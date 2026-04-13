export interface RawRecord {
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
}

export interface ProcessedRecord {
  id: number;
  paciente: string;
  dataEntrada: Date | null;
  dataSaida: Date | null;
  dataEntradaStr: string;
  dataSaidaStr: string;
  cidade: string;
  outrasCidades: string;
  cidadeFinal: string;
  tempoPermInformado: number | null;
  permanenciaDias: number;
  faixaPermanencia: string;
  tipoInternacao: string;
  tipoAlta: string;
  cid: string;
  menorIdade: string;
  statusInternacao: "Encerrada" | "Em andamento";
  totalInternacoesPaciente: number;
  reinternacao: boolean;
  mesEntrada: string;
  mesSaida: string;
  anoEntrada: number | null;
  semanaEntrada: number | null;
  // quality flags
  altaSemDataSaida: boolean;
  dataSaidaInvalida: boolean;
  permanenciaDivergente: boolean;
  cidadeAusente: boolean;
  cidAusente: boolean;
  menorIdadeAusente: boolean;
}

export interface Filters {
  dataEntradaInicio: string;
  dataEntradaFim: string;
  dataSaidaInicio: string;
  dataSaidaFim: string;
  status: string;
  cidade: string;
  tipoInternacao: string;
  tipoAlta: string;
  cid: string;
  menorIdade: string;
  reinternacao: string;
  faixaPermanencia: string;
  buscaPaciente: string;
}

export const defaultFilters: Filters = {
  dataEntradaInicio: "",
  dataEntradaFim: "",
  dataSaidaInicio: "",
  dataSaidaFim: "",
  status: "",
  cidade: "",
  tipoInternacao: "",
  tipoAlta: "",
  cid: "",
  menorIdade: "",
  reinternacao: "",
  faixaPermanencia: "",
  buscaPaciente: "",
};
