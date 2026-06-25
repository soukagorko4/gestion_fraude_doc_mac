import { FraudCase } from "@/data/fraudCases";
import { FraudBadge } from "./FraudBadge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Plane, User } from "lucide-react";

interface CasesTableProps {
  cases: FraudCase[];
  limit?: number;
}

export function CasesTable({ cases, limit }: CasesTableProps) {
  const displayCases = limit ? cases.slice(0, limit) : cases;

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Vol</th>
            <th>Destination</th>
            <th>Passagers</th>
            <th>Passeport</th>
            <th>Visa/Titre</th>
            <th>Nationalité</th>
            <th>Origine</th>
            <th>Sexe</th>
          </tr>
        </thead>
        <tbody>
          {displayCases.map((fraudCase) => (
            <tr key={fraudCase.id}>
              <td className="font-medium">
                {format(new Date(fraudCase.date), "dd MMM yyyy", { locale: fr })}
              </td>
              <td>
                <div className="flex items-center gap-2">
                  <Plane className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono text-sm">{fraudCase.flightNumber}</span>
                </div>
              </td>
              <td className="font-medium">{fraudCase.destination}</td>
              <td>
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{fraudCase.passengerCount}</span>
                </div>
              </td>
              <td>
                <div className="space-y-1">
                  {fraudCase.passport.country && (
                    <p className="text-sm">{fraudCase.passport.country}</p>
                  )}
                  <FraudBadge type={fraudCase.passport.fraudType} />
                </div>
              </td>
              <td>
                <div className="space-y-1">
                  {fraudCase.visa.type && (
                    <p className="text-sm">{fraudCase.visa.type} - {fraudCase.visa.country}</p>
                  )}
                  <FraudBadge type={fraudCase.visa.fraudType} />
                </div>
              </td>
              <td>{fraudCase.nationality}</td>
              <td>
                <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                  {fraudCase.origin}
                </span>
              </td>
              <td>
                <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                  fraudCase.sex === 'M' 
                    ? 'bg-primary/10 text-primary' 
                    : 'bg-accent/10 text-accent'
                }`}>
                  {fraudCase.sex}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
