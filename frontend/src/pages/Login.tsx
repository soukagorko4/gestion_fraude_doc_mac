import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LogIn, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import loginBg from "../../public/login-bg.jpg";
import armoiries from "@/assets/armoiries-senegal.png";
import {
  getLoginAttempt, recordFailedAttempt, resetAttempts, isLocked,
  MAX_FAILED, LOCK_MINUTES,
} from "@/lib/security";
import { logAudit } from "@/lib/audit";


export default function Login() {
  const { signIn } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [loading, setLoading] = useState(false);
  const [lockRemaining, setLockRemaining] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);

  // countdown timer
  useEffect(() => {
    if (lockRemaining <= 0) return;
    const t = setInterval(() => setLockRemaining((s) => Math.max(0, s - 1000)), 1000);
    return () => clearInterval(t);
  }, [lockRemaining]);

  const checkAttempt = async (u: string) => {
    const att = await getLoginAttempt(u);
    const { locked, remainingMs } = isLocked(att);
    if (locked) {
      setLockRemaining(remainingMs);
      return true;
    }
    if (att) setRemainingAttempts(Math.max(0, MAX_FAILED - att.failed_count));
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setWarning("");
    setLoading(true);

    const u = username.trim().toLowerCase();
    try {
      // 1. Check lock
      if (await checkAttempt(u)) {
        const message = `Compte bloqué; merci d'attendre ${LOCK_MINUTES} mn pour réessayer !!!`;
        setError(message);
        toast.error(message);
        return;
      }

      // (Removed client-side Supabase pre-check) Laisser le backend décider de l'état du compte

      // 3. Try sign in
      const { error: signErr } = await signIn(u, password);
      if (signErr) {
        // Essayer d'afficher le message précis renvoyé par l'API (ex: compte désactivé)
        let serverMessage: string | null = null;
        try {
          if (typeof signErr === "object" && signErr !== null) {
            serverMessage = (signErr as any).message || (signErr as any).error || JSON.stringify(signErr);
          } else {
            serverMessage = String(signErr);
          }
        } catch (e) {
          serverMessage = String(signErr);
        }

        if (serverMessage) {
          setError(serverMessage);
          toast.error(serverMessage);
          await logAudit("LOGIN_FAILED", { username: u, details: serverMessage });
          // Si le message indique un compte désactivé, arrêter ici (ne pas incrémenter le compteur)
          if (/desactiv/i.test(serverMessage) || /désactiv/i.test(serverMessage)) {
            return;
          }
        }

        // Sinon, comportement par défaut : enregistrer tentative et appliquer verrouillage si nécessaire
        const res = await recordFailedAttempt(u);
        await logAudit("LOGIN_FAILED", { username: u, details: { remaining: res.remaining } });
        if (res.locked_until) {
          setLockRemaining(new Date(res.locked_until).getTime() - Date.now());
          const message = `Compte bloqué; merci d'attendre ${LOCK_MINUTES} mn pour réessayer !!!`;
          setError(message);
          toast.error(message);
          await logAudit("ACCOUNT_LOCKED", { username: u });
        } else {
          setRemainingAttempts(res.remaining);
          const message = `Identifiants incorrects. Il vous reste ${res.remaining} tentative${res.remaining > 1 ? "s" : ""}.`;
          setError(message);
          toast.error(message);
        }
        return;
      }

      // 4. Success: reset attempts, log
      await resetAttempts(u);
      await logAudit("LOGIN_SUCCESS", { username: u });
      toast.success("Connexion réussie");
    } finally {
      setLoading(false);
    }
  };

  const lockMinSec = () => {
    const total = Math.ceil(lockRemaining / 1000);
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
  };

  return (
    // <div
    //   className="relative flex min-h-screen items-center justify-center p-4"
    //   style={{
    //     backgroundImage: `url(${loginBg})`,
    //     backgroundSize: "cover",
    //     backgroundPosition: "center",
    //     backgroundRepeat: "no-repeat",
    //   }}
    // >

    <div
        style={{
          backgroundImage: "url('/login-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "100vh"
        }}
      >
        
      {/* Overlay sombre pour la lisibilité */}
      <div className="absolute inset-0 bg-[#0c2340]/80" />

      <Card className="relative z-10 w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center">
            <img src={armoiries} alt="Armoiries du Sénégal" className="h-20 w-20 object-contain" />
          </div>
          <CardTitle className="text-2xl text-[#0c2340]">DPAF - Connexion</CardTitle>
          <CardDescription className="text-[#2d8a9e]">Système de gestion des fraudes documentaires</CardDescription>
        </CardHeader>
        <CardContent>
          {lockRemaining > 0 && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Compte bloqué. Réessayez dans <strong>{lockMinSec()}</strong>.
              </AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nom d'utilisateur</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={(e) => e.target.value && checkAttempt(e.target.value.trim().toLowerCase())}
                placeholder="admin, user1, superviseur"
                disabled={lockRemaining > 0}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={lockRemaining > 0}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {warning && <p className="text-sm text-amber-600">{warning}</p>}
            {remainingAttempts !== null && remainingAttempts < MAX_FAILED && remainingAttempts > 0 && !error && (
              <p className="text-xs text-muted-foreground">
                Il vous reste {remainingAttempts} tentative{remainingAttempts > 1 ? "s" : ""}.
              </p>
            )}
            <Button type="submit" className="w-full gap-2" disabled={loading || lockRemaining > 0}>
              <LogIn className="h-4 w-4" />
              {loading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>
          <div className="mt-4 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
            <p className="font-medium mb-1">Comptes de test :</p>
            <p>admin / password • admin2 / password • user / password • user2 / password</p>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Le compte <strong>admin / password</strong> est maintenant disponible pour les tests administrateurs.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
