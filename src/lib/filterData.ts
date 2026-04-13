import { ProcessedRecord, Filters } from "./types";
import { parse, isValid } from "date-fns";

function toDate(s: string): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return isValid(d) ? d : null;
}

export function applyFilters(data: ProcessedRecord[], filters: Filters): ProcessedRecord[] {
  return data.filter((r) => {
    if (filters.buscaPaciente && !r.paciente.toLowerCase().includes(filters.buscaPaciente.toLowerCase())) return false;
    if (filters.status && r.statusInternacao !== filters.status) return false;
    if (filters.cidade && r.cidadeFinal !== filters.cidade) return false;
    if (filters.tipoInternacao && r.tipoInternacao !== filters.tipoInternacao) return false;
    if (filters.tipoAlta && r.tipoAlta !== filters.tipoAlta) return false;
    if (filters.cid && r.cid !== filters.cid) return false;
    if (filters.menorIdade && r.menorIdade.toUpperCase() !== filters.menorIdade.toUpperCase()) return false;
    if (filters.faixaPermanencia && r.faixaPermanencia !== filters.faixaPermanencia) return false;
    if (filters.reinternacao) {
      if (filters.reinternacao === "Sim" && !r.reinternacao) return false;
      if (filters.reinternacao === "Não" && r.reinternacao) return false;
    }
    if (filters.dataEntradaInicio) {
      const d = toDate(filters.dataEntradaInicio);
      if (d && r.dataEntrada && r.dataEntrada < d) return false;
    }
    if (filters.dataEntradaFim) {
      const d = toDate(filters.dataEntradaFim);
      if (d && r.dataEntrada && r.dataEntrada > d) return false;
    }
    if (filters.dataSaidaInicio) {
      const d = toDate(filters.dataSaidaInicio);
      if (d && r.dataSaida && r.dataSaida < d) return false;
    }
    if (filters.dataSaidaFim) {
      const d = toDate(filters.dataSaidaFim);
      if (d && r.dataSaida && r.dataSaida > d) return false;
    }
    return true;
  });
}

export function getUniqueValues(data: ProcessedRecord[], key: keyof ProcessedRecord): string[] {
  const set = new Set<string>();
  data.forEach((d) => {
    const v = String(d[key] || "");
    if (v) set.add(v);
  });
  return [...set].sort();
}
