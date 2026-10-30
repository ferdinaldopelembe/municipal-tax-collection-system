import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Printer } from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Select from "../../components/ui/Select";
import useAuth from "../../context/useAuth";
import { api, apiPost } from "../../lib/api";
import { exportReceiptPdf } from "../../utils/exportReceiptPdf";
import { mapApiPayment } from "./paymentView";

const METHODS = ["Numerário", "M-Pesa", "e-Mola", "Mkesh"];

const fmtMT = (value) =>
  Number(value).toLocaleString("pt-MZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + " MT";

export default function ComerciantePagamentoPage() {
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [markets, setMarkets] = useState([]);
  const [rates, setRates] = useState([]);
  const [profileMarketId, setProfileMarketId] = useState("");
  const [profileStallId, setProfileStallId] = useState("");
  const [profileProduct, setProfileProduct] = useState("");
  const [method, setMethod] = useState("");
  const [error, setError] = useState("");
  const [payment, setPayment] = useState(null);
  const rate = rates.find((item) => item.product === user.produto);

  useEffect(() => {
    let active = true;
    api("/catalog/markets")
      .then((items) => {
        if (active) setMarkets(items);
      })
      .catch((catalogError) => {
        if (active) setError(catalogError.message);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!user.marketId) return undefined;
    let active = true;
    api(`/catalog/rates?marketId=${user.marketId}`)
      .then((items) => {
        if (active) setRates(items);
      })
      .catch((catalogError) => {
        if (active) setError(catalogError.message);
      });
    return () => {
      active = false;
    };
  }, [user.marketId]);

  async function submitPayment(event) {
    event.preventDefault();
    setError("");
    try {
      const savedPayment = await apiPost("/payments", { method });
      setPayment(mapApiPayment(savedPayment));
    } catch (paymentError) {
      setError(paymentError.message);
    }
  }

  async function loadProfileRates(marketId) {
    setRates([]);
    setProfileProduct("");
    if (!marketId) return;
    try {
      setRates(await api(`/catalog/rates?marketId=${marketId}`));
    } catch (catalogError) {
      setError(catalogError.message);
    }
  }

  async function saveProfile() {
    setError("");
    try {
      await updateUserProfile({
        marketId: profileMarketId,
        stallId: profileStallId,
        product: profileProduct,
      });
    } catch (profileError) {
      setError(profileError.message);
    }
  }

  if (payment) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-semibold text-text">Pagamento efectuado</h1>
        <Card className="space-y-5 p-6">
          <div className="flex flex-col items-center text-center">
            <CheckCircle2 size={36} className="text-emerald-600" />
            <h2 className="mt-3 text-lg font-semibold text-text">
              Pagamento confirmado para {payment.comerciante}
            </h2>
          </div>
          <div className="space-y-2 rounded-lg border border-border bg-slate-50 p-4 text-sm">
            <p><strong>Referência de pagamento:</strong> {payment.senha}</p>
            <p><strong>Comerciante:</strong> {payment.comerciante}</p>
            <p><strong>Telefone:</strong> {payment.telefone || "—"}</p>
            <p><strong>Taxa:</strong> {payment.taxa}</p>
            <p><strong>Mercado / banca:</strong> {payment.mercado} · {payment.banca}</p>
            <p><strong>Período:</strong> {payment.periodo}</p>
            <p><strong>Método:</strong> {payment.metodo}</p>
            <p><strong>Referência da transacção:</strong> {payment.referencia}</p>
            <p><strong>Valor:</strong> {fmtMT(payment.valor)}</p>
            <p><strong>Data:</strong> {payment.data}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="secondary" onClick={() => exportReceiptPdf(payment)}>
              <Printer size={16} /> Imprimir recibo
            </Button>
            <Button onClick={() => navigate("/pagamentos")}>
              Ver os meus pagamentos
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!user.marketId || !user.stallId || !user.produto) {
    const selectedMarket = markets.find(
      (market) => market.id === Number(profileMarketId)
    );
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-text">Associar o seu negócio</h1>
          <p className="mt-1 text-sm text-text-muted">
            Estes dados ficam guardados no seu perfil e serão usados nos pagamentos.
          </p>
        </div>
        <Card className="space-y-4 p-5">
          <Select
            id="profile-market"
            label="Mercado"
            value={profileMarketId}
            onChange={(event) => {
              const marketId = event.target.value;
              setProfileMarketId(marketId);
              setProfileStallId("");
              loadProfileRates(marketId);
            }}
            required
          >
            <option value="">Seleccionar mercado…</option>
            {markets.map((market) => (
              <option key={market.id} value={market.id}>{market.name}</option>
            ))}
          </Select>
          <Select
            id="profile-stall"
            label="A sua banca"
            value={profileStallId}
            onChange={(event) => setProfileStallId(event.target.value)}
            disabled={!selectedMarket}
            required
          >
            <option value="">Seleccionar banca…</option>
            {(selectedMarket?.stalls || []).map((stall) => (
              <option key={stall.id} value={stall.id}>{stall.code}</option>
            ))}
          </Select>
          <Select
            id="profile-product"
            label="Produto comercializado"
            value={profileProduct}
            onChange={(event) => setProfileProduct(event.target.value)}
            disabled={!rates.length}
            required
          >
            <option value="">Seleccionar produto…</option>
            {rates.map((item) => (
              <option key={item.id} value={item.product}>{item.product}</option>
            ))}
          </Select>
          {profileProduct && (
            <p className="text-sm text-text-muted">
              {(() => {
                const selectedRate = rates.find((item) => item.product === profileProduct);
                return selectedRate
                  ? `Taxa: ${selectedRate.periodicity} · ${fmtMT(selectedRate.amount)}`
                  : "";
              })()}
            </p>
          )}
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button
            className="w-full"
            disabled={!profileMarketId || !profileStallId || !profileProduct}
            onClick={saveProfile}
          >
            Guardar os dados do meu negócio
          </Button>
        </Card>
      </div>
    );
  }

  if (rates.length > 0 && !rate) {
    return (
      <Card className="p-5">
        <p className="text-sm text-danger">
          Não há uma taxa activa para o produto associado à sua banca. Contacte o administrador.
        </p>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate("/pagamentos")}
          className="rounded-md p-1.5 hover:bg-slate-100"
          title="Voltar"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-text">Fazer pagamento</h1>
          <p className="mt-1 text-sm text-text-muted">
            O período e o valor são calculados pela taxa da sua banca.
          </p>
        </div>
      </div>

      <form onSubmit={submitPayment} className="space-y-6">
        <Card className="space-y-3 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
            O seu negócio
          </h2>
          <p className="text-sm text-text"><strong>Comerciante:</strong> {user.name}</p>
          <p className="text-sm text-text"><strong>Telefone:</strong> {user.phone || "—"}</p>
          <p className="text-sm text-text"><strong>Mercado:</strong> {user.mercado}</p>
          <p className="text-sm text-text"><strong>Banca:</strong> {user.banca}</p>
          <p className="text-sm text-text"><strong>Produto:</strong> {user.produto}</p>
        </Card>

        <Card className="space-y-4 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
            Taxa aplicável
          </h2>
          {rate ? (
            <>
              <p className="text-sm text-text"><strong>Periodicidade:</strong> {rate.periodicity}</p>
              <p className="text-sm text-text"><strong>Valor a pagar:</strong> {fmtMT(rate.amount)}</p>
            </>
          ) : (
            <p className="text-sm text-text-muted">A carregar a taxa aplicável…</p>
          )}
          <Select
            id="method"
            label="Método de pagamento"
            value={method}
            onChange={(event) => setMethod(event.target.value)}
            required
          >
            <option value="">Seleccionar…</option>
            {METHODS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </Select>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" className="w-full" disabled={!rate || !method}>
            Efectuar pagamento
          </Button>
        </Card>
      </form>
    </div>
  );
}
