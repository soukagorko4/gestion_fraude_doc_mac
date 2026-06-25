import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { apiJson } from "@/hooks/useApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { KeyRound, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { logAudit } from "@/lib/audit";
import { passwordAgeStatus } from "@/lib/security";

export default function ChangePassword() {
  const { appUser, profile, refreshAppUser } = useAuth();
  const navigate = useNavigate();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const forced = appUser?.force_password_change ?? false;
  const ageInfo = appUser && profile
    ? passwordAgeStatus(appUser.password_last_changed, profile.role)
    : null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (next.length < 6) return setError("Mot de passe trop court (min 6 caractères).");
    if (next !== confirm) return setError("Les mots de passe ne correspondent pas.");

    setLoading(true);
    try {
      await apiJson("/api/users/change-password", {
        method: "PUT",
        body: JSON.stringify({
          oldPassword: forced ? undefined : current,
          newPassword: next,
        }),
      });
      await logAudit("PASSWORD_CHANGED");
      await refreshAppUser();
      toast.success("Mot de passe modifié avec succès");
      navigate("/");
    } catch (error: any) {
      const message = error?.message || "Erreur lors de la modification du mot de passe";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <KeyRound className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Changer le mot de passe</CardTitle>
              <CardDescription>Mettez à jour votre mot de passe</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {forced && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>Mot de passe expiré, merci de le changer pour continuer.</AlertDescription>
            </Alert>
          )}
          {!forced && ageInfo?.warn && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Votre mot de passe expire dans {ageInfo.daysLeft} jour{ageInfo.daysLeft > 1 ? "s" : ""}.
              </AlertDescription>
            </Alert>
          )}
          <form onSubmit={submit} className="space-y-4">
            {!forced && (
              <div className="space-y-2">
                <Label>Mot de passe actuel</Label>
                <Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
              </div>
            )}
            <div className="space-y-2">
              <Label>Nouveau mot de passe</Label>
              <Input type="password" value={next} onChange={(e) => setNext(e.target.value)} required minLength={6} />
            </div>
            <div className="space-y-2">
              <Label>Confirmer</Label>
              <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Modification..." : "Modifier le mot de passe"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
