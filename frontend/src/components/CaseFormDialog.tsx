import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useReferenceData } from "@/hooks/useReferenceData";
import { Plus, Minus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { canModifyCase } from "@/lib/permissions";

interface CaseFormDialogProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  fraudeId: number | null;
  mode: "view" | "edit";
  onSaved?: () => void;
}

interface FraudeRow {
  id: number;
  prenom_fraudeur: string;
  nom_fraudeur: string;
  genre_fraudeur: string;
  date_naiss_fraudeur: string | null;
  nationalite_id: number;
  date_fraude: string | null;
  lieu_fraude: string;
  provenance_destination: string;
  desc_fraude: string | null;
  societe_id: number;
  vol_id: number;
  zone: string;
  user_id: string;
  created_at: string | null;
}

interface DetailRow {
  id?: number;
  document_id: number | string;
  num_document_faux: string;
  type_fraude_id: number | string;
  nationalite_id: number | string;
  _deleted?: boolean;
  _new?: boolean;
}

export function CaseFormDialog({ open, onOpenChange, fraudeId, mode, onSaved }: CaseFormDialogProps) {
  const { nationalites, societes, vols, documents, typeFraudes } = useReferenceData();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fraude, setFraude] = useState<FraudeRow | null>(null);
  const [details, setDetails] = useState<DetailRow[]>([]);

  const readOnly = mode === "view";
  const canEdit = fraude ? canModifyCase(fraude.created_at, fraude.user_id, user?.id, profile?.role) : false;

  useEffect(() => {
    if (!open || !fraudeId) return;
    setLoading(true);
    Promise.all([
      supabase.from("fraudes").select("*").eq("id", fraudeId).single(),
      supabase.from("details").select("*").eq("fraude_id", fraudeId),
    ]).then(([f, d]) => {
      if (f.data) setFraude(f.data as any);
      if (d.data) setDetails(d.data as any);
      setLoading(false);
    });
  }, [open, fraudeId]);

  const updateFraude = (k: keyof FraudeRow, v: any) => setFraude((f) => f ? { ...f, [k]: v } : f);
  const updateDetail = (i: number, k: keyof DetailRow, v: any) =>
    setDetails((d) => d.map((it, idx) => idx === i ? { ...it, [k]: v } : it));
  const addDetail = () => {
    if (details.filter(d => !d._deleted).length >= 3) return;
    setDetails((d) => [...d, { document_id: "", num_document_faux: "", type_fraude_id: "", nationalite_id: "", _new: true }]);
  };
  const removeDetail = (i: number) =>
    setDetails((d) => d.map((it, idx) => idx === i ? { ...it, _deleted: true } : it).filter(it => !(it._new && it._deleted)));

  const handleSave = async () => {
    if (!fraude || !user) return;
    setSaving(true);
    const { error: fErr } = await supabase
      .from("fraudes")
      .update({
        prenom_fraudeur: fraude.prenom_fraudeur,
        nom_fraudeur: fraude.nom_fraudeur,
        genre_fraudeur: fraude.genre_fraudeur,
        date_naiss_fraudeur: fraude.date_naiss_fraudeur || null,
        nationalite_id: fraude.nationalite_id,
        date_fraude: fraude.date_fraude || null,
        lieu_fraude: fraude.lieu_fraude,
        provenance_destination: fraude.provenance_destination,
        desc_fraude: fraude.desc_fraude,
        societe_id: fraude.societe_id,
        vol_id: fraude.vol_id,
        zone: fraude.zone,
      })
      .eq("id", fraude.id);

    if (fErr) {
      toast.error("Erreur: " + fErr.message);
      setSaving(false);
      return;
    }

    for (const d of details) {
      if (d._deleted && d.id) {
        await supabase.from("details").delete().eq("id", d.id);
      } else if (d._new && !d._deleted) {
        await supabase.from("details").insert({
          fraude_id: fraude.id,
          document_id: Number(d.document_id),
          num_document_faux: d.num_document_faux,
          type_fraude_id: Number(d.type_fraude_id),
          nationalite_id: Number(d.nationalite_id),
          user_id: user.id,
        });
      } else if (d.id) {
        await supabase.from("details").update({
          document_id: Number(d.document_id),
          num_document_faux: d.num_document_faux,
          type_fraude_id: Number(d.type_fraude_id),
          nationalite_id: Number(d.nationalite_id),
        }).eq("id", d.id);
      }
    }

    toast.success("Cas modifié avec succès");
    setSaving(false);
    onOpenChange(false);
    onSaved?.();
  };

  const visibleDetails = details.filter(d => !d._deleted);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{readOnly ? "Détail du cas" : "Éditer le cas"} #{fraudeId}</DialogTitle>
          <DialogDescription>
            {readOnly ? "Consultation des informations" : "Modifier les informations du cas"}
          </DialogDescription>
        </DialogHeader>

        {loading || !fraude ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : (
          <div className="space-y-6">
            {!readOnly && !canEdit && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                Délai de modification dépassé. Vous ne pouvez plus modifier ce cas.
              </div>
            )}

            <div>
              <h3 className="font-semibold mb-3">Informations du fraudeur</h3>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Prénom"><Input value={fraude.prenom_fraudeur} readOnly={readOnly} onChange={(e) => updateFraude("prenom_fraudeur", e.target.value)} /></Field>
                <Field label="Nom"><Input value={fraude.nom_fraudeur} readOnly={readOnly} onChange={(e) => updateFraude("nom_fraudeur", e.target.value)} /></Field>
                <Field label="Genre">
                  <Select value={fraude.genre_fraudeur} onValueChange={(v) => updateFraude("genre_fraudeur", v)} disabled={readOnly}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NR">NR</SelectItem>
                      <SelectItem value="Masculin">Masculin</SelectItem>
                      <SelectItem value="Feminin">Féminin</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Date de naissance"><Input type="date" value={fraude.date_naiss_fraudeur || ""} readOnly={readOnly} onChange={(e) => updateFraude("date_naiss_fraudeur", e.target.value)} /></Field>
                <Field label="Nationalité">
                  <Select value={String(fraude.nationalite_id)} onValueChange={(v) => updateFraude("nationalite_id", Number(v))} disabled={readOnly}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{nationalites.map(n => <SelectItem key={n.id} value={String(n.id)}>{n.label}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Date de fraude"><Input type="date" value={fraude.date_fraude || ""} readOnly={readOnly} onChange={(e) => updateFraude("date_fraude", e.target.value)} /></Field>
                <Field label="Lieu de fraude"><Input value={fraude.lieu_fraude} readOnly={readOnly} onChange={(e) => updateFraude("lieu_fraude", e.target.value)} /></Field>
                <Field label="Provenance/Destination"><Input value={fraude.provenance_destination} readOnly={readOnly} onChange={(e) => updateFraude("provenance_destination", e.target.value)} /></Field>
                <Field label="Société">
                  <Select value={String(fraude.societe_id)} onValueChange={(v) => updateFraude("societe_id", Number(v))} disabled={readOnly}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{societes.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.label}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Vol">
                  <Select value={String(fraude.vol_id)} onValueChange={(v) => updateFraude("vol_id", Number(v))} disabled={readOnly}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{vols.map(v => <SelectItem key={v.id} value={String(v.id)}>{v.numero} - {v.destination}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Zone">
                  <Select value={fraude.zone} onValueChange={(v) => updateFraude("zone", v)} disabled={readOnly}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NR">NR</SelectItem>
                      <SelectItem value="ARRIVEE">Arrivée</SelectItem>
                      <SelectItem value="DEPART">Départ</SelectItem>
                      <SelectItem value="TRANSIT">Transit</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <div className="col-span-2">
                  <Field label="Description"><Textarea value={fraude.desc_fraude || ""} readOnly={readOnly} onChange={(e) => updateFraude("desc_fraude", e.target.value)} /></Field>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Détails de fraude ({visibleDetails.length})</h3>
                {!readOnly && canEdit && visibleDetails.length < 3 && (
                  <Button size="sm" variant="outline" onClick={addDetail}><Plus className="h-4 w-4 mr-1" />Ajouter</Button>
                )}
              </div>
              <div className="space-y-3">
                {details.map((d, i) => d._deleted ? null : (
                  <div key={i} className="rounded-lg border border-border p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Document #{i + 1}</span>
                      {!readOnly && canEdit && visibleDetails.length > 1 && (
                        <Button size="sm" variant="ghost" onClick={() => removeDetail(i)}><Minus className="h-4 w-4" /></Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Document">
                        <Select value={String(d.document_id)} onValueChange={(v) => updateDetail(i, "document_id", v)} disabled={readOnly}>
                          <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                          <SelectContent>{documents.map(doc => <SelectItem key={doc.id} value={String(doc.id)}>{doc.label}</SelectItem>)}</SelectContent>
                        </Select>
                      </Field>
                      <Field label="N° document faux"><Input value={d.num_document_faux} readOnly={readOnly} onChange={(e) => updateDetail(i, "num_document_faux", e.target.value)} /></Field>
                      <Field label="Type de fraude">
                        <Select value={String(d.type_fraude_id)} onValueChange={(v) => updateDetail(i, "type_fraude_id", v)} disabled={readOnly}>
                          <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                          <SelectContent>{typeFraudes.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.label}</SelectItem>)}</SelectContent>
                        </Select>
                      </Field>
                      <Field label="Nationalité document">
                        <Select value={String(d.nationalite_id)} onValueChange={(v) => updateDetail(i, "nationalite_id", v)} disabled={readOnly}>
                          <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                          <SelectContent>{nationalites.map(n => <SelectItem key={n.id} value={String(n.id)}>{n.label}</SelectItem>)}</SelectContent>
                        </Select>
                      </Field>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fermer</Button>
          {!readOnly && canEdit && (
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Enregistrer
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
