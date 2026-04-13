import { ProcessedRecord } from "./types";

export function computeMetrics(data: ProcessedRecord[]) {
  const total = data.length;
  const distinctPacientes = new Set(data.map((d) => d.paciente.toLowerCase())).size;
  const emAndamento = data.filter((d) => d.statusInternacao === "Em andamento").length;
  const encerradas = data.filter((d) => d.statusInternacao === "Encerrada").length;

  const permanencias = data.map((d) => d.permanenciaDias).filter((d) => d > 0);
  const tempoMedio = permanencias.length ? permanencias.reduce((a, b) => a + b, 0) / permanencias.length : 0;
  const sorted = [...permanencias].sort((a, b) => a - b);
  const tempoMediano = sorted.length
    ? sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)]
    : 0;
  const tempoMaximo = sorted.length ? sorted[sorted.length - 1] : 0;

  const pacientesReinternados = new Set(data.filter((d) => d.reinternacao).map((d) => d.paciente.toLowerCase())).size;
  const taxaReinternacao = distinctPacientes > 0 ? (pacientesReinternados / distinctPacientes) * 100 : 0;

  const menores = data.filter((d) => d.menorIdade.toUpperCase() === "SIM").length;
  const involuntarias = data.filter((d) => d.tipoInternacao.toLowerCase().includes("involuntária")).length;
  const percInvoluntarias = total > 0 ? (involuntarias / total) * 100 : 0;

  const altasMelhoradas = data.filter((d) => d.tipoAlta.toLowerCase().includes("melhorada")).length;
  const evasoes = data.filter((d) => d.tipoAlta.toLowerCase().includes("evasão") || d.tipoAlta.toLowerCase().includes("evasao")).length;

  // Cidade com maior volume
  const cidadeMap = new Map<string, number>();
  data.forEach((d) => cidadeMap.set(d.cidadeFinal, (cidadeMap.get(d.cidadeFinal) || 0) + 1));
  const cidadeMaior = [...cidadeMap.entries()].sort((a, b) => b[1] - a[1])[0];

  // CID mais frequente
  const cidMap = new Map<string, number>();
  data.forEach((d) => cidMap.set(d.cid, (cidMap.get(d.cid) || 0) + 1));
  const cidMaior = [...cidMap.entries()].sort((a, b) => b[1] - a[1])[0];

  // Inconsistências
  const totalInconsistencias = data.reduce(
    (acc, d) =>
      acc +
      (d.altaSemDataSaida ? 1 : 0) +
      (d.dataSaidaInvalida ? 1 : 0) +
      (d.permanenciaDivergente ? 1 : 0) +
      (d.cidadeAusente ? 1 : 0) +
      (d.cidAusente ? 1 : 0) +
      (d.menorIdadeAusente ? 1 : 0),
    0
  );

  return {
    total,
    distinctPacientes,
    emAndamento,
    encerradas,
    tempoMedio: Math.round(tempoMedio * 10) / 10,
    tempoMediano: Math.round(tempoMediano * 10) / 10,
    tempoMaximo,
    taxaReinternacao: Math.round(taxaReinternacao * 10) / 10,
    menores,
    percInvoluntarias: Math.round(percInvoluntarias * 10) / 10,
    altasMelhoradas,
    evasoes,
    cidadeMaiorVolume: cidadeMaior ? `${cidadeMaior[0]} (${cidadeMaior[1]})` : "N/A",
    cidMaisFrequente: cidMaior ? `${cidMaior[0]} (${cidMaior[1]})` : "N/A",
    totalInconsistencias,
  };
}
