import { useEffect, useMemo, useState } from "react";
import { Calendar, Download, Receipt, TrendingUp, Users } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import BarChart from "../../components/ui/BarChart";
import LineChart from "../../components/ui/LineChart";
import { Table, THead, TH, TBody, TR, TD } from "../../components/ui/Table";
import Pagination from "../../components/ui/Pagination";
import { api } from "../../lib/api";
import { formatMT } from "../../utils/format";
import { exportarPdf } from "../../utils/exportPdf";
import { mapApiPayment } from "../pagamentos/paymentView";

const PAGE_SIZE = 8;
const today = new Date();
const defaultEnd = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
const defaultStart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;

function quoteCsv(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

export default function RelatoriosPage() {
  const [from, setFrom] = useState(defaultStart);
  const [to, setTo] = useState(defaultEnd);
  const [marketId, setMarketId] = useState("");
  const [markets, setMarkets] = useState([]);
  const [report, setReport] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const invalidDateRange = from && to && from > to;

  useEffect(() => {
    api("/admin/markets").then(setMarkets).catch((requestError) => setError(requestError.message));
  }, []);

  useEffect(() => {
    if (invalidDateRange) return;
    let active = true;
    const params = new URLSearchParams({ from, to });
    if (marketId) params.set("marketId", marketId);
    api(`/admin/reports?${params}`)
      .then((result) => { if (active) { setReport(result); setError(""); setPage(1); } })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [from, to, marketId, invalidDateRange]);

  const payments = useMemo(() => (report?.payments || []).map(mapApiPayment), [report]);
  const items = payments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(payments.length / PAGE_SIZE));
  const revenueByMarket = (report?.markets || []).map((item) => ({
    label: item.market.replace(/^Mercado (do|da|de) /, ""),
    valor: Number(item.revenue),
  }));
  const daily = (report?.daily || []).map((item) => ({
    dia: new Date(`${item.date}T00:00:00`).toLocaleDateString("pt-MZ", { day: "2-digit", month: "2-digit" }),
    valor: Number(item.revenue),
  }));
  const selectedMarket = markets.find((market) => market.id === Number(marketId));

  function exportCsv() {
    const rows = [
      ["Referência", "Transacção", "Data", "Comerciante", "Mercado", "Banca", "Produto", "Período", "Método", "Valor (MT)"],
      ...payments.map((payment) => [
        payment.senha, payment.referencia, payment.paidAt, payment.comerciante,
        payment.mercado, payment.banca, payment.produto, payment.periodo,
        payment.metodo, payment.valor.toFixed(2),
      ]),
    ];
    const csv = rows.map((row) => row.map(quoteCsv).join(";")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `pagamentos_${from}_${to}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function exportPdf() {
    exportarPdf({
      titulo: "Relatório de pagamentos",
      subtitulo: `Período: ${from} a ${to} · Mercado: ${selectedMarket?.name || "Todos"}`,
      resumo: [
        { label: "Receita total", value: formatMT(Number(report?.revenue || 0)) },
        { label: "Pagamentos", value: String(report?.transactions || 0) },
        { label: "Comerciantes pagantes", value: String(report?.merchants || 0) },
      ],
      tabelas: [{
        title: "Pagamentos confirmados",
        columns: ["Referência", "Data", "Comerciante", "Mercado", "Valor (MT)"],
        rows: payments.map((payment) => [
          payment.senha, payment.data, payment.comerciante,
          payment.mercado, formatMT(payment.valor),
        ]),
      }],
      rodape: "Cobrança Beira · Relatório gerado a partir dos pagamentos registados",
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-2xl font-semibold">Relatórios</h1><p className="mt-1 text-sm text-text-muted">Receita e pagamentos confirmados no período seleccionado.</p></div><div className="flex gap-2"><Button variant="secondary" onClick={exportCsv} disabled={!report?.payments?.length}><Download size={16} /> CSV</Button><Button onClick={exportPdf} disabled={!report?.payments?.length}><Download size={16} /> PDF</Button></div></div>
      <Card className="grid gap-3 p-4 sm:grid-cols-3">
        <label className="text-xs font-medium text-text-muted">Data de início<div className="relative mt-1"><Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2" /><input type="date" value={from} max={to} onChange={(event) => { setLoading(true); setFrom(event.target.value); }} className="h-10 w-full rounded-lg border border-border pl-9 pr-2 text-sm text-text" /></div></label>
        <label className="text-xs font-medium text-text-muted">Data de fim<div className="relative mt-1"><Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2" /><input type="date" value={to} min={from} max={defaultEnd} onChange={(event) => { setLoading(true); setTo(event.target.value); }} className="h-10 w-full rounded-lg border border-border pl-9 pr-2 text-sm text-text" /></div></label>
        <label className="text-xs font-medium text-text-muted">Mercado<select value={marketId} onChange={(event) => { setLoading(true); setMarketId(event.target.value); }} className="mt-1 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-text"><option value="">Todos os mercados</option>{markets.map((market) => <option key={market.id} value={market.id}>{market.name}</option>)}</select></label>
      </Card>
      {(invalidDateRange || error) && <p role="alert" className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">{invalidDateRange ? "A data inicial não pode ser posterior à data final." : error}</p>}
      <div className="grid gap-4 sm:grid-cols-3"><Kpi icon={<TrendingUp size={18} />} label="Receita total" value={formatMT(Number(report?.revenue || 0))} /><Kpi icon={<Receipt size={18} />} label="Pagamentos" value={Number(report?.transactions || 0).toLocaleString("pt-MZ")} /><Kpi icon={<Users size={18} />} label="Comerciantes pagantes" value={Number(report?.merchants || 0).toLocaleString("pt-MZ")} /></div>
      <div className="grid gap-4 xl:grid-cols-3"><Card className="p-5 xl:col-span-2"><h2 className="text-sm font-semibold">Evolução da receita diária</h2>{daily.length ? <LineChart data={daily} height={240} /> : <Empty loading={loading} />}</Card><Card className="p-5"><h2 className="text-sm font-semibold">Receita por mercado</h2>{revenueByMarket.length ? <BarChart data={revenueByMarket} height={240} /> : <Empty loading={loading} />}</Card></div>
      <Card className="overflow-hidden p-0"><div className="border-b border-border px-5 py-3"><h2 className="text-sm font-semibold">Resumo por mercado</h2></div><Table><THead><TH>Mercado</TH><TH className="text-right">Receita</TH><TH className="text-right">Pagamentos</TH><TH className="text-right">Comerciantes pagantes</TH><TH className="text-right">Média / pagamento</TH></THead><TBody>
        {(report?.markets || []).map((item) => <TR key={item.marketId}><TD className="font-medium">{item.market}</TD><TD className="text-right">{formatMT(Number(item.revenue))}</TD><TD className="text-right">{item.transactions}</TD><TD className="text-right">{item.merchants}</TD><TD className="text-right">{formatMT(item.transactions ? Number(item.revenue) / item.transactions : 0)}</TD></TR>)}
        {!loading && !report?.markets?.length && <TR><TD className="py-8 text-center text-sm text-text-muted">Sem pagamentos no período seleccionado.</TD></TR>}
      </TBody></Table></Card>
      <Card className="overflow-hidden p-0"><div className="border-b border-border px-5 py-3"><h2 className="text-sm font-semibold">Pagamentos detalhados</h2></div><Table><THead><TH>Referência</TH><TH>Data</TH><TH>Comerciante</TH><TH>Mercado</TH><TH>Produto</TH><TH>Método</TH><TH className="text-right">Valor</TH></THead><TBody>
        {items.map((payment) => <TR key={payment.id}><TD className="font-mono text-xs">{payment.senha}</TD><TD>{payment.data}</TD><TD>{payment.comerciante}</TD><TD>{payment.mercado}</TD><TD>{payment.produto}</TD><TD>{payment.metodo}</TD><TD className="text-right">{formatMT(payment.valor)}</TD></TR>)}
        {loading && <TR><TD className="py-8 text-center text-sm text-text-muted">A carregar relatório…</TD></TR>}
        {!loading && items.length === 0 && <TR><TD className="py-8 text-center text-sm text-text-muted">Sem pagamentos no período seleccionado.</TD></TR>}
      </TBody></Table><Pagination page={page} totalPages={totalPages} onChange={setPage} /></Card>
    </div>
  );
}

function Kpi({ icon, label, value }) {
  return <Card className="flex items-center gap-4 p-5"><div className="rounded-lg bg-primary/10 p-2 text-primary">{icon}</div><div><p className="text-xs uppercase text-text-muted">{label}</p><p className="mt-1 text-xl font-semibold">{value}</p></div></Card>;
}

function Empty({ loading }) {
  return <div className="flex h-[240px] items-center justify-center text-sm text-text-muted">{loading ? "A carregar dados…" : "Sem pagamentos no período."}</div>;
}
