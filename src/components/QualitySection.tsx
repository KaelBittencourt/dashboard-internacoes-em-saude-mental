import { ProcessedRecord } from "@/lib/types";
import { AlertTriangle, FileWarning, MapPinOff, FileX, Clock, UserX } from "lucide-react";

interface QualitySectionProps {
  data: ProcessedRecord[];
}

export default function QualitySection({ data }: QualitySectionProps) {
  const items = [
    { label: "Data de saída inválida", count: data.filter(d => d.dataSaidaInvalida).length, icon: <FileWarning className="w-5 h-5" />, color: "text-kpi-red" },
    { label: "Alta sem data de saída", count: data.filter(d => d.altaSemDataSaida).length, icon: <AlertTriangle className="w-5 h-5" />, color: "text-kpi-amber" },
    { label: "Cidade ausente", count: data.filter(d => d.cidadeAusente).length, icon: <MapPinOff className="w-5 h-5" />, color: "text-kpi-purple" },
    { label: "CID ausente", count: data.filter(d => d.cidAusente).length, icon: <FileX className="w-5 h-5" />, color: "text-kpi-indigo" },
    { label: "Permanência divergente", count: data.filter(d => d.permanenciaDivergente).length, icon: <Clock className="w-5 h-5" />, color: "text-kpi-teal" },
    { label: "Menor de idade ausente", count: data.filter(d => d.menorIdadeAusente).length, icon: <UserX className="w-5 h-5" />, color: "text-kpi-pink" },
  ];

  return (
    <div className="animate-fade-in">
      <h2 className="section-title mb-4 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-kpi-amber" /> Qualidade dos Dados
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {items.map(item => (
          <div key={item.label} className="kpi-card flex flex-col items-center text-center gap-2">
            <div className={item.color}>{item.icon}</div>
            <span className="text-2xl font-bold text-foreground">{item.count}</span>
            <span className="text-xs text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
