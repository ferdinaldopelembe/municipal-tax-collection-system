import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Breadcrumb from "../../components/ui/Breadcrumb";
import { api, apiPost, apiPut } from "../../lib/api";

const initialForm = {
  name: "",
  nuit: "",
  phone: "",
  email: "",
  password: "",
  marketId: "",
  stallId: "",
  product: "",
};

export default function NovoComerciantePage() {
  const navigate = useNavigate();
  const [query] = useSearchParams();
  const merchantId = query.get("id");
  const [markets, setMarkets] = useState([]);
  const [rates, setRates] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      api("/admin/markets"),
      merchantId ? api("/admin/merchants") : Promise.resolve([]),
    ])
      .then(([marketList, merchants]) => {
        if (!active) return;
        setMarkets(marketList);
        if (merchantId) {
          const merchant = merchants.find((item) => item.id === Number(merchantId));
          if (!merchant) throw new Error("Comerciante não encontrado.");
          setForm({
            name: merchant.name,
            nuit: merchant.nuit || "",
            phone: merchant.phone || "",
            email: merchant.email || "",
            password: "",
            marketId: String(merchant.marketId),
            stallId: String(merchant.stallId),
            product: merchant.product,
          });
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [merchantId]);

  useEffect(() => {
    if (!form.marketId) return;
    let active = true;
    api(`/catalog/rates?marketId=${form.marketId}`)
      .then((items) => {
        if (active) setRates(items);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      });
    return () => {
      active = false;
    };
  }, [form.marketId]);

  const selectedMarket = markets.find((market) => market.id === Number(form.marketId));
  const availableStalls = useMemo(
    () => (selectedMarket?.stalls || []).filter(
      (stall) => !stall.occupied || stall.id === Number(form.stallId)
    ),
    [selectedMarket, form.stallId]
  );
  const selectedRate = rates.find((rate) => rate.product === form.product);

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        ...form,
        marketId: Number(form.marketId),
        stallId: Number(form.stallId),
      };
      if (merchantId) {
        delete payload.password;
        await apiPut(`/admin/merchants/${merchantId}`, payload);
      } else {
        await apiPost("/admin/merchants", payload);
      }
      navigate("/comerciantes");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[
        { label: "Comerciantes", to: "/comerciantes" },
        { label: merchantId ? "Editar" : "Novo" },
      ]} />
      <Link to="/comerciantes" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text">
        <ArrowLeft size={16} /> Voltar aos comerciantes
      </Link>
      <div>
        <h1 className="text-2xl font-semibold text-text">
          {merchantId ? "Editar comerciante" : "Novo comerciante"}
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Os dados e a banca ficam associados ao registo persistente do comerciante.
        </p>
      </div>
      {loading ? <p className="text-sm text-text-muted">A carregar…</p> : (
        <form onSubmit={submit} className="max-w-3xl space-y-6">
          <Card className="grid gap-4 p-6 sm:grid-cols-2">
            <Input id="name" label="Nome completo" value={form.name}
              onChange={(event) => setField("name", event.target.value)} required />
            <Input id="nuit" label="NUIT" value={form.nuit} maxLength={9}
              onChange={(event) => setField("nuit", event.target.value.replace(/\D/g, "").slice(0, 9))}
              inputMode="numeric" required />
            <Input id="phone" label="Telefone" type="tel" value={form.phone}
              onChange={(event) => setField("phone", event.target.value)} required />
            <Input id="email" label="E-mail" type="email" value={form.email}
              onChange={(event) => setField("email", event.target.value)} />
            {!merchantId && <Input id="password" label="Senha inicial (mínimo 8 caracteres)"
              type="password" minLength={8} value={form.password}
              onChange={(event) => setField("password", event.target.value)} required />}
          </Card>
          <Card className="grid gap-4 p-6 sm:grid-cols-2">
            <Select id="market" label="Mercado" value={form.marketId}
              onChange={(event) => {
                setRates([]);
                setForm((current) => ({
                  ...current, marketId: event.target.value, stallId: "", product: "",
                }));
              }} required>
              <option value="">Seleccionar mercado…</option>
              {markets.filter((market) => market.active).map((market) => (
                <option key={market.id} value={market.id}>{market.name}</option>
              ))}
            </Select>
            <Select id="stall" label="Banca" value={form.stallId}
              onChange={(event) => setField("stallId", event.target.value)}
              disabled={!form.marketId} required>
              <option value="">Seleccionar banca livre…</option>
              {availableStalls.map((stall) => (
                <option key={stall.id} value={stall.id}>{stall.code}</option>
              ))}
            </Select>
            <Select id="product" label="Produto comercializado" value={form.product}
              onChange={(event) => setField("product", event.target.value)}
              disabled={!form.marketId} required>
              <option value="">Seleccionar produto…</option>
              {rates.map((rate) => <option key={rate.id} value={rate.product}>{rate.product}</option>)}
            </Select>
            {selectedRate && (
              <div className="self-center text-sm text-text-muted">
                Taxa: {selectedRate.periodicity} · {Number(selectedRate.amount).toLocaleString("pt-MZ")} MT
              </div>
            )}
          </Card>
          {error && <p role="alert" className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => navigate("/comerciantes")}>Cancelar</Button>
            <Button type="submit" disabled={saving || loading}>{saving ? "A guardar…" : "Guardar comerciante"}</Button>
          </div>
        </form>
      )}
    </div>
  );
}
