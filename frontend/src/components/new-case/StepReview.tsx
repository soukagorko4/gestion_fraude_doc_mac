import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Edit2, Check } from "lucide-react";
import { useReferenceData } from "@/hooks/useReferenceData";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { FraudeFormData, DetailFormData } from "@/pages/NewCase";

interface Props {
  fraudeData: FraudeFormData;
  detailsData: DetailFormData[];
  onEditFraude: (data: FraudeFormData) => void;
  onEditDetails: (data: DetailFormData[]) => void;
  onNext: () => void;
  onPrev: () => void;
  onFraudeInserted: (id: number) => void;
}

export default function StepReview({ fraudeData, detailsData, onEditFraude, onEditDetails, onNext, onPrev, onFraudeInserted }: Props) {
  const { nationalites, societes, vols, documents, typeFraudes } = useReferenceData();
  const { user } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [editingFraude, setEditingFraude] = useState(false);
  const [editingDetailIdx, setEditingDetailIdx] = useState<number | null>(null);

  const getLabel = (list: { id: number; label: string }[], id: string) => list.find((i) => String(i.id) === id)?.label || "-";
  const getVol = (id: string) => {
    const v = vols.find((v) => String(v.id) === id);
    return v ? `${v.numero} - ${v.destination}` : "-";
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);

    // Insert fraude
    const { data: fraude, error: fraudeError } = await supabase
      .from("fraudes")
      .insert({
        prenom_fraudeur: fraudeData.prenom_fraudeur,
        nom_fraudeur: fraudeData.nom_fraudeur,
        genre_fraudeur: fraudeData.genre_fraudeur,
        date_naiss_fraudeur: fraudeData.date_naiss_fraudeur || null,
        nationalite_id: Number(fraudeData.nationalite_id),
        date_fraude: fraudeData.date_fraude || null,
        lieu_fraude: fraudeData.lieu_fraude,
        provenance_destination: fraudeData.provenance_destination,
        desc_fraude: fraudeData.desc_fraude || null,
        societe_id: Number(fraudeData.societe_id),
        vol_id: Number(fraudeData.vol_id),
        zone: fraudeData.zone,
        user_id: user.id,
      } as any)
      .select("id")
      .single();

    if (fraudeError) {
      toast({ title: "Erreur", description: fraudeError.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    const fraudeId = (fraude as any).id;
    onFraudeInserted(fraudeId);

    // Insert details
    const detailsInsert = detailsData.map((d) => ({
      document_id: Number(d.document_id),
      num_document_faux: d.num_document_faux,
      type_fraude_id: Number(d.type_fraude_id),
      fraude_id: fraudeId,
      nationalite_id: Number(d.nationalite_id),
      user_id: user.id,
    }));

    const { error: detailsError } = await supabase.from("details").insert(detailsInsert as any);

    if (detailsError) {
      toast({ title: "Erreur", description: detailsError.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    toast({ title: "Succès", description: "Le cas de fraude a été enregistré avec succès." });
    setSubmitting(false);
    onNext();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">Étape 3 - Récapitulatif</h2>
      <p className="text-sm text-muted-foreground">Vérifiez les informations avant validation. Cliquez sur ✏️ pour modifier.</p>

      {/* Fraudeur review */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Informations du fraudeur</CardTitle>
          <Button type="button" variant="ghost" size="sm" onClick={() => setEditingFraude(!editingFraude)}>
            {editingFraude ? <Check className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
          </Button>
        </CardHeader>
        <CardContent>
          {editingFraude ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1">
                <Label className="text-xs">Prénom</Label>
                <Input value={fraudeData.prenom_fraudeur} onChange={(e) => onEditFraude({ ...fraudeData, prenom_fraudeur: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Nom</Label>
                <Input value={fraudeData.nom_fraudeur} onChange={(e) => onEditFraude({ ...fraudeData, nom_fraudeur: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Genre</Label>
                <Select value={fraudeData.genre_fraudeur} onValueChange={(v) => onEditFraude({ ...fraudeData, genre_fraudeur: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NR">Non renseigné</SelectItem>
                    <SelectItem value="Masculin">Masculin</SelectItem>
                    <SelectItem value="Feminin">Féminin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Lieu de fraude</Label>
                <Input value={fraudeData.lieu_fraude} onChange={(e) => onEditFraude({ ...fraudeData, lieu_fraude: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Provenance/Destination</Label>
                <Input value={fraudeData.provenance_destination} onChange={(e) => onEditFraude({ ...fraudeData, provenance_destination: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Description</Label>
                <Textarea value={fraudeData.desc_fraude} onChange={(e) => onEditFraude({ ...fraudeData, desc_fraude: e.target.value })} />
              </div>
            </div>
          ) : (
            <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <div><span className="text-muted-foreground">Prénom:</span> <strong>{fraudeData.prenom_fraudeur}</strong></div>
              <div><span className="text-muted-foreground">Nom:</span> <strong>{fraudeData.nom_fraudeur}</strong></div>
              <div><span className="text-muted-foreground">Genre:</span> <strong>{fraudeData.genre_fraudeur}</strong></div>
              <div><span className="text-muted-foreground">Date naissance:</span> <strong>{fraudeData.date_naiss_fraudeur || "-"}</strong></div>
              <div><span className="text-muted-foreground">Nationalité:</span> <strong>{getLabel(nationalites, fraudeData.nationalite_id)}</strong></div>
              <div><span className="text-muted-foreground">Date fraude:</span> <strong>{fraudeData.date_fraude || "-"}</strong></div>
              <div><span className="text-muted-foreground">Lieu:</span> <strong>{fraudeData.lieu_fraude}</strong></div>
              <div><span className="text-muted-foreground">Provenance/Dest.:</span> <strong>{fraudeData.provenance_destination}</strong></div>
              <div><span className="text-muted-foreground">Zone:</span> <strong>{fraudeData.zone}</strong></div>
              <div><span className="text-muted-foreground">Société:</span> <strong>{getLabel(societes, fraudeData.societe_id)}</strong></div>
              <div><span className="text-muted-foreground">Vol:</span> <strong>{getVol(fraudeData.vol_id)}</strong></div>
              <div className="sm:col-span-2 lg:col-span-3"><span className="text-muted-foreground">Description:</span> <strong>{fraudeData.desc_fraude || "-"}</strong></div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details review */}
      {detailsData.map((detail, idx) => (
        <Card key={idx}>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Détail {idx + 1}</CardTitle>
            <Button type="button" variant="ghost" size="sm" onClick={() => setEditingDetailIdx(editingDetailIdx === idx ? null : idx)}>
              {editingDetailIdx === idx ? <Check className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
            </Button>
          </CardHeader>
          <CardContent>
            {editingDetailIdx === idx ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">Document</Label>
                  <Select value={detail.document_id} onValueChange={(v) => { const u = [...detailsData]; u[idx] = { ...u[idx], document_id: v }; onEditDetails(u); }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{documents.map((d) => <SelectItem key={d.id} value={String(d.id)}>{d.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">N° document faux</Label>
                  <Input value={detail.num_document_faux} onChange={(e) => { const u = [...detailsData]; u[idx] = { ...u[idx], num_document_faux: e.target.value }; onEditDetails(u); }} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Type de fraude</Label>
                  <Select value={detail.type_fraude_id} onValueChange={(v) => { const u = [...detailsData]; u[idx] = { ...u[idx], type_fraude_id: v }; onEditDetails(u); }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{typeFraudes.map((t) => <SelectItem key={t.id} value={String(t.id)}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Nationalité</Label>
                  <Select value={detail.nationalite_id} onValueChange={(v) => { const u = [...detailsData]; u[idx] = { ...u[idx], nationalite_id: v }; onEditDetails(u); }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{nationalites.map((n) => <SelectItem key={n.id} value={String(n.id)}>{n.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <div><span className="text-muted-foreground">Document:</span> <strong>{getLabel(documents, detail.document_id)}</strong></div>
                <div><span className="text-muted-foreground">N° faux:</span> <strong>{detail.num_document_faux}</strong></div>
                <div><span className="text-muted-foreground">Type fraude:</span> <strong>{getLabel(typeFraudes, detail.type_fraude_id)}</strong></div>
                <div><span className="text-muted-foreground">Nationalité:</span> <strong>{getLabel(nationalites, detail.nationalite_id)}</strong></div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onPrev} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Précédent
        </Button>
        <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
          <Save className="h-4 w-4" />
          {submitting ? "Enregistrement..." : "Valider et enregistrer"}
        </Button>
      </div>
    </div>
  );
}
