import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const groqApiKey = Deno.env.get('GROQ_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, artwork, conversationHistory } = await req.json();

    if (!groqApiKey) {
      throw new Error('Groq API key not configured');
    }

    // Build the system prompt with artwork context
    let systemPrompt = `You are an expert art curator and historian with deep knowledge of art, artists, and art history. You are helpful, engaging, and passionate about sharing knowledge about art.

If provided with artwork details, use that information to answer questions accurately. You can discuss:
- The artwork's historical context, style, and significance
- The artist's biography, techniques, and other works
- Art movements and periods
- Cultural and historical background
- Artistic techniques and materials
- Recommendations for similar artworks or artists

Keep responses conversational and engaging, like a knowledgeable museum guide. If you don't have specific information about something, be honest about it.`;

    if (artwork) {
      systemPrompt += `

Current artwork context:
- Title: ${artwork.title}
- Artist: ${artwork.artistDisplayName || 'Unknown'}
- Date: ${artwork.objectDate || 'Unknown'}
- Medium: ${artwork.medium || 'Unknown'}
- Department: ${artwork.department || 'Unknown'}
- Dimensions: ${artwork.dimensions || 'Unknown'}
- Culture: ${artwork.culture || 'Unknown'}
- Period: ${artwork.period || 'Unknown'}
- Artist Bio: ${artwork.artistDisplayBio || 'Unknown'}
- Artist Nationality: ${artwork.artistNationality || 'Unknown'}`;
    }

    // Build conversation history for context
    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Add recent conversation history (last 6 messages for context)
    if (conversationHistory && Array.isArray(conversationHistory)) {
      const recentHistory = conversationHistory.slice(-6);
      recentHistory.forEach(msg => {
        if (msg.type === 'user') {
          messages.push({ role: 'user', content: msg.content });
        } else if (msg.type === 'bot') {
          messages.push({ role: 'assistant', content: msg.content });
        }
      });
    }

    // Add the current message
    messages.push({ role: 'user', content: message });

    console.log('Sending request to Groq with messages:', messages.length);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Groq API error:', response.status, errorData);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI response generated successfully');

    return new Response(JSON.stringify({ 
      response: aiResponse,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in art-curator-ai function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});