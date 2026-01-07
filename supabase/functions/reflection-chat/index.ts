import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `אתה מנטור AI מומחה למנהיגות פדגוגית ופיתוח מקצועי של מנהלי פסג"ה (מרכזי פיתוח סגל הוראה).
    
תפקידך לנהל שיחה רפלקטיבית מעמיקה עם מנהל/ת הפסג"ה על:
1. פעולות משמעותיות שנעשו בפסג"ה והאדוות שלהן
2. יעדים לשנה הקרובה
3. התאמה לתקציב
4. קשיים ואתגרים
5. פתרונות יצירתיים ודרכי התקדמות

הנחיות לשיחה:
- שאל שאלות פתוחות שמעודדות חשיבה עמוקה
- הקשב והתייחס לתשובות באופן ממוקד ואמפתי
- זהה נקודות חוזק ייחודיות של הפסג"ה
- עזור לזהות הזדמנויות לצמיחה
- סכם תובנות מרכזיות
- התייחס לנתונים הספציפיים של המשתמש כשזה רלוונטי
- השתמש בשפה חיובית ומעצימה
- שמור על שיחה זורמת וטבעית בעברית

${userContext ? `מידע על הפסג"ה:
- שם: ${userContext.fullName || 'לא צוין'}
- מחוז: ${userContext.district || 'לא צוין'}
- ישוב: ${userContext.city || 'לא צוין'}
- מספר גנים: ${userContext.numKindergartens || 0}
- בתי ספר יסודיים: ${userContext.numElementary || 0}
- בתי ספר תיכוניים: ${userContext.numHighSchools || 0}
- מספר השתלמויות: ${userContext.trainingsCount || 0}` : ''}

התחל עם שאלה פתוחה על פעולות גדולות שנעשו בפסג"ה אם זו ההודעה הראשונה.`;

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
