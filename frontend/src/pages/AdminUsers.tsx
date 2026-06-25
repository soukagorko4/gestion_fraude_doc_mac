import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiJson } from "@/hooks/useApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Pencil, Trash2, IdCard, Plus, Search, UserCog, Power, Eye, EyeOff } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { logAudit } from "@/lib/audit";
import { Navigate } from "react-router-dom";

interface UserRow {
  id: number;
  auth_user_id: string;
  prenom: string;
  nom: string;
  contact: string | null;
  username: string;
  email: string;
  active: boolean;
  force_password_change: boolean;
  password_last_changed: string;
  role_id: number | null;
  service_id: number | null;
  avatar_url: string | null;
  created_at: string;
}

const emptyForm = {
  id: 0, prenom: "", nom: "", contact: "", username: "", password: "", password_confirm: "",
  role_id: "" as string, service_id: "" as string,
  active: true, force_password_change: false,
};

export default function AdminUsers() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [roles, setRoles] = useState<{ id: number; nom_role: string }[]>([]);
  const [services, setServices] = useState<{ id: number; nom_service: string }[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [editing, setEditing] = useState(false);
  const [detail, setDetail] = useState<UserRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showPwdConfirm, setShowPwdConfirm] = useState(false);

  if (profile && profile.role !== "ADMIN") return <Navigate to="/" replace />;

  const load = async () => {
    try {
      // Récupérer les utilisateurs, rôles et services du backend
      const usersData = await apiJson("/api/users");
      const rolesData = await apiJson("/api/roles");
      const servicesData = await apiJson("/api/services");

      // Transformer les utilisateurs pour correspondre à la structure attendue
      const transformedUsers = usersData.map((u: any) => ({
        id: u.id,
        auth_user_id: "", // Pas disponible du backend
        prenom: u.prenom,
        nom: u.nom,
        contact: u.contact || null,
        username: u.username,
        email: u.username, // Utiliser username comme email
        active: u.active,
        force_password_change: u.forcePasswordChange,
        password_last_changed: u.passwordLastChanged,
        role_id: u.roleId,
        service_id: u.serviceId,
        avatar_url: null,
        created_at: "",
      }));

      // Transformer les rôles
      const transformedRoles = rolesData.map((r: any) => ({
        id: r.id,
        nom_role: r.nomRole,
      }));

      // Transformer les services
      const transformedServices = servicesData.map((s: any) => ({
        id: s.id,
        nom_service: s.nomService,
      }));

      setUsers(transformedUsers);
      setRoles(transformedRoles);
      setServices(transformedServices);
    } catch (error: any) {
      toast.error(error?.message || "Erreur de chargement des utilisateurs");
    }
  };

  useEffect(() => { load(); logAudit("PAGE_VIEW", { entity: "admin_users" }); }, []);

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, serviceFilter]);

  const roleName = (id: number | null) => roles.find((r) => r.id === id)?.nom_role || "—";
  const serviceName = (id: number | null) => services.find((s) => s.id === id)?.nom_service || "—";

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((u) => {
      const roleText = roleName(u.role_id).toLowerCase();
      const serviceText = serviceName(u.service_id).toLowerCase();
      const matchesSearch =
        u.username.toLowerCase().includes(q) ||
        u.prenom.toLowerCase().includes(q) ||
        u.nom.toLowerCase().includes(q) ||
        (u.contact || "").toLowerCase().includes(q) ||
        roleText.includes(q) ||
        serviceText.includes(q);

      const matchesRole = roleFilter !== "all" ? String(u.role_id) === roleFilter : true;
      const matchesService = serviceFilter !== "all" ? String(u.service_id) === serviceFilter : true;

      return matchesSearch && matchesRole && matchesService;
    });
  }, [users, search, roleFilter, serviceFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const openCreate = () => { setForm({ ...emptyForm }); setEditing(false); setOpen(true); };
  const openEdit = (u: UserRow) => {
    setForm({
      id: u.id, prenom: u.prenom, nom: u.nom, contact: u.contact || "",
      username: u.username, password: "", password_confirm: "",
      role_id: u.role_id ? String(u.role_id) : "",
      service_id: u.service_id ? String(u.service_id) : "",
      active: u.active, force_password_change: u.force_password_change,
    });
    setEditing(true); setOpen(true);
  };

  const submit = async () => {
    if (!form.prenom || !form.nom || !form.username) return toast.error("Champs obligatoires manquants");
    if (!editing && !form.password) return toast.error("Mot de passe obligatoire");
    if (form.password && form.password !== form.password_confirm) return toast.error("Les mots de passe ne correspondent pas");
    if (!form.role_id) return toast.error("Rôle obligatoire");

    setLoading(true);
    try {
      if (editing) {
        // UPDATE utilisateur - d'abord mettre à jour les données
        await apiJson(`/api/users/${form.id}`, {
          method: "PUT",
          body: JSON.stringify({
            prenom: form.prenom,
            nom: form.nom,
            contact: form.contact,
            roleId: Number(form.role_id),
            serviceId: form.service_id ? Number(form.service_id) : null,
            active: form.active,
            forcePasswordChange: form.force_password_change,
          }),
        });

        // Si password est fourni, utiliser un endpoint séparé pour le changer
        if (form.password) {
          await apiJson(`/api/users/${form.id}/reset-password`, {
            method: "PUT",
            body: JSON.stringify({ newPassword: form.password }),
          });
        }

        toast.success("Utilisateur modifié");
        await logAudit("USER_UPDATED", { entity: "users", entity_id: form.id });
      } else {
        // CREATE utilisateur
        await apiJson("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({
            prenom: form.prenom,
            nom: form.nom,
            contact: form.contact,
            username: form.username.toLowerCase(),
            password: form.password,
            roleId: Number(form.role_id),
            serviceId: form.service_id ? Number(form.service_id) : null,
            active: form.active,
            forcePasswordChange: form.force_password_change,
          }),
        });

        toast.success("Utilisateur créé");
        await logAudit("USER_CREATED", { entity: "users", entity_id: form.username });
      }

      setOpen(false);
      await load();
    } catch (error: any) {
      toast.error(error.message || "Erreur");
    } finally { setLoading(false); }
  };

  const remove = async (u: UserRow) => {
    try {
      await apiJson(`/api/users/${u.id}`, { method: "DELETE" });
      
      toast.success("Utilisateur supprimé");
      await logAudit("USER_DELETED", { entity: "users", entity_id: u.id });
      await load();
    } catch (error: any) {
      toast.error(error.message || "Erreur");
    }
  };

  const toggleActive = async (u: UserRow) => {
    try {
      await apiJson(`/api/users/${u.id}`, {
        method: "PUT",
        body: JSON.stringify({ active: !u.active }),
      });
      
      toast.success(`Compte ${!u.active ? "activé" : "désactivé"}`);
      await logAudit(!u.active ? "USER_ACTIVATED" : "USER_DEACTIVATED", { entity: "users", entity_id: u.id });
      await load();
    } catch (error: any) {
      toast.error(error.message || "Erreur");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <UserCog className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Gestion des utilisateurs</h1>
            <p className="text-sm text-muted-foreground">Création, édition et suivi des comptes</p>
          </div>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Nouvel utilisateur</Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <CardTitle>Liste des utilisateurs</CardTitle>
              <Badge variant="secondary">{filtered.length} enregistrement{filtered.length > 1 ? "s" : ""}</Badge>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher nom, login, rôle, service..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-44">
                  <Label className="mb-2 text-xs uppercase tracking-[.2em] text-muted-foreground">Rôle</Label>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger><SelectValue placeholder="Tous" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      {roles.map((r) => <SelectItem key={r.id} value={String(r.id)}>{r.nom_role}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-44">
                  <Label className="mb-2 text-xs uppercase tracking-[.2em] text-muted-foreground">Service</Label>
                  <Select value={serviceFilter} onValueChange={setServiceFilter}>
                    <SelectTrigger><SelectValue placeholder="Tous" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      {services.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.nom_service}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Nom complet</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.username}</TableCell>
                  <TableCell>{u.prenom} {u.nom}</TableCell>
                  <TableCell>{u.contact || "—"}</TableCell>
                  <TableCell>{roleName(u.role_id)}</TableCell>
                  <TableCell>{serviceName(u.service_id)}</TableCell>
                  <TableCell>
                    {u.active ? <Badge>Actif</Badge> : <Badge variant="destructive">Désactivé</Badge>}
                    {u.force_password_change && <Badge variant="outline" className="ml-1">MDP à changer</Badge>}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="icon" variant="ghost" onClick={() => setDetail(u)} title="Détails"><IdCard className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => openEdit(u)} title="Éditer"><Pencil className="h-4 w-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" title={u.active ? "Désactiver" : "Activer"}>
                          <Power className={`h-4 w-4 ${u.active ? "text-amber-600" : "text-emerald-600"}`} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{u.active ? "Désactiver" : "Activer"} ce compte ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            {u.active ? "L'utilisateur ne pourra plus se connecter." : "L'utilisateur pourra à nouveau se connecter."}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => toggleActive(u)}>Confirmer</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" title="Supprimer"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer l'utilisateur ?</AlertDialogTitle>
                          <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => remove(u)}>Supprimer</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
              {pageItems.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-6">Aucun utilisateur</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>

        <div className="flex flex-col gap-4 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            Affichage de <span className="font-medium">{pageItems.length === 0 ? 0 : (page - 1) * perPage + 1}</span>
            à <span className="font-medium">{(page - 1) * perPage + pageItems.length}</span>
            sur <span className="font-medium">{filtered.length}</span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 text-sm">
              <span>Par page :</span>
              <Select value={String(perPage)} onValueChange={(value) => setPerPage(Number(value))}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[5, 10, 20, 50].map((value) => (
                    <SelectItem key={value} value={String(value)}>{value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="inline-flex items-center gap-2">
              <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Préc
              </Button>
              <span className="text-sm">
                {page} / {totalPages}
              </span>
              <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                Suiv
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Form dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Modifier l'utilisateur" : "Nouvel utilisateur"}</DialogTitle>
            <DialogDescription>Renseignez les informations ci-dessous</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-2"><Label>Prénom *</Label><Input value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} /></div>
            <div className="space-y-2"><Label>Nom *</Label><Input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} /></div>
            <div className="space-y-2"><Label>Contact</Label><Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Username *</Label>
              <Input value={form.username} disabled={editing} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Rôle *</Label>
              <Select value={form.role_id} onValueChange={(v) => setForm({ ...form, role_id: v })}>
                <SelectTrigger><SelectValue placeholder="Choisir un rôle" /></SelectTrigger>
                <SelectContent>
                  {roles.map((r) => <SelectItem key={r.id} value={String(r.id)}>{r.nom_role}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Service</Label>
              <Select value={form.service_id} onValueChange={(v) => setForm({ ...form, service_id: v })}>
                <SelectTrigger><SelectValue placeholder="Choisir un service" /></SelectTrigger>
                <SelectContent>
                  {services.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.nom_service}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label>{editing ? "Nouveau mot de passe (optionnel)" : "Mot de passe *"}</Label>
              <div className="relative">
                <Input
                  type={showPwd ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPwd ? "Masquer" : "Afficher"}
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Confirmer le mot de passe {editing ? "" : "*"}</Label>
              <div className="relative">
                <Input
                  type={showPwdConfirm ? "text" : "password"}
                  value={form.password_confirm}
                  onChange={(e) => setForm({ ...form, password_confirm: e.target.value })}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPwdConfirm((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPwdConfirm ? "Masquer" : "Afficher"}
                >
                  {showPwdConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.password && form.password_confirm && form.password !== form.password_confirm && (
                <p className="text-xs text-destructive">Les mots de passe ne correspondent pas</p>
              )}
            </div>
            <div className="col-span-2 flex items-center justify-between border rounded-md p-3">
              <div>
                <Label>Compte actif</Label>
                <p className="text-xs text-muted-foreground">L'utilisateur peut se connecter</p>
              </div>
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
            </div>
            <div className="col-span-2 flex items-start gap-2">
              <Checkbox
                id="fpc"
                checked={form.force_password_change}
                onCheckedChange={(v) => setForm({ ...form, force_password_change: !!v })}
              />
              <Label htmlFor="fpc" className="cursor-pointer">
                Obliger l'utilisateur à changer son mot de passe à la première connexion
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={submit} disabled={loading}>{loading ? "Enregistrement..." : "Enregistrer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ID Card detail */}
      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Fiche utilisateur</DialogTitle>
          </DialogHeader>
          {detail && <IdCardView user={detail} roleName={roleName(detail.role_id)} serviceName={serviceName(detail.service_id)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function IdCardView({ user, roleName, serviceName }: { user: UserRow; roleName: string; serviceName: string }) {
  const initials = `${user.prenom[0] || ""}${user.nom[0] || ""}`.toUpperCase();
  const qrPayload = JSON.stringify({
    id: user.id, username: user.username,
    nom: `${user.prenom} ${user.nom}`,
    role: roleName, service: serviceName, contact: user.contact,
  });
  return (
    <div className="rounded-lg border-2 border-primary/20 overflow-hidden">
      <div className="gradient-header h-20 relative">
        <div className="absolute -bottom-10 left-6 h-20 w-20 rounded-full border-4 border-background bg-secondary flex items-center justify-center text-2xl font-bold">
          {initials}
        </div>
        <div className="absolute top-3 right-4 text-primary-foreground text-xs font-semibold">
          DPAF • CARTE D'IDENTITÉ
        </div>
      </div>
      <div className="px-6 pt-12 pb-4">
        <h2 className="text-xl font-bold">{user.prenom} {user.nom}</h2>
        <p className="text-sm text-muted-foreground">@{user.username}</p>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-muted-foreground">Rôle :</span> <strong>{roleName}</strong></div>
          <div><span className="text-muted-foreground">Service :</span> <strong>{serviceName}</strong></div>
          <div><span className="text-muted-foreground">Contact :</span> <strong>{user.contact || "—"}</strong></div>
          <div><span className="text-muted-foreground">Statut :</span> <strong>{user.active ? "Actif" : "Désactivé"}</strong></div>
        </div>
        <div className="mt-4 flex justify-center bg-muted/30 rounded p-3">
          <QRCodeSVG value={qrPayload} size={140} />
        </div>
        <p className="text-xs text-center text-muted-foreground mt-2">Scannez pour afficher les informations</p>
      </div>
    </div>
  );
}
