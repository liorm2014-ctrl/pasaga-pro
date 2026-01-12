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
    console.log('Authenticated user:', userId);

    const { messages, userContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Determine gender-appropriate language
    const isFemale = userContext?.gender === 'female';
    const genderSuffix = isFemale ? 'י' : '';
    const genderTitle = isFemale ? 'מנהלת' : 'מנהל';

    const systemPrompt = `אתה מנטור AI מומחה למנהיגות פדגוגית ופיתוח מקצועי של מנהלי פסג"ה (מרכזי פיתוח סגל הוראה).
    
אתה משוחח עם ${genderTitle} פסג"ה${userContext?.city ? ` מ${userContext.city}` : ''}.

תפקידך לנהל שיחה רפלקטיבית מעמיקה ולשאול 3 שאלות מנחות בלבד. לאחר קבלת התשובות, סכם את השיחה.

מבנה השיחה:
1. שאלה ראשונה: על פעולות משמעותיות שנעשו בפסג"ה והאדוות שלהן
2. שאלה שנייה: על יעדים לשנה הקרובה והתאמתם לתקציב
3. שאלה שלישית: על אתגרים ופתרונות יצירתיים להתמודדות איתם
4. לאחר 3 התשובות: סיכום מקיף של התובנות, החוזקות והמלצות להמשך

הנחיות חשובות:
- פנ${genderSuffix} ל${genderTitle} בלשון ${isFemale ? 'נקבה' : 'זכר'} בלבד
- כתוב בעברית תקנית ורהוטה בלבד - אל תמציא מילים
- השתמש במילים קיימות בשפה העברית בלבד
- שאל שאלות פתוחות שמעודדות חשיבה עמוקה
- הקשב והתייחס לתשובות באופן ממוקד ואמפתי
- התייחס לנתונים הספציפיים של ה${genderTitle} כשזה רלוונטי
- שמור על שיחה זורמת וטבעית
- חשוב מאוד: אל תשתמש בשום סימני עיצוב מיוחדים! לא כוכביות (**), לא סולמיות (###), לא תגיות HTML
- להדגשה פשוט כתוב את המילה בצורה רגילה - הטקסט יעובד אוטומטית

${userContext ? `מידע על הפסג"ה:
- שם: ${userContext.fullName || 'לא צוין'}
- מגדר: ${isFemale ? 'נקבה' : 'זכר'}
- מחוז: ${userContext.district || 'לא צוין'}
- ישוב: ${userContext.city || 'לא צוין'}
- מספר גנים: ${userContext.numKindergartens || 0}
- בתי ספר יסודיים: ${userContext.numElementary || 0}
- בתי ספר תיכוניים: ${userContext.numHighSchools || 0}
- מספר השתלמויות: ${userContext.trainingsCount || 0}` : ''}

אם זו ההודעה הראשונה, התחל${genderSuffix} עם ברכה אישית ושאלה הראשונה.
לאחר קבלת 3 תשובות מהמשתמש, ספק${genderSuffix} סיכום מקיף הכולל: תובנות מרכזיות, נקודות חוזק שזוהו, והמלצות להמשך.`;

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
          ...messages,
        ],
        stream: true,
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

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("reflection-chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
