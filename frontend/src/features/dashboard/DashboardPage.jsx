import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  Receipt,
  Users,
  Percent,
  ArrowRight,
  Calendar,
} from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import BarChart from "../../components/ui/BarChart";
import LineChart from "../../components/ui/LineChart";
import {
  Table,
  THead,
  TH,
  TBody,
  TR,
  TD,
} from "../../components/ui/Table";
import {
  MERCADOS,
  DASHBOARD_TRANSACOES,
  COMERCIANTES_RECENTES,
} from "../../data/mock";
import { formatMT } from "../../utils/format";

const PERIODOS = [
  { value: "hoje", label: "Hoje", dias: 1 },
  { value: "7d", label: "Últimos 7 dias", dias: 7 },
  { value: "30d", label: "Últimos 30 dias", dias: 30 },
];

const estadoVariants = {
  Regular: "success",
  "Em dívida": "warning",
  Bloqueado: "danger",
};

export default function DashboardPage() {
  const [mercado, setMercado] = useState("");
  const [periodo, setPeriodo] = useState("7d");

  // --- 1. Filtragem central dos dados ---
  const dadosFiltrados = useMemo(() => {
    const dias = PERIODOS.find((p) => p.value === periodo)?.dias ?? 7;

    // Data de corte = max(data) - (dias - 1)
    const todasDatas = Array.from(
      new Set(DASHBOARD_TRANSACOES.map((t) => t.data))
    ).sort();
    const dataMax = todasDatas[todasDatas.length - 1];
    const corte = new Date(dataMax + "T00:00:00");
    corte.setDate(corte.getDate() - (dias - 1));
    const corteIso = corte.toISOString().slice(0, 10);

    return DASHBOARD_TRANSACOES.filter((t) => {
      const noPeriodo = t.data >= corteIso;
      const noMercado = !mercado || t.mercado === mercado;
      return noPeriodo && noMercado;
    });
  }, [mercado, periodo]);

  // --- 2. KPIs derivados ---
  const kpis = useMemo(() => {
    const receita = dadosFiltrados.reduce((s, t) => s + t.receita, 0);
    const transacoes = dadosFiltrados.reduce((s, t) => s + t.transacoes, 0);
    const comerciantes = dadosFiltrados.reduce(
      (s, t) => s + t.comerciantes,
      0
    );
    const mediaPorTransacao = transacoes ? receita / transacoes : 0;
    const taxaCobranca = Math.min(
      100,
      Math.round((receita / (transacoes * 60 || 1)) * 100)
    );
    return { receita, transacoes, comerciantes, mediaPorTransacao, taxaCobranca };
  }, [dadosFiltrados]);

  // --- 3. Série diária para o gráfico de linha ---
  const serieDiaria = useMemo(() => {
    const mapa = new Map();
    dadosFiltrados.forEach((t) => {
      mapa.set(t.data, (mapa.get(t.data) || 0) + t.receita);
    });
    const datas = [...mapa.keys()].sort();
    return datas.map((iso) => {
      const [y, m, d] = iso.split("-");
      return {
        dia: `${d}/${m}`,
        valor: Math.round(mapa.get(iso) * 100) / 100,
      };
    });
  }, [dadosFiltrados]);

  // --- 4. Receita por mercado para o gráfico de barras ---
  const seriePorMercado = useMemo(() => {
    const mapa = new Map();
    dadosFiltrados.forEach((t) => {
      mapa.set(t.mercado, (mapa.get(t.mercado) || 0) + t.receita);
    });
    return [...mapa.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([nome, valor]) => ({
        label: nome.replace("Mercado do ", "").replace("Mercado da ", ""),
        valor: Math.round(valor * 100) / 100,
      }));
  }, [dadosFiltrados]);

  // --- 5. Top comerciantes recentes (respeitando filtro de mercado) ---
  const comerciantesFiltrados = useMemo(
    () =>
      COMERCIANTES_RECENTES.filter(
        (c) => !mercado || c.mercado === mercado
      ).slice(0, 5),
    [mercado]
  );

  // --- 6. Comparação com período anterior (para o badge de tendência) ---
  const tendencia = useMemo(() => {
    const dias = PERIODOS.find((p) => p.value === periodo)?.dias ?? 7;
    const todasDatas = Array.from(
      new Set(DASHBOARD_TRANSACOES.map((t) => t.data))
    ).sort();
    const dataMax = todasDatas[todasDatas.length - 1];

    const fimAtual = new Date(dataMax + "T00:00:00");
    const inicioAtual = new Date(fimAtual);
    inicioAtual.setDate(inicioAtual.getDate() - (dias - 1));

    const fimAnterior = new Date(inicioAtual);
    fimAnterior.setDate(fimAnterior.getDate() - 1);
    const inicioAnterior = new Date(fimAnterior);
    inicioAnterior.setDate(inicioAnterior.getDate() - (dias - 1));

    const iso = (d) => d.toISOString().slice(0, 10);
    const soma = (de, ate) =>
      DASHBOARD_TRANSACOES.filter(
        (t) =>
          t.data >= de &&
          t.data <= ate &&
          (!mercado || t.mercado === mercado)
      ).reduce((s, t) => s + t.receita, 0);

    const atual = soma(iso(inicioAtual), iso(fimAtual));
    const anterior = soma(iso(inicioAnterior), iso(fimAnterior));
    const delta = anterior ? ((atual - anterior) / anterior) * 100 : 0;
    return Math.round(delta * 10) / 10;
  }, [mercado, periodo]);

  return (
    <div className="space-y-6">
      {/* Cabeçalho + filtros */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text">Dashboard</h1>
          <p className="mt-1 text-sm text-text-muted">
            Visão geral em tempo real dos mercados informais.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={mercado}
            onChange={(e) => setMercado(e.target.value)}
            className="h-10 rounded-lg border border-border bg-white px-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Todos os mercados</option>
            {MERCADOS.map((m) => (
              <option key={m.id} value={m.nome}>
                {m.nome}
              </option>
            ))}
          </select>

          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="h-10 rounded-lg border border-border bg-white px-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {PERIODOS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={<TrendingUp size={18} />}
          label="Receita total"
          value={formatMT(kpis.receita)}
          hint={
            <span
              className={
                tendencia >= 0 ? "text-emerald-600" : "text-rose-600"
              }
            >
              {tendencia >= 0 ? "▲" : "▼"} {Math.abs(tendencia)}% vs. período anterior
            </span>
          }
          accent="primary"
        />
        <KpiCard
          icon={<Receipt size={18} />}
          label="Transacções"
          value={kpis.transacoes.toLocaleString("pt-MZ")}
          hint={`Média ${formatMT(kpis.mediaPorTransacao)} por transacção`}
          accent="info"
        />
        <KpiCard
          icon={<Users size={18} />}
          label="Comerciantes activos"
          value={kpis.comerciantes.toLocaleString("pt-MZ")}
          hint="Com pelo menos uma cobrança"
          accent="success"
        />
        <KpiCard
          icon={<Percent size={18} />}
          label="Taxa de cobrança"
          value={`${kpis.taxaCobranca}%`}
          hint="Receita vs. esperado"
          accent="warning"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-text">
                Evolução da receita
              </h2>
              <p className="text-xs text-text-muted">
                {serieDiaria.length} dia(s) ·{" "}
                {mercado || "todos os mercados"}
              </p>
            </div>
            <Badge variant={tendencia >= 0 ? "success" : "danger"}>
              {tendencia >= 0 ? "+" : ""}
              {tendencia}%
            </Badge>
          </div>
          {serieDiaria.length > 0 ? (
            <LineChart data={serieDiaria} height={240} />
          ) : (
            <EmptyChart />
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-text">
              Receita por mercado
            </h2>
            <p className="text-xs text-text-muted">
              {seriePorMercado.length} mercado(s)
            </p>
          </div>
          {seriePorMercado.length > 0 ? (
            <BarChart data={seriePorMercado} height={240} />
          ) : (
            <EmptyChart />
          )}
        </Card>
      </div>

      {/* Comerciantes recentes */}
      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div>
            <h2 className="text-sm font-semibold text-text">
              Comerciantes recentes
            </h2>
            <p className="text-xs text-text-muted">
              Últimos registos{" "}
              {mercado ? `em ${mercado}` : "em todos os mercados"}
            </p>
          </div>
          <Link
            to="/comerciantes"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Ver todos <ArrowRight size={14} />
          </Link>
        </div>

        <Table>
          <THead>
            <TH>Nome</TH>
            <TH>Mercado</TH>
            <TH>Produto</TH>
            <TH>Estado</TH>
            <TH className="text-right">Registado em</TH>
          </THead>
          <TBody>
            {comerciantesFiltrados.map((c) => (
              <TR key={c.id}>
                <TD className="font-medium text-text">{c.nome}</TD>
                <TD className="text-text-muted">{c.mercado}</TD>
                <TD className="text-text-muted">{c.produto}</TD>
                <TD>
                  <Badge variant={estadoVariants[c.estado]}>{c.estado}</Badge>
                </TD>
                <TD className="text-right text-text-muted">
                  {formatarData(c.criadoEm)}
                </TD>
              </TR>
            ))}
            {comerciantesFiltrados.length === 0 && (
              <TR>
                <TD className="py-8 text-center text-sm text-text-muted">
                  Sem comerciantes para o mercado seleccionado.
                </TD>
              </TR>
            )}
          </TBody>
        </Table>
      </Card>
    </div>
  );
}

/* ---------- Subcomponentes ---------- */

function KpiCard({ icon, label, value, hint, accent = "primary" }) {
  const accents = {
    primary: "bg-primary/10 text-primary",
    info: "bg-sky-100 text-sky-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
  };
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
            {label}
          </p>
          <p className="mt-2 truncate text-2xl font-semibold text-text">
            {value}
          </p>
          <p className="mt-1 text-xs text-text-muted">{hint}</p>
        </div>
        <div className={`shrink-0 rounded-lg p-2 ${accents[accent]}`}>{icon}</div>
      </div>
    </Card>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-[240px] items-center justify-center rounded-lg border border-dashed border-border bg-slate-50/50 text-sm text-text-muted">
      Sem dados para o filtro seleccionado
    </div>
  );
}

function formatarData(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}