import { useState, useMemo } from "react";
import { ProcessedRecord } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Download, Search, ChevronUp, ChevronDown } from "lucide-react";
import PatientModal from "./PatientModal";
import * as XLSX from "xlsx";

interface DataTableProps {
  data: ProcessedRecord[];
  allData: ProcessedRecord[];
}

type SortKey = keyof ProcessedRecord;

export default function DataTable({ data, allData }: DataTableProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>("dataEntrada");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selectedRecord, setSelectedRecord] = useState<ProcessedRecord | null>(null);
  const pageSize = 15;

  const filtered = useMemo(() => {
    let d = data;
    if (search) d = d.filter(r => r.paciente.toLowerCase().includes(search.toLowerCase()));
    d = [...d].sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return d;
  }, [data, search, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const pageData = filtered.slice(page * pageSize, (page + 1) * pageSize);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const exportCSV = () => {
    const headers = ["Paciente","Entrada","Saída","Status","Cidade","Tipo Internação","Tipo Alta","CID","Menor","Permanência (dias)","Reinternação"];
    const rows = filtered.map(r => [r.paciente, r.dataEntradaStr, r.dataSaidaStr, r.statusInternacao, r.cidadeFinal, r.tipoInternacao, r.tipoAlta, r.cid, r.menorIdade, r.permanenciaDias, r.reinternacao ? "Sim" : "Não"]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "internacoes.csv"; a.click();
  };

  const exportXLSX = () => {
    const ws = XLSX.utils.json_to_sheet(filtered.map(r => ({
      Paciente: r.paciente, Entrada: r.dataEntradaStr, Saída: r.dataSaidaStr, Status: r.statusInternacao,
      Cidade: r.cidadeFinal, "Tipo Internação": r.tipoInternacao, "Tipo Alta": r.tipoAlta, CID: r.cid,
      "Menor de Idade": r.menorIdade, "Permanência (dias)": r.permanenciaDias, Reinternação: r.reinternacao ? "Sim" : "Não",
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Internações");
    XLSX.writeFile(wb, "internacoes.xlsx");
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return null;
    return sortDir === "asc" ? <ChevronUp className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />;
  };

  const cols: { key: SortKey; label: string; w?: string }[] = [
    { key: "paciente", label: "Paciente", w: "min-w-[180px]" },
    { key: "dataEntrada", label: "Entrada" },
    { key: "dataSaida", label: "Saída" },
    { key: "statusInternacao", label: "Status" },
    { key: "cidadeFinal", label: "Cidade" },
    { key: "tipoInternacao", label: "Tipo Int." },
    { key: "tipoAlta", label: "Tipo Alta" },
    { key: "cid", label: "CID" },
    { key: "menorIdade", label: "Menor" },
    { key: "permanenciaDias", label: "Dias" },
    { key: "reinternacao", label: "Reint." },
  ];

  const hasFlags = (r: ProcessedRecord) => r.altaSemDataSaida || r.dataSaidaInvalida || r.permanenciaDivergente || r.cidadeAusente || r.cidAusente || r.menorIdadeAusente;

  return (
    <div className="chart-container animate-fade-in">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
        <h2 className="section-title">Tabela Detalhada</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} className="pl-9 h-8 text-sm w-48" />
          </div>
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="w-3 h-3 mr-1" />CSV</Button>
          <Button variant="outline" size="sm" onClick={exportXLSX}><Download className="w-3 h-3 mr-1" />XLSX</Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b bg-muted/50">
              {cols.map(c => (
                <th key={c.key} className={`px-3 py-2 text-left font-semibold text-muted-foreground cursor-pointer select-none hover:text-foreground ${c.w || ""}`} onClick={() => toggleSort(c.key)}>
                  {c.label} <SortIcon col={c.key} />
                </th>
              ))}
              <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Flags</th>
            </tr>
          </thead>
          <tbody>
            {pageData.map(r => (
              <tr key={r.id} className="border-b hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => setSelectedRecord(r)}>
                <td className="px-3 py-2 font-medium text-foreground">{r.paciente}</td>
                <td className="px-3 py-2">{r.dataEntradaStr}</td>
                <td className="px-3 py-2">{r.dataSaidaStr}</td>
                <td className="px-3 py-2">
                  <Badge variant={r.statusInternacao === "Em andamento" ? "default" : "secondary"} className="text-xs">
                    {r.statusInternacao}
                  </Badge>
                </td>
                <td className="px-3 py-2">{r.cidadeFinal}</td>
                <td className="px-3 py-2">{r.tipoInternacao}</td>
                <td className="px-3 py-2">{r.tipoAlta}</td>
                <td className="px-3 py-2 max-w-[120px] truncate">{r.cid}</td>
                <td className="px-3 py-2">{r.menorIdade}</td>
                <td className="px-3 py-2 font-medium">{r.permanenciaDias}</td>
                <td className="px-3 py-2">{r.reinternacao ? "Sim" : "Não"}</td>
                <td className="px-3 py-2">
                  {hasFlags(r) && <Badge variant="destructive" className="text-xs">!</Badge>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
        <span>{filtered.length} registros</span>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Anterior</Button>
          <span className="flex items-center px-2">{page + 1} / {totalPages || 1}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Próximo</Button>
        </div>
      </div>

      <PatientModal record={selectedRecord} allData={allData} open={!!selectedRecord} onClose={() => setSelectedRecord(null)} />
    </div>
  );
}
