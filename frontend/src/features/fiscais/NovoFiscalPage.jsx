import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { api, apiPost, apiPut } from "../../lib/api";

const ZONES = ["Zona A", "Zona B", "Zona C", "Zona D"];
const SHIFTS = ["Manhã · 06h–14h", "Tarde · 14h–22h", "Noite · 22h–06h"];
const emptyForm = { name: "", nuit: "", phone: "", email: "", marketId: "", zone: "", shift: "" };

export default function NovoFiscalPage() {
  const navigate = useNavigate();
  const [query] = useSearchParams();
  const fiscalId = query.get("id");
  const [form, setForm] = useState(emptyForm);
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      api("/admin/markets"),
      fiscalId ? api("/admin/fiscals") : Promise.resolve([]),
    ]).then(([marketList, fiscalList]) => {
      if (!active) return;
      setMarkets(marketList);
      if (fiscalId) {
        const fiscal = fiscalList.find((item) => item.id === Number(fiscalId));
        if (!fiscal) throw new Error("Fiscal não encontrado.");
        setForm({
          name: fiscal.name, nuit: fiscal.nuit, phone: fiscal.phone,
          email: fiscal.email, marketId: String(fiscal.marketId),
          zone: fiscal.zone, shift: fiscal.shift,
        });
      }
    }).catch((requestError) => {
      if (active) setError(requestError.message);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [fiscalId]);

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = { ...form, marketId: Number(form.marketId) };
      if (fiscalId) await apiPut(`/admin/fiscals/${fiscalId}`, payload);
      else await apiPost("/admin/fiscals", payload);
      navigate("/fiscais");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Link to="/fiscais" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text"><ArrowLeft size={16} /> Voltar aos fiscais</Link>
      <div><h1 className="text-2xl font-semibold text-text">{fiscalId ? "Editar fiscal" : "Novo fiscal"}</h1><p className="mt-1 text-sm text-text-muted">Os dados são guardados no registo do sistema.</p></div>
      {loading ? <p className="text-sm text-text-muted">A carregar…</p> : (
        <form onSubmit={submit} className="max-w-3xl space-y-6">
          <Card className="grid gap-4 p-6 sm:grid-cols-2">
            <label className="text-sm font-medium">Nome<input required maxLength={120} value={form.name} onChange={(event) => setField("name", event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-border px-3 font-normal" /></label>
            <label className="text-sm font-medium">NUIT<input required inputMode="numeric" maxLength={9} value={form.nuit} onChange={(event) => setField("nuit", event.target.value.replace(/\D/g, "").slice(0, 9))} className="mt-1 h-10 w-full rounded-lg border border-border px-3 font-mono font-normal" /></label>
            <label className="text-sm font-medium">Contacto<input required type="tel" value={form.phone} onChange={(event) => setField("phone", event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-border px-3 font-normal" /></label>
            <label className="text-sm font-medium">E-mail<input required type="email" value={form.email} onChange={(event) => setField("email", event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-border px-3 font-normal" /></label>
          </Card>
          <Card className="grid gap-4 p-6 sm:grid-cols-3">
            <label className="text-sm font-medium">Mercado<select required value={form.marketId} onChange={(event) => setField("marketId", event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-border bg-white px-3 font-normal"><option value="">Seleccionar…</option>{markets.filter((market) => market.active).map((market) => <option key={market.id} value={market.id}>{market.name}</option>)}</select></label>
            <label className="text-sm font-medium">Zona<select required value={form.zone} onChange={(event) => setField("zone", event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-border bg-white px-3 font-normal"><option value="">Seleccionar…</option>{ZONES.map((zone) => <option key={zone}>{zone}</option>)}</select></label>
            <label className="text-sm font-medium">Turno<select required value={form.shift} onChange={(event) => setField("shift", event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-border bg-white px-3 font-normal"><option value="">Seleccionar…</option>{SHIFTS.map((shift) => <option key={shift}>{shift}</option>)}</select></label>
          </Card>
          {error && <p role="alert" className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">{error}</p>}
          <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => navigate("/fiscais")}>Cancelar</Button><Button type="submit" disabled={saving}>{saving ? "A guardar…" : <><Save size={16} /> Guardar fiscal</>}</Button></div>
        </form>
      )}
    </div>
  );
}
