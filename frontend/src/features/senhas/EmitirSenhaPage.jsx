import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Printer, CheckCircle2 } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { api, apiPost } from "../../lib/api";
import { PAYMENT_METHODS } from "../../data/domains";
import { mapApiPayment } from "../pagamentos/paymentView";
import { exportReceiptPdf } from "../../utils/exportReceiptPdf";
import { formatMT } from "../../lib/format";

export default function EmitirSenhaPage() {
  const navigate = useNavigate();
  const [merchants, setMerchants] = useState([]);
  const [merchantId, setMerchantId] = useState("");
  const [method, setMethod] = useState("");
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api("/admin/merchants").then((items) => {
      if (active) setMerchants(items);
    }).catch((requestError) => {
      if (active) setError(requestError.message);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const merchant = merchants.find((item) => item.id === Number(merchantId));
  const rate = merchant && merchant.amount != null
    ? `${merchant.periodicity} · ${formatMT(Number(merchant.amount))}`
    : "Sem taxa activa";

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const result = await apiPost("/admin/payments", {
        merchantId: Number(merchantId),
        method,
      });
      setPayment(mapApiPayment(result));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  if (payment) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-3"><CheckCircle2 className="text-success" size={28} /><div><h1 className="text-2xl font-semibold">Pagamento registado</h1><p className="text-sm text-text-muted">Pagamento gravado na base de dados e recibo emitido.</p></div></div>
        <Card className="space-y-3 p-6 text-sm">
          <Row label="Referência" value={payment.senha} />
          <Row label="Transacção" value={payment.referencia} />
          <Row label="Comerciante" value={payment.comerciante} />
          <Row label="Mercado / banca" value={`${payment.mercado} · ${payment.banca}`} />
          <Row label="Período" value={`${payment.tipo} · ${payment.periodo}`} />
          <Row label="Método" value={payment.metodo} />
          <Row label="Data" value={payment.data} />
          <Row label="Valor pago" value={formatMT(payment.valor)} />
          <div className="flex flex-wrap justify-end gap-2 pt-3">
            <Button variant="secondary" onClick={() => exportReceiptPdf(payment)}><Printer size={16} /> Imprimir recibo</Button>
            <Button variant="secondary" onClick={() => navigate("/pagamentos")}>Ver pagamentos</Button>
            <Button onClick={() => { setPayment(null); setMerchantId(""); setMethod(""); }}>Novo pagamento</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/pagamentos" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text"><ArrowLeft size={16} /> Voltar aos pagamentos</Link>
      <div><h1 className="text-2xl font-semibold">Registar pagamento</h1><p className="mt-1 text-sm text-text-muted">Registe uma cobrança efectivamente recebida. Valor e período vêm da taxa activa.</p></div>
      {loading ? <p className="text-sm text-text-muted">A carregar comerciantes…</p> : (
        <form onSubmit={submit} className="max-w-2xl space-y-6">
          <Card className="space-y-4 p-6">
            <label className="block text-sm font-medium">Comerciante<select required value={merchantId} onChange={(event) => setMerchantId(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm"><option value="">Seleccionar comerciante…</option>{merchants.filter((item) => item.status !== "Bloqueado").map((item) => <option key={item.id} value={item.id}>{item.name} · {item.stall} · {item.market}</option>)}</select></label>
            {merchant && <div className="rounded-lg bg-slate-50 p-4 text-sm"><p className="font-medium">{merchant.market} · {merchant.stall}</p><p className="mt-1 text-text-muted">{merchant.product} — {rate}</p></div>}
            <fieldset><legend className="mb-2 text-sm font-medium">Método de pagamento</legend><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{PAYMENT_METHODS.map((item) => <button key={item} type="button" onClick={() => setMethod(item)} className={`rounded-lg border px-3 py-2 text-sm ${method === item ? "border-primary bg-primary/5 text-primary" : "border-border"}`}>{item}</button>)}</div></fieldset>
          </Card>
          {error && <p role="alert" className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">{error}</p>}
          <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => navigate("/pagamentos")}>Cancelar</Button><Button type="submit" disabled={saving || !merchantId || !method}>{saving ? "A registar…" : "Confirmar pagamento"}</Button></div>
        </form>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return <div className="flex justify-between gap-4 border-b border-border py-2"><span className="text-text-muted">{label}</span><span className="text-right font-medium">{value}</span></div>;
}
