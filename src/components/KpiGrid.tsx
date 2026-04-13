import KpiCard from "./KpiCard";
import {
  Users, UserCheck, Clock, TrendingUp, AlertTriangle, Activity,
  MapPin, FileText, ArrowUpDown, Baby, LogOut, Award, Timer, ShieldAlert
} from "lucide-react";

interface KpiGridProps {
  metrics: ReturnType<typeof import("@/lib/metrics").computeMetrics>;
}

export default function KpiGrid({ metrics }: KpiGridProps) {
  const cards = [
    { title: "Total de Internações", value: metrics.total, icon: <Activity className="w-5 h-5 text-primary-foreground" />, color: "bg-kpi-blue" },
    { title: "Pacientes Distintos", value: metrics.distinctPacientes, icon: <Users className="w-5 h-5 text-primary-foreground" />, color: "bg-kpi-indigo" },
    { title: "Em Andamento", value: metrics.emAndamento, icon: <Clock className="w-5 h-5 text-primary-foreground" />, color: "bg-kpi-amber" },
    { title: "Encerradas", value: metrics.encerradas, icon: <UserCheck className="w-5 h-5 text-primary-foreground" />, color: "bg-kpi-emerald" },
    { title: "Tempo Médio (dias)", value: metrics.tempoMedio, icon: <Timer className="w-5 h-5 text-primary-foreground" />, color: "bg-kpi-teal" },
    { title: "Tempo Mediano (dias)", value: metrics.tempoMediano, icon: <ArrowUpDown className="w-5 h-5 text-primary-foreground" />, color: "bg-kpi-purple" },
    { title: "Taxa Reinternação", value: `${metrics.taxaReinternacao}%`, icon: <TrendingUp className="w-5 h-5 text-primary-foreground" />, color: "bg-kpi-pink" },
    { title: "Menores de Idade", value: metrics.menores, icon: <Baby className="w-5 h-5 text-primary-foreground" />, color: "bg-kpi-cyan" },
    { title: "% Involuntárias", value: `${metrics.percInvoluntarias}%`, icon: <ShieldAlert className="w-5 h-5 text-primary-foreground" />, color: "bg-kpi-red" },
    { title: "Altas Melhoradas", value: metrics.altasMelhoradas, icon: <Award className="w-5 h-5 text-primary-foreground" />, color: "bg-kpi-lime" },
    { title: "Evasões", value: metrics.evasoes, icon: <LogOut className="w-5 h-5 text-primary-foreground" />, color: "bg-kpi-orange" },
    { title: "Cidade Maior Volume", value: "", icon: <MapPin className="w-5 h-5 text-primary-foreground" />, color: "bg-kpi-sky", subtitle: metrics.cidadeMaiorVolume },
    { title: "CID Mais Frequente", value: "", icon: <FileText className="w-5 h-5 text-primary-foreground" />, color: "bg-kpi-violet", subtitle: metrics.cidMaisFrequente },
    { title: "Permanência Máxima", value: `${metrics.tempoMaximo} dias`, icon: <Clock className="w-5 h-5 text-primary-foreground" />, color: "bg-kpi-rose" },
    { title: "Inconsistências", value: metrics.totalInconsistencias, icon: <AlertTriangle className="w-5 h-5 text-primary-foreground" />, color: "bg-kpi-green" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((c) => (
        <KpiCard key={c.title} {...c} />
      ))}
    </div>
  );
}
