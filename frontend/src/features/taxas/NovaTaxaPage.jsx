import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { api, apiPost, apiPut } from "../../lib/api";
import { PRODUCT_TYPES, RATE_PERIODS } from "../../data/domains";

const initialForm = { marketId: "", product: "", periodicity: "Diária", amount: "", active: true, description: "" };

export default function NovaTaxaPage() {
  const navigate = useNavigate();
  const [query] = useSearchParams();
  const rateId = query.get("id");
  const [markets, setMarkets] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      api("/admin/markets"),
      rateId ? api("/admin/rates") : Promise.resolve([]),
    ]).then(([marketList, rateList]) => {
      if (!active) return;
      setMarkets(marketList);
      if (rateId) {
        const rate = rateList.find((item) => item.id === Number(rateId));
        if (!rate) throw new Error("Taxa não encontrada.");
        setForm({
          marketId: String(rate.marketId), product: rate.product,
          periodicity: rate.periodicity, amount: String(rate.amount),
          active: rate.active, description: rate.description || "",
        });
      }
    }).catch((requestError) => {
      if (active) setError(requestError.message);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [rateId]);

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        marketId: Number(form.marketId),
        amount: Number(form.amount),
      };
      if (rateId) await apiPut(`/admin/rates/${rateId}`, payload);
      else await apiPost("/admin/rates", payload);
      navigate("/taxas");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Link to="/taxas" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text"><ArrowLeft size={16} /> Voltar às taxas</Link>
      <div><h1 className="text-2xl font-semibold text-text">{rateId ? "Editar taxa" : "Nova taxa"}</h1><p className="mt-1 text-sm text-text-muted">A taxa activa determina automaticamente o montante cobrado ao comerciante.</p></div>
      {loading ? <p className="text-sm text-text-muted">A carregar…</p> : (
        <form onSubmit={submit} className="max-w-3xl space-y-6">
          <Card className="grid gap-4 p-6 sm:grid-cols-2">
            <label className="text-sm font-medium">Mercado<select required value={form.marketId} onChange={(event) => setField("marketId", event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-border bg-white px-3 font-normal"><option value="">Seleccionar…</option>{markets.map((market) => <option key={market.id} value={market.id}>{market.name}</option>)}</select></label>
            <label className="text-sm font-medium">Produto<select required value={form.product} onChange={(event) => setField("product", event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-border bg-white px-3 font-normal"><option value="">Seleccionar…</option>{PRODUCT_TYPES.map((product) => <option key={product}>{product}</option>)}</select></label>
            <label className="text-sm font-medium">Periodicidade<select required value={form.periodicity} onChange={(event) => setField("periodicity", event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-border bg-white px-3 font-normal">{RATE_PERIODS.map((period) => <option key={period}>{period}</option>)}</select></label>
            <label className="text-sm font-medium">Valor (MT)<input required type="number" min="0.01" step="0.01" value={form.amount} onChange={(event) => setField("amount", event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-border px-3 font-normal" /></label>
            <label className="text-sm font-medium sm:col-span-2">Descrição<input value={form.description} onChange={(event) => setField("description", event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-border px-3 font-normal" /></label>
            <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" checked={form.active} onChange={(event) => setField("active", event.target.checked)} /> Taxa activa e disponível para pagamentos</label>
          </Card>
          {error && <p role="alert" className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">{error}</p>}
          <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => navigate("/taxas")}>Cancelar</Button><Button type="submit" disabled={saving}>{saving ? "A guardar…" : <><Save size={16} /> Guardar taxa</>}</Button></div>
        </form>
      )}
    </div>
  );
}
