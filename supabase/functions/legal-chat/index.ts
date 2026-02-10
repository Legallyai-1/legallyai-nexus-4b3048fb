import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { streamText } from "npm:ai@3.4.33";
import { createAnthropic } from "npm:@ai-sdk/anthropic@1.0.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Blocked patterns for prompt injection attempts
const BLOCKED_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions?|rules?|prompts?)/i,
  /disregard\s+(all\s+)?(previous|prior|above)/i,
  /you\s+are\s+now\s+(?!legallyai)/i,
  /act\s+as\s+(?!a\s+legal)/i,
  /pretend\s+(you\s+are|to\s+be)/i,
  /forget\s+(everything|all|your)/i,
  /new\s+instructions?:/i,
  /system\s*:\s*/i,
  /\[system\]/i,
  /\<\s*system\s*\>/i,
];

function validateMessage(content: string): { valid: boolean; reason?: string } {
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(content)) {
      console.warn("Blocked prompt injection attempt in chat:", content.substring(0, 100));
      return { valid: false, reason: "Invalid request format. Please ask your legal question clearly." };
    }
  }
  return { valid: true };
}

// Helper function to create SSE fallback stream
function createSSEFallbackStream(message: string): ReadableStream {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: message } }] })}\n\n`));
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    }
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    let userId = "anonymous";
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: authError } = await supabaseClient.auth.getUser(token);
      
      if (!authError && userData.user) {
        userId = userData.user.id;
        console.log("Authenticated user for chat:", userId);
      }
    }
    console.log("Chat request from:", userId);

    const { messages, stream = true } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (messages.length > 50) {
      return new Response(
        JSON.stringify({ error: "Too many messages in conversation. Please start a new chat." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const totalContentLength = messages.reduce((acc: number, m: any) => acc + (m.content?.length || 0), 0);
    if (totalContentLength > 50000) {
      return new Response(
        JSON.stringify({ error: "Conversation too long. Please start a new chat." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    for (const message of messages) {
      if (message.content) {
        const validation = validateMessage(message.content);
        if (!validation.valid) {
          return new Response(
            JSON.stringify({ error: validation.reason }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    const systemPrompt = `You are LegallyAI, a knowledgeable AI legal assistant. You provide helpful, accurate information about U.S. law (2025).

IMPORTANT RULES:
1. Provide clear, helpful answers to legal questions
2. Reference specific laws, statutes, or legal principles when relevant
3. Explain legal concepts in plain English
4. Suggest when someone should consult an attorney
5. Be professional but approachable
6. If asked to generate a document, explain you can help with that on the Generate page
7. Always remind users this is informational, not legal advice
8. NEVER provide advice on how to commit crimes or illegal activities
9. If a question seems to be asking for help with illegal activities, politely decline

Areas you can help with:
- Contract law and agreements
- Employment law
- Family law (custody, divorce)
- Real estate law
- Business formation (LLC, Corp)
- Intellectual property basics
- General legal questions

End important responses with: "Remember: This is general legal information, not legal advice. For your specific situation, consult a licensed attorney."`;

    console.log("Chat request from:", userId, "with", messages.length, "messages");

    // Get Vercel AI Gateway API key
    const VERCEL_AI_KEY = Deno.env.get("VERCEL_AI_GATEWAY_KEY");
    
    if (!VERCEL_AI_KEY) {
      console.error("VERCEL_AI_GATEWAY_KEY not configured");
      const fallbackResponse = `I'm here to help with your legal questions! While I'm having trouble connecting to my AI capabilities right now, please check back shortly or contact support.

Remember: For urgent legal matters, please consult a licensed attorney.`;
      
      if (stream) {
        return new Response(
          createSSEFallbackStream(fallbackResponse),
          { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } }
        );
      }
      return new Response(
        JSON.stringify({ response: fallbackResponse }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Anthropic provider with Vercel AI Gateway
    const anthropic = createAnthropic({
      apiKey: VERCEL_AI_KEY,
    });

    // Prepare messages for AI SDK format
    const formattedMessages = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }));

    try {
      // Use streamText from Vercel AI SDK with correct model identifier
      const result = await streamText({
        model: anthropic('claude-sonnet-4.5'), // Vercel AI Gateway format
        system: systemPrompt,
        messages: formattedMessages,
      });

      // Handle streaming response
      if (stream) {
        console.log("Streaming response with Vercel AI SDK + Claude Sonnet");
        
        // Convert AI SDK stream to SSE format
        const encoder = new TextEncoder();
        const sseStream = new ReadableStream({
          async start(controller) {
            try {
              for await (const chunk of result.textStream) {
                const sseData = `data: ${JSON.stringify({ choices: [{ delta: { content: chunk } }] })}\n\n`;
                controller.enqueue(encoder.encode(sseData));
              }
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              controller.close();
            } catch (error) {
              console.error("Stream error:", error);
              controller.error(error);
            }
          }
        });

        return new Response(sseStream, {
          headers: {
            ...corsHeaders,
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
          },
        });
      } else {
        // Non-streaming response
        const fullText = await result.text;
        console.log("Response generated with Claude Sonnet, length:", fullText.length);
        
        return new Response(
          JSON.stringify({ response: fullText }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

    } catch (aiError) {
      console.error("AI SDK error:", aiError);
      
      // Provide fallback response
      const fallbackResponse = `I'm here to help with your legal questions! While I'm having trouble connecting to my full AI capabilities right now, here are some general resources:

1. For **document generation**, visit our Generate page
2. For **court preparation**, check our Court Prep tools
3. For **specific legal hubs**, we have specialized assistants for custody, DUI, wills, and more

Please try your question again in a moment, or explore our other features.

Remember: For urgent legal matters, please consult a licensed attorney.`;

      if (stream) {
        return new Response(
          createSSEFallbackStream(fallbackResponse),
          { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } }
        );
      } else {
        return new Response(
          JSON.stringify({ response: fallbackResponse }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

  } catch (error) {
    console.error("Error in legal-chat:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
