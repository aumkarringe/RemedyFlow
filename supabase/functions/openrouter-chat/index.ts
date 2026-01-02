import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Safety guardrails - topics to avoid
const sensitiveTopics = [
  'medical diagnosis',
  'prescription medication dosage',
  'emergency medical advice',
  'drug interactions',
  'suicide',
  'self-harm',
  'illegal activities',
  'personal medical records',
  'specific drug prescriptions',
];

const safetySystemPrompt = `You are a helpful wellness and home remedies assistant. You provide general wellness information and natural remedy suggestions.

IMPORTANT SAFETY GUIDELINES - YOU MUST FOLLOW THESE:
1. NEVER provide specific medical diagnoses
2. NEVER recommend specific prescription medication dosages
3. NEVER provide emergency medical advice - always direct to emergency services
4. NEVER discuss drug interactions in detail - recommend consulting a pharmacist
5. Always recommend consulting healthcare professionals for serious conditions
6. Focus on general wellness, preventive care, and traditional home remedies
7. If asked about sensitive medical topics, politely decline and suggest professional consultation
8. Be helpful but cautious - user safety is the top priority
9. For any symptoms that could be serious, recommend seeing a doctor

If a user asks about something potentially dangerous or outside your safe scope, respond with:
"I'm not able to provide advice on that topic as it requires professional medical expertise. Please consult with a healthcare provider for personalized guidance."`;

function containsSensitiveTopic(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return sensitiveTopics.some(topic => lowerMessage.includes(topic));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context } = await req.json();
    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
    
    if (!OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }

    // Check for sensitive content in the latest message
    const latestUserMessage = messages.find((m: any) => m.role === 'user')?.content || '';
    
    if (containsSensitiveTopic(latestUserMessage)) {
      return new Response(JSON.stringify({
        response: "I appreciate your trust, but this topic requires professional medical expertise. Please consult with a qualified healthcare provider who can give you personalized advice based on your specific situation. Your health and safety are important!",
        blocked: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemMessage = context 
      ? `${safetySystemPrompt}\n\nContext: ${context}`
      : safetySystemPrompt;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://lovable.dev',
        'X-Title': 'Wellness Home Remedies App',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        messages: [
          { role: 'system', content: systemMessage },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content || '';

    return new Response(JSON.stringify({ 
      response: generatedText,
      blocked: false 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in openrouter-chat function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
