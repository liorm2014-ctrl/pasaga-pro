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
    const { pisgahData, trainingsData, stats } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `אתה אנליסט AI מומחה לניתוח נתונים פדגוגיים ומערכות חינוך. תפקידך לנתח נתוני השתלמויות של פסג"ה (מרכז פיתוח סגל הוראה) ולספק תובנות מעמיקות ואיכותיות.

הנחיות לניתוח:
1. נתח את הנתונים באופן מקצועי ומעמיק - התייחס לכל הנתונים שהועלו מקבצי Excel או PDF
2. זהה דפוסים, מגמות וחוזקות ייחודיות מכל הגיליונות והעמודות בקובץ
3. הצע המלצות ממוקדות וישימות על בסיס כל המידע הזמין
4. התייחס לייחודיות של הפסג"ה הספציפית
5. השתמש בשפה מקצועית אך נגישה
6. ספק ניתוח SWOT מלא המבוסס על כל הנתונים

פורמט התשובה (JSON):
{
  "characterization": "פסקה של 2-3 משפטים המאפיינת את הפסג"ה והייחודיות שלה",
  "strengths": ["חוזקה 1", "חוזקה 2", "חוזקה 3"],
  "weaknesses": ["חולשה או אתגר 1", "חולשה או אתגר 2"],
  "opportunities": ["הזדמנות 1", "הזדמנות 2"],
  "threats": ["איום או אתגר חיצוני 1", "איום או אתגר חיצוני 2"],
  "recommendations": ["המלצה ספציפית 1", "המלצה ספציפית 2", "המלצה ספציפית 3"],
  "keyInsight": "תובנה מרכזית אחת משמעותית על הפסג"ה"
}

החזר רק את ה-JSON ללא טקסט נוסף.`;

    const userMessage = `נתח את הנתונים הבאים של פסג"ה:

פרטי הפסג"ה:
- שם: ${pisgahData?.fullName || 'לא צוין'}
- מחוז: ${pisgahData?.district || 'לא צוין'}  
- ישוב: ${pisgahData?.city || 'לא צוין'}
- מספר גני ילדים: ${pisgahData?.numKindergartens || 0}
- בתי ספר יסודיים: ${pisgahData?.numElementary || 0}
- בתי ספר תיכוניים: ${pisgahData?.numHighSchools || 0}

סטטיסטיקות:
- סה"כ השתלמויות: ${stats?.totalTrainings || 0}
- סה"כ משתתפים: ${stats?.totalParticipants || 0}
- סה"כ שעות הדרכה: ${stats?.totalHours || 0}
- ממוצע משתתפים להשתלמות: ${stats?.avgParticipants || 0}

התפלגות קטגוריות:
${trainingsData?.categoryDistribution?.map((c: {name: string, count: number, percentage: number}) => `- ${c.name}: ${c.count} השתלמויות (${c.percentage}%)`).join('\n') || 'אין נתונים'}

התפלגות קהלי יעד:
${trainingsData?.audienceDistribution?.map((a: {name: string, count: number}) => `- ${a.name}: ${a.count} השתלמויות`).join('\n') || 'אין נתונים'}

מגמה חודשית:
${trainingsData?.monthlyTrend?.map((m: {month: string, trainings: number, participants: number}) => `- ${m.month}: ${m.trainings} השתלמויות, ${m.participants} משתתפים`).join('\n') || 'אין נתונים'}`;

    console.log("Sending analysis request to AI gateway");

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
    console.log("AI response received:", data);
    
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON from the response
    let analysisResult;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/```\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      analysisResult = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", content);
      // Return a fallback structured response
      analysisResult = {
        characterization: content.substring(0, 200),
        strengths: ["מגוון רחב של השתלמויות", "מספר משתתפים טוב"],
        weaknesses: ["נדרש ניתוח נוסף"],
        opportunities: ["הרחבת תחומי ההשתלמויות"],
        threats: ["אתגרי תקציב"],
        recommendations: ["המשך מעקב אחר התקדמות"],
        keyInsight: "נדרש מידע נוסף לניתוח מעמיק יותר"
      };
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("dashboard-analysis error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
