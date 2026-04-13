import { ProcessedRecord } from "@/lib/types";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Pencil, Calendar, MapPin, Stethoscope, Clock, AlertTriangle,
  User, Activity, ArrowRightLeft, FileText
} from "lucide-react";

interface PatientModalProps {
  record: ProcessedRecord | null;
  allData: ProcessedRecord[];
  open: boolean;
  onClose: () => void;
  onEdit?: (record: ProcessedRecord) => void;
}

export default function PatientModal({ record, allData, open, onClose, onEdit }: PatientModalProps) {
  if (!record) return null;

  const history = allData
    .filter(d => d.paciente.toLowerCase() === record.paciente.toLowerCase())
    .sort((a, b) => (b.dataEntrada?.getTime() || 0) - (a.dataEntrada?.getTime() || 0)); // Newest first

  const flags = [
    record.altaSemDataSaida && "Alta sem data de saída",
    record.dataSaidaInvalida && "Data de saída inválida",
    record.permanenciaDivergente && "Permanência divergente",
    record.cidadeAusente && "Cidade ausente",
    record.cidAusente && "CID ausente",
    record.menorIdadeAusente && "Menor de idade ausente",
  ].filter(Boolean) as string[];

  const isOngoing = record.statusInternacao === "Em andamento";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden flex flex-col gap-0 border-border/50 shadow-2xl">
        {/* === HEADER PREMIUM === */}
        <div className="px-6 py-6 pb-4 border-b border-border/50 bg-gradient-to-br from-muted/50 to-background flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 border border-primary/20 shadow-sm">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="flex flex-col justify-center">
                <DialogTitle className="text-xl font-bold tracking-tight text-foreground mb-1">
                  {record.paciente}
                </DialogTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={isOngoing ? "default" : "secondary"} className={isOngoing ? "bg-kpi-amber hover:bg-kpi-amber/90 text-amber-950 font-semibold" : ""}>
                    {record.statusInternacao}
                  </Badge>
                  {record.reinternacao && (
                    <Badge variant="outline" className="border-kpi-pink/40 text-kpi-pink">
                      Reinternação
                    </Badge>
                  )}
                  {record.menorIdade === "SIM" && (
                    <Badge variant="outline" className="border-kpi-cyan/40 text-kpi-cyan">
                      Menor de Idade
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {onEdit && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => { onClose(); onEdit(record); }}
                className="shrink-0 mr-2 shadow-sm"
              >
                <Pencil className="w-3.5 h-3.5 mr-2" />
                Editar Perfil
              </Button>
            )}
          </div>
        </div>

        {/* === BODY (SPLIT VIEW) === */}
        <div className="flex flex-col md:flex-row overflow-y-auto w-full scrollbar-thin">
          
          {/* Lado Esquerdo: Dados Principais */}
          <div className="flex-1 p-6 space-y-6 border-r border-border/50">
            
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-primary" /> Período
              </h4>
              <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-xl border border-border/30">
                <DataPoint label="Entrada" value={record.dataEntradaStr} />
                <DataPoint label="Saída" value={record.dataSaidaStr} />
                <DataPoint label="Permanência" value={`${record.permanenciaDias} dias`} highlight />
                <DataPoint label="Faixa" value={record.faixaPermanencia} />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Stethoscope className="w-3.5 h-3.5 text-primary" /> Quadro Clínico
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <DataPoint label="Tipo de Internação" value={record.tipoInternacao} />
                <DataPoint label="Tipo de Alta" value={record.tipoAlta} />
                <DataPoint label="CID (Diagnóstico)" value={record.cid} span={2} />
              </div>
            </div>

            {record.descricao && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-primary" /> Descrição / Observações
                </h4>
                <div className="bg-muted/10 p-4 rounded-xl border border-border/30 text-sm text-foreground whitespace-pre-wrap">
                  {record.descricao}
                </div>
              </div>
            )}

            <Separator className="bg-border/40" />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                 <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-primary" /> Origem
                 </h4>
                 <DataPoint label="Cidade" value={record.cidadeFinal} />
              </div>
              <div className="space-y-4">
                 <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-primary" /> Estatísticas
                 </h4>
                 <DataPoint label="Total de Internações" value={`${record.totalInternacoesPaciente} passagens`} />
              </div>
            </div>

          </div>

          {/* Lado Direito: Histórico e Alertas */}
          <div className="w-full md:w-[280px] bg-muted/5 p-6 space-y-8 flex flex-col shrink-0">
            
            {flags.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-destructive flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5" /> Alertas
                </h4>
                <div className="flex flex-col gap-2">
                  {flags.map(f => (
                    <div key={f} className="text-xs bg-destructive/10 text-destructive border border-destructive/20 px-3 py-2 rounded-md font-medium leading-tight">
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4 flex-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-primary" /> Histórico ({history.length})
              </h4>
              <div className="relative border-l-2 border-muted pl-4 space-y-6 ml-2 mt-2">
                {history.map((h, i) => {
                  const isCurrent = h.id === record.id;
                  return (
                    <div key={i} className="relative">
                      {/* Timeline dot */}
                      <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 ${
                        isCurrent ? 'bg-primary border-primary ring-2 ring-primary/20' : 'bg-muted-foreground border-background'
                      }`} />
                      
                      <div className={`text-sm ${isCurrent ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                        {h.dataEntradaStr}
                      </div>
                      
                      <div className="text-xs text-muted-foreground mt-1 space-y-1">
                        <div className="flex items-center gap-1.5">
                           {h.dataSaidaStr === "Em andamento" ? (
                             <Badge variant="outline" className="text-[9px] py-0 h-4 border-kpi-amber/30 text-kpi-amber">Atual</Badge>
                           ) : (
                             <span>Até {h.dataSaidaStr}</span>
                           )}
                        </div>
                        <div className="text-[11px] opacity-70">
                          {h.permanenciaDias} dias • {h.cid}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}

function DataPoint({ label, value, highlight, span = 1 }: { label: string; value: string; highlight?: boolean; span?: number }) {
  return (
    <div className={span === 2 ? "col-span-2" : "col-span-1"}>
      <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
      <div className={`font-medium ${highlight ? "text-primary text-base" : "text-sm text-foreground"}`}>
        {value}
      </div>
    </div>
  );
}
