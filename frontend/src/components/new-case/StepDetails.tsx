import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ArrowLeft, ArrowRight, Plus, Minus } from "lucide-react";
import { useReferenceData } from "@/hooks/useReferenceData";
import type { DetailFormData } from "@/pages/NewCase";

interface Props {
  data: DetailFormData[];
  onChange: (data: DetailFormData[]) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function StepDetails({ data, onChange, onNext, onPrev }: Props) {
  const { documents, typeFraudes, nationalites } = useReferenceData();

  const addDetail = () => {
    if (data.length < 3) {
      onChange([...data, { document_id: "", num_document_faux: "", type_fraude_id: "", nationalite_id: "" }]);
    }
  };

  const removeDetail = (index: number) => {
    if (data.length > 1) {
      onChange(data.filter((_, i) => i !== index));
    }
  };

  const updateDetail = (index: number, field: keyof DetailFormData, value: string) => {
    const updated = data.map((d, i) => (i === index ? { ...d, [field]: value } : d));
    onChange(updated);
  };

  const canProceed = data.every((d) => d.document_id && d.num_document_faux && d.type_fraude_id && d.nationalite_id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
            <FileText className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Étape 2 - Détails de fraude</h2>
            <p className="text-sm text-muted-foreground">Ajoutez jusqu'à 3 détails de documents frauduleux</p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addDetail}
          disabled={data.length >= 3}
          className="gap-1"
        >
          <Plus className="h-4 w-4" /> Ajouter
        </Button>
      </div>

      {data.map((detail, index) => (
        <Card key={index}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Détail {index + 1} / {data.length}</CardTitle>
              {data.length > 1 && (
                <Button type="button" variant="ghost" size="icon" onClick={() => removeDetail(index)} className="text-destructive hover:text-destructive">
                  <Minus className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Document *</Label>
              <Select value={detail.document_id} onValueChange={(v) => updateDetail(index, "document_id", v)}>
                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  {documents.map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>N° document faux *</Label>
              <Input value={detail.num_document_faux} onChange={(e) => updateDetail(index, "num_document_faux", e.target.value)} placeholder="Numéro du document" />
            </div>
            <div className="space-y-2">
              <Label>Type de fraude *</Label>
              <Select value={detail.type_fraude_id} onValueChange={(v) => updateDetail(index, "type_fraude_id", v)}>
                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  {typeFraudes.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nationalité du document *</Label>
              <Select value={detail.nationalite_id} onValueChange={(v) => updateDetail(index, "nationalite_id", v)}>
                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  {nationalites.map((n) => (
                    <SelectItem key={n.id} value={String(n.id)}>{n.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onPrev} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Précédent
        </Button>
        <Button onClick={onNext} disabled={!canProceed} className="gap-2">
          Suivant <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
