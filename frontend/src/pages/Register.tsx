import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { apiJson } from "@/hooks/useApi";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import { logAudit } from "@/lib/audit";

const empty = {
  prenom: "", nom: "", contact: "", username: "",
  password: "", password_confirm: "",
  role_id: "", service_id: "",
  active: true, force_password_change: false,
};

export default function Register() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [roles, setRoles] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [form, setForm] = useState({ ...empty });
  const [showPwd, setShowPwd] = useState(false);
  const [showPwdConfirm, setShowPwdConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [r, s] = await Promise.all([
          apiJson("/api/roles"),
          apiJson("/api/services"),
        ]);
        setRoles(r || []);
        setServices(s || []);
      } catch (error: any) {
        toast.error(error?.message || "Impossible de charger les rôles et services");
      }
    })();
    logAudit("PAGE_VIEW", { entity: "register" });
  }, []);

  if (profile && profile.role !== "ADMIN") return <Navigate to="/" replace />;

  const submit = async () => {
    if (!form.prenom || !form.nom || !form.username) return toast.error("Champs obligatoires manquants");
    if (!form.password) return toast.error("Mot de passe obligatoire");
    if (form.password !== form.password_confirm) return toast.error("Les mots de passe ne correspondent pas");
    if (!form.role_id) return toast.error("Rôle obligatoire");
    if (!form.service_id) return toast.error("Service obligatoire");

    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prenom: form.prenom,
          nom: form.nom,
          contact: form.contact,
          username: form.username.toLowerCase(),
          password: form.password,
          roleId: Number(form.role_id),
          serviceId: Number(form.service_id),
          active: form.active,
          forcePasswordChange: form.force_password_change,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Erreur lors de la création de l'utilisateur");
        return;
      }

      toast.success("Utilisateur créé avec succès");
      await logAudit("USER_CREATED", { entity: "users", entity_id: form.username });
      setForm({ ...empty });
      // navigate("/admin/users");
      navigate("/login");
    } catch (error: any) {
      toast.error(error?.message || "Erreur réseau");
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <UserPlus className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Enregistrer un nouvel utilisateur</h1>
          <p className="text-sm text-muted-foreground">Créer un compte d'accès à la plateforme</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du compte</CardTitle>
          <CardDescription>Tous les champs marqués d'un * sont obligatoires</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Prénom *</Label><Input value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} /></div>
          <div className="space-y-2"><Label>Nom *</Label><Input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} /></div>
          <div className="space-y-2"><Label>Contact</Label><Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} /></div>
          <div className="space-y-2"><Label>Username *</Label><Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></div>

          <div className="space-y-2">
            <Label>Rôle *</Label>
            <Select value={form.role_id} onValueChange={(v) => setForm({ ...form, role_id: v })}>
              <SelectTrigger><SelectValue placeholder="Choisir un rôle" /></SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={String(r.id)}>
                    {(r as any).nom_role ?? (r as any).nomRole ?? `Rôle ${r.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Service</Label>
            <Select value={form.service_id} onValueChange={(v) => setForm({ ...form, service_id: v })}>
              <SelectTrigger><SelectValue placeholder="Choisir un service" /></SelectTrigger>
              <SelectContent>
                {services.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {(s as any).nom_service ?? (s as any).nomService ?? `Service ${s.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 col-span-2">
            <Label>Mot de passe *</Label>
            <div className="relative">
              <Input
                type={showPwd ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="pr-10"
              />
              <button type="button" onClick={() => setShowPwd((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPwd ? "Masquer" : "Afficher"}>
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2 col-span-2">
            <Label>Confirmer le mot de passe *</Label>
            <div className="relative">
              <Input
                type={showPwdConfirm ? "text" : "password"}
                value={form.password_confirm}
                onChange={(e) => setForm({ ...form, password_confirm: e.target.value })}
                className="pr-10"
              />
              <button type="button" onClick={() => setShowPwdConfirm((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPwdConfirm ? "Masquer" : "Afficher"}>
                {showPwdConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {form.password && form.password_confirm && form.password !== form.password_confirm && (
              <p className="text-xs text-destructive">Les mots de passe ne correspondent pas</p>
            )}
          </div>

          <div className="col-span-2 flex items-center justify-between border rounded-md p-3">
            <div>
              <Label>Activer le compte</Label>
              <p className="text-xs text-muted-foreground">
                {form.active ? "L'utilisateur pourra se connecter immédiatement" : "Compte désactivé — connexion bloquée"}
              </p>
            </div>
            <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
          </div>

          <div className="col-span-2 flex items-start gap-2 border rounded-md p-3">
            <Checkbox
              id="fpc-register"
              checked={form.force_password_change}
              onCheckedChange={(v) => setForm({ ...form, force_password_change: !!v })}
            />
            <Label htmlFor="fpc-register" className="cursor-pointer">
              Obliger l'utilisateur à changer son mot de passe à la première connexion
            </Label>
          </div>

          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setForm({ ...empty })}>Réinitialiser</Button>
            <Button onClick={submit} disabled={loading}>{loading ? "Enregistrement..." : "Enregistrer"}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
