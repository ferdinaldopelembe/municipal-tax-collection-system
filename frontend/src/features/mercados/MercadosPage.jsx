import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Eye, Pencil } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import { Table, THead, TH, TBody, TR, TD } from "../../components/ui/Table";
import Pagination from "../../components/ui/Pagination";
import { api, apiPost, apiPut } from "../../lib/api";

const PAGE_SIZE = 8;
const emptyForm = { name: "", location: "", manager: "", active: true };

export default function MercadosPage() {
  const [markets, setMarkets] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    api("/admin/markets")
      .then((items) => { if (active) setMarkets(items); })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    const text = search.trim().toLowerCase();
    return markets.filter((market) => (
      (!text || market.name.toLowerCase().includes(text)
        || (market.location || "").toLowerCase().includes(text)
        || (market.manager || "").toLowerCase().includes(text))
      && (!statusFilter || String(market.active) === statusFilter)
    ));
  }, [markets, search, statusFilter]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const items = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(market) {
    setEditingId(market.id);
    setForm({
      name: market.name,
      location: market.location || "",
      manager: market.manager || "",
      active: market.active,
    });
    setModalOpen(true);
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const saved = editingId
        ? await apiPut(`/admin/markets/${editingId}`, form)
        : await apiPost("/admin/markets", form);
      setMarkets((current) => editingId
        ? current.map((item) => item.id === saved.id ? saved : item)
        : [saved, ...current]);
      setModalOpen(false);
      setPage(1);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-2xl font-semibold text-text">Mercados</h1><p className="mt-1 text-sm text-text-muted">Gestão dos mercados e das respectivas bancas.</p></div>
        <Button onClick={openCreate}><Plus size={16} /> Novo mercado</Button>
      </div>
      <Card className="flex flex-wrap items-center gap-3 p-4">
        <div className="relative w-full max-w-sm"><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Pesquisar nome, localização ou gestor…" className="h-10 w-full rounded-lg border border-border bg-white pl-9 pr-3 text-sm" /></div>
        <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }} className="h-10 rounded-lg border border-border bg-white px-3 text-sm"><option value="">Todos os estados</option><option value="true">Activo</option><option value="false">Inactivo</option></select>
      </Card>
      {error && <p role="alert" className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">{error}</p>}
      <Card className="overflow-hidden p-0">
        <Table>
          <THead><TH>Nome</TH><TH>Localização</TH><TH className="text-right">Bancas</TH><TH className="text-right">Comerciantes</TH><TH>Gestor</TH><TH>Estado</TH><TH className="text-right">Acções</TH></THead>
          <TBody>
            {items.map((market) => (
              <TR key={market.id}>
                <TD><Link to={`/mercados/${market.id}`} className="font-medium text-text hover:text-primary">{market.name}</Link></TD>
                <TD className="text-text-muted">{market.location || "—"}</TD>
                <TD className="text-right">{market.stalls.length}</TD>
                <TD className="text-right">{market.merchantCount}</TD>
                <TD>{market.manager || "—"}</TD>
                <TD><Badge variant={market.active ? "success" : "neutral"}>{market.active ? "Activo" : "Inactivo"}</Badge></TD>
                <TD className="text-right"><div className="flex justify-end gap-1">
                  <Link to={`/mercados/${market.id}`} className="rounded-md p-1.5 text-text-muted hover:bg-slate-100" title="Ver mercado"><Eye size={16} /></Link>
                  <button onClick={() => openEdit(market)} className="rounded-md p-1.5 text-text-muted hover:bg-slate-100" title="Editar mercado"><Pencil size={16} /></button>
                </div></TD>
              </TR>
            ))}
            {loading && <TR><TD className="py-8 text-center text-sm text-text-muted">A carregar mercados…</TD></TR>}
            {!loading && items.length === 0 && <TR><TD className="py-8 text-center text-sm text-text-muted">Nenhum mercado encontrado.</TD></TR>}
          </TBody>
        </Table>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </Card>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Editar mercado" : "Novo mercado"} description="Os dados do mercado são partilhados com o catálogo de pagamentos." footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button><Button onClick={save} disabled={saving}>{saving ? "A guardar…" : "Guardar"}</Button></>}>
        <div className="space-y-4">
          <label className="block text-sm font-medium">Nome<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} maxLength={120} className="mt-1 h-10 w-full rounded-lg border border-border px-3 text-sm" /></label>
          <label className="block text-sm font-medium">Localização<input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} className="mt-1 h-10 w-full rounded-lg border border-border px-3 text-sm" /></label>
          <label className="block text-sm font-medium">Gestor responsável<input value={form.manager} onChange={(event) => setForm({ ...form, manager: event.target.value })} className="mt-1 h-10 w-full rounded-lg border border-border px-3 text-sm" /></label>
          {editingId && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} /> Mercado activo</label>}
        </div>
      </Modal>
    </div>
  );
}
