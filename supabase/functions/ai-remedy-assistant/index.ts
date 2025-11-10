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
    const { message, conversationHistory } = await req.json();
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('AI Assistant request received:', { message });

    const systemPrompt = `You are an expert holistic health advisor specializing in natural home remedies, traditional healing practices, and wellness.

Your expertise includes:
- Home remedies using natural ingredients
- Yoga poses (Yogasanas) for specific health conditions
- Acupressure points and techniques
- Ayurvedic principles and remedies
- Herbal medicine and natural supplements
- Dietary recommendations for health issues
- Lifestyle modifications for wellness
- Preventive care and immune boosting
- Breathing exercises (Pranayama)
- Meditation techniques for stress and anxiety

Guidelines:
1. Always provide specific, actionable remedies
2. Include detailed instructions for preparation and usage
3. Suggest relevant yoga poses with proper technique
4. Recommend specific acupressure points with location and duration
5. Provide dietary suggestions and foods to avoid
6. Include preventive measures
7. Mention any precautions or contraindications
8. Structure responses clearly with headers
9. Be empathetic and encouraging
10. Always recommend consulting a healthcare professional for serious conditions

Format your response with clear sections like:
🌿 Home Remedies
🧘 Yoga Poses (Yogasanas)
👆 Acupressure Points
🥗 Dietary Recommendations
💡 Lifestyle Tips
⚠️ Precautions

Be comprehensive but practical. Focus on solutions people can implement at home.`;

    // Build conversation context
    const messages = [
      { role: 'user', parts: [{ text: systemPrompt }] }
    ];

    // Add conversation history
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach((msg: { role: string; content: string }) => {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        });
      });
    }

    // Add current message
    messages.push({
      role: 'user',
      parts: [{ text: message }]
    });

    console.log('Calling Lovable AI...');

    // Convert messages to OpenAI format
    const chatMessages = [
      { role: 'system', content: systemPrompt }
    ];

    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach((msg: { role: string; content: string }) => {
        chatMessages.push({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        });
      });
    }

    chatMessages.push({ role: 'user', content: message });

    const response = await fetch(
      'https://ai.gateway.lovable.dev/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: chatMessages,
          temperature: 0.7,
          max_tokens: 2048,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      }
      if (response.status === 402) {
        throw new Error('AI credits exhausted. Please add credits to continue.');
      }
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Lovable AI response received');

    const aiResponse = data.choices[0]?.message?.content || 
                      'I apologize, but I could not generate a response. Please try again.';

    return new Response(
      JSON.stringify({ response: aiResponse }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in ai-remedy-assistant:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
