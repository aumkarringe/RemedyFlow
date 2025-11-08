import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { healthIssue, datasetResults } = await req.json();
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    console.log('Generating AI remedies for:', healthIssue);

    const hasDatasetResults = datasetResults && datasetResults.length > 0;
    
    const prompt = hasDatasetResults 
      ? `You found ${datasetResults.length} remedies in the database for "${healthIssue}". 
         Please provide 3-5 ADDITIONAL complementary home remedies that are NOT in this list: ${JSON.stringify(datasetResults.map((r: any) => r['Name of Item']))}.
         
         Focus on:
         - Different natural ingredients
         - Alternative approaches
         - Modern scientific remedies
         - Traditional remedies from different cultures`
      : `Generate 5-7 comprehensive home remedies for "${healthIssue}".`;

    const fullPrompt = `${prompt}

CRITICAL: You MUST respond with ONLY a valid JSON array. No markdown, no explanations, no code blocks, just pure JSON.

Generate remedies in this EXACT format:
[
  {
    "name": "Ingredient/Remedy Name",
    "healthIssue": "${healthIssue}",
    "remedy": "Detailed preparation and usage instructions (at least 2-3 sentences)",
    "yogasan": "Specific yoga pose name with brief instructions",
    "acupressure": "Specific pressure point name and location",
    "benefits": "Key benefits in one sentence",
    "precautions": "Any warnings or who should avoid",
    "duration": "How long to use this remedy",
    "source": "AI-Generated"
  }
]

Requirements:
1. Each remedy must be practical and safe
2. Include detailed preparation steps
3. Specify exact quantities where applicable
4. Mention frequency of use
5. All remedies should be different from each other
6. Focus on natural, accessible ingredients
7. Include scientific rationale where possible

Return ONLY the JSON array, nothing else.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ text: fullPrompt }]
          }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    let aiResponse = data.candidates[0]?.content?.parts[0]?.text || '[]';
    
    console.log('Raw AI response:', aiResponse);
    
    // Clean up the response - remove markdown code blocks if present
    aiResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Parse the JSON
    let remedies;
    try {
      remedies = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Failed to parse:', aiResponse);
      // Return empty array if parsing fails
      remedies = [];
    }

    // Ensure we have an array
    if (!Array.isArray(remedies)) {
      remedies = [];
    }

    console.log('Generated remedies count:', remedies.length);

    return new Response(
      JSON.stringify({ remedies }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-remedies:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        remedies: []
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
