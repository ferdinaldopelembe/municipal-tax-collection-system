import { useMemo, useState } from "react";
import {
  Download,
  Calendar,
  TrendingUp,
  Users,
  Receipt,
  Percent,
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
import Pagination from "../../components/ui/Pagination";
import {
  MERCADOS,
  TIPOS_RELATORIO,
  RECEITA_POR_MERCADO,
  EVOLUCAO_DIARIA,
  TRANSACOES_RELATORIO,
} from "../../data/mock";
import { formatMT } from "../../utils/format";
import { exportarPdf } from "../../utils/exportPdf";

const PAGE_SIZE = 5;

const estadoVariants = {
  Pago: "success",
  "Em dívida": "warning",
  Pendente: "info",
};

export default function RelatoriosPage() {
  const [dataInicio, setDataInicio] = useState("2026-06-01");
  const [dataFim, setDataFim] = useState("2026-06-14");
  const [mercado, setMercado] = useState("");
  const [tipo, setTipo] = useState("Receita por mercado");
  const [menuExport, setMenuExport] = useState(false);
  const [page, setPage] = useState(1);

  const receitaFiltrada = useMemo(() => {
    return RECEITA_POR_MERCADO.filter(
      (r) => !mercado || r.mercado === mercado
    );
  }, [mercado]);

  const kpis = useMemo(() => {
    const receita = receitaFiltrada.reduce((s, r) => s + r.receita, 0);
    const transacoes = receitaFiltrada.reduce((s, r) => s + r.transacoes, 0);
    const comerciantes = receitaFiltrada.reduce(
      (s, r) => s + r.comerciantes,
      0
    );
    const taxaCobranca =
      transacoes > 0
        ? Math.round((receita / (transacoes * 60)) * 100)
        : 0;
    return { receita, transacoes, comerciantes, taxaCobranca };
  }, [receitaFiltrada]);

  const barData = receitaFiltrada.map((r) => ({
    label: r.mercado.replace("Mercado do ", "").replace("Mercado da ", ""),
    valor: r.receita,
  }));

  const transacoesFiltradas = useMemo(() => {
    return TRANSACOES_RELATORIO.filter(
      (t) => !mercado || t.mercado === mercado
    );
  }, [mercado]);

  const totalPages = Math.max(
    1,
    Math.ceil(transacoesFiltradas.length / PAGE_SIZE)
  );
  const pageItems = transacoesFiltradas.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  function handleExport(formato) {
  setMenuExport(false);

  if (formato === "csv") {
    const linhas = [
      ["Mercado", "Receita (MT)", "Transacções", "Comerciantes"],
      ...receitaFiltrada.map((r) => [
        r.mercado,
        r.receita.toFixed(2),
        r.transacoes,
        r.comerciantes,
      ]),
    ];
    const csv = linhas.map((l) => l.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio_${dataInicio}_a_${dataFim}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  // PDF via janela de impressão nativa
  const fmtData = (iso) => {
    if (!iso) return "—";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  };

  exportarPdf({
    titulo: tipo,
    subtitulo: `Período: ${fmtData(dataInicio)} a ${fmtData(dataFim)} · Mercado: ${
      mercado || "Todos"
    }`,
    resumo: [
      { label: "Receita total", value: formatMT(kpis.receita) },
      {
        label: "Transacções",
        value: kpis.transacoes.toLocaleString("pt-MZ"),
      },
      {
        label: "Comerciantes activos",
        value: kpis.comerciantes.toLocaleString("pt-MZ"),
      },
      { label: "Taxa de cobrança", value: `${kpis.taxaCobranca}%` },
    ],
    tabelas: [
      {
        title: "Resumo por mercado",
        columns: [
          "Mercado",
          "Receita (MT)",
          "Transacções",
          "Comerciantes",
          "Média / transacção",
        ],
        rows: [
          ...receitaFiltrada.map((r) => [
            r.mercado,
            r.receita.toLocaleString("pt-MZ", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
            r.transacoes.toLocaleString("pt-MZ"),
            r.comerciantes,
            (r.receita / (r.transacoes || 1)).toLocaleString("pt-MZ", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
          ]),
          [
            "Total",
            receitaFiltrada
              .reduce((s, r) => s + r.receita, 0)
              .toLocaleString("pt-MZ", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }),
            receitaFiltrada
              .reduce((s, r) => s + r.transacoes, 0)
              .toLocaleString("pt-MZ"),
            receitaFiltrada.reduce((s, r) => s + r.comerciantes, 0),
            "—",
          ],
        ],
      },
      {
        title: "Transacções detalhadas",
        columns: ["ID", "Data", "Comerciante", "Mercado", "Tipo", "Valor (MT)", "Estado"],
        rows: transacoesFiltradas.map((t) => [
          t.id,
          t.data,
          t.comerciante,
          t.mercado,
          t.tipo,
          t.valor.toLocaleString("pt-MZ", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          t.estado,
        ]),
      },
    ],
    rodape: "Sistema de Gestão de Mercados Informais · Documento gerado automaticamente",
  });
}

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text">Relatórios</h1>
          <p className="mt-1 text-sm text-text-muted">
            Analise a receita, cobrança e evolução das taxas nos mercados.
          </p>
        </div>

        <div className="relative">
          <Button onClick={() => setMenuExport((v) => !v)}>
            <Download size={16} />
            Exportar
          </Button>
          {menuExport && (
            <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-lg border border-border bg-white shadow-lg">
              <button
                onClick={() => handleExport("csv")}
                className="block w-full px-3 py-2 text-left text-sm text-text hover:bg-slate-50"
              >
                Exportar CSV
              </button>
              <button
                onClick={() => handleExport("pdf")}
                className="block w-full px-3 py-2 text-left text-sm text-text hover:bg-slate-50"
              >
                Exportar PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filtros */}
      <Card className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-text-muted">
            Data de início
          </label>
          <div className="relative">
            <Calendar
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-white pl-9 pr-2 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-text-muted">
            Data de fim
          </label>
          <div className="relative">
            <Calendar
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-white pl-9 pr-2 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-text-muted">
            Mercado
          </label>
          <select
            value={mercado}
            onChange={(e) => {
              setMercado(e.target.value);
              setPage(1);
            }}
            className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Todos os mercados</option>
            {MERCADOS.map((m) => (
              <option key={m.id} value={m.nome}>
                {m.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-text-muted">
            Tipo de relatório
          </label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {TIPOS_RELATORIO.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={<TrendingUp size={18} />}
          label="Receita total"
          value={formatMT(kpis.receita)}
          hint="No período seleccionado"
          accent="primary"
        />
        <KpiCard
          icon={<Receipt size={18} />}
          label="Transacções"
          value={kpis.transacoes.toLocaleString("pt-MZ")}
          hint="Total processado"
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
                Evolução da receita diária
              </h2>
              <p className="text-xs text-text-muted">
                Últimos 14 dias · valores em MT
              </p>
            </div>
            <Badge variant="success">+12,4% vs. período anterior</Badge>
          </div>
          <LineChart data={EVOLUCAO_DIARIA} height={240} />
        </Card>

        <Card className="p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-text">
              Receita por mercado
            </h2>
            <p className="text-xs text-text-muted">Top 5 mercados</p>
          </div>
          <BarChart data={barData} height={240} />
        </Card>
      </div>

      {/* Tabela resumo por mercado */}
      <Card className="overflow-hidden p-0">
        <div className="border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold text-text">
            Resumo por mercado
          </h2>
        </div>
        <Table>
          <THead>
            <TH>Mercado</TH>
            <TH className="text-right">Receita</TH>
            <TH className="text-right">Transacções</TH>
            <TH className="text-right">Comerciantes</TH>
            <TH className="text-right">Média / transacção</TH>
          </THead>
          <TBody>
            {receitaFiltrada.map((r) => (
              <TR key={r.mercado}>
                <TD className="font-medium text-text">{r.mercado}</TD>
                <TD className="text-right font-mono text-text">
                  {formatMT(r.receita)}
                </TD>
                <TD className="text-right text-text-muted">
                  {r.transacoes.toLocaleString("pt-MZ")}
                </TD>
                <TD className="text-right text-text-muted">
                  {r.comerciantes}
                </TD>
                <TD className="text-right text-text-muted">
                  {formatMT(r.transacoes ? r.receita / r.transacoes : 0)}
                </TD>
              </TR>
            ))}
            {receitaFiltrada.length > 0 && (
              <TR>
                <TD className="font-semibold text-text">Total</TD>
                <TD className="text-right font-semibold text-text">
                  {formatMT(
                    receitaFiltrada.reduce((s, r) => s + r.receita, 0)
                  )}
                </TD>
                <TD className="text-right font-semibold text-text">
                  {receitaFiltrada
                    .reduce((s, r) => s + r.transacoes, 0)
                    .toLocaleString("pt-MZ")}
                </TD>
                <TD className="text-right font-semibold text-text">
                  {receitaFiltrada.reduce((s, r) => s + r.comerciantes, 0)}
                </TD>
                <TD className="text-right font-semibold text-text">—</TD>
              </TR>
            )}
            {receitaFiltrada.length === 0 && (
              <TR>
                <TD className="py-8 text-center text-sm text-text-muted">
                  Sem dados para o filtro seleccionado.
                </TD>
              </TR>
            )}
          </TBody>
        </Table>
      </Card>

      {/* Tabela detalhada */}
      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold text-text">
            Transacções detalhadas
          </h2>
          <span className="text-xs text-text-muted">
            {transacoesFiltradas.length} registos
          </span>
        </div>
        <Table>
          <THead>
            <TH>ID</TH>
            <TH>Data</TH>
            <TH>Comerciante</TH>
            <TH>Mercado</TH>
            <TH>Tipo</TH>
            <TH className="text-right">Valor</TH>
            <TH>Estado</TH>
          </THead>
          <TBody>
            {pageItems.map((t) => (
              <TR key={t.id}>
                <TD className="font-mono text-xs text-text-muted">{t.id}</TD>
                <TD className="text-text-muted">{t.data}</TD>
                <TD className="font-medium text-text">{t.comerciante}</TD>
                <TD className="text-text-muted">{t.mercado}</TD>
                <TD className="text-text-muted">{t.tipo}</TD>
                <TD className="text-right font-mono text-text">
                  {formatMT(t.valor)}
                </TD>
                <TD>
                  <Badge variant={estadoVariants[t.estado]}>{t.estado}</Badge>
                </TD>
              </TR>
            ))}
            {pageItems.length === 0 && (
              <TR>
                <TD className="py-8 text-center text-sm text-text-muted">
                  Sem transacções para o filtro seleccionado.
                </TD>
              </TR>
            )}
          </TBody>
        </Table>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </Card>
    </div>
  );
}

/* ---------- KPI Card interno ---------- */

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
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold text-text">{value}</p>
          <p className="mt-1 text-xs text-text-muted">{hint}</p>
        </div>
        <div className={`rounded-lg p-2 ${accents[accent]}`}>{icon}</div>
      </div>
    </Card>
  );
}