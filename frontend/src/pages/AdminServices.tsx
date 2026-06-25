import { useEffect, useState, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { apiJson } from "@/hooks/useApi";

interface SP { id: number; sigleServiceParent: string; nomServiceParent: string; }
interface S {
  id: number; nomService: string; sigleService: string; descService: string;
  contactService: string | null; adresseService: string | null;
  statutChefService: string; nomChefService: string; gradeChefService: string;
  fonctionChefService: string; contactChefService: string; serviceParentId: number;
}

const empty = {
  nomService: "", sigleService: "", descService: "", contactService: "", adresseService: "",
  statutChefService: "", nomChefService: "", gradeChefService: "",
  fonctionChefService: "", contactChefService: "", serviceParentId: 0,
};

export default function AdminServices() {
  const { profile, loading } = useAuth();
  const [rows, setRows] = useState<S[]>([]);
  const [parents, setParents] = useState<SP[]>([]);
  const [search, setSearch] = useState("");
  const [filterParent, setFilterParent] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<S | null>(null);
  const [form, setForm] = useState<typeof empty>(empty);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const parseJSON = async (response: Response) => {
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [sData, pData] = await Promise.all([
        apiJson("/api/services"),
        apiJson("/api/service-parents"),
      ]);
      setRows(sData || []);
      setParents(pData || []);
    } catch (error: any) {
      toast.error(error?.message || "Erreur de chargement");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => rows.filter(r => {
    const matchSearch = `${r.nomService} ${r.sigleService} ${r.nomChefService}`.toLowerCase().includes(search.toLowerCase());
    const matchParent = filterParent === "all" || String(r.serviceParentId) === filterParent;
    return matchSearch && matchParent;
  }), [rows, search, filterParent]);

  if (loading) return null;
  if (isLoading) return null;
  if (profile?.role !== "ADMIN") return <Navigate to="/" replace />;

  const parentLabel = (id: number) => parents.find(p => p.id === id)?.sigleServiceParent ?? "—";

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (r: S) => { setEditing(r); const { id, ...rest } = r; setForm(rest); setOpen(true); };

  const submit = async () => {
    if (!form.serviceParentId) { toast.error("Service parent requis"); return; }
    const required = ["nomService","sigleService","descService","statutChefService","nomChefService","gradeChefService","fonctionChefService","contactChefService"];
    for (const k of required) {
      if (!(form as any)[k]?.toString().trim()) {
        toast.error("Champs obligatoires manquants");
        return;
      }
    }

    setActionLoading(true);
    try {
      const url = editing ? `/api/services/${editing.id}` : "/api/services";
      const method = editing ? "PUT" : "POST";
      // Ensure serviceParentId is included and serviceParentId is a valid number
      const payload = { ...form, serviceParentId: Number(form.serviceParentId) };
      const data = await apiJson(url, {
        method,
        body: JSON.stringify(payload),
      });

      toast.success(editing ? "Service modifié" : "Service ajouté");
      setOpen(false);
      await fetchData();
    } catch (error: any) {
      toast.error(error?.message || "Erreur lors de l'enregistrement");
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setActionLoading(true);
    try {
      const data = await apiJson(`/api/services/${deleteId}`, { method: "DELETE" });
      toast.success("Service supprimé");
      await fetchData();
    } catch (error: any) {
      toast.error(error?.message || "Suppression impossible");
    } finally {
      setActionLoading(false);
      setDeleteId(null);
    }
  };

  const F = (k: keyof typeof empty, label: string) => (
    <div><Label>{label}</Label><Input value={(form as any)[k] ?? ""} onChange={e => setForm({ ...form, [k]: e.target.value })} /></div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Services</h1>
          <p className="text-muted-foreground">Gestion des services rattachés</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Ajouter</Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <Badge variant="secondary" className="text-sm">{filtered.length} enregistrement(s)</Badge>
        <div className="flex gap-2 flex-1 justify-end">
          <Select value={filterParent} onValueChange={setFilterParent}>
            <SelectTrigger className="w-[220px]"><SelectValue placeholder="Filtrer par service parent" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les services parents</SelectItem>
              {parents.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.sigleServiceParent}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sigle</TableHead><TableHead>Nom</TableHead><TableHead>Service Parent</TableHead>
              <TableHead>Chef</TableHead><TableHead>Contact</TableHead><TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.sigleService}</TableCell>
                <TableCell>{r.nomService}</TableCell>
                <TableCell><Badge variant="outline">{parentLabel(r.serviceParentId)}</Badge></TableCell>
                <TableCell>{r.gradeChefService} {r.nomChefService}</TableCell>
                <TableCell>{r.contactService}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => setDeleteId(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Aucun résultat</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Modifier" : "Ajouter"} un service</DialogTitle>
            <DialogDescription>Renseignez les informations du service.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Service parent</Label>
              <Select value={form.serviceParentId ? String(form.serviceParentId) : ""} onValueChange={(v) => setForm({ ...form, serviceParentId: Number(v) })}>
                <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                <SelectContent>
                  {parents.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.sigleServiceParent} — {p.nomServiceParent}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {F("nomService","Nom")}{F("sigleService","Sigle")}
            <div className="col-span-2">{F("descService","Description")}</div>
            {F("contactService","Contact")}{F("adresseService","Adresse")}
            {F("statutChefService","Statut du chef")}{F("nomChefService","Nom du chef")}
            {F("gradeChefService","Grade du chef")}{F("fonctionChefService","Fonction du chef")}
            <div className="col-span-2">{F("contactChefService","Contact du chef")}</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={submit}>{editing ? "Modifier" : "Ajouter"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
