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

interface Role { id: number; nomRole: string; descRole: string; }

export default function AdminRoles() {
  const { profile, loading } = useAuth();
  const [rows, setRows] = useState<Role[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [form, setForm] = useState({ nomRole: "", descRole: "" });
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const data = await apiJson("/api/roles");
      setRows(data || []);
    } catch (error: any) {
      toast.error(error?.message || "Erreur de chargement");
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() =>
    rows.filter(r => `${r.nomRole} ${r.descRole}`.toLowerCase().includes(search.toLowerCase())),
    [rows, search]
  );

  if (loading) return null;
  if (profile?.role !== "ADMIN") return <Navigate to="/" replace />;

  const openCreate = () => { setEditing(null); setForm({ nomRole: "", descRole: "" }); setOpen(true); };
  const openEdit = (r: Role) => { setEditing(r); setForm({ nomRole: r.nomRole, descRole: r.descRole }); setOpen(true); };

  const submit = async () => {
    if (!form.nomRole.trim() || !form.descRole.trim()) { toast.error("Tous les champs sont requis"); return; }

    try {
      const url = editing ? `/api/roles/${editing.id}` : "/api/roles";
      const method = editing ? "PUT" : "POST";
      const data = await apiJson(url, {
        method,
        body: JSON.stringify(form),
      });

      toast.success(editing ? "Rôle modifié avec succès" : "Rôle ajouté avec succès");
      setOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error?.message || "Erreur lors de l'enregistrement");
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const data = await apiJson(`/api/roles/${deleteId}`, { method: "DELETE" });
      toast.success("Rôle supprimé");
      fetchData();
    } catch (error: any) {
      toast.error(error?.message || "Échec de la suppression");
    }
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des rôles</h1>
          <p className="text-muted-foreground">Administration des rôles utilisateurs</p>
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

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(r => (
              <TableRow key={r.id}>
                <TableCell>{r.id}</TableCell>
                <TableCell className="font-medium">{r.nomRole}</TableCell>
                <TableCell>{r.descRole}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => setDeleteId(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Aucun résultat</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Modifier le rôle" : "Ajouter un rôle"}</DialogTitle>
            <DialogDescription>Renseignez le nom et la description du rôle.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Nom du rôle</Label><Input value={form.nomRole} onChange={e => setForm({ ...form, nomRole: e.target.value })} /></div>
            <div><Label>Description</Label><Input value={form.descRole} onChange={e => setForm({ ...form, descRole: e.target.value })} /></div>
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
