import { Filters, defaultFilters, ProcessedRecord } from "@/lib/types";
import { getUniqueValues } from "@/lib/filterData";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X, Search } from "lucide-react";

interface FiltersBarProps {
  filters: Filters;
  setFilters: (f: Filters) => void;
  allData: ProcessedRecord[];
}

const FAIXAS = ["0 a 7 dias", "8 a 15 dias", "16 a 30 dias", "31 a 60 dias", "Acima de 60 dias"];

export default function FiltersBar({ filters, setFilters, allData }: FiltersBarProps) {
  const update = (key: keyof Filters, value: string) => setFilters({ ...filters, [key]: value });
  const clear = () => setFilters(defaultFilters);
  const hasFilters = Object.values(filters).some((v) => v !== "");

  return (
    <div className="bg-card rounded-xl border p-4 shadow-sm animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Filtros</h3>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clear} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4 mr-1" /> Limpar filtros
          </Button>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        <div className="relative col-span-2 md:col-span-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar paciente..."
            value={filters.buscaPaciente}
            onChange={(e) => update("buscaPaciente", e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <div>
          <Input type="date" value={filters.dataEntradaInicio} onChange={(e) => update("dataEntradaInicio", e.target.value)} className="h-9 text-sm" placeholder="Entrada de" />
        </div>
        <div>
          <Input type="date" value={filters.dataEntradaFim} onChange={(e) => update("dataEntradaFim", e.target.value)} className="h-9 text-sm" placeholder="Entrada até" />
        </div>
        <FilterSelect label="Status" value={filters.status} onChange={(v) => update("status", v)} options={["Encerrada", "Em andamento"]} />
        <FilterSelect label="Cidade" value={filters.cidade} onChange={(v) => update("cidade", v)} options={getUniqueValues(allData, "cidadeFinal")} />
        <FilterSelect label="Tipo Internação" value={filters.tipoInternacao} onChange={(v) => update("tipoInternacao", v)} options={getUniqueValues(allData, "tipoInternacao")} />
        <FilterSelect label="Tipo Alta" value={filters.tipoAlta} onChange={(v) => update("tipoAlta", v)} options={getUniqueValues(allData, "tipoAlta")} />
        <FilterSelect label="CID" value={filters.cid} onChange={(v) => update("cid", v)} options={getUniqueValues(allData, "cid")} />
        <FilterSelect label="Menor de idade" value={filters.menorIdade} onChange={(v) => update("menorIdade", v)} options={["SIM", "NÃO"]} />
        <FilterSelect label="Reinternação" value={filters.reinternacao} onChange={(v) => update("reinternacao", v)} options={["Sim", "Não"]} />
        <FilterSelect label="Faixa permanência" value={filters.faixaPermanencia} onChange={(v) => update("faixaPermanencia", v)} options={FAIXAS} />
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <Select value={value || "all"} onValueChange={(v) => onChange(v === "all" ? "" : v)}>
      <SelectTrigger className="h-9 text-sm">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{label}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>{o}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
