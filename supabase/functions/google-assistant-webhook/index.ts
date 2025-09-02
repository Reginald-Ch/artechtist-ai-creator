import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const requestBody = await req.json()
    
    console.log('Google Assistant webhook request:', requestBody)

    // Extract user input from Google Assistant request
    const userInput = requestBody.inputs?.[0]?.rawInputs?.[0]?.query || ''
    const intent = requestBody.inputs?.[0]?.intent || ''

    // Simple response logic (in production, you'd use your bot logic)
    let responseText = "I'm your AI assistant. How can I help you today?"
    
    if (intent === 'actions.intent.MAIN') {
      responseText = "Welcome to your AI assistant! What would you like to know?"
    } else if (userInput.toLowerCase().includes('hello')) {
      responseText = "Hello! How are you doing today?"
    } else if (userInput.toLowerCase().includes('help')) {
      responseText = "I can help you with various tasks. Just ask me anything!"
    } else if (userInput) {
      responseText = `You said: "${userInput}". That's interesting! How can I help you with that?`
    }

    // Google Assistant response format
    const response = {
      conversationToken: requestBody.conversationToken || '',
      expectUserResponse: true,
      expectedInputs: [{
        inputPrompt: {
          richInitialPrompt: {
            items: [{
              simpleResponse: {
                textToSpeech: responseText,
                displayText: responseText
              }
            }]
          }
        },
        possibleIntents: [{
          intent: 'actions.intent.TEXT'
        }]
      }]
    }

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Webhook error:', error)
    
    const errorResponse = {
      conversationToken: '',
      expectUserResponse: false,
      finalResponse: {
        richResponse: {
          items: [{
            simpleResponse: {
              textToSpeech: "Sorry, I encountered an error. Please try again later.",
              displayText: "Sorry, I encountered an error. Please try again later."
            }
          }]
        }
      }
    }

    return new Response(
      JSON.stringify(errorResponse),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  }
})