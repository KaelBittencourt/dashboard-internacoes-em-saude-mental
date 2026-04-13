import { ProcessedRecord } from "@/lib/types";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from "recharts";

const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16", "#f97316", "#6366f1"];

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

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="chart-container animate-fade-in">
      <h3 className="section-title mb-4">{title}</h3>
      <div className="h-72">{children}</div>
    </div>
  );
}

export default function ChartsSection({ data }: ChartsProps) {
  // a) Evolução mensal entradas
  const entrMensal = sortByMonth(countBy(data, (d) => d.mesEntrada));
  // b) Evolução mensal altas
  const altasMensal = sortByMonth(countBy(data.filter(d => d.statusInternacao === "Encerrada"), (d) => d.mesSaida));
  // c) Entradas x saídas
  const meses = new Set<string>();
  data.forEach(d => { if (d.mesEntrada !== "Não informado") meses.add(d.mesEntrada); if (d.mesSaida !== "Não informado") meses.add(d.mesSaida); });
  const entradasMap = new Map<string, number>();
  const saidasMap = new Map<string, number>();
  data.forEach(d => { if (d.mesEntrada !== "Não informado") entradasMap.set(d.mesEntrada, (entradasMap.get(d.mesEntrada) || 0) + 1); });
  data.filter(d => d.statusInternacao === "Encerrada").forEach(d => { if (d.mesSaida !== "Não informado") saidasMap.set(d.mesSaida, (saidasMap.get(d.mesSaida) || 0) + 1); });
  const entSai = sortByMonth([...meses].map(m => ({ name: m, value: 0 }))).map(m => ({
    name: m.name, entradas: entradasMap.get(m.name) || 0, saidas: saidasMap.get(m.name) || 0
  }));
  // d) Tipo internação
  const tipoInt = countBy(data, d => d.tipoInternacao);
  // e) Tipo alta
  const tipoAlta = countBy(data.filter(d => d.statusInternacao === "Encerrada"), d => d.tipoAlta);
  // f) Top 10 cidades
  const topCidades = countBy(data, d => d.cidadeFinal).slice(0, 10);
  // g) Top 10 CIDs
  const topCids = countBy(data, d => d.cid).slice(0, 10);
  // h) Faixa permanência
  const faixas = countBy(data, d => d.faixaPermanencia);
  const faixaOrder = ["0 a 7 dias", "8 a 15 dias", "16 a 30 dias", "31 a 60 dias", "Acima de 60 dias"];
  const faixasSorted = faixaOrder.map(f => faixas.find(x => x.name === f) || { name: f, value: 0 });
  // i) Menor de idade
  const menorData = countBy(data, d => d.menorIdade.toUpperCase() === "SIM" ? "Sim" : d.menorIdade.toUpperCase() === "NÃO" ? "Não" : "Não informado");
  // j) Reinternação
  const reinternData = [
    { name: "1 internação", value: data.filter(d => !d.reinternacao).length },
    { name: "2+ internações", value: data.filter(d => d.reinternacao).length },
  ];
  // k) Maiores permanências
  const topPerm = [...data].sort((a, b) => b.permanenciaDias - a.permanenciaDias).slice(0, 10).map(d => ({
    name: d.paciente.length > 20 ? d.paciente.slice(0, 20) + "…" : d.paciente,
    value: d.permanenciaDias,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <ChartCard title="Evolução Mensal de Internações">
        <ResponsiveContainer>
          <LineChart data={entrMensal}><CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} name="Internações" /></LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Evolução Mensal de Altas">
        <ResponsiveContainer>
          <BarChart data={altasMensal}><CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="value" fill="#16a34a" radius={[4,4,0,0]} name="Altas" /></BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Entradas x Saídas por Mês">
        <ResponsiveContainer>
          <BarChart data={entSai}><CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="entradas" fill="#2563eb" radius={[4,4,0,0]} name="Entradas" /><Bar dataKey="saidas" fill="#16a34a" radius={[4,4,0,0]} name="Saídas" /></BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Distribuição por Tipo de Internação">
        <ResponsiveContainer>
          <PieChart><Pie data={tipoInt} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} labelLine={false} fontSize={11}>{tipoInt.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Distribuição por Tipo de Alta">
        <ResponsiveContainer>
          <BarChart data={tipoAlta} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" /><XAxis type="number" tick={{ fontSize: 11 }} /><YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="value" fill="#8b5cf6" radius={[0,4,4,0]} name="Qtd" /></BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Top 10 Cidades de Origem">
        <ResponsiveContainer>
          <BarChart data={topCidades} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" /><XAxis type="number" tick={{ fontSize: 11 }} /><YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="value" fill="#06b6d4" radius={[0,4,4,0]} name="Qtd" /></BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Top 10 CIDs">
        <ResponsiveContainer>
          <BarChart data={topCids} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" /><XAxis type="number" tick={{ fontSize: 11 }} /><YAxis dataKey="name" type="category" width={200} tick={{ fontSize: 10 }} /><Tooltip /><Bar dataKey="value" fill="#f59e0b" radius={[0,4,4,0]} name="Qtd" /></BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Distribuição por Faixa de Permanência">
        <ResponsiveContainer>
          <BarChart data={faixasSorted}><CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" /><XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="value" fill="#2563eb" radius={[4,4,0,0]} name="Qtd" /></BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Menor de Idade">
        <ResponsiveContainer>
          <PieChart><Pie data={menorData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} fontSize={12}>{menorData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Reinternação">
        <ResponsiveContainer>
          <PieChart><Pie data={reinternData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} fontSize={12}>{reinternData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Ranking de Maiores Permanências">
        <ResponsiveContainer>
          <BarChart data={topPerm} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" /><XAxis type="number" tick={{ fontSize: 11 }} /><YAxis dataKey="name" type="category" width={160} tick={{ fontSize: 10 }} /><Tooltip /><Bar dataKey="value" fill="#ef4444" radius={[0,4,4,0]} name="Dias" /></BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
