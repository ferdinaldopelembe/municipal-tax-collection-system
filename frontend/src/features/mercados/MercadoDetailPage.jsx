import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Plus, Store, Users, Wallet } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Tabs from "../../components/ui/Tabs";
import { Table, THead, TH, TBody, TR, TD } from "../../components/ui/Table";
import { formatMT } from "../../lib/format";
import { api, apiPost } from "../../lib/api";

const TABS = [
  { value: "bancas", label: "Bancas" },
  { value: "comerciantes", label: "Comerciantes" },
  { value: "fiscais", label: "Fiscais" },
  { value: "taxas", label: "Taxas" },
];

async function fetchMarketDetails(id) {
  const marketList = await api("/admin/markets");
  const market = marketList.find((item) => item.id === Number(id));
  if (!market) throw new Error("Mercado não encontrado.");
  const start = new Date();
  start.setDate(1);
  const from = start.toISOString().slice(0, 10);
  const to = new Date().toISOString().slice(0, 10);
  const [merchantItems, fiscalItems, rateItems, dashboard] = await Promise.all([
    api("/admin/merchants"),
    api("/admin/fiscals"),
    api("/admin/rates"),
    api(`/admin/dashboard?from=${from}&to=${to}&marketId=${market.id}`),
  ]);
  return {
    market,
    merchants: merchantItems.filter((item) => item.marketId === market.id),
    fiscals: fiscalItems.filter((item) => item.marketId === market.id),
    rates: rateItems.filter((item) => item.marketId === market.id),
    revenue: Number(dashboard.revenue),
  };
}

export default function MercadoDetailPage() {
  const { id } = useParams();
  const [market, setMarket] = useState(null);
  const [merchants, setMerchants] = useState([]);
  const [fiscals, setFiscals] = useState([]);
  const [rates, setRates] = useState([]);
  const [revenue, setRevenue] = useState(0);
  const [tab, setTab] = useState("bancas");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [stallForm, setStallForm] = useState({ code: "", product: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    fetchMarketDetails(id)
      .then((details) => {
        if (!active) return;
        setMarket(details.market);
        setMerchants(details.merchants);
        setFiscals(details.fiscals);
        setRates(details.rates);
        setRevenue(details.revenue);
        setError("");
      })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  const stalls = useMemo(() => market?.stalls || [], [market]);
  const occupancy = stalls.filter((stall) => stall.occupied).length;
  const currentItems = useMemo(() => {
    const text = search.trim().toLowerCase();
    const source = tab === "bancas" ? stalls
      : tab === "comerciantes" ? merchants
      : tab === "fiscais" ? fiscals : rates;
    return source.filter((item) => JSON.stringify(item).toLowerCase().includes(text));
  }, [tab, stalls, merchants, fiscals, rates, search]);

  async function createStall() {
    setSaving(true);
    setError("");
    try {
      await apiPost("/admin/stalls", {
        marketId: market.id,
        code: stallForm.code.trim().toUpperCase(),
        product: stallForm.product,
      });
      setModalOpen(false);
      setStallForm({ code: "", product: "" });
      const details = await fetchMarketDetails(id);
      setMarket(details.market);
      setMerchants(details.merchants);
      setFiscals(details.fiscals);
      setRates(details.rates);
      setRevenue(details.revenue);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading && !market) return <p className="text-sm text-text-muted">A carregar mercado…</p>;
  if (!market) return <div role="alert" className="text-sm text-danger">{error || "Mercado não encontrado."}</div>;

  return (
    <div className="space-y-6">
      <Link to="/mercados" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text"><ArrowLeft size={16} /> Voltar aos mercados</Link>
      <div>
        <h1 className="text-2xl font-semibold text-text">{market.name}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-text-muted">
          <span className="inline-flex items-center gap-1"><MapPin size={14} />{market.location || "Localização não definida"}</span>
          <span>Gestor: {market.manager || "Não atribuído"}</span>
          <Badge variant={market.active ? "success" : "neutral"}>{market.active ? "Activo" : "Inactivo"}</Badge>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Summary icon={Store} label="Bancas" value={`${stalls.length} (${occupancy} ocupadas)`} />
        <Summary icon={Users} label="Comerciantes" value={merchants.length} />
        <Summary icon={Wallet} label="Receita neste mês" value={formatMT(revenue)} />
      </div>
      <Tabs value={tab} onChange={(value) => { setTab(value); setSearch(""); }} tabs={TABS.map((item) => ({
        ...item,
        count: item.value === "bancas" ? stalls.length
          : item.value === "comerciantes" ? merchants.length
          : item.value === "fiscais" ? fiscals.length : rates.length,
      }))} />
      <Card className="overflow-hidden p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Pesquisar…" className="h-9 w-full max-w-xs rounded-lg border border-border px-3 text-sm" />
          {tab === "bancas" && <Button onClick={() => setModalOpen(true)}><Plus size={16} /> Nova banca</Button>}
        </div>
        {tab === "bancas" && <Table><THead><TH>Código</TH><TH>Produto</TH><TH>Comerciante</TH><TH>Estado</TH></THead><TBody>
          {currentItems.map((stall) => <TR key={stall.id}><TD className="font-mono">{stall.code}</TD><TD>{stall.product || "—"}</TD><TD>{stall.merchant || "— sem comerciante —"}</TD><TD><Badge variant={stall.occupied ? "success" : "neutral"}>{stall.occupied ? "Ocupada" : "Livre"}</Badge></TD></TR>)}
          {currentItems.length === 0 && <EmptyRow text="Sem bancas para apresentar." />}
        </TBody></Table>}
        {tab === "comerciantes" && <Table><THead><TH>Nome</TH><TH>NUIT</TH><TH>Banca</TH><TH>Produto</TH><TH>Estado</TH></THead><TBody>
          {currentItems.map((merchant) => <TR key={merchant.id}><TD>{merchant.name}</TD><TD>{merchant.nuit || "—"}</TD><TD>{merchant.stall}</TD><TD>{merchant.product}</TD><TD><Badge variant={merchant.status === "Bloqueado" ? "danger" : "success"}>{merchant.status}</Badge></TD></TR>)}
          {currentItems.length === 0 && <EmptyRow text="Sem comerciantes para apresentar." />}
        </TBody></Table>}
        {tab === "fiscais" && <Table><THead><TH>Nome</TH><TH>Contacto</TH><TH>Zona / Turno</TH><TH>Estado</TH></THead><TBody>
          {currentItems.map((fiscal) => <TR key={fiscal.id}><TD>{fiscal.name}</TD><TD>{fiscal.phone}</TD><TD>{fiscal.zone} · {fiscal.shift}</TD><TD>{fiscal.status}</TD></TR>)}
          {currentItems.length === 0 && <EmptyRow text="Sem fiscais para apresentar." />}
        </TBody></Table>}
        {tab === "taxas" && <Table><THead><TH>Produto</TH><TH>Valor</TH><TH>Periodicidade</TH><TH>Comerciantes</TH><TH>Estado</TH></THead><TBody>
          {currentItems.map((rate) => <TR key={rate.id}><TD>{rate.product}</TD><TD>{formatMT(Number(rate.amount))}</TD><TD>{rate.periodicity}</TD><TD>{rate.merchants}</TD><TD>{rate.active ? "Activa" : "Suspensa"}</TD></TR>)}
          {currentItems.length === 0 && <EmptyRow text="Sem taxas para apresentar." />}
        </TBody></Table>}
      </Card>
      {error && <p role="alert" className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">{error}</p>}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nova banca" description={`Adicionar banca ao ${market.name}.`} footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button><Button onClick={createStall} disabled={saving}>{saving ? "A guardar…" : "Guardar"}</Button></>}>
        <div className="space-y-4">
          <label className="block text-sm font-medium">Código<input value={stallForm.code} onChange={(event) => setStallForm((current) => ({ ...current, code: event.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-border px-3 font-mono text-sm" /></label>
          <label className="block text-sm font-medium">Produto<select value={stallForm.product} onChange={(event) => setStallForm((current) => ({ ...current, product: event.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm"><option value="">Seleccionar…</option>{rates.map((rate) => <option key={rate.id} value={rate.product}>{rate.product}</option>)}</select></label>
        </div>
      </Modal>
    </div>
  );
}

function Summary({ icon: Icon, label, value }) {
  return <Card className="flex items-center gap-4 p-4"><div className="rounded-lg bg-primary-soft p-2 text-primary"><Icon size={18} /></div><div><p className="text-xs text-text-muted">{label}</p><p className="font-semibold">{value}</p></div></Card>;
}

function EmptyRow({ text }) {
  return <TR><TD className="py-8 text-center text-sm text-text-muted">{text}</TD></TR>;
}
