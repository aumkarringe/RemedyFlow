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
    const { userData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a holistic wellness AI assistant. Analyze the user's health data and provide personalized, actionable wellness insights.

Based on the user's saved health searches, remedies tried, and preferences, you must:
1. Analyze patterns in their health concerns
2. Predict wellness state (stress, fatigue, digestion, sleep, immunity)
3. Provide personalized recommendations

CRITICAL: You MUST respond with ONLY valid JSON in this exact format:
{
  "healthStats": {
    "stress": "65%",
    "sleepImbalance": "40%",
    "fatigue": "55%",
    "digestion": "70%",
    "immunity": "60%"
  },
  "analysis": "Brief personalized analysis of the user's wellness patterns",
  "recommendations": {
    "homeRemedies": [
      {"name": "Remedy Name", "description": "How to use", "benefit": "Why it helps"}
    ],
    "yogaPoses": [
      {"name": "Pose Name 🧘", "duration": "5-10 mins", "benefit": "What it improves"}
    ],
    "acupressure": [
      {"name": "Point Name", "location": "Where to find it", "technique": "How to apply"}
    ],
    "diet": {
      "eat": ["Food 1", "Food 2", "Food 3"],
      "avoid": ["Food 1", "Food 2"]
    },
    "lifestyle": [
      {"tip": "Actionable tip", "reason": "Why it matters"}
    ],
    "meditation": [
      {"name": "Technique Name", "duration": "5-15 mins", "instructions": "How to do it"}
    ]
  },
  "weeklyPlan": [
    {"day": "Monday", "morning": "Activity", "evening": "Activity", "focus": "Main focus area"}
  ]
}

Provide at least 3 items for each category. Make recommendations specific to the user's data.`;

    const userDataSummary = userData ? JSON.stringify(userData) : "No previous health data available - provide general wellness recommendations";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this user's wellness data and provide personalized insights:\n\n${userDataSummary}` },
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    let aiResponse = data.choices[0]?.message?.content || "{}";
    
    // Clean up response
    aiResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    let insights;
    try {
      insights = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Raw response:", aiResponse);
      insights = {
        healthStats: { stress: "50%", sleepImbalance: "50%", fatigue: "50%", digestion: "50%", immunity: "50%" },
        analysis: "Unable to parse wellness data. Please try again.",
        recommendations: {
          homeRemedies: [],
          yogaPoses: [],
          acupressure: [],
          diet: { eat: [], avoid: [] },
          lifestyle: [],
          meditation: []
        },
        weeklyPlan: []
      };
    }

    return new Response(JSON.stringify({ insights }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in wellness-insights function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
