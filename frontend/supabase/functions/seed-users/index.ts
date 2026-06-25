import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const users = [
    { email: "admin@dpaf.sn", password: "password", username: "admin", full_name: "Administrateur", role: "ADMIN" },
    { email: "user1@dpaf.sn", password: "password", username: "user1", full_name: "Utilisateur 1", role: "USER" },
    { email: "superviseur@dpaf.sn", password: "password", username: "superviseur", full_name: "Superviseur", role: "SUPERVISEUR" },
    { email: "referant@dpaf.sn", password: "password", username: "referant", full_name: "Référant", role: "REFERANT" },
  ];

  const results = [];
  for (const u of users) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { username: u.username, full_name: u.full_name, role: u.role },
    });
    results.push({ email: u.email, success: !error, error: error?.message });
  }

  return new Response(JSON.stringify(results), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
