import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  UserX,
  UserCheck,
} from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Tooltip from "../../components/ui/Tooltip";
import {
  Table,
  THead,
  TH,
  TBody,
  TR,
  TD,
} from "../../components/ui/Table";
import Pagination from "../../components/ui/Pagination";
import { FISCAIS, MERCADOS } from "../../data/mock";

const PAGE_SIZE = 8;
const CHAVE_NOVO_FISCAL = "proxima:novo-fiscal";

const estadoVariants = {
  Activo: "success",
  Inactivo: "neutral",
};

// Lê os fiscais base do mock e, se existir um novo fiscal guardado
// em sessionStorage (vindo da página /fiscais/novo), insere-o no topo.
function lerFiscaisIniciais() {
  const base = [...FISCAIS];
  const raw = sessionStorage.getItem(CHAVE_NOVO_FISCAL);
  if (raw) {
    try {
      const novo = JSON.parse(raw);
      if (novo && novo.id && !base.some((f) => f.id === novo.id)) {
        base.unshift(novo);
      }
    } catch {
      /* ignorar JSON inválido */
    }
  }
  return base;
}

export default function FiscaisPage() {
  const [fiscais, setFiscais] = useState(lerFiscaisIniciais);
  const [pesquisa, setPesquisa] = useState("");
  const [mercado, setMercado] = useState("");
  const [estado, setEstado] = useState("");
  const [page, setPage] = useState(1);

  // Sempre que a página /fiscais/novo grava, dispara o evento "novo-fiscal".
  // Aqui adicionamos o novo fiscal à lista sem duplicar.
  useEffect(() => {
    function onNovo() {
      const raw = sessionStorage.getItem(CHAVE_NOVO_FISCAL);
      if (!raw) return;
      try {
        const novo = JSON.parse(raw);
        setFiscais((prev) =>
          prev.some((f) => f.id === novo.id) ? prev : [novo, ...prev]
        );
        // Limpa para não duplicar em remounts/recarregamentos
        sessionStorage.removeItem(CHAVE_NOVO_FISCAL);
      } catch {
        /* ignorar */
      }
    }
    window.addEventListener("novo-fiscal", onNovo);
    return () => window.removeEventListener("novo-fiscal", onNovo);
  }, []);

  const filtrados = useMemo(() => {
    const q = pesquisa.trim().toLowerCase();
    return fiscais.filter((f) => {
      const matchQ =
        !q ||
        f.nome.toLowerCase().includes(q) ||
        f.nuit.includes(q) ||
        f.contacto.replace(/\s/g, "").includes(q.replace(/\s/g, "")) ||
        f.email.toLowerCase().includes(q);
      const matchMercado = !mercado || f.mercado === mercado;
      const matchEstado = !estado || f.estado === estado;
      return matchQ && matchMercado && matchEstado;
    });
  }, [fiscais, pesquisa, mercado, estado]);

  const totalPages = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE));
  const pageItems = filtrados.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function resetPage(fn) {
    return (e) => {
      fn(e.target.value);
      setPage(1);
    };
  }

  function toggleEstado(f) {
    const inactivo = f.estado === "Inactivo";
    setFiscais((prev) =>
      prev.map((x) =>
        x.id === f.id
          ? {
              ...x,
              estado: inactivo ? "Activo" : "Inactivo",
              motivoInactividade: inactivo
                ? undefined
                : "Desactivado manualmente pelo gestor",
            }
          : x
      )
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text">Fiscais</h1>
          <p className="mt-1 text-sm text-text-muted">
            {fiscais.length} fiscais registados nos mercados informais.
          </p>
        </div>
        <Link to="/fiscais/novo">
          <Button>
            <Plus size={16} />
            Novo fiscal
          </Button>
        </Link>
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
            placeholder="Pesquisar por nome, NUIT, telefone ou e-mail…"
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
          value={estado}
          onChange={resetPage(setEstado)}
          className="h-10 rounded-lg border border-border bg-white px-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Todos os estados</option>
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
        </select>
      </Card>

      {/* Tabela */}
      <Card className="overflow-hidden p-0">
        <Table>
          <THead>
            <TH>Nome</TH>
            <TH>NUIT</TH>
            <TH>Contacto</TH>
            <TH>E-mail</TH>
            <TH>Mercado</TH>
            <TH>Zona / Turno</TH>
            <TH>Estado</TH>
            <TH className="text-right">Acções</TH>
          </THead>
          <TBody>
            {pageItems.map((f) => (
              <TR key={f.id}>
                <TD className="font-medium text-text">{f.nome}</TD>
                <TD className="font-mono text-xs text-text-muted">{f.nuit}</TD>
                <TD className="text-text-muted">{f.contacto}</TD>
                <TD className="text-text-muted">{f.email}</TD>
                <TD className="text-text">{f.mercado}</TD>
                <TD className="text-text">
                  <span className="block text-sm">{f.zona}</span>
                  <span className="text-xs text-text-muted">{f.turno}</span>
                </TD>
                <TD>
                  <Tooltip content={f.motivoInactividade || ""}>
                    <Badge variant={estadoVariants[f.estado]}>
                      {f.estado}
                    </Badge>
                  </Tooltip>
                </TD>
                <TD className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      className="rounded-md p-1.5 text-text-muted hover:bg-slate-100 hover:text-text"
                      title="Ver"
                      onClick={() => alert(`Ver ${f.nome} (mock).`)}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="rounded-md p-1.5 text-text-muted hover:bg-slate-100 hover:text-text"
                      title="Editar"
                      onClick={() => alert(`Editar ${f.nome} (mock).`)}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="rounded-md p-1.5 text-text-muted hover:bg-slate-100 hover:text-text"
                      title={
                        f.estado === "Inactivo" ? "Activar fiscal" : "Desactivar fiscal"
                      }
                      onClick={() => toggleEstado(f)}
                    >
                      {f.estado === "Inactivo" ? (
                        <UserCheck size={16} />
                      ) : (
                        <UserX size={16} />
                      )}
                    </button>
                  </div>
                </TD>
              </TR>
            ))}
            {pageItems.length === 0 && (
              <TR>
                <TD className="py-8 text-center text-sm text-text-muted">
                  Nenhum fiscal encontrado.
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