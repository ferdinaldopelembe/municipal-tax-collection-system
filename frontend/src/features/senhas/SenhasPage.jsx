import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Printer } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { Table, THead, TH, TBody, TR, TD } from "../../components/ui/Table";
import Pagination from "../../components/ui/Pagination";
import { api } from "../../lib/api";
import { exportReceiptPdf } from "../../utils/exportReceiptPdf";
import { formatMT } from "../../lib/format";

const PAGE_SIZE = 8;

function toReceipt(ticket) {
  const date = ticket.dataEmissao ? new Date(ticket.dataEmissao).toLocaleString("pt-MZ") : "—";
  const period = ticket.periodoInicio === ticket.periodoFim
    ? new Date(`${ticket.periodoInicio}T00:00:00`).toLocaleDateString("pt-MZ")
    : `${ticket.periodoInicio} – ${ticket.periodoFim}`;
  return {
    senha: ticket.numero,
    referencia: ticket.numero,
    comerciante: ticket.comerciante,
    mercado: ticket.mercado,
    banca: ticket.banca,
    tipo: ticket.tipoTaxa,
    periodo: period,
    metodo: ticket.metodoPagamento,
    valor: Number(ticket.valor),
    data: date,
  };
}

export default function SenhasPage() {
  const [tickets, setTickets] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [search, setSearch] = useState("");
  const [marketFilter, setMarketFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([api("/admin/tickets"), api("/admin/markets")])
      .then(([ticketItems, marketItems]) => {
        if (!active) return;
        setTickets(ticketItems);
        setMarkets(marketItems);
      })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    const text = search.trim().toLowerCase();
    return tickets.filter((ticket) => (
      (!text || ticket.numero.toLowerCase().includes(text)
        || ticket.comerciante.toLowerCase().includes(text)
        || (ticket.nuit || "").includes(text))
      && (!marketFilter || ticket.mercado === marketFilter)
    ));
  }, [tickets, search, marketFilter]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const items = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const today = new Date().toISOString().slice(0, 10);
  const receivedToday = tickets.filter((ticket) => ticket.dataEmissao?.slice(0, 10) === today)
    .reduce((sum, ticket) => sum + Number(ticket.valor), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-2xl font-semibold">Recibos</h1><p className="mt-1 text-sm text-text-muted">Recibos emitidos a partir de pagamentos confirmados.</p></div><Link to="/pagamentos/novo"><Button><Plus size={16} /> Registar pagamento</Button></Link></div>
      <div className="grid gap-4 sm:grid-cols-2"><Card className="p-4"><p className="text-xs font-medium uppercase text-text-muted">Pagamentos registados</p><p className="mt-1 text-2xl font-semibold">{tickets.length}</p></Card><Card className="p-4"><p className="text-xs font-medium uppercase text-text-muted">Recebido hoje</p><p className="mt-1 text-2xl font-semibold text-success">{formatMT(receivedToday)}</p></Card></div>
      <Card className="flex flex-wrap items-center gap-3 p-4"><div className="relative w-full max-w-sm"><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Pesquisar referência, comerciante ou NUIT…" className="h-10 w-full rounded-lg border border-border pl-9 pr-3 text-sm" /></div><select value={marketFilter} onChange={(event) => { setMarketFilter(event.target.value); setPage(1); }} className="h-10 rounded-lg border border-border bg-white px-3 text-sm"><option value="">Todos os mercados</option>{markets.map((market) => <option key={market.id}>{market.name}</option>)}</select></Card>
      {error && <p role="alert" className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">{error}</p>}
      <Card className="overflow-hidden p-0"><Table><THead><TH>Referência</TH><TH>Comerciante</TH><TH>Mercado / Banca</TH><TH>Período</TH><TH>Valor</TH><TH>Estado</TH><TH className="text-right">Recibo</TH></THead><TBody>
        {items.map((ticket) => <TR key={ticket.id}><TD className="font-mono text-xs">{ticket.numero}</TD><TD><span className="block font-medium">{ticket.comerciante}</span><span className="text-xs text-text-muted">NUIT {ticket.nuit || "—"}</span></TD><TD><span className="block">{ticket.mercado}</span><span className="font-mono text-xs text-text-muted">{ticket.banca}</span></TD><TD>{ticket.periodoInicio} – {ticket.periodoFim}<span className="block text-xs text-text-muted">{ticket.tipoTaxa}</span></TD><TD>{formatMT(Number(ticket.valor))}</TD><TD><Badge variant="success">Pago</Badge></TD><TD className="text-right"><button onClick={() => exportReceiptPdf(toReceipt(ticket))} title="Imprimir recibo" className="rounded-md p-1.5 text-text-muted hover:bg-slate-100"><Printer size={16} /></button></TD></TR>)}
        {loading && <TR><TD className="py-8 text-center text-sm text-text-muted">A carregar recibos…</TD></TR>}
        {!loading && items.length === 0 && <TR><TD className="py-8 text-center text-sm text-text-muted">Nenhum recibo encontrado.</TD></TR>}
      </TBody></Table><Pagination page={page} totalPages={totalPages} onChange={setPage} /></Card>
    </div>
  );
}
