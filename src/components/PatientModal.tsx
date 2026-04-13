import { ProcessedRecord } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface PatientModalProps {
  record: ProcessedRecord | null;
  allData: ProcessedRecord[];
  open: boolean;
  onClose: () => void;
}

export default function PatientModal({ record, allData, open, onClose }: PatientModalProps) {
  if (!record) return null;

  const history = allData
    .filter(d => d.paciente.toLowerCase() === record.paciente.toLowerCase())
    .sort((a, b) => (a.dataEntrada?.getTime() || 0) - (b.dataEntrada?.getTime() || 0));

  const flags = [
    record.altaSemDataSaida && "Alta sem data de saída",
    record.dataSaidaInvalida && "Data de saída inválida",
    record.permanenciaDivergente && "Permanência divergente",
    record.cidadeAusente && "Cidade ausente",
    record.cidAusente && "CID ausente",
    record.menorIdadeAusente && "Menor de idade ausente",
  ].filter(Boolean) as string[];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">{record.paciente}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Entrada" value={record.dataEntradaStr} />
            <Field label="Saída" value={record.dataSaidaStr} />
            <Field label="Status" value={record.statusInternacao} />
            <Field label="Cidade" value={record.cidadeFinal} />
            <Field label="Tipo Internação" value={record.tipoInternacao} />
            <Field label="Tipo Alta" value={record.tipoAlta} />
            <Field label="CID" value={record.cid} />
            <Field label="Menor de idade" value={record.menorIdade} />
            <Field label="Permanência" value={`${record.permanenciaDias} dias`} />
            <Field label="Faixa" value={record.faixaPermanencia} />
            <Field label="Reinternação" value={record.reinternacao ? "Sim" : "Não"} />
            <Field label="Total internações" value={String(record.totalInternacoesPaciente)} />
          </div>

          {flags.length > 0 && (
            <div>
              <p className="font-semibold text-foreground mb-1">Inconsistências</p>
              <div className="flex flex-wrap gap-1">
                {flags.map(f => <Badge key={f} variant="destructive" className="text-xs">{f}</Badge>)}
              </div>
            </div>
          )}

          {history.length > 1 && (
            <div>
              <p className="font-semibold text-foreground mb-2">Histórico do Paciente</p>
              <div className="space-y-2">
                {history.map((h, i) => (
                  <div key={i} className={`p-2 rounded-lg border text-xs ${h.id === record.id ? "bg-primary/5 border-primary/30" : "bg-muted/50"}`}>
                    <span className="font-medium">{h.dataEntradaStr}</span> → <span>{h.dataSaidaStr}</span>
                    <span className="ml-2 text-muted-foreground">{h.permanenciaDias}d · {h.tipoInternacao} · {h.cid}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-medium text-foreground">{value}</p>
    </div>
  );
}
