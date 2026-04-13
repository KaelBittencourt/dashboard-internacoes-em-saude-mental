import { RawRecord, ProcessedRecord } from "./types";
import { parse, differenceInDays, isValid, getISOWeek, format } from "date-fns";
import { ptBR } from "date-fns/locale";

function parseDate(str: string): Date | null {
  if (!str || !str.trim()) return null;
  const cleaned = str.trim();
  // Try dd/MM/yyyy
  let d = parse(cleaned, "dd/MM/yyyy", new Date());
  if (isValid(d) && d.getFullYear() > 1900 && d.getFullYear() < 2100) return d;
  // Try yyyy-MM-dd
  d = parse(cleaned, "yyyy-MM-dd", new Date());
  if (isValid(d) && d.getFullYear() > 1900 && d.getFullYear() < 2100) return d;
  return null;
}

function getFaixaPermanencia(dias: number): string {
  if (dias <= 7) return "0 a 7 dias";
  if (dias <= 15) return "8 a 15 dias";
  if (dias <= 30) return "16 a 30 dias";
  if (dias <= 60) return "31 a 60 dias";
  return "Acima de 60 dias";
}

function formatMonth(d: Date | null): string {
  if (!d) return "Não informado";
  return format(d, "MMM/yyyy", { locale: ptBR });
}

export function transformData(raw: RawRecord[]): ProcessedRecord[] {
  // First pass: build records
  const records: ProcessedRecord[] = raw.map((r, idx) => {
    const dataEntrada = parseDate(r["DATA DE ENTRADA"]);
    const dataSaida = parseDate(r["DATA DE SAÍDA"]);

    const cidade = (r.CIDADE || "").trim();
    const outrasCidades = (r["OUTRAS CIDADES"] || "").trim();
    const cidadeFinal = cidade || outrasCidades || "Não informado";

    const statusInternacao: "Encerrada" | "Em andamento" = dataSaida ? "Encerrada" : "Em andamento";

    const now = new Date();
    const permanenciaDias = dataEntrada
      ? dataSaida
        ? Math.max(0, differenceInDays(dataSaida, dataEntrada))
        : Math.max(0, differenceInDays(now, dataEntrada))
      : 0;

    const tempoPermInformado = r["TEMPO DE PERMANÊNCIA"]
      ? parseInt(r["TEMPO DE PERMANÊNCIA"], 10) || null
      : null;

    const tipoAlta = (r["TIPO DE ALTA"] || "").trim() || "Não informado";
    const tipoInternacao = (r["TIPO DE INTERNAÇÃO"] || "").trim() || "Não informado";
    const cid = (r.CIDs || "").trim() || "Não informado";
    const menorIdade = (r["PACIENTE MENOR DE IDADE?"] || "").trim() || "Não informado";
    const paciente = (r.PACIENTE || "").trim() || "Não informado";

    // Quality flags
    const altaSemDataSaida = tipoAlta !== "Não informado" && tipoAlta !== "" && !dataSaida;
    const dataSaidaInvalida = !!(r["DATA DE SAÍDA"] && r["DATA DE SAÍDA"].trim() && !dataSaida);
    const permanenciaDivergente = tempoPermInformado !== null && Math.abs(tempoPermInformado - permanenciaDias) > 1;
    const cidadeAusente = cidadeFinal === "Não informado";
    const cidAusente = cid === "Não informado";
    const menorIdadeAusente = menorIdade === "Não informado";

    return {
      id: idx,
      paciente,
      dataEntrada,
      dataSaida,
      dataEntradaStr: dataEntrada ? format(dataEntrada, "dd/MM/yyyy") : "Não informado",
      dataSaidaStr: dataSaida ? format(dataSaida, "dd/MM/yyyy") : statusInternacao === "Em andamento" ? "Em andamento" : "Não informado",
      cidade,
      outrasCidades,
      cidadeFinal,
      tempoPermInformado,
      permanenciaDias,
      faixaPermanencia: getFaixaPermanencia(permanenciaDias),
      tipoInternacao,
      tipoAlta,
      cid,
      menorIdade,
      statusInternacao,
      totalInternacoesPaciente: 0,
      reinternacao: false,
      mesEntrada: formatMonth(dataEntrada),
      mesSaida: formatMonth(dataSaida),
      anoEntrada: dataEntrada ? dataEntrada.getFullYear() : null,
      semanaEntrada: dataEntrada ? getISOWeek(dataEntrada) : null,
      altaSemDataSaida,
      dataSaidaInvalida,
      permanenciaDivergente,
      cidadeAusente,
      cidAusente,
      menorIdadeAusente,
    };
  });

  // Second pass: reinternações
  const pacienteCount = new Map<string, number>();
  records.forEach((r) => {
    if (r.paciente !== "Não informado") {
      pacienteCount.set(r.paciente.toLowerCase(), (pacienteCount.get(r.paciente.toLowerCase()) || 0) + 1);
    }
  });
  records.forEach((r) => {
    const key = r.paciente.toLowerCase();
    const count = pacienteCount.get(key) || 1;
    r.totalInternacoesPaciente = count;
    r.reinternacao = count >= 2;
  });

  return records;
}
