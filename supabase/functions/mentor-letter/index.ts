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
    const { userData, trainingsStats, analysisData, conversationSummary } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const genderPrefix = userData?.gender === 'female' ? 'מנהלת' : 'מנהל';
    const genderSuffix = userData?.gender === 'female' ? 'ה' : '';
    const genderYou = userData?.gender === 'female' ? 'את' : 'אתה';

    const systemPrompt = `אתה מנטור פדגוגי מנוסה וחם הכותב מכתב אישי ומעצים למנהל/ת פסג"ה.

הנחיות לכתיבת המכתב:
1. פתיחה אישית וחמה עם פנייה ישירה בשם
2. תיאור קצר של התהליך שעבר/ה
3. הדגשת החזון והייחודיות של הפסג"ה
4. פירוט 3 חוזקות משמעותיות שזיהית
5. המלצה אישית אחת ספציפית וישימה
6. סיום מעצים ומעודד

סגנון הכתיבה:
- אישי, חם ואמפתי
- מקצועי אך לא פורמלי מדי
- מעצים ומחזק
- ספציפי לנתונים שקיבלת
- בעברית תקנית וזורמת
- השתמש/י בלשון ${userData?.gender === 'female' ? 'נקבה' : 'זכר'}

אורך המכתב: 200-300 מילים`;

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

    console.log("Generating mentor letter...");

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
