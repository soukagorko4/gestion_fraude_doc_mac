import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import StepFraudeur from "@/components/new-case/StepFraudeur";
import StepDetails from "@/components/new-case/StepDetails";
import StepReview from "@/components/new-case/StepReview";
import StepValidation from "@/components/new-case/StepValidation";

export interface FraudeFormData {
  prenom_fraudeur: string;
  nom_fraudeur: string;
  genre_fraudeur: string;
  date_naiss_fraudeur: string;
  nationalite_id: string;
  date_fraude: string;
  lieu_fraude: string;
  provenance_destination: string;
  desc_fraude: string;
  societe_id: string;
  vol_id: string;
  zone: string;
}

export interface DetailFormData {
  document_id: string;
  num_document_faux: string;
  type_fraude_id: string;
  nationalite_id: string;
}

const steps = [
  { number: 1, label: "Informations du fraudeur" },
  { number: 2, label: "Détails de fraude" },
  { number: 3, label: "Récapitulatif" },
  { number: 4, label: "Validation" },
];

export default function NewCase() {
  const [currentStep, setCurrentStep] = useState(1);
  const [fraudeData, setFraudeData] = useState<FraudeFormData>({
    prenom_fraudeur: "",
    nom_fraudeur: "",
    genre_fraudeur: "NR",
    date_naiss_fraudeur: "",
    nationalite_id: "",
    date_fraude: "",
    lieu_fraude: "",
    provenance_destination: "",
    desc_fraude: "",
    societe_id: "",
    vol_id: "",
    zone: "NR",
  });
  const [detailsData, setDetailsData] = useState<DetailFormData[]>([
    { document_id: "", num_document_faux: "", type_fraude_id: "", nationalite_id: "" },
  ]);
  const [insertedFraudeId, setInsertedFraudeId] = useState<number | null>(null);

  const progress = (currentStep / steps.length) * 100;

  const goNext = () => setCurrentStep((s) => Math.min(s + 1, 4));
  const goPrev = () => setCurrentStep((s) => Math.max(s - 1, 1));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Nouveau cas</h1>
        <p className="mt-1 text-muted-foreground">
          Enregistrer un nouveau cas de fraude documentaire
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-3">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between">
          {steps.map((step) => (
            <div
              key={step.number}
              className={cn(
                "flex items-center gap-2 text-sm",
                currentStep >= step.number ? "text-primary font-medium" : "text-muted-foreground"
              )}
            >
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                  currentStep > step.number
                    ? "bg-primary text-primary-foreground"
                    : currentStep === step.number
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {step.number}
              </div>
              <span className="hidden sm:inline">{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      {currentStep === 1 && (
        <StepFraudeur data={fraudeData} onChange={setFraudeData} onNext={goNext} />
      )}
      {currentStep === 2 && (
        <StepDetails data={detailsData} onChange={setDetailsData} onNext={goNext} onPrev={goPrev} />
      )}
      {currentStep === 3 && (
        <StepReview
          fraudeData={fraudeData}
          detailsData={detailsData}
          onEditFraude={setFraudeData}
          onEditDetails={setDetailsData}
          onNext={goNext}
          onPrev={goPrev}
          onFraudeInserted={setInsertedFraudeId}
        />
      )}
      {currentStep === 4 && (
        <StepValidation
          fraudeId={insertedFraudeId}
          onReset={() => {
            setCurrentStep(1);
            setFraudeData({
              prenom_fraudeur: "", nom_fraudeur: "", genre_fraudeur: "NR",
              date_naiss_fraudeur: "", nationalite_id: "", date_fraude: "",
              lieu_fraude: "", provenance_destination: "", desc_fraude: "",
              societe_id: "", vol_id: "", zone: "NR",
            });
            setDetailsData([{ document_id: "", num_document_faux: "", type_fraude_id: "", nationalite_id: "" }]);
            setInsertedFraudeId(null);
          }}
        />
      )}
    </div>
  );
}
