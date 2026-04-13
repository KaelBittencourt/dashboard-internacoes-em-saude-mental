import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface FormData {
  PACIENTE: string;
  "DATA DE ENTRADA": string;
  "DATA DE SAÍDA": string;
  CIDADE: string;
  "OUTRAS CIDADES": string;
  "TEMPO DE PERMANÊNCIA": string;
  "TIPO DE INTERNAÇÃO": string;
  "TIPO DE ALTA": string;
  CIDs: string;
  "PACIENTE MENOR DE IDADE?": string;
  "DESCRIÇÃO": string;
}

const emptyForm: FormData = {
  PACIENTE: "",
  "DATA DE ENTRADA": "",
  "DATA DE SAÍDA": "",
  CIDADE: "",
  "OUTRAS CIDADES": "",
  "TEMPO DE PERMANÊNCIA": "",
  "TIPO DE INTERNAÇÃO": "",
  "TIPO DE ALTA": "",
  CIDs: "",
  "PACIENTE MENOR DE IDADE?": "",
  "DESCRIÇÃO": "",
};

const TIPO_INTERNACAO_OPTIONS = ["Voluntária", "Involuntária", "Compulsória"];
const TIPO_ALTA_OPTIONS = ["Melhorada", "Inalterada", "A pedido", "Evasão", "Transferência", "Óbito"];
const MENOR_OPTIONS = ["SIM", "NÃO"];

interface RecordFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  initialData?: Partial<FormData> | null;
  mode: "add" | "edit";
}

// Convert dd/MM/yyyy to yyyy-MM-dd for <input type="date">
function toInputDate(str: string): string {
  if (!str) return "";
  const parts = str.split("/");
  if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
  return str;
}

// Convert yyyy-MM-dd to dd/MM/yyyy for storage
function toSheetDate(str: string): string {
  if (!str) return "";
  const parts = str.split("-");
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return str;
}

export default function RecordFormModal({ open, onClose, onSubmit, initialData, mode }: RecordFormModalProps) {
  const [form, setForm] = useState<FormData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setForm({
          ...emptyForm,
          ...initialData,
          "DATA DE ENTRADA": toInputDate(initialData["DATA DE ENTRADA"] || ""),
          "DATA DE SAÍDA": toInputDate(initialData["DATA DE SAÍDA"] || ""),
        });
      } else {
        setForm(emptyForm);
      }
      setError(null);
    }
  }, [open, initialData]);

  const update = (key: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.PACIENTE.trim()) {
      setError("Nome do paciente é obrigatório");
      return;
    }
    if (!form["DATA DE ENTRADA"]) {
      setError("Data de entrada é obrigatória");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const submitData = {
        ...form,
        "DATA DE ENTRADA": toSheetDate(form["DATA DE ENTRADA"]),
        "DATA DE SAÍDA": toSheetDate(form["DATA DE SAÍDA"]),
      };
      await onSubmit(submitData);
      onClose();
    } catch (e: any) {
      setError(e.message || "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Novo Registro" : "Editar Registro"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Paciente */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Paciente *</label>
            <Input value={form.PACIENTE} onChange={(e) => update("PACIENTE", e.target.value)} placeholder="Nome completo do paciente" />
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Data de Entrada *</label>
              <Input type="date" value={form["DATA DE ENTRADA"]} onChange={(e) => update("DATA DE ENTRADA", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Data de Saída</label>
              <Input type="date" value={form["DATA DE SAÍDA"]} onChange={(e) => update("DATA DE SAÍDA", e.target.value)} />
            </div>
          </div>

          {/* Cidade */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Cidade</label>
              <Input value={form.CIDADE} onChange={(e) => update("CIDADE", e.target.value)} placeholder="Cidade" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Outras Cidades</label>
              <Input value={form["OUTRAS CIDADES"]} onChange={(e) => update("OUTRAS CIDADES", e.target.value)} placeholder="Se houver" />
            </div>
          </div>

          {/* Tipo Internação */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Tipo de Internação</label>
              <Select value={form["TIPO DE INTERNAÇÃO"] || "none"} onValueChange={(v) => update("TIPO DE INTERNAÇÃO", v === "none" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Selecione</SelectItem>
                  {TIPO_INTERNACAO_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Tipo de Alta</label>
              <Select value={form["TIPO DE ALTA"] || "none"} onValueChange={(v) => update("TIPO DE ALTA", v === "none" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Selecione</SelectItem>
                  {TIPO_ALTA_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* CID e Menor */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">CID</label>
              <Input value={form.CIDs} onChange={(e) => update("CIDs", e.target.value)} placeholder="Ex: F20, F32" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Menor de Idade?</label>
              <Select value={form["PACIENTE MENOR DE IDADE?"] || "none"} onValueChange={(v) => update("PACIENTE MENOR DE IDADE?", v === "none" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Selecione</SelectItem>
                  {MENOR_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tempo permanência */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Tempo de Permanência (dias)</label>
            <Input type="number" value={form["TEMPO DE PERMANÊNCIA"]} onChange={(e) => update("TEMPO DE PERMANÊNCIA", e.target.value)} placeholder="Calculado automaticamente se vazio" />
          </div>

          {/* Descrição */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Descrição</label>
            <textarea
              value={form["DESCRIÇÃO"]}
              onChange={(e) => update("DESCRIÇÃO", e.target.value)}
              placeholder="Observações, anotações ou detalhes relevantes sobre o paciente..."
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[80px] resize-y"
            />
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
            {mode === "add" ? "Adicionar" : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
