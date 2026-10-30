import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Landmark } from "lucide-react";
import useAuth from "../../context/useAuth";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import { api } from "../../lib/api";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [marketId, setMarketId] = useState("");
  const [stallId, setStallId] = useState("");
  const [produto, setProduto] = useState("");
  const [markets, setMarkets] = useState([]);
  const [rates, setRates] = useState([]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!email.trim() && !phone.trim()) {
      setError("Indique um e-mail ou telefone para iniciar sessão.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    if (!marketId || !stallId || !produto) {
      setError("Indique o mercado, a banca e o produto do seu negócio.");
      return;
    }

    setSubmitting(true);
    try {
      await register({
        name,
        email,
        phone,
        password,
        marketId,
        stallId,
        product: produto,
      });
      navigate("/pagamentos", { replace: true });
    } catch (registrationError) {
      setError(registrationError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 py-10">
      <div className="w-full max-w-[420px]">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Landmark size={20} className="text-white" />
          </div>
          <span className="text-lg font-semibold text-text">Cobrança Beira</span>
        </div>

        <h1 className="text-2xl font-semibold text-text">Criar conta</h1>
        <p className="mt-1 text-sm text-text-muted">
          A conta terá acesso a pagamentos e impressão de recibos.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <Input
            id="name"
            label="Nome completo"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
          <Input
            id="email"
            label="E-mail"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Input
            id="phone"
            label="Telefone"
            type="tel"
            autoComplete="tel"
            placeholder="+258 84 123 4567"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
          <Select
            id="market"
            label="Mercado"
            value={marketId}
            onChange={async (event) => {
              const selectedId = event.target.value;
              setMarketId(selectedId);
              setStallId("");
              setProduto("");
              setRates([]);
              if (!selectedId) return;
              try {
                const marketRates = await api(`/catalog/rates?marketId=${selectedId}`);
                setRates(marketRates);
              } catch (catalogError) {
                setError(catalogError.message);
              }
            }}
            required
          >
            <option value="">Seleccionar mercado…</option>
            {markets.map((option) => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </Select>
          <Select
            id="stall"
            label="Banca"
            value={stallId}
            onChange={(event) => setStallId(event.target.value)}
            disabled={!marketId}
            required
          >
            <option value="">Seleccionar banca…</option>
            {(markets.find((market) => market.id === Number(marketId))?.stalls || []).map((option) => (
              <option key={option.id} value={option.id}>{option.code}</option>
            ))}
          </Select>
          <Select
            id="product"
            label="Produto comercializado"
            value={produto}
            onChange={(event) => setProduto(event.target.value)}
            disabled={!rates.length}
            required
          >
            <option value="">Seleccionar produto…</option>
            {rates.map((rate) => (
              <option key={rate.id} value={rate.product}>{rate.product}</option>
            ))}
          </Select>
          {produto && (
            <p className="text-sm text-text-muted">
              {(() => {
                const rate = rates.find((item) => item.product === produto);
                return rate
                  ? `Taxa: ${rate.periodicity} · ${Number(rate.amount).toLocaleString("pt-MZ")} MT`
                  : "";
              })()}
            </p>
          )}
          <Input
            id="password"
            label="Senha (mínimo 6 caracteres)"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
          />
          <Input
            id="confirm-password"
            label="Confirmar senha"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />

          {error && (
            <div className="rounded-lg border border-danger/20 bg-danger/5 px-3 py-2.5 text-sm text-danger">
              {error}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={
              submitting ||
              !name.trim() ||
              !password ||
              !confirmPassword ||
              !marketId ||
              !stallId ||
              !produto
            }
          >
            {submitting ? "A criar conta…" : "Criar conta"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          Já tem conta?{" "}
          <Link to="/login" className="font-medium text-primary hover:text-primary-hover">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
