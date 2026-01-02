import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced safety guardrails - comprehensive list of sensitive topics
const sensitiveTopics = [
  'medical diagnosis',
  'prescription medication',
  'emergency medical',
  'drug interactions',
  'suicide',
  'self-harm',
  'illegal activities',
  'personal medical records',
  'drug prescriptions',
  'overdose',
  'abortion',
  'euthanasia',
  'controlled substances',
  'mental health crisis',
  'violence',
  'weapons',
  'credit card',
  'social security',
  'password',
  'bank account',
  'private key',
  'api key',
  'secret key',
];

// Keywords that indicate potential hallucination risks
const hallucinationRiskPatterns = [
  /cure\s+(cancer|aids|hiv|diabetes)/i,
  /100%\s*(effective|guaranteed|cure)/i,
  /miracle\s*(cure|treatment|remedy)/i,
  /replace\s*(medication|medicine|doctor)/i,
  /stop\s*taking\s*(medication|medicine)/i,
];

const safetySystemPrompt = `You are a knowledgeable wellness and natural remedies consultant. You provide general wellness information and traditional remedy suggestions based on centuries of herbal medicine knowledge.

CRITICAL SAFETY GUIDELINES - STRICTLY FOLLOW:

1. NEVER provide specific medical diagnoses - you are not a doctor
2. NEVER recommend stopping or replacing prescription medications
3. NEVER provide dosages for prescription drugs
4. For any emergency symptoms, ALWAYS direct to emergency services (911)
5. NEVER discuss controlled substances or illegal activities
6. Always recommend consulting healthcare professionals for serious conditions
7. Focus on preventive care, traditional remedies, and lifestyle modifications
8. Be honest about limitations - say "I don't know" when uncertain
9. Avoid absolute claims like "this will cure" - use "may help with" instead
10. For chronic conditions, always suggest professional medical consultation

RESPONSE STYLE:
- Be warm, empathetic, and supportive
- Use clear, simple language
- Provide evidence-based information when available
- Include safety precautions for any remedy suggested
- Format responses naturally, avoiding robotic patterns

If asked about sensitive topics outside your scope, respond:
"I appreciate your trust, but this topic requires professional expertise. Please consult with a qualified healthcare provider for personalized guidance."`;

function containsSensitiveTopic(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return sensitiveTopics.some(topic => lowerMessage.includes(topic));
}

function hasHallucinationRisk(message: string): boolean {
  return hallucinationRiskPatterns.some(pattern => pattern.test(message));
}

function sanitizeResponse(response: string): string {
  // Remove any potentially harmful advice patterns
  const harmfulPatterns = [
    /take\s+\d+\s*(mg|ml|pills?|tablets?|capsules?)\s+of/gi,
    /inject\s+/gi,
    /stop\s+taking\s+your\s+(medication|medicine|prescription)/gi,
  ];
  
  let sanitized = response;
  harmfulPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[consult a healthcare provider about] ');
  });
  
  return sanitized;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context, saveSymptoms } = await req.json();
    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
    
    if (!OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }

    const latestUserMessage = messages.find((m: { role: string; content: string }) => m.role === 'user')?.content || '';
    
    // Check for sensitive content
    if (containsSensitiveTopic(latestUserMessage)) {
      console.log('Blocked sensitive topic request');
      return new Response(JSON.stringify({
        response: "I appreciate your trust in me, but this topic requires professional expertise that I cannot provide. For your safety and wellbeing, please consult with a qualified healthcare provider, pharmacist, or appropriate professional who can give you personalized guidance based on your specific situation. Your health matters, and getting the right expert advice is important! 💚",
        blocked: true,
        reason: "sensitive_topic"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check for hallucination risk patterns
    if (hasHallucinationRisk(latestUserMessage)) {
      console.log('Detected hallucination risk pattern');
      return new Response(JSON.stringify({
        response: "I want to be honest with you - while natural remedies can support overall wellness, I cannot make claims about curing serious medical conditions. These conditions require proper medical diagnosis and treatment from qualified healthcare providers. I'd be happy to suggest supportive wellness practices that can complement professional medical care. Would you like some general wellness suggestions instead?",
        blocked: true,
        reason: "hallucination_prevention"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemMessage = context 
      ? `${safetySystemPrompt}\n\nAdditional Context: ${context}`
      : safetySystemPrompt;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://lovable.dev',
        'X-Title': 'RemedyFlow Wellness App',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        messages: [
          { role: 'system', content: systemMessage },
          ...messages,
        ],
        temperature: 0.6, // Lower temperature for more consistent, less hallucinatory responses
        max_tokens: 2000,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "I'm receiving many requests right now. Please try again in a moment.",
          blocked: false 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    let generatedText = data.choices?.[0]?.message?.content || '';

    // Sanitize the response for any harmful patterns that slipped through
    generatedText = sanitizeResponse(generatedText);

    console.log('Successfully generated response');

    return new Response(JSON.stringify({ 
      response: generatedText,
      blocked: false,
      model: 'gemini-2.0-flash'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in openrouter-chat function:', error);
    return new Response(JSON.stringify({ 
      error: "I'm having trouble connecting right now. Please try again in a moment.",
      blocked: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});