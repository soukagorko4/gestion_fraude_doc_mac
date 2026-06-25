import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, PlusCircle } from "lucide-react";

interface Props {
  fraudeId: number | null;
  onReset: () => void;
}

export default function StepValidation({ fraudeId, onReset }: Props) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Cas enregistré avec succès !</h2>
        <p className="mt-2 text-muted-foreground">
          Le cas de fraude n°{fraudeId} a été enregistré dans la base de données.
        </p>
        <Button onClick={onReset} className="mt-6 gap-2">
          <PlusCircle className="h-4 w-4" />
          Nouveau cas
        </Button>
      </CardContent>
    </Card>
  );
}
