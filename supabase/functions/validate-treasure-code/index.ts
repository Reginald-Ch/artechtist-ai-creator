import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code } = await req.json();

    if (!code || code.length !== 5 || !/^\d{5}$/.test(code)) {
      return new Response(
        JSON.stringify({ error: "Invalid treasure code format. Must be 5 digits." }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    // Create Supabase client with service role key to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if treasure code exists and is valid
    const { data: treasureCode, error: fetchError } = await supabaseAdmin
      .from("treasure_codes")
      .select("*")
      .eq("code", code)
      .eq("is_active", true)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (fetchError || !treasureCode) {
      console.log("Code validation failed:", fetchError);
      return new Response(
        JSON.stringify({ 
          error: "Invalid or expired treasure code. Check your code and try again!" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401 
        }
      );
    }

    // Create a temporary user session using the anon client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Create a temporary email for this treasure code session
    const tempEmail = `treasure_${code}@temp.artechtist.com`;
    const tempPassword = `treasure_${code}_${Date.now()}`;

    // Try to sign up the temporary user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: tempEmail,
      password: tempPassword,
      options: {
        data: {
          first_name: "Treasure Hunter",
          last_name: "",
          is_treasure_user: true,
          treasure_code: code,
          treasure_expires_at: treasureCode.expires_at
        }
      }
    });

    if (authError && !authError.message.includes("already registered")) {
      console.log("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Failed to create treasure session" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500 
        }
      );
    }

    // If user already exists, sign them in
    let session = authData?.session;
    if (!session) {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: tempEmail,
        password: tempPassword,
      });

      if (signInError) {
        console.log("Sign in error:", signInError);
        return new Response(
          JSON.stringify({ error: "Failed to access treasure session" }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500 
          }
        );
      }
      session = signInData.session;
    }

    // Update treasure code usage
    await supabaseAdmin
      .from("treasure_codes")
      .update({ 
        last_used_at: new Date().toISOString(),
        usage_count: treasureCode.usage_count + 1
      })
      .eq("id", treasureCode.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        session: session,
        message: "Welcome to your treasure hunt adventure!",
        expires_at: treasureCode.expires_at
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error("Treasure code validation error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});