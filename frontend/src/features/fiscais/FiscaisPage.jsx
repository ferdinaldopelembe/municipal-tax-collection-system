import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Pencil, UserX, UserCheck } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Tooltip from "../../components/ui/Tooltip";
import { Table, THead, TH, TBody, TR, TD } from "../../components/ui/Table";
import Pagination from "../../components/ui/Pagination";
import { api, apiPatch } from "../../lib/api";

const PAGE_SIZE = 8;

export default function FiscaisPage() {
  const [fiscals, setFiscals] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [search, setSearch] = useState("");
  const [marketFilter, setMarketFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([api("/admin/fiscals"), api("/admin/markets")])
      .then(([fiscalItems, marketItems]) => {
        if (active) {
          setFiscals(fiscalItems);
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
    return fiscals.filter((fiscal) =>
      (!text || fiscal.name.toLowerCase().includes(text)
        || fiscal.nuit.includes(text)
        || fiscal.phone.toLowerCase().includes(text)
        || fiscal.email.toLowerCase().includes(text))
      && (!marketFilter || fiscal.market === marketFilter)
      && (!statusFilter || fiscal.status === statusFilter)
    );
  }, [fiscals, search, marketFilter, statusFilter]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const items = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function toggleStatus(fiscal) {
    const status = fiscal.status === "Inactivo" ? "Activo" : "Inactivo";
    try {
      const updated = await apiPatch(`/admin/fiscals/${fiscal.id}/status`, {
        status,
        reason: status === "Inactivo" ? "Desactivado pela administração" : null,
      });
      setFiscals((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-2xl font-semibold text-text">Fiscais</h1><p className="mt-1 text-sm text-text-muted">{fiscals.length} fiscais registados.</p></div>
        <Link to="/fiscais/novo"><Button><Plus size={16} /> Novo fiscal</Button></Link>
      </div>
      <Card className="flex flex-wrap items-center gap-3 p-4">
        <div className="relative w-full max-w-sm">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Pesquisar nome, NUIT ou contacto…" className="h-10 w-full rounded-lg border border-border bg-white pl-9 pr-3 text-sm" />
        </div>
        <select value={marketFilter} onChange={(event) => { setMarketFilter(event.target.value); setPage(1); }} className="h-10 rounded-lg border border-border bg-white px-3 text-sm">
          <option value="">Todos os mercados</option>{markets.map((market) => <option key={market.id}>{market.name}</option>)}
        </select>
        <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }} className="h-10 rounded-lg border border-border bg-white px-3 text-sm">
          <option value="">Todos os estados</option><option>Activo</option><option>Inactivo</option>
        </select>
      </Card>
      {error && <p role="alert" className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">{error}</p>}
      <Card className="overflow-hidden p-0">
        <Table>
          <THead><TH>Nome</TH><TH>NUIT</TH><TH>Contacto</TH><TH>E-mail</TH><TH>Mercado</TH><TH>Zona / Turno</TH><TH>Estado</TH><TH className="text-right">Acções</TH></THead>
          <TBody>
            {items.map((fiscal) => (
              <TR key={fiscal.id}>
                <TD className="font-medium text-text">{fiscal.name}</TD><TD className="font-mono text-xs">{fiscal.nuit}</TD><TD>{fiscal.phone}</TD><TD>{fiscal.email}</TD><TD>{fiscal.market}</TD>
                <TD><span className="block text-sm">{fiscal.zone}</span><span className="text-xs text-text-muted">{fiscal.shift}</span></TD>
                <TD><Tooltip content={fiscal.statusReason || ""}><Badge variant={fiscal.status === "Activo" ? "success" : "neutral"}>{fiscal.status}</Badge></Tooltip></TD>
                <TD className="text-right"><div className="flex justify-end gap-1">
                  <Link to={`/fiscais/novo?id=${fiscal.id}`} className="rounded-md p-1.5 text-text-muted hover:bg-slate-100" title="Editar fiscal"><Pencil size={16} /></Link>
                  <button onClick={() => toggleStatus(fiscal)} title={fiscal.status === "Activo" ? "Desactivar fiscal" : "Activar fiscal"} className="rounded-md p-1.5 text-text-muted hover:bg-slate-100">{fiscal.status === "Activo" ? <UserX size={16} /> : <UserCheck size={16} />}</button>
                </div></TD>
              </TR>
            ))}
            {loading && <TR><TD className="py-8 text-center text-sm text-text-muted">A carregar fiscais…</TD></TR>}
            {!loading && items.length === 0 && <TR><TD className="py-8 text-center text-sm text-text-muted">Nenhum fiscal encontrado.</TD></TR>}
          </TBody>
        </Table>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </Card>
    </div>
  );
}
