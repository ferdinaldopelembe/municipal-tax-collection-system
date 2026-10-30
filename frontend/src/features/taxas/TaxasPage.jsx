import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Pencil, Play, Pause } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { Table, THead, TH, TBody, TR, TD } from "../../components/ui/Table";
import Pagination from "../../components/ui/Pagination";
import { api, apiPatch } from "../../lib/api";
import { formatMT } from "../../lib/format";

const PAGE_SIZE = 8;

export default function TaxasPage() {
  const [rates, setRates] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [search, setSearch] = useState("");
  const [marketFilter, setMarketFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([api("/admin/rates"), api("/admin/markets")])
      .then(([rateItems, marketItems]) => {
        if (active) {
          setRates(rateItems);
          setMarkets(marketItems);
          setError("");
        }
      })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    const text = search.trim().toLowerCase();
    return rates.filter((rate) => (
      (!text || rate.product.toLowerCase().includes(text) || rate.market.toLowerCase().includes(text))
      && (!marketFilter || String(rate.marketId) === marketFilter)
      && (!periodFilter || rate.periodicity === periodFilter)
      && (!statusFilter || String(rate.active) === statusFilter)
    ));
  }, [rates, search, marketFilter, periodFilter, statusFilter]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const items = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function toggle(rate) {
    const active = !rate.active;
    try {
      const updated = await apiPatch(`/admin/rates/${rate.id}/status`, {
        status: active ? "Activa" : "Suspensa",
      });
      setRates((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-2xl font-semibold text-text">Taxas</h1><p className="mt-1 text-sm text-text-muted">{rates.length} taxas configuradas.</p></div>
        <Link to="/taxas/nova"><Button><Plus size={16} /> Nova taxa</Button></Link>
      </div>
      <Card className="flex flex-wrap items-center gap-3 p-4">
        <div className="relative w-full max-w-sm"><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Pesquisar por produto ou mercado…" className="h-10 w-full rounded-lg border border-border bg-white pl-9 pr-3 text-sm" /></div>
        <select value={marketFilter} onChange={(event) => { setMarketFilter(event.target.value); setPage(1); }} className="h-10 rounded-lg border border-border bg-white px-3 text-sm"><option value="">Todos os mercados</option>{markets.map((market) => <option key={market.id} value={market.id}>{market.name}</option>)}</select>
        <select value={periodFilter} onChange={(event) => { setPeriodFilter(event.target.value); setPage(1); }} className="h-10 rounded-lg border border-border bg-white px-3 text-sm"><option value="">Todas as periodicidades</option>{["Diária", "Semanal", "Mensal"].map((period) => <option key={period}>{period}</option>)}</select>
        <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }} className="h-10 rounded-lg border border-border bg-white px-3 text-sm"><option value="">Todos os estados</option><option value="true">Activa</option><option value="false">Suspensa</option></select>
      </Card>
      {error && <p role="alert" className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">{error}</p>}
      <Card className="overflow-hidden p-0">
        <Table>
          <THead><TH>Produto</TH><TH>Mercado</TH><TH>Periodicidade</TH><TH className="text-right">Valor</TH><TH className="text-right">Comerciantes</TH><TH>Estado</TH><TH className="text-right">Acções</TH></THead>
          <TBody>
            {items.map((rate) => <TR key={rate.id}>
              <TD className="font-medium">{rate.product}</TD><TD>{rate.market}</TD><TD>{rate.periodicity}</TD><TD className="text-right font-mono">{formatMT(Number(rate.amount))}</TD><TD className="text-right">{rate.merchants}</TD>
              <TD><Badge variant={rate.active ? "success" : "warning"}>{rate.active ? "Activa" : "Suspensa"}</Badge></TD>
              <TD className="text-right"><div className="flex justify-end gap-1"><Link to={`/taxas/nova?id=${rate.id}`} className="rounded-md p-1.5 text-text-muted hover:bg-slate-100" title="Editar taxa"><Pencil size={16} /></Link><button onClick={() => toggle(rate)} className="rounded-md p-1.5 text-text-muted hover:bg-slate-100" title={rate.active ? "Suspender" : "Activar"}>{rate.active ? <Pause size={16} /> : <Play size={16} />}</button></div></TD>
            </TR>)}
            {loading && <TR><TD className="py-8 text-center text-sm text-text-muted">A carregar taxas…</TD></TR>}
            {!loading && items.length === 0 && <TR><TD className="py-8 text-center text-sm text-text-muted">Nenhuma taxa encontrada.</TD></TR>}
          </TBody>
        </Table>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </Card>
    </div>
  );
}
