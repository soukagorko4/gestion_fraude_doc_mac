import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData.user) return json({ error: "Unauthorized" }, 401);

    const { current_password, new_password } = await req.json();
    if (!new_password || new_password.length < 6) return json({ error: "Mot de passe trop court (min 6)" }, 400);

    // Verify current password by re-signing in
    if (current_password) {
      const verify = await userClient.auth.signInWithPassword({
        email: userData.user.email!, password: current_password,
      });
      if (verify.error) return json({ error: "Mot de passe actuel incorrect" }, 400);
    }

    const admin = createClient(url, service);
    const { error: pErr } = await admin.auth.admin.updateUserById(userData.user.id, { password: new_password });
    if (pErr) return json({ error: pErr.message }, 400);

    await admin.from("users")
      .update({ force_password_change: false, password_last_changed: new Date().toISOString() })
      .eq("auth_user_id", userData.user.id);

    return json({ success: true });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
