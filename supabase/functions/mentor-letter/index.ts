import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    console.log('Authenticated user for mentor letter:', userId);

    const { userData, trainingsStats, analysisData, conversationSummary } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const genderPrefix = userData?.gender === 'female' ? 'מנהלת' : 'מנהל';
    const genderSuffix = userData?.gender === 'female' ? 'ה' : '';
    const genderYou = userData?.gender === 'female' ? 'את' : 'אתה';

    const genderForm = userData?.gender === 'female' ? 'נקבה' : 'זכר';
    const genderVerbs = userData?.gender === 'female' 
      ? 'עושה, מצליחה, יכולה, שלך, בך, המשיכי, תשכחי'
      : 'עושה, מצליח, יכול, שלך, בך, המשך, תשכח';

    const systemPrompt = `אתה מנטור פדגוגי מקצועי וחם מפסג"ה שכותב מכתבים אישיים ל${genderPrefix}י פסג"ה.

הנחיות לתוכן המכתב:
1. **פתיחה חמה**: ברכה אישית עם שם ${genderPrefix}ה ("שלום רב! מקווה שהמכתב הזה מוצא אותך ברוגע ובחיוך")
2. **הערכה כנה**: הבע הערכה על העבודה המדהימה למען החינוך בישראל ועבור הילדים והמשפחות בעיר
3. **התייחסות לנתונים**: ציין את המספרים הספציפיים - מספר גנים, בתי ספר יסודיים ותיכונים, וכיצד זה מעיד על מחויבות
4. **הכרה ביכולות**: הדגש את היכולת להניע מעגלי שינוי אמיתי ולפתח פדגוגיה איכותית
5. **אתגר והתמודדות**: אזכר אתגר רלוונטי (שילוב טכנולוגיות חדשות, פיתוח מתמיד של עובדי הוראה, שיתופי פעולה בין מוסדות) והצע שאלה או דרך להתמודד
6. **טיפ מעשי**: טיפ קונקרטי כמנטור (למשל: להקדיש זמן למפגשים עם צוותי היגוי מהמוסדות השונים להחלפת רעיונות)
7. **סיום מעצים**: מסר על האמונה ביכולות לחולל שינוי - "לא רק מה שעושים, אלא איך עושים"

הנחיות לצורה:
- **לשון ${genderForm}** לאורך כל המכתב: ${genderVerbs}
- **קריטי**: אחרי כל משפט שמסתיים בנקודה - שורה חדשה!
- פסקאות קצרות עם רווח ריק ביניהן
- הדגשות עם **טקסט** למילים חשובות (2-3 הדגשות במכתב)
- אורך: 180-250 מילים
- חתימה: "בברכת חינוך מצמיח, מנטור פסג"ה"`;

    const userMessage = `כתוב מכתב אישי ל${genderPrefix} הפסג"ה על בסיס המידע הבא:

פרטים אישיים:
- שם: ${userData?.fullName || 'לא צוין'}
- מגדר: ${userData?.gender === 'female' ? 'נקבה' : 'זכר'}
- מחוז: ${userData?.district || 'לא צוין'}
- ישוב: ${userData?.city || 'לא צוין'}
- סמל פסג"ה: ${userData?.pisgaSymbol || 'לא צוין'}
- גני ילדים: ${userData?.numKindergartens || 0}
- בתי ספר יסודיים: ${userData?.numElementary || 0}
- בתי ספר תיכוניים: ${userData?.numHighSchools || 0}

נתוני השתלמויות:
- סה"כ השתלמויות: ${trainingsStats?.totalTrainings || 0}
- סה"כ משתתפים: ${trainingsStats?.totalParticipants || 0}
- סה"כ שעות הדרכה: ${trainingsStats?.totalHours || 0}
- ממוצע משתתפים: ${trainingsStats?.avgParticipants || 0}

${analysisData ? `ניתוח SWOT:
חוזקות: ${analysisData.strengths?.join(', ') || 'לא צוין'}
אתגרים: ${analysisData.weaknesses?.join(', ') || 'לא צוין'}
הזדמנויות: ${analysisData.opportunities?.join(', ') || 'לא צוין'}
איומים: ${analysisData.threats?.join(', ') || 'לא צוין'}
אפיון הפסג"ה: ${analysisData.characterization || 'לא צוין'}
תובנה מרכזית: ${analysisData.keyInsight || 'לא צוין'}
המלצות: ${analysisData.recommendations?.join(', ') || 'לא צוין'}` : ''}

${conversationSummary ? `תקציר השיחה הרפלקטיבית:
${conversationSummary}` : ''}

כתוב מכתב אישי ומעצים שמשלב את כל המידע הזה.`;

    console.log("Generating mentor letter for user:", userId);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "מגבלת בקשות הושגה, נסו שוב מאוחר יותר" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "נדרשת הוספת קרדיט לחשבון" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "שגיאה בשירות AI" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    console.log("AI response received");
    
    const letter = data.choices?.[0]?.message?.content;
    
    if (!letter) {
      throw new Error("No content in AI response");
    }

    return new Response(JSON.stringify({ letter }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("mentor-letter error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
