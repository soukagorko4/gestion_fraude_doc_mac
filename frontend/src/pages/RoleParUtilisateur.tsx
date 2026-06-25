import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Users, ChevronDown, ChevronRight, Mail, Phone, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface UserRow {
  id: number;
  prenom: string;
  nom: string;
  username: string;
  email: string;
  contact: string | null;
  active: boolean;
  role_id: number | null;
  service_id: number | null;
  created_at: string;
  roles?: { nom_role: string; desc_role: string };
  services?: { nom_service: string };
}

export default function RoleParUtilisateur() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [openRoles, setOpenRoles] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      const { data: users } = await supabase
        .from("users" as any)
        .select("id, prenom, nom, username, email, contact, active, role_id, service_id, created_at, roles(nom_role, desc_role), services(nom_service)")
        .order("created_at", { ascending: false });
      const list = (users as any) || [];
      setRows(list);
      setLoading(false);
    })();
  }, []);

  const grouped = useMemo(() => {
    const g: Record<string, UserRow[]> = {};
    rows.forEach((r) => {
      const key = r.roles?.nom_role || "Sans rôle";
      (g[key] ||= []).push(r);
    });
    return Object.entries(g).sort((a, b) => b[1].length - a[1].length);
  }, [rows]);

  const filteredGrouped = useMemo(() => {
    if (!search.trim()) return grouped;
    const q = search.toLowerCase();
    return grouped
      .map(([roleName, users]) => {
        const filteredUsers = users.filter(
          (u) =>
            u.prenom.toLowerCase().includes(q) ||
            u.nom.toLowerCase().includes(q) ||
            u.username.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            (u.contact || "").toLowerCase().includes(q) ||
            (u.services?.nom_service || "").toLowerCase().includes(q)
        );
        return [roleName, filteredUsers] as [string, UserRow[]];
      })
      .filter(([, users]) => users.length > 0);
  }, [grouped, search]);

  const totalUsers = rows.length;

  const toggle = (k: string) => {
    setOpenRoles((prev) => {
      const n = new Set(prev);
      n.has(k) ? n.delete(k) : n.add(k);
      return n;
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Utilisateurs par rôle</h1>
            <p className="text-sm text-muted-foreground">
              {totalUsers} utilisateur{totalUsers > 1 ? "s" : ""} réparti{totalUsers > 1 ? "s" : ""} dans {grouped.length} rôle{grouped.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un utilisateur..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-3">
        {filteredGrouped.map(([roleName, users]) => {
          const isOpen = openRoles.has(roleName);
          const desc = users[0]?.roles?.desc_role || "";
          return (
            <div key={roleName} className="rounded-xl border border-border bg-card overflow-hidden">
              <Button
                variant="ghost"
                onClick={() => toggle(roleName)}
                className="w-full flex items-center justify-between p-4 h-auto hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                  <Users className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <span className="font-semibold text-base block">{roleName}</span>
                    {desc && <span className="text-xs text-muted-foreground">{desc}</span>}
                  </div>
                </div>
                <Badge variant="secondary" className="text-sm">
                  {users.length} utilisateur{users.length > 1 ? "s" : ""}
                </Badge>
              </Button>

              {isOpen && (
                <div className="overflow-x-auto border-t border-border">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Nom complet</th>
                        <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Username</th>
                        <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                        <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Contact</th>
                        <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Service</th>
                        <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-b transition-colors hover:bg-muted/50">
                          <td className="p-4 align-middle font-medium">
                            {u.prenom} {u.nom}
                          </td>
                          <td className="p-4 align-middle">{u.username}</td>
                          <td className="p-4 align-middle">
                            <div className="flex items-center gap-1.5">
                              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm">{u.email}</span>
                            </div>
                          </td>
                          <td className="p-4 align-middle">
                            {u.contact ? (
                              <div className="flex items-center gap-1.5">
                                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-sm">{u.contact}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="p-4 align-middle">
                            {u.services?.nom_service ? (
                              <div className="flex items-center gap-1.5">
                                <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-sm">{u.services.nom_service}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="p-4 align-middle">
                            {u.active ? (
                              <Badge>Actif</Badge>
                            ) : (
                              <Badge variant="destructive">Désactivé</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}

        {filteredGrouped.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            Aucun utilisateur trouvé pour cette recherche.
          </div>
        )}
      </div>
    </div>
  );
}
