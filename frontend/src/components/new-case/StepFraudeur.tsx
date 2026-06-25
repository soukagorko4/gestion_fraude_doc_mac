import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, ArrowRight } from "lucide-react";
import { useReferenceData } from "@/hooks/useReferenceData";
import type { FraudeFormData } from "@/pages/NewCase";

interface Props {
  data: FraudeFormData;
  onChange: (data: FraudeFormData) => void;
  onNext: () => void;
}

export default function StepFraudeur({ data, onChange, onNext }: Props) {
  const { nationalites, societes, vols, loading } = useReferenceData();

  const update = (field: keyof FraudeFormData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const canProceed = data.prenom_fraudeur && data.nom_fraudeur && data.nationalite_id && data.lieu_fraude && data.provenance_destination && data.societe_id && data.vol_id;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Étape 1 - Informations du fraudeur</CardTitle>
            <CardDescription>Renseignez les données relatives au fraudeur</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label>Prénom *</Label>
            <Input value={data.prenom_fraudeur} onChange={(e) => update("prenom_fraudeur", e.target.value)} placeholder="Prénom" />
          </div>
          <div className="space-y-2">
            <Label>Nom *</Label>
            <Input value={data.nom_fraudeur} onChange={(e) => update("nom_fraudeur", e.target.value)} placeholder="Nom" />
          </div>
          <div className="space-y-2">
            <Label>Genre</Label>
            <Select value={data.genre_fraudeur} onValueChange={(v) => update("genre_fraudeur", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="NR">Non renseigné</SelectItem>
                <SelectItem value="Masculin">Masculin</SelectItem>
                <SelectItem value="Feminin">Féminin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Date de naissance</Label>
            <Input type="date" value={data.date_naiss_fraudeur} onChange={(e) => update("date_naiss_fraudeur", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Nationalité *</Label>
            <Select value={data.nationalite_id} onValueChange={(v) => update("nationalite_id", v)}>
              <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
              <SelectContent>
                {nationalites.map((n) => (
                  <SelectItem key={n.id} value={String(n.id)}>{n.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Date de fraude</Label>
            <Input type="date" value={data.date_fraude} onChange={(e) => update("date_fraude", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Lieu de fraude *</Label>
            <Input value={data.lieu_fraude} onChange={(e) => update("lieu_fraude", e.target.value)} placeholder="Lieu" />
          </div>
          <div className="space-y-2">
            <Label>Provenance / Destination *</Label>
            <Input value={data.provenance_destination} onChange={(e) => update("provenance_destination", e.target.value)} placeholder="Ex: PARIS" />
          </div>
          <div className="space-y-2">
            <Label>Zone</Label>
            <Select value={data.zone} onValueChange={(v) => update("zone", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="NR">Non renseigné</SelectItem>
                <SelectItem value="ARRIVEE">Arrivée</SelectItem>
                <SelectItem value="DEPART">Départ</SelectItem>
                <SelectItem value="TRANSIT">Transit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Société *</Label>
            <Select value={data.societe_id} onValueChange={(v) => update("societe_id", v)}>
              <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
              <SelectContent>
                {societes.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Vol *</Label>
            <Select value={data.vol_id} onValueChange={(v) => update("vol_id", v)}>
              <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
              <SelectContent>
                {vols.map((v) => (
                  <SelectItem key={v.id} value={String(v.id)}>{v.numero} - {v.destination}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea value={data.desc_fraude} onChange={(e) => update("desc_fraude", e.target.value)} placeholder="Description de la fraude..." className="min-h-20" />
        </div>
        <div className="flex justify-end">
          <Button onClick={onNext} disabled={!canProceed} className="gap-2">
            Suivant <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
