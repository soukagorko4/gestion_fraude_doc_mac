import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Download, Eye, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
import { canModifyCase } from "@/lib/permissions";
import { CaseFormDialog } from "@/components/CaseFormDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface FraudeRow {
  id: number;
  date_fraude: string | null;
  prenom_fraudeur: string;
  nom_fraudeur: string;
  genre_fraudeur: string;
  lieu_fraude: string;
  provenance_destination: string;
  zone: string;
  user_id: string;
  created_at: string | null;
  nationalite_id: number;
  societe_id: number;
  vol_id: number;
  nationalites?: { label: string };
  societes?: { label: string };
  vols?: { numero: string; destination: string };
}

export default function CasesList() {
  const { user, profile } = useAuth();
  const [cases, setCases] = useState<FraudeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"view" | "edit">("view");
  const [activeId, setActiveId] = useState<number | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<number[] | null>(null);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("fraudes")
        .select("*, nationalites(label), societes(label), vols(numero, destination)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setCases((data as any) || []);
    } catch (error: any) {
      toast.error("Erreur de chargement des cas : " + (error?.message || "Erreur inconnue"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCases(); }, []);

  const filtered = useMemo(() => {
    return cases.filter((c) => {
      const s = search.toLowerCase();
      const matchSearch = !s ||
        c.nom_fraudeur.toLowerCase().includes(s) ||
        c.prenom_fraudeur.toLowerCase().includes(s) ||
        c.lieu_fraude.toLowerCase().includes(s) ||
        c.vols?.numero?.toLowerCase().includes(s);
      const matchZone = zoneFilter === "all" || c.zone === zoneFilter;
      return matchSearch && matchZone;
    });
  }, [cases, search, zoneFilter]);

  const toggleOne = (id: number) => {
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const deletableSelected = useMemo(() =>
    Array.from(selected).filter(id => {
      const c = cases.find(x => x.id === id);
      return c && canModifyCase(c.created_at, c.user_id, user?.id, profile?.role);
    }), [selected, cases, user, profile]);

  const handleDelete = async (ids: number[]) => {
    await supabase.from("details").delete().in("fraude_id", ids);
    const { error } = await supabase.from("fraudes").delete().in("id", ids);
    if (error) {
      toast.error("Erreur: " + error.message);
    } else {
      toast.success(`${ids.length} cas supprimé(s)`);
      setSelected(new Set());
      fetchCases();
    }
    setConfirmDelete(null);
  };

  const openView = (id: number) => { setActiveId(id); setDialogMode("view"); setDialogOpen(true); };
  const openEdit = (id: number) => { setActiveId(id); setDialogMode("edit"); setDialogOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Liste des cas</h1>
          <p className="mt-1 text-muted-foreground">{filtered.length} cas sur {cases.length} total</p>
        </div>
        <div className="flex gap-2">
          {selected.size > 0 && (
            <Button
              variant="destructive"
              className="gap-2"
              disabled={deletableSelected.length === 0}
              onClick={() => setConfirmDelete(deletableSelected)}
            >
              <Trash2 className="h-4 w-4" />
              Supprimer ({deletableSelected.length}/{selected.size})
            </Button>
          )}
          <Button variant="outline" className="gap-2"><Download className="h-4 w-4" />Exporter</Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Rechercher par nom, lieu, vol..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={zoneFilter} onValueChange={setZoneFilter}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Zone" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes zones</SelectItem>
            <SelectItem value="ARRIVEE">Arrivée</SelectItem>
            <SelectItem value="DEPART">Départ</SelectItem>
            <SelectItem value="TRANSIT">Transit</SelectItem>
            <SelectItem value="NR">NR</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="data-table w-full">
            <thead>
              <tr>
                <th className="w-10"></th>
                <th>Date</th>
                <th>Fraudeur</th>
                <th>Vol</th>
                <th>Lieu</th>
                <th>Zone</th>
                <th>Société</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const canModify = canModifyCase(c.created_at, c.user_id, user?.id, profile?.role);
                return (
                  <tr key={c.id}>
                    <td>
                      <Checkbox checked={selected.has(c.id)} onCheckedChange={() => toggleOne(c.id)} />
                    </td>
                    <td className="font-medium">{c.date_fraude ? format(new Date(c.date_fraude), "dd MMM yyyy", { locale: fr }) : "-"}</td>
                    <td>{c.prenom_fraudeur} {c.nom_fraudeur}</td>
                    <td className="font-mono text-sm">{c.vols?.numero || "-"}</td>
                    <td>{c.lieu_fraude}</td>
                    <td><span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium">{c.zone}</span></td>
                    <td>{c.societes?.label || "-"}</td>
                    <td>
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openView(c.id)} title="Détail"><Eye className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => openEdit(c.id)} disabled={!canModify} title={canModify ? "Éditer" : "Délai dépassé"}><Pencil className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => setConfirmDelete([c.id])} disabled={!canModify} title={canModify ? "Supprimer" : "Délai dépassé"}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Filter className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-lg font-medium text-foreground">Aucun cas trouvé</p>
            </div>
          )}
        </div>
      )}

      <CaseFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        fraudeId={activeId}
        mode={dialogMode}
        onSaved={fetchCases}
      />

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Voulez-vous vraiment supprimer {confirmDelete?.length} cas ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmDelete && handleDelete(confirmDelete)}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
