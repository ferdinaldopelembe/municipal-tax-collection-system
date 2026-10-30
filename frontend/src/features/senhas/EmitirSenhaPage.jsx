import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Search,
  AlertTriangle,
  Printer,
  MapPin,
  CreditCard,
  Banknote,
  Smartphone,
} from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { COMERCIANTES, SENHAS } from "../../data/mock";

// ---------- utils ----------
const HOJE = new Date("2024-10-30T10:00:00");
const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const MESES_CURTO = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

const METODOS = [
  { value: "M-Pesa", label: "M-Pesa", requerRef: true, icon: Smartphone },
  { value: "e-Mola", label: "e-Mola", requerRef: true, icon: Smartphone },
  { value: "Numerário", label: "Numerário", requerRef: false, icon: Banknote },
  { value: "POS", label: "POS", requerRef: false, icon: CreditCard },
];

function formatDate(d) {
  return `${d.getDate()} ${MESES_CURTO[d.getMonth()]} ${d.getFullYear()}`;
}

function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

function getPeriodo(tipo, date) {
  if (tipo === "Diária") return formatDate(date);
  if (tipo === "Semanal") return `Semana ${getISOWeek(date)} · ${date.getFullYear()}`;
  return `${MESES[date.getMonth()]} ${date.getFullYear()}`;
}

function getVencimento(tipo, date) {
  const d = new Date(date.getTime());
  if (tipo === "Diária") return formatDate(d);
  if (tipo === "Semanal") {
    d.setDate(d.getDate() + 2);
    return formatDate(d);
  }
  d.setMonth(d.getMonth() + 1, 0); // último dia do mês
  return formatDate(d);
}

function formatMT(n) {
  const s = Number(n).toFixed(2).replace(".", ",");
  const [int, dec] = s.split(",");
  return `${int.replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${dec} MT`;
}

function taxaFromComerciante(c) {
  if (!c?.taxa) return { tipo: "Diária", valor: 0 };
  const m = c.taxa.match(/^(Diária|Semanal|Mensal)\s*·\s*([\d.]+,\d+)\s*MT/);
  if (!m) return { tipo: "Diária", valor: 0 };
  return {
    tipo: m[1],
    valor: Number(m[2].replace(/\./g, "").replace(",", ".")),
  };
}

const estadoVariants = {
  Regular: "success",
  "Em dívida": "warning",
  Bloqueado: "danger",
};

// ---------- componente ----------
export default function EmitirSenhaPage() {
  const navigate = useNavigate();

  const [comercianteId, setComercianteId] = useState("");
  const [buscaComerciante, setBuscaComerciante] = useState("");
  const [comboOpen, setComboOpen] = useState(false);
  const comboRef = useRef(null);

  const [metodo, setMetodo] = useState("");
  const [referencia, setReferencia] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const [erros, setErros] = useState({});
  const [emitida, setEmitida] = useState(null);

  const comerciante = COMERCIANTES.find((c) => c.id === Number(comercianteId));
  const { tipo: tipoTaxa, valor } = taxaFromComerciante(comerciante);
  const periodo = getPeriodo(tipoTaxa, HOJE);
  const vencimento = getVencimento(tipoTaxa, HOJE);

  const proximoNumero = useMemo(() => {
    const nums = SENHAS.map((s) => parseInt(s.numero.replace("SNH-", ""), 10));
    const max = Math.max(...nums);
    return `SNH-${String(max + 1).padStart(5, "0")}`;
  }, []);

  const comerciantesFiltrados = useMemo(() => {
    const q = buscaComerciante.trim().toLowerCase();
    const base = q
      ? COMERCIANTES.filter(
          (c) => c.nome.toLowerCase().includes(q) || c.nuit.includes(q)
        )
      : COMERCIANTES;
    return base.slice(0, 8);
  }, [buscaComerciante]);

  const metodoObj = METODOS.find((m) => m.value === metodo);
  const isBloqueado = comerciante?.estado === "Bloqueado";
  const isEmDivida = comerciante?.estado === "Em dívida";

  // click-outside do combobox
  useEffect(() => {
    if (!comboOpen) return;
    function onDown(e) {
      if (comboRef.current && !comboRef.current.contains(e.target)) {
        setComboOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [comboOpen]);

  function selecionarComerciante(c) {
    setComercianteId(c.id);
    setBuscaComerciante("");
    setComboOpen(false);
    setErros((prev) => ({ ...prev, comerciante: undefined }));
    setMetodo("");
    setReferencia("");
    setObservacoes("");
  }

  function validar() {
    const e = {};
    if (!comerciante) e.comerciante = "Seleccione um comerciante.";
    if (isBloqueado)
      e.comerciante = "Comerciante bloqueado. Desbloqueie antes de emitir.";
    if (!metodo) e.metodo = "Seleccione o método de pagamento.";
    if (metodoObj?.requerRef && !referencia.trim()) {
      e.referencia = `Indique a referência ${metodo}.`;
    }
    return e;
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    const e = validar();
    setErros(e);
    if (Object.keys(e).length > 0) return;

    setEmitida({
      numero: proximoNumero,
      comerciante: comerciante.nome,
      nuit: comerciante.nuit,
      mercado: comerciante.mercado,
      banca: comerciante.banca,
      produto: comerciante.produto,
      tipoTaxa,
      valor,
      periodo,
      dataEmissao: formatDate(HOJE),
      dataVencimento: vencimento,
      metodoPagamento: metodo,
      referencia: referencia || null,
      observacoes: observacoes || null,
    });
  }

  // ---------- ecrã de sucesso ----------
  if (emitida) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
            <Check size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-text">
              Senha emitida com sucesso
            </h1>
            <p className="text-sm text-text-muted">
              A senha{" "}
              <span className="font-mono font-medium text-text">
                {emitida.numero}
              </span>{" "}
              foi registada no sistema.
            </p>
          </div>
        </div>

        <Recibo senha={emitida} />

        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-medium text-text hover:bg-slate-50"
          >
            <Printer size={16} />
            Imprimir recibo
          </button>
          <Button onClick={() => navigate("/senhas")}>
            Voltar às senhas
          </Button>
        </div>
      </div>
    );
  }

  // ---------- ecrã de emissão ----------
  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/senhas"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-text"
        >
          <ArrowLeft size={16} />
          Voltar às senhas
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-text">Emitir senha</h1>
        <p className="mt-1 text-sm text-text-muted">
          Preencha os dados do comerciante e do pagamento. A senha é gerada
          automaticamente após confirmação.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        {/* Coluna esquerda: formulário */}
        <div className="space-y-6 lg:col-span-2">
          {/* 1. Comerciante */}
          <Card className="space-y-4 p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                1
              </span>
              <h2 className="text-sm font-semibold text-text">Comerciante</h2>
            </div>

            <div className="space-y-1.5" ref={comboRef}>
              <label className="text-sm font-medium text-text">
                Seleccionar comerciante <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setComboOpen((v) => !v)}
                  className={`flex h-10 w-full items-center justify-between rounded-lg border bg-white px-3 text-left text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                    erros.comerciante
                      ? "border-danger focus:border-danger"
                      : "border-border focus:border-primary"
                  }`}
                >
                  {comerciante ? (
                    <span className="flex items-center gap-2 text-text">
                      <span className="font-medium">{comerciante.nome}</span>
                      <span className="font-mono text-xs text-text-muted">
                        NUIT {comerciante.nuit}
                      </span>
                    </span>
                  ) : (
                    <span className="text-text-muted">
                      Procurar por nome ou NUIT…
                    </span>
                  )}
                  <ChevronDown size={16} className="text-text-muted" />
                </button>

                {comboOpen && (
                  <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-border bg-white shadow-lg">
                    <div className="border-b border-border p-2">
                      <div className="relative">
                        <Search
                          size={14}
                          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted"
                        />
                        <input
                          autoFocus
                          type="text"
                          placeholder="Pesquisar…"
                          value={buscaComerciante}
                          onChange={(e) => setBuscaComerciante(e.target.value)}
                          className="h-9 w-full rounded-md border border-border bg-slate-50 pl-8 pr-2 text-sm text-text focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                    <ul className="max-h-64 overflow-y-auto py-1">
                      {comerciantesFiltrados.map((c) => (
                        <li key={c.id}>
                          <button
                            type="button"
                            onClick={() => selecionarComerciante(c)}
                            className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50"
                          >
                            <span className="min-w-0 flex-1">
                              <span className="block truncate font-medium text-text">
                                {c.nome}
                              </span>
                              <span className="block truncate text-xs text-text-muted">
                                NUIT {c.nuit} · {c.mercado} · {c.banca}
                              </span>
                            </span>
                            <Badge variant={estadoVariants[c.estado]}>
                              {c.estado}
                            </Badge>
                          </button>
                        </li>
                      ))}
                      {comerciantesFiltrados.length === 0 && (
                        <li className="px-3 py-6 text-center text-sm text-text-muted">
                          Nenhum comerciante encontrado.
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
              {erros.comerciante && (
                <p className="flex items-center gap-1 text-xs text-danger">
                  <AlertTriangle size={12} />
                  {erros.comerciante}
                </p>
              )}
            </div>

            {comerciante && (
              <div className="grid gap-3 rounded-lg border border-border bg-slate-50 p-4 sm:grid-cols-2">
                <Info label="NUIT" value={comerciante.nuit} mono />
                <Info label="Contacto" value={comerciante.contacto} />
                <Info
                  label="Mercado / Banca"
                  value={`${comerciante.mercado} · ${comerciante.banca}`}
                />
                <Info label="Tipo de produto" value={comerciante.produto} />
                <Info label="Estado actual" value={comerciante.estado} badge />
                <Info label="Taxa aplicável" value={comerciante.taxa} />
              </div>
            )}

            {isBloqueado && (
              <Banner tone="danger" icon={AlertTriangle}>
                <strong>Comerciante bloqueado.</strong>{" "}
                {comerciante.motivoBloqueio || "Motivo não especificado."} Não é
                possível emitir senhas até regularização.
              </Banner>
            )}
            {isEmDivida && !isBloqueado && (
              <Banner tone="warning" icon={AlertTriangle}>
                Este comerciante tem <strong>senhas em dívida</strong>. Pode
                emitir, mas confirme o pagamento integral.
              </Banner>
            )}
          </Card>

          {/* 2. Taxa */}
          <Card className="space-y-4 p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                2
              </span>
              <h2 className="text-sm font-semibold text-text">Taxa a cobrar</h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <ReadonlyField label="Tipo de taxa" value={comerciante ? tipoTaxa : "—"} />
              <ReadonlyField
                label="Valor"
                value={comerciante ? formatMT(valor) : "—"}
                highlight
              />
              <ReadonlyField
                label="Período"
                value={comerciante ? periodo : "—"}
              />
              <ReadonlyField
                label="Data de vencimento"
                value={comerciante ? vencimento : "—"}
              />
            </div>
            <p className="flex items-start gap-1.5 text-xs text-text-muted">
              <MapPin size={12} className="mt-0.5 shrink-0" />
              Calculado automaticamente com base no tipo de produto e mercado
              do comerciante.
            </p>
          </Card>

          {/* 3. Pagamento */}
          <Card className="space-y-4 p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                3
              </span>
              <h2 className="text-sm font-semibold text-text">Pagamento</h2>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text">
                Método de pagamento <span className="text-danger">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {METODOS.map((m) => {
                  const Icon = m.icon;
                  const active = metodo === m.value;
                  return (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => {
                        setMetodo(m.value);
                        setErros((prev) => ({ ...prev, metodo: undefined }));
                      }}
                      className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs font-medium transition ${
                        active
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border bg-white text-text hover:border-primary/40"
                      }`}
                    >
                      <Icon size={18} />
                      {m.label}
                    </button>
                  );
                })}
              </div>
              {erros.metodo && (
                <p className="mt-1 flex items-center gap-1 text-xs text-danger">
                  <AlertTriangle size={12} />
                  {erros.metodo}
                </p>
              )}
            </div>

            {metodoObj?.requerRef && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text">
                  Referência {metodo}{" "}
                  <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={referencia}
                  onChange={(e) => {
                    setReferencia(e.target.value);
                    setErros((prev) => ({ ...prev, referencia: undefined }));
                  }}
                  placeholder={
                    metodo === "M-Pesa"
                      ? "Ex.: MP-8392-1029-7481"
                      : "Ex.: EM-4821-0921-3654"
                  }
                  className={`h-10 w-full rounded-lg border bg-white px-3 font-mono text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                    erros.referencia
                      ? "border-danger focus:border-danger"
                      : "border-border focus:border-primary"
                  }`}
                />
                {erros.referencia && (
                  <p className="flex items-center gap-1 text-xs text-danger">
                    <AlertTriangle size={12} />
                    {erros.referencia}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text">
                Observações{" "}
                <span className="text-xs font-normal text-text-muted">
                  (opcional)
                </span>
              </label>
              <textarea
                rows={2}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Ex.: pagamento parcial autorizado pelo gestor do mercado."
                className="w-full resize-none rounded-lg border border-border bg-white px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </Card>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => navigate("/senhas")}
              className="inline-flex h-10 items-center rounded-lg border border-border bg-white px-4 text-sm font-medium text-text hover:bg-slate-50"
            >
              Cancelar
            </button>
            <Button type="submit">
              <Check size={16} />
              Emitir senha
            </Button>
          </div>
        </div>

        {/* Coluna direita: preview */}
        <div>
          <div className="sticky top-6">
            <Recibo senha={{
              numero: proximoNumero,
              comerciante: comerciante?.nome,
              nuit: comerciante?.nuit,
              mercado: comerciante?.mercado,
              banca: comerciante?.banca,
              produto: comerciante?.produto,
              tipoTaxa: comerciante ? tipoTaxa : "—",
              valor: comerciante ? valor : 0,
              periodo: comerciante ? periodo : "—",
              dataEmissao: formatDate(HOJE),
              dataVencimento: comerciante ? vencimento : "—",
              metodoPagamento: metodo || "—",
            }} preview />
          </div>
        </div>
      </form>
    </div>
  );
}

// ---------- subcomponentes ----------
function Info({ label, value, mono, badge }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
        {label}
      </p>
      {badge ? (
        <div className="mt-1">
          <Badge variant={estadoVariants[value] || "neutral"}>{value}</Badge>
        </div>
      ) : (
        <p className={`mt-1 text-sm text-text ${mono ? "font-mono" : ""}`}>
          {value}
        </p>
      )}
    </div>
  );
}

function ReadonlyField({ label, value, highlight }) {
  return (
    <div>
      <label className="text-xs font-medium uppercase tracking-wide text-text-muted">
        {label}
      </label>
      <div
        className={`mt-1 flex h-10 items-center rounded-lg border border-border bg-slate-50 px-3 text-sm ${
          highlight ? "font-semibold text-text" : "text-text"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function Banner({ tone, icon: Icon, children }) {
  const styles = {
    danger: "border-danger/30 bg-danger/5 text-danger",
    warning: "border-warning/40 bg-warning/5 text-amber-800",
  }[tone];
  return (
    <div
      className={`flex items-start gap-2 rounded-lg border p-3 text-xs ${styles}`}
    >
      <Icon size={14} className="mt-0.5 shrink-0" />
      <p className="leading-relaxed">{children}</p>
    </div>
  );
}

function Recibo({ senha, preview }) {
  return (
    <div
      className={`rounded-xl border bg-white ${
        preview
          ? "border-dashed border-border bg-slate-50/60 shadow-sm"
          : "border-border shadow-sm"
      }`}
    >
      <div className="border-b border-dashed border-border px-5 py-4 text-center">
        <p className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
          {preview ? "Pré-visualização" : "Recibo"} · Senha de pagamento
        </p>
        <p className="mt-1 font-mono text-lg font-semibold text-text">
          {senha.numero}
        </p>
        <p className="mt-0.5 text-xs text-text-muted">
          Emitida em {senha.dataEmissao}
        </p>
      </div>

      <dl className="space-y-2 px-5 py-4 text-sm">
        <Row label="Comerciante" value={senha.comerciante || "—"} strong />
        <Row label="NUIT" value={senha.nuit || "—"} mono />
        <Row
          label="Mercado / Banca"
          value={
            senha.mercado ? `${senha.mercado} · ${senha.banca}` : "—"
          }
        />
        <Row label="Produto" value={senha.produto || "—"} />
        <Row label="Tipo de taxa" value={senha.tipoTaxa} />
        <Row label="Período" value={senha.periodo} />
        <Row label="Vencimento" value={senha.dataVencimento} />
        <Row label="Método" value={senha.metodoPagamento} />
        {senha.referencia && (
          <Row label="Referência" value={senha.referencia} mono />
        )}
      </dl>

      <div className="mx-5 border-t border-dashed border-border" />

      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-sm text-text-muted">Total a pagar</span>
        <span className="text-xl font-semibold text-text">
          {formatMT(senha.valor || 0)}
        </span>
      </div>
    </div>
  );
}

function Row({ label, value, mono, strong }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="shrink-0 text-text-muted">{label}</dt>
      <dd
        className={`min-w-0 text-right ${mono ? "font-mono text-xs" : "text-sm"} ${
          strong ? "font-medium" : ""
        } text-text truncate`}
        title={value}
      >
        {value}
      </dd>
    </div>
  );
}