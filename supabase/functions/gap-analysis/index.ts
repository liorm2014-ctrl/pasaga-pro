import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TrainingData {
  domain: string;
  category: string;
  hours: number;
  participants: number;
}

interface GapAnalysisRequest {
  trainings: TrainingData[];
  institutions: {
    kindergartens: number;
    elementary: number;
    highSchools: number;
  };
  currentStrengths?: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('Missing or invalid authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Missing authentication' }), 
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error('Token validation failed:', claimsError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }), 
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log('Authenticated user for gap analysis:', userId);

    const { trainings, institutions, currentStrengths } = await req.json() as GapAnalysisRequest;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Calculate statistics from trainings
    const totalHours = trainings.reduce((sum, t) => sum + t.hours, 0);
    const domainHours: Record<string, number> = {};
    const categoryHours: Record<string, number> = {};
    
    trainings.forEach(t => {
      domainHours[t.domain] = (domainHours[t.domain] || 0) + t.hours;
      categoryHours[t.category] = (categoryHours[t.category] || 0) + t.hours;
    });

    // Find imbalances
    const domainPercentages = Object.entries(domainHours).map(([domain, hours]) => ({
      domain,
      hours,
      percentage: totalHours > 0 ? Math.round((hours / totalHours) * 100) : 0,
    })).sort((a, b) => b.percentage - a.percentage);

    const topDomain = domainPercentages[0];
    const hasDistortion = topDomain && topDomain.percentage > 50;

    // Check for missing domains
    const criticalDomains = ['מנהיגות', 'טכנו-פדגוגיה', 'חינוך מיוחד'];
    const missingDomains = criticalDomains.filter(d => !domainHours[d] || domainHours[d] === 0);

    const systemPrompt = `אתה יועץ פדגוגי בכיר המנתח נתוני פסג"ה. עליך:
1. לזהות את הפער המרכזי ביותר שמסכן את איכות ההוראה
2. להסביר למה הפער הזה חשוב
3. לציין אילו אפשרויות חסומות בגלל חוסר נתונים
4. להמליץ על פעולות מותרות שנתמכות בנתונים
5. להעריך את רמת הסיכון

קריטי: 
- השתמש רק בנתונים שניתנו לך - אל תמציא מידע
- אם אין מספיק נתונים לקביעה מסוימת, אמור "אין מספיק מידע לקביעה"
- אם יש עיוות פדגוגי (תחום אחד > 50%), זה חייב להופיע כפער מרכזי`;

    const userPrompt = `נתוני הפסג"ה:
- גני ילדים: ${institutions.kindergartens}
- בתי ספר יסודיים: ${institutions.elementary}
- תיכונים: ${institutions.highSchools}

התפלגות שעות לפי תחום:
${domainPercentages.map(d => `- ${d.domain}: ${d.hours} שעות (${d.percentage}%)`).join('\n')}

${hasDistortion ? `⚠️ זוהה עיוות: תחום "${topDomain.domain}" מהווה ${topDomain.percentage}% מהשעות!` : ''}

${missingDomains.length > 0 ? `תחומים חסרים: ${missingDomains.join(', ')}` : ''}

${currentStrengths?.length ? `חוזקות שהמשתמש רוצה לציין: ${currentStrengths.join(', ')}` : ''}

נתח והחזר בפורמט JSON:
{
  "centralRisk": "הפער המרכזי המזוהה",
  "whyItMatters": "הסבר למה זה חשוב לאיכות ההוראה",
  "riskLevel": "low/medium/high/critical",
  "blockedOptions": ["אפשרויות שלא ניתן לבחור בגלל חוסר נתונים"],
  "allowedActions": ["פעולות מומלצות שנתמכות בנתונים"],
  "validatedStrengths": ["חוזקות שניתן לאשר מהנתונים"],
  "rejectedStrengths": [{"strength": "חוזקה שנדחתה", "reason": "סיבה לדחייה"}],
  "insufficientData": ["תחומים שאין מספיק מידע לגביהם"]
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse gap analysis response");
    }

    const gapAnalysis = JSON.parse(jsonMatch[0]);

    // Add the imbalance data
    gapAnalysis.imbalanceDetected = hasDistortion ? {
      domain: topDomain.domain,
      percentage: topDomain.percentage,
      isDistortion: true,
    } : null;

    gapAnalysis.dataSource = Object.keys(domainHours);

    return new Response(JSON.stringify(gapAnalysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Gap analysis error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      centralRisk: "אין מספיק מידע לניתוח",
      whyItMatters: "נדרשים נתונים נוספים",
      riskLevel: "medium",
      blockedOptions: [],
      allowedActions: ["העלה קובץ השתלמויות", "הזן נתונים ידנית"],
      insufficientData: ["כל התחומים"],
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
