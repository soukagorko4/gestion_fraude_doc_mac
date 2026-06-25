import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Building2, ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Row {
  id: number;
  date_fraude: string | null;
  prenom_fraudeur: string;
  nom_fraudeur: string;
  lieu_fraude: string;
  zone: string;
  user_id: string;
  societe_id: number;
  societes?: { label: string };
  vols?: { numero: string; destination: string };
}

export default function ListeCasdeFraudeParService() {
  const [rows, setRows] = useState<Row[]>([]);
  const [profilesMap, setProfilesMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [openServices, setOpenServices] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      const { data: fraudes } = await supabase
        .from("fraudes")
        .select("id, date_fraude, prenom_fraudeur, nom_fraudeur, lieu_fraude, zone, user_id, societe_id, societes(label), vols(numero, destination)")
        .order("created_at", { ascending: false });
      const list = (fraudes as any) || [];
      setRows(list);

      const userIds = Array.from(new Set(list.map((r: Row) => r.user_id))) as string[];
      if (userIds.length > 0) {
        const { data: profs } = await supabase.from("profiles").select("id, full_name, username").in("id", userIds);
        const map: Record<string, string> = {};
        (profs || []).forEach((p: any) => { map[p.id] = p.full_name || p.username; });
        setProfilesMap(map);
      }
      setLoading(false);
    })();
  }, []);

  const grouped = useMemo(() => {
    const g: Record<string, Row[]> = {};
    rows.forEach((r) => {
      const key = r.societes?.label || "Sans service";
      (g[key] ||= []).push(r);
    });
    return Object.entries(g).sort((a, b) => b[1].length - a[1].length);
  }, [rows]);

  const toggle = (k: string) => {
    setOpenServices((prev) => {
      const n = new Set(prev);
      n.has(k) ? n.delete(k) : n.add(k);
      return n;
    });
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Cas par service</h1>
        <p className="mt-1 text-muted-foreground">Liste des cas de fraude regroupés par service ({rows.length} cas)</p>
      </div>

      <div className="space-y-3">
        {grouped.map(([service, items]) => {
          const isOpen = openServices.has(service);
          return (
            <div key={service} className="rounded-xl border border-border bg-card overflow-hidden">
              <Button
                variant="ghost"
                onClick={() => toggle(service)}
                className="w-full flex items-center justify-between p-4 h-auto hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                  <Building2 className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-base">{service}</span>
                </div>
                <Badge variant="secondary" className="text-sm">{items.length} cas</Badge>
              </Button>

              {isOpen && (
                <div className="overflow-x-auto border-t border-border">
                  <table className="data-table w-full">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Fraudeur</th>
                        <th>Vol</th>
                        <th>Lieu</th>
                        <th>Zone</th>
                        <th>Enregistré par</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((r) => (
                        <tr key={r.id}>
                          <td>{r.date_fraude ? format(new Date(r.date_fraude), "dd MMM yyyy", { locale: fr }) : "-"}</td>
                          <td>{r.prenom_fraudeur} {r.nom_fraudeur}</td>
                          <td className="font-mono text-sm">{r.vols?.numero || "-"}</td>
                          <td>{r.lieu_fraude}</td>
                          <td><span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium">{r.zone}</span></td>
                          <td className="text-sm text-muted-foreground">{profilesMap[r.user_id] || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
