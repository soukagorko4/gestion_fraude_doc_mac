import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Caller client to verify admin
    const userClient = createClient(url, anon, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData.user) return json({ error: "Unauthorized" }, 401);

    const { data: profile } = await userClient
      .from("profiles").select("role").eq("id", userData.user.id).single();
    if (profile?.role !== "ADMIN") return json({ error: "Forbidden — admin only" }, 403);

    const admin = createClient(url, service);
    const body = await req.json();
    const { action } = body;

    if (action === "create") {
      const { prenom, nom, contact, role_id, service_id, username, password, active, force_password_change } = body;
      if (!prenom || !nom || !username || !password) return json({ error: "Champs requis manquants" }, 400);

      // Get role name from role_id
      const { data: roleRow } = await admin.from("roles").select("nom_role").eq("id", role_id).single();
      const roleName = roleRow?.nom_role || "USER";
      const email = `${username}@dpaf.sn`;

      const { data: created, error: cErr } = await admin.auth.admin.createUser({
        email, password, email_confirm: true,
        user_metadata: { username, full_name: `${prenom} ${nom}`, role: roleName },
      });
      if (cErr) return json({ error: cErr.message }, 400);

      // Insert into users table
      const { error: uErr } = await admin.from("users").insert({
        auth_user_id: created.user.id,
        prenom, nom, contact: contact || "", role_id, service_id,
        username, email, active: active ?? true,
        force_password_change: force_password_change ?? false,
        password_last_changed: new Date().toISOString(),
      });
      if (uErr) {
        await admin.auth.admin.deleteUser(created.user.id);
        return json({ error: uErr.message }, 400);
      }
      return json({ success: true, id: created.user.id });
    }

    if (action === "update") {
      const { id, prenom, nom, contact, role_id, service_id, active, force_password_change, password } = body;
      const { data: userRow } = await admin.from("users").select("auth_user_id, username").eq("id", id).single();
      if (!userRow) return json({ error: "Utilisateur introuvable" }, 404);

      const { data: roleRow } = await admin.from("roles").select("nom_role").eq("id", role_id).single();
      const roleName = roleRow?.nom_role || "USER";

      const updates: any = { prenom, nom, contact, role_id, service_id, active, force_password_change };
      if (password) {
        await admin.auth.admin.updateUserById(userRow.auth_user_id, { password });
        updates.password_last_changed = new Date().toISOString();
        updates.force_password_change = force_password_change ?? false;
      }
      await admin.from("users").update(updates).eq("id", id);
      await admin.from("profiles").update({ role: roleName, full_name: `${prenom} ${nom}` }).eq("id", userRow.auth_user_id);
      return json({ success: true });
    }

    if (action === "delete") {
      const { id } = body;
      const { data: userRow } = await admin.from("users").select("auth_user_id").eq("id", id).single();
      if (!userRow) return json({ error: "Utilisateur introuvable" }, 404);
      if (userRow.auth_user_id) await admin.auth.admin.deleteUser(userRow.auth_user_id);
      await admin.from("users").delete().eq("id", id);
      return json({ success: true });
    }

    if (action === "toggle_active") {
      const { id, active } = body;
      await admin.from("users").update({ active }).eq("id", id);
      return json({ success: true });
    }

    return json({ error: "Action inconnue" }, 400);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
