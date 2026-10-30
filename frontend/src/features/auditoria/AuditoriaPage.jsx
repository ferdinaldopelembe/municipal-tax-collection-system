import { useMemo, useState, useEffect } from "react";
import { Download, Search, ShieldCheck } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { Table, THead, TH, TBody, TR, TD } from "../../components/ui/Table";
import Pagination from "../../components/ui/Pagination";
import { api } from "../../lib/api";

const PAGE_SIZE = 10;

export default function AuditoriaPage() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [period, setPeriod] = useState("");
  const [cutoff, setCutoff] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api("/admin/audit")
      .then((items) => { if (active) setEvents(items); })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const users = [...new Set(events.map((event) => event.utilizador))];
  const actions = [...new Set(events.map((event) => event.accao))];
  const filtered = useMemo(() => {
    const text = search.trim().toLowerCase();
    return events.filter((event) => (
      (!text || event.descricao.toLowerCase().includes(text)
        || event.entidade.toLowerCase().includes(text)
        || event.utilizador.toLowerCase().includes(text))
      && (!userFilter || event.utilizador === userFilter)
      && (!actionFilter || event.accao === actionFilter)
      && (!cutoff || new Date(event.data).getTime() >= cutoff)
    ));
  }, [events, search, userFilter, actionFilter, cutoff]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const items = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function exportCsv() {
    const rows = [
      ["Data", "Utilizador", "Perfil", "Acção", "Entidade", "Descrição", "IP"],
      ...filtered.map((event) => [
        event.data, event.utilizador, event.perfil, event.accao,
        event.entidade, event.descricao, event.ip,
      ]),
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(";")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "auditoria.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4"><div><div className="flex items-center gap-2"><h1 className="text-2xl font-semibold">Auditoria</h1><span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary"><ShieldCheck size={12} /> Registos persistentes</span></div><p className="mt-1 text-sm text-text-muted">{events.length} eventos registados.</p></div><Button variant="secondary" onClick={exportCsv} disabled={!filtered.length}><Download size={16} /> Exportar CSV</Button></div>
      <Card className="flex flex-wrap items-center gap-3 p-4">
        <div className="relative w-full max-w-sm"><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Pesquisar descrição, entidade ou utilizador…" className="h-10 w-full rounded-lg border border-border pl-9 pr-3 text-sm" /></div>
        <select value={userFilter} onChange={(event) => { setUserFilter(event.target.value); setPage(1); }} className="h-10 rounded-lg border border-border bg-white px-3 text-sm"><option value="">Todos os utilizadores</option>{users.map((user) => <option key={user}>{user}</option>)}</select>
        <select value={actionFilter} onChange={(event) => { setActionFilter(event.target.value); setPage(1); }} className="h-10 rounded-lg border border-border bg-white px-3 text-sm"><option value="">Todas as acções</option>{actions.map((action) => <option key={action}>{action}</option>)}</select>
        <select value={period} onChange={(event) => { const value = event.target.value; setPeriod(value); setCutoff(value ? Date.now() - Number(value) * 86400000 : null); setPage(1); }} className="h-10 rounded-lg border border-border bg-white px-3 text-sm"><option value="">Todo o período</option><option value="7">Últimos 7 dias</option><option value="30">Últimos 30 dias</option></select>
      </Card>
      {error && <p role="alert" className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">{error}</p>}
      <Card className="overflow-hidden p-0"><Table><THead><TH>Data / Hora</TH><TH>Utilizador</TH><TH>Acção</TH><TH>Entidade</TH><TH>Descrição</TH><TH>IP</TH></THead><TBody>
        {items.map((event) => <TR key={event.id}><TD className="whitespace-nowrap text-xs">{new Date(event.data).toLocaleString("pt-MZ")}</TD><TD><span className="block font-medium">{event.utilizador}</span><span className="text-xs text-text-muted">{event.perfil}</span></TD><TD><Badge variant={event.accao === "Bloqueio" ? "danger" : event.accao === "Cobrança" ? "success" : "info"}>{event.accao}</Badge></TD><TD>{event.entidade}</TD><TD className="max-w-sm text-text-muted">{event.descricao}</TD><TD className="font-mono text-xs">{event.ip || "—"}</TD></TR>)}
        {loading && <TR><TD className="py-8 text-center text-sm text-text-muted">A carregar auditoria…</TD></TR>}
        {!loading && items.length === 0 && <TR><TD className="py-8 text-center text-sm text-text-muted">Nenhum evento encontrado.</TD></TR>}
      </TBody></Table><Pagination page={page} totalPages={totalPages} onChange={setPage} /></Card>
    </div>
  );
}
