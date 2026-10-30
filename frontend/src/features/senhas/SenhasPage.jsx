import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Eye,
  Printer,
  CreditCard,
  XCircle,
} from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import {
  Table,
  THead,
  TH,
  TBody,
  TR,
  TD,
} from "../../components/ui/Table";
import Pagination from "../../components/ui/Pagination";
import { SENHAS, MERCADOS, TIPOS_TAXA } from "../../data/mock";

const PAGE_SIZE = 8;
const HOJE = "2024-10-30";

const estadoVariants = {
  Paga: "success",
  Pendente: "info",
  Vencida: "danger",
  Anulada: "neutral",
};

function formatMT(n) {
  const s = n.toFixed(2).replace(".", ",");
  const [int, dec] = s.split(",");
  return `${int.replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${dec} MT`;
}

export default function SenhasPage() {
  const [senhas, setSenhas] = useState(SENHAS);
  const [pesquisa, setPesquisa] = useState("");
  const [mercado, setMercado] = useState("");
  const [tipo, setTipo] = useState("");
  const [estado, setEstado] = useState("");
  const [page, setPage] = useState(1);

  const stats = useMemo(() => {
    const emitidasHoje = senhas.filter((s) => s.dataEmissao === HOJE).length;
    const recebidoHoje = senhas
      .filter((s) => s.estado === "Paga" && s.dataPagamento === HOJE)
      .reduce((sum, s) => sum + s.valor, 0);
    const pendentes = senhas.filter((s) => s.estado === "Pendente").length;
    const vencidas = senhas.filter((s) => s.estado === "Vencida").length;
    return { emitidasHoje, recebidoHoje, pendentes, vencidas };
  }, [senhas]);

  const filtrados = useMemo(() => {
    const q = pesquisa.trim().toLowerCase();
    return senhas.filter((s) => {
      const matchQ =
        !q ||
        s.numero.toLowerCase().includes(q) ||
        s.comerciante.toLowerCase().includes(q) ||
        s.nuit.includes(q);
      const matchMercado = !mercado || s.mercado === mercado;
      const matchTipo = !tipo || s.tipoTaxa === tipo;
      const matchEstado = !estado || s.estado === estado;
      return matchQ && matchMercado && matchTipo && matchEstado;
    });
  }, [senhas, pesquisa, mercado, tipo, estado]);

  const totalPages = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE));
  const pageItems = filtrados.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function resetPage(fn) {
    return (e) => {
      fn(e.target.value);
      setPage(1);
    };
  }

  function registarPagamento(s) {
    setSenhas((prev) =>
      prev.map((x) =>
        x.id === s.id
          ? {
              ...x,
              estado: "Paga",
              metodoPagamento: "M-Pesa",
              dataPagamento: HOJE,
            }
          : x
      )
    );
  }

  function anularSenha(s) {
    if (!window.confirm(`Anular a senha ${s.numero} de ${s.comerciante}?`)) return;
    setSenhas((prev) =>
      prev.map((x) => (x.id === s.id ? { ...x, estado: "Anulada" } : x))
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text">Senhas</h1>
          <p className="mt-1 text-sm text-text-muted">
            Gestão das senhas de pagamento de taxas dos mercados informais.
          </p>
        </div>
        <Link to="/senhas/nova">
          <Button>
            <Plus size={16} />
            Emitir senha
          </Button>
        </Link>
      </div>

      {/* KPIs de resumo */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
            Emitidas hoje
          </p>
          <p className="mt-1 text-2xl font-semibold text-text">
            {stats.emitidasHoje}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
            Recebido hoje
          </p>
          <p className="mt-1 text-2xl font-semibold text-success">
            {formatMT(stats.recebidoHoje)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
            Pendentes
          </p>
          <p className="mt-1 text-2xl font-semibold text-text">
            {stats.pendentes}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
            Vencidas
          </p>
          <p className="mt-1 text-2xl font-semibold text-danger">
            {stats.vencidas}
          </p>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="flex flex-wrap items-center gap-3 p-4">
        <div className="relative w-full max-w-sm">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            placeholder="Pesquisar por Nº senha, comerciante ou NUIT…"
            value={pesquisa}
            onChange={resetPage(setPesquisa)}
            className="h-10 w-full rounded-lg border border-border bg-white pl-9 pr-3 text-sm text-text placeholder:text-text-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <select
          value={mercado}
          onChange={resetPage(setMercado)}
          className="h-10 rounded-lg border border-border bg-white px-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Todos os mercados</option>
          {MERCADOS.map((m) => (
            <option key={m.id} value={m.nome}>
              {m.nome}
            </option>
          ))}
        </select>

        <select
          value={tipo}
          onChange={resetPage(setTipo)}
          className="h-10 rounded-lg border border-border bg-white px-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Todos os tipos</option>
          {TIPOS_TAXA.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          value={estado}
          onChange={resetPage(setEstado)}
          className="h-10 rounded-lg border border-border bg-white px-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Todos os estados</option>
          <option value="Paga">Paga</option>
          <option value="Pendente">Pendente</option>
          <option value="Vencida">Vencida</option>
          <option value="Anulada">Anulada</option>
        </select>
      </Card>

      {/* Tabela */}
      <Card className="overflow-hidden p-0">
        <Table>
          <THead>
            <TH>Nº Senha</TH>
            <TH>Comerciante</TH>
            <TH>Mercado / Banca</TH>
            <TH>Período</TH>
            <TH>Valor</TH>
            <TH>Estado</TH>
            <TH>Vencimento</TH>
            <TH className="text-right">Acções</TH>
          </THead>
          <TBody>
            {pageItems.map((s) => (
              <TR key={s.id}>
                <TD className="font-mono text-xs font-medium text-text">
                  {s.numero}
                </TD>
                <TD className="text-text">
                  <span className="block text-sm font-medium">
                    {s.comerciante}
                  </span>
                  <span className="font-mono text-xs text-text-muted">
                    NUIT {s.nuit}
                  </span>
                </TD>
                <TD className="text-text">
                  <span className="block text-sm">{s.mercado}</span>
                  <span className="font-mono text-xs text-text-muted">
                    {s.banca}
                  </span>
                </TD>
                <TD>
                  <span className="block text-sm text-text">{s.periodo}</span>
                  <span className="text-xs text-text-muted">{s.tipoTaxa}</span>
                </TD>
                <TD className="font-medium text-text">{formatMT(s.valor)}</TD>
                <TD>
                  <Badge variant={estadoVariants[s.estado]}>{s.estado}</Badge>
                </TD>
                <TD className="text-text-muted">{s.dataVencimento}</TD>
                <TD className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      className="rounded-md p-1.5 text-text-muted hover:bg-slate-100 hover:text-text"
                      title="Ver"
                      onClick={() => alert(`Ver senha ${s.numero} (mock).`)}
                    >
                      <Eye size={16} />
                    </button>

                    {s.estado !== "Anulada" && (
                      <button
                        className="rounded-md p-1.5 text-text-muted hover:bg-slate-100 hover:text-text"
                        title="Imprimir"
                        onClick={() =>
                          alert(`Imprimir senha ${s.numero} (mock).`)
                        }
                      >
                        <Printer size={16} />
                      </button>
                    )}

                    {(s.estado === "Pendente" || s.estado === "Vencida") && (
                      <button
                        className="rounded-md p-1.5 text-text-muted hover:bg-slate-100 hover:text-text"
                        title="Registar pagamento"
                        onClick={() => registarPagamento(s)}
                      >
                        <CreditCard size={16} />
                      </button>
                    )}

                    {(s.estado === "Pendente" || s.estado === "Vencida") && (
                      <button
                        className="rounded-md p-1.5 text-text-muted hover:bg-slate-100 hover:text-danger"
                        title="Anular"
                        onClick={() => anularSenha(s)}
                      >
                        <XCircle size={16} />
                      </button>
                    )}
                  </div>
                </TD>
              </TR>
            ))}
            {pageItems.length === 0 && (
              <TR>
                <TD className="py-8 text-center text-sm text-text-muted">
                  Nenhuma senha encontrada.
                </TD>
              </TR>
            )}
          </TBody>
        </Table>

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </Card>
    </div>
  );
}