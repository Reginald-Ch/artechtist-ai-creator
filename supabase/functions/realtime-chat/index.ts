import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { 
      status: 400,
      headers: corsHeaders 
    });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  // Get OpenAI API key from environment
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    console.error('OpenAI API key not found');
    socket.close(1000, 'OpenAI API key not configured');
    return response;
  }

  let openAISocket: WebSocket | null = null;
  let sessionConfigured = false;

  const connectToOpenAI = () => {
    try {
      openAISocket = new WebSocket(
        'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01',
        [],
        {
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'OpenAI-Beta': 'realtime=v1'
          }
        }
      );

      openAISocket.onopen = () => {
        console.log('Connected to OpenAI Realtime API');
      };

      openAISocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('OpenAI message type:', data.type);

          // Configure session after connection
          if (data.type === 'session.created' && !sessionConfigured) {
            const sessionConfig = {
              type: 'session.update',
              session: {
                modalities: ['text', 'audio'],
                instructions: 'You are a helpful AI assistant for voice training. You can help users practice pronunciation, provide feedback, and have conversations to improve their speaking skills.',
                voice: 'alloy',
                input_audio_format: 'pcm16',
                output_audio_format: 'pcm16',
                input_audio_transcription: {
                  model: 'whisper-1'
                },
                turn_detection: {
                  type: 'server_vad',
                  threshold: 0.5,
                  prefix_padding_ms: 300,
                  silence_duration_ms: 1000
                },
                temperature: 0.8,
                max_response_output_tokens: 'inf'
              }
            };
            
            openAISocket?.send(JSON.stringify(sessionConfig));
            sessionConfigured = true;
            console.log('Session configured with voice training settings');
          }

          // Forward message to client
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(event.data);
          }
        } catch (error) {
          console.error('Error processing OpenAI message:', error);
        }
      };

      openAISocket.onerror = (error) => {
        console.error('OpenAI WebSocket error:', error);
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({
            type: 'error',
            message: 'OpenAI connection error'
          }));
        }
      };

      openAISocket.onclose = () => {
        console.log('OpenAI WebSocket closed');
        if (socket.readyState === WebSocket.OPEN) {
          socket.close();
        }
      };
    } catch (error) {
      console.error('Failed to connect to OpenAI:', error);
      socket.close(1000, 'Failed to connect to OpenAI');
    }
  };

  // Client WebSocket handlers
  socket.onopen = () => {
    console.log('Client connected to realtime chat');
    connectToOpenAI();
  };

  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      console.log('Client message type:', message.type);
      
      // Forward client messages to OpenAI
      if (openAISocket && openAISocket.readyState === WebSocket.OPEN) {
        openAISocket.send(event.data);
      } else {
        console.warn('OpenAI socket not ready, message dropped');
      }
    } catch (error) {
      console.error('Error processing client message:', error);
    }
  };

  socket.onclose = () => {
    console.log('Client disconnected');
    if (openAISocket && openAISocket.readyState === WebSocket.OPEN) {
      openAISocket.close();
    }
  };

  socket.onerror = (error) => {
    console.error('Client WebSocket error:', error);
    if (openAISocket && openAISocket.readyState === WebSocket.OPEN) {
      openAISocket.close();
    }
  };

  return response;
});