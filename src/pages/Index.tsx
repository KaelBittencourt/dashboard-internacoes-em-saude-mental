import { useState, useEffect, useMemo, useCallback } from "react";
import { fetchSheetData } from "@/lib/fetchData";
import { transformData } from "@/lib/transformData";
import { computeMetrics } from "@/lib/metrics";
import { applyFilters } from "@/lib/filterData";
import { ProcessedRecord, Filters, defaultFilters } from "@/lib/types";
import FiltersBar from "@/components/FiltersBar";
import KpiGrid from "@/components/KpiGrid";
import ChartsSection from "@/components/ChartsSection";
import QualitySection from "@/components/QualitySection";
import DataTable from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { RefreshCw, Brain } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Index() {
  const [allData, setAllData] = useState<ProcessedRecord[]>([]);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await fetchSheetData();
      const processed = transformData(raw);
      setAllData(processed);
      setLastSync(new Date());
    } catch (e: any) {
      setError(e.message || "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = useMemo(() => applyFilters(allData, filters), [allData, filters]);
  const metrics = useMemo(() => computeMetrics(filtered), [filtered]);

  if (loading && !allData.length) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Carregando dados da planilha...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1600px] mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Internações em Saúde Mental</h1>
              <p className="text-xs text-muted-foreground">
                Dados sincronizados do Google Sheets
                {lastSync && <> · Última atualização: {format(lastSync, "dd/MM/yyyy HH:mm", { locale: ptBR })}</>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button size="sm" onClick={() => window.location.reload()} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} />
              Atualizar dados
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <FiltersBar filters={filters} setFilters={setFilters} allData={allData} />
        <KpiGrid metrics={metrics} />
        <ChartsSection data={filtered} />
        <QualitySection data={filtered} />
        <DataTable data={filtered} allData={allData} />
      </div>
    </div>
  );
}
