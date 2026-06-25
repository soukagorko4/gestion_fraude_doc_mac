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
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { apiJson } from "@/hooks/useApi";

interface SP {
  id: number;
  nomServiceParent: string;
  sigleServiceParent: string;
  descServiceParent: string;
  contactServiceParent: string | null;
  adresseServiceParent: string | null;
  statutChefServiceParent: string;
  nomChefServiceParent: string;
  gradeChefServiceParent: string;
  fonctionChefServiceParent: string;
  contactChefServiceParent: string;
}

const empty: Omit<SP, "id"> = {
  nomServiceParent: "",
  sigleServiceParent: "",
  descServiceParent: "",
  contactServiceParent: "",
  adresseServiceParent: "",
  statutChefServiceParent: "",
  nomChefServiceParent: "",
  gradeChefServiceParent: "",
  fonctionChefServiceParent: "",
  contactChefServiceParent: "",
};

export default function AdminServiceParents() {
  const { profile, loading } = useAuth();
  const [rows, setRows] = useState<SP[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SP | null>(null);
  const [form, setForm] = useState(empty);
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
      const data = await apiJson("/api/service-parents");
      setRows(data || []);
    } catch (error: any) {
      toast.error(error?.message || "Erreur de chargement des services parents");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => rows.filter(r =>
    `${r.nomServiceParent} ${r.sigleServiceParent} ${r.nomChefServiceParent}`.toLowerCase().includes(search.toLowerCase())
  ), [rows, search]);

  if (loading) return null;
  if (isLoading) return null;
  if (profile?.role !== "ADMIN") return <Navigate to="/" replace />;

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (r: SP) => { setEditing(r); const { id, ...rest } = r; setForm(rest); setOpen(true); };

  const submit = async () => {
    const required = [
      "nomServiceParent",
      "sigleServiceParent",
      "descServiceParent",
      "statutChefServiceParent",
      "nomChefServiceParent",
      "gradeChefServiceParent",
      "fonctionChefServiceParent",
      "contactChefServiceParent",
    ];
    for (const k of required) {
      if (!(form as any)[k]?.toString().trim()) {
        toast.error("Champs obligatoires manquants");
        return;
      }
    }

    setActionLoading(true);
    try {
      const url = editing ? `/api/service-parents/${editing.id}` : "/api/service-parents";
      const method = editing ? "PUT" : "POST";
      const data = await apiJson(url, {
        method,
        body: JSON.stringify(form),
      });

      toast.success(editing ? "Service parent modifié" : "Service parent ajouté");
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
      const data = await apiJson(`/api/service-parents/${deleteId}`, { method: "DELETE" });
      toast.success("Service parent supprimé");
      await fetchData();
    } catch (error: any) {
      toast.error(error?.message || "Suppression impossible (services liés ?)");
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
          <h1 className="text-3xl font-bold">Services Parents</h1>
          <p className="text-muted-foreground">Gestion des directions & services parents</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Ajouter</Button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <Badge variant="secondary" className="text-sm">{filtered.length} enregistrement(s)</Badge>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="rounded-lg border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sigle</TableHead><TableHead>Nom</TableHead><TableHead>Chef</TableHead>
              <TableHead>Contact</TableHead><TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.sigleServiceParent}</TableCell>
                <TableCell>{r.nomServiceParent}</TableCell>
                <TableCell>{r.gradeChefServiceParent} {r.nomChefServiceParent}</TableCell>
                <TableCell>{r.contactServiceParent}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => setDeleteId(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Aucun résultat</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Modifier" : "Ajouter"} un service parent</DialogTitle>
            <DialogDescription>Renseignez les informations du service parent.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            {F("nomServiceParent","Nom")}{F("sigleServiceParent","Sigle")}
            <div className="col-span-2">{F("descServiceParent","Description")}</div>
            {F("contactServiceParent","Contact")}{F("adresseServiceParent","Adresse")}
            {F("statutChefServiceParent","Statut du chef")}{F("nomChefServiceParent","Nom du chef")}
            {F("gradeChefServiceParent","Grade du chef")}{F("fonctionChefServiceParent","Fonction du chef")}
            <div className="col-span-2">{F("contactChefServiceParent","Contact du chef")}</div>
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
            <AlertDialogDescription>Cette action est irréversible et échouera si des services y sont liés.</AlertDialogDescription>
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
