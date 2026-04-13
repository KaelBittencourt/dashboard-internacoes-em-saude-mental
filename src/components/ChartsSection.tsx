import { ProcessedRecord } from "@/lib/types";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart, RadialBarChart, RadialBar, Legend,
} from "recharts";

const PALETTE = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#06b6d4", "#ec4899", "#84cc16", "#f97316", "#6366f1",
];

const GRADIENT_PAIRS = [
  ["#3b82f6", "#60a5fa"],
  ["#10b981", "#34d399"],
  ["#8b5cf6", "#a78bfa"],
  ["#06b6d4", "#22d3ee"],
  ["#f59e0b", "#fbbf24"],
  ["#ef4444", "#f87171"],
  ["#ec4899", "#f472b6"],
];

interface ChartsProps {
  data: ProcessedRecord[];
}

function countBy<T>(arr: T[], fn: (item: T) => string): { name: string; value: number }[] {
  const map = new Map<string, number>();
  arr.forEach((item) => {
    const key = fn(item);
    map.set(key, (map.get(key) || 0) + 1);
  });
  return [...map.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

function sortByMonth(data: { name: string; value: number }[]) {
  const months = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  return [...data].filter(d => d.name !== "Não informado").sort((a, b) => {
    const [ma, ya] = a.name.split("/");
    const [mb, yb] = b.name.split("/");
    const diff = parseInt(ya) - parseInt(yb);
    if (diff !== 0) return diff;
    return months.indexOf(ma.toLowerCase().slice(0, 3)) - months.indexOf(mb.toLowerCase().slice(0, 3));
  });
}

// Modern custom tooltip
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 dark:bg-gray-800 backdrop-blur-sm text-white rounded-lg px-4 py-2.5 shadow-xl border border-white/10 text-xs">
      <p className="font-semibold mb-1 text-gray-300">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-300">{p.name}:</span>
          <span className="font-bold text-white">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-gray-900 dark:bg-gray-800 backdrop-blur-sm text-white rounded-lg px-4 py-2.5 shadow-xl border border-white/10 text-xs">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.payload.fill }} />
        <span className="font-semibold text-white">{d.name}</span>
      </div>
      <p className="mt-1"><span className="font-bold text-sm text-white">{d.value}</span> <span className="text-gray-400">({((d.payload.percent || 0) * 100).toFixed(1)}%)</span></p>
    </div>
  );
}

// Modern donut with center label
function DonutCenter({ data, label }: { data: { name: string; value: number }[]; label: string }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
      <tspan x="50%" dy="-8" style={{ fill: "hsl(var(--foreground))", fontSize: 24, fontWeight: 700 }}>{total}</tspan>
      <tspan x="50%" dy="20" style={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}>{label}</tspan>
    </text>
  );
}

function ChartCard({ title, subtitle, children, className = "", heightClass = "h-72" }: { title: string; subtitle?: string; children: React.ReactNode; className?: string; heightClass?: string }) {
  return (
    <div className={`bg-card/80 backdrop-blur-xl rounded-2xl border border-white/5 p-6 shadow-card hover:shadow-glow transition-all duration-300 animate-fade-in ${className}`}>
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-foreground tracking-tight">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      <div className={heightClass}>{children}</div>
    </div>
  );
}

function useChartTheme() {
  const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
  return {
    gridStroke: isDark ? "hsl(220 15% 20%)" : "hsl(214 20% 92%)",
    axisStyle: { fontSize: 11, fill: isDark ? "hsl(215 15% 60%)" : "hsl(215 10% 50%)" },
  };
}

export default function ChartsSection({ data }: ChartsProps) {
  const { gridStroke, axisStyle } = useChartTheme();
  const entrMensal = sortByMonth(countBy(data, (d) => d.mesEntrada));
  const altasMensal = sortByMonth(countBy(data.filter(d => d.statusInternacao === "Encerrada"), (d) => d.mesSaida));

  const meses = new Set<string>();
  data.forEach(d => { if (d.mesEntrada !== "Não informado") meses.add(d.mesEntrada); if (d.mesSaida !== "Não informado") meses.add(d.mesSaida); });
  const entradasMap = new Map<string, number>();
  const saidasMap = new Map<string, number>();
  data.forEach(d => { if (d.mesEntrada !== "Não informado") entradasMap.set(d.mesEntrada, (entradasMap.get(d.mesEntrada) || 0) + 1); });
  data.filter(d => d.statusInternacao === "Encerrada").forEach(d => { if (d.mesSaida !== "Não informado") saidasMap.set(d.mesSaida, (saidasMap.get(d.mesSaida) || 0) + 1); });
  const entSai = sortByMonth([...meses].map(m => ({ name: m, value: 0 }))).map(m => ({
    name: m.name, entradas: entradasMap.get(m.name) || 0, saidas: saidasMap.get(m.name) || 0
  }));

  const tipoInt = countBy(data, d => d.tipoInternacao);
  const tipoAlta = countBy(data.filter(d => d.statusInternacao === "Encerrada"), d => d.tipoAlta);
  const topCidades = countBy(data, d => d.cidadeFinal).slice(0, 10);
  const topCids = countBy(data, d => d.cid).slice(0, 10);

  const faixas = countBy(data, d => d.faixaPermanencia);
  const faixaOrder = ["0 a 7 dias", "8 a 15 dias", "16 a 30 dias", "31 a 60 dias", "Acima de 60 dias"];
  const faixasSorted = faixaOrder.map(f => faixas.find(x => x.name === f) || { name: f, value: 0 });

  const menorData = countBy(data, d => d.menorIdade.toUpperCase() === "SIM" ? "Sim" : d.menorIdade.toUpperCase() === "NÃO" ? "Não" : "Não informado");
  const reinternData = [
    { name: "Única", value: data.filter(d => !d.reinternacao).length },
    { name: "Reinternação", value: data.filter(d => d.reinternacao).length },
  ];

  const topPerm = [...data].sort((a, b) => b.permanenciaDias - a.permanenciaDias).slice(0, 10).map((d, i) => ({
    name: d.paciente.length > 22 ? d.paciente.slice(0, 22) + "…" : d.paciente,
    value: d.permanenciaDias,
    fill: GRADIENT_PAIRS[i % GRADIENT_PAIRS.length][0],
  }));

  // For horizontal bars with gradient fills
  const topCidadesColored = topCidades.map((d, i) => ({ ...d, fill: PALETTE[i % PALETTE.length] }));
  const topCidsColored = topCids.map((d, i) => ({ ...d, fill: PALETTE[i % PALETTE.length] }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Area chart for monthly evolution */}
      <ChartCard title="Evolução Mensal de Internações" subtitle="Tendência de novos registros ao longo do tempo">
        <ResponsiveContainer>
          <AreaChart data={entrMensal}>
            <defs>
              <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted) / 0.4)" }} />
            <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2.5} fill="url(#gradBlue)" name="Internações" dot={{ r: 4, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2, fill: "#fff" }} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Area chart for monthly discharges */}
      <ChartCard title="Evolução Mensal de Altas" subtitle="Volume de altas registradas por mês">
        <ResponsiveContainer>
          <AreaChart data={altasMensal}>
            <defs>
              <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted) / 0.4)" }} />
            <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2.5} fill="url(#gradGreen)" name="Altas" dot={{ r: 4, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2, fill: "#fff" }} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Grouped bars with rounded corners */}
      <ChartCard title="Entradas x Saídas por Mês" subtitle="Comparativo mensal de fluxo de pacientes">
        <ResponsiveContainer>
          <BarChart data={entSai} barGap={2} barCategoryGap="20%">
            <defs>
              <linearGradient id="gradEntradas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#60a5fa" />
              </linearGradient>
              <linearGradient id="gradSaidas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>

            <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted) / 0.4)" }} />
            <Bar dataKey="entradas" fill="url(#gradEntradas)" radius={[6, 6, 0, 0]} name="Entradas" />
            <Bar dataKey="saidas" fill="url(#gradSaidas)" radius={[6, 6, 0, 0]} name="Saídas" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Modern donut for tipo internação */}
      <ChartCard title="Tipo de Internação" subtitle="Distribuição por modalidade de internação">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={tipoInt} cx="50%" cy="50%" innerRadius={70} outerRadius={105} paddingAngle={4} dataKey="value" cornerRadius={6} stroke="none">
              {tipoInt.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
            </Pie>
            <Tooltip content={<PieTooltip />} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: axisStyle.fill }} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Horizontal gradient bars for tipo alta */}
      <ChartCard title="Tipo de Alta" subtitle="Distribuição das modalidades de alta">
        <ResponsiveContainer>
          <BarChart data={tipoAlta} layout="vertical" barCategoryGap="16%">
            <defs>
              <linearGradient id="gradPurple" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#a78bfa" />
              </linearGradient>
            </defs>

            <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis dataKey="name" type="category" width={150} tick={axisStyle} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted) / 0.4)" }} />
            <Bar dataKey="value" fill="url(#gradPurple)" radius={[0, 8, 8, 0]} name="Quantidade" barSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Colored horizontal bars for cidades */}
      <ChartCard title="Top 10 Cidades de Origem" subtitle="Cidades com maior volume de internações">
        <ResponsiveContainer>
          <BarChart data={topCidadesColored} layout="vertical" barCategoryGap="12%">
            <defs>
              <linearGradient id="gradCyan" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
            </defs>

            <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis dataKey="name" type="category" width={150} tick={axisStyle} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted) / 0.4)" }} />
            <Bar dataKey="value" fill="url(#gradCyan)" radius={[0, 8, 8, 0]} name="Internações" barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Colored horizontal bars for CIDs */}
      <ChartCard title="Top 10 CIDs" subtitle="Diagnósticos mais frequentes">
        <ResponsiveContainer>
          <BarChart data={topCidsColored} layout="vertical" barCategoryGap="12%">
            <defs>
              <linearGradient id="gradAmber" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
            </defs>

            <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis dataKey="name" type="category" width={200} tick={{ ...axisStyle, fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted) / 0.4)" }} />
            <Bar dataKey="value" fill="url(#gradAmber)" radius={[0, 8, 8, 0]} name="Registros" barSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Faixa permanência with gradient bars */}
      <ChartCard title="Faixa de Permanência" subtitle="Distribuição do tempo de internação">
        <ResponsiveContainer>
          <BarChart data={faixasSorted} barCategoryGap="20%">
            <defs>
              <linearGradient id="gradIndigo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#818cf8" />
              </linearGradient>
            </defs>
            <XAxis dataKey="name" tick={{ ...axisStyle, fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted) / 0.4)" }} />
            <Bar dataKey="value" fill="url(#gradIndigo)" radius={[8, 8, 0, 0]} name="Internações" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Menor de idade - modern donut */}
      <ChartCard title="Menor de Idade" subtitle="Proporção de pacientes menores">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={menorData} cx="50%" cy="50%" innerRadius={70} outerRadius={105} paddingAngle={4} dataKey="value" cornerRadius={6} stroke="none">
              {menorData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              <DonutCenter data={menorData} label="total" />
            </Pie>
            <Tooltip content={<PieTooltip />} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: axisStyle.fill }} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Reinternação - modern donut */}
      <ChartCard title="Reinternação" subtitle="Pacientes com múltiplas internações">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={reinternData} cx="50%" cy="50%" innerRadius={70} outerRadius={105} paddingAngle={4} dataKey="value" cornerRadius={6} stroke="none">
              <Cell fill="#3b82f6" />
              <Cell fill="#f59e0b" />
              <DonutCenter data={reinternData} label="pacientes" />
            </Pie>
            <Tooltip content={<PieTooltip />} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: axisStyle.fill }} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Ranking permanências — custom HTML list for full name visibility */}
      <ChartCard title="Ranking de Maiores Permanências" subtitle="Top 10 pacientes com mais dias internados" className="lg:col-span-2" heightClass="h-auto">
        <div className="space-y-1">
          {topPerm.map((item, idx) => {
            const max = topPerm[0]?.value || 1;
            const pct = Math.min(100, (item.value / max) * 100);
            const total = topPerm.length;
            // warm → cold: red(0°) → teal(180°)
            const hue = Math.round((idx / Math.max(total - 1, 1)) * 180);
            const clr = `hsl(${hue}, 72%, 55%)`;
            const clrEnd = `hsl(${Math.min(hue + 25, 200)}, 72%, 62%)`;
            const glow = `0 0 12px hsl(${hue} 72% 55% / 0.35)`;
            return (
              <div key={idx} className="rounded-xl px-4 py-3 transition-colors hover:bg-muted/40">
                {/* Row: position + name + badge */}
                <div className="flex items-start gap-3">
                  {/* Position badge */}
                  <span
                    className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-extrabold text-white shadow-sm mt-0.5"
                    style={{ background: `linear-gradient(135deg, ${clr}, ${clrEnd})`, boxShadow: glow }}
                  >
                    {idx + 1}
                  </span>
                  {/* Name — no truncation, full wrap allowed */}
                  <p className="flex-1 text-[13px] font-semibold text-foreground leading-snug pt-1 break-words">
                    {item.name}
                  </p>
                  {/* Days value */}
                  <span className="shrink-0 text-sm font-black tabular-nums pt-1" style={{ color: clr }}>
                    {item.value}
                    <span className="text-[10px] font-medium opacity-60 ml-1">dias</span>
                  </span>
                </div>
                {/* Progress bar */}
                <div className="mt-2 ml-10 h-1.5 rounded-full bg-muted/50 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${pct}%`, background: `linear-gradient(to right, ${clr}, ${clrEnd})`, boxShadow: glow }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </ChartCard>
    </div>
  );
}
