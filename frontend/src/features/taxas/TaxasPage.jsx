import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    Plus,
    Search,
    Eye,
    Pencil,
    Power,
    Play,
    Pause,
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
import { TAXAS, MERCADOS, TIPOS_TAXA } from "../../data/mock";

const PAGE_SIZE = 8;

const estadoVariants = {
    Activa: "success",
    Suspensa: "warning",
    Inactiva: "danger",
};

const formatarValor = (v) =>
    v.toLocaleString("pt-MZ", { minimumFractionDigits: 2 }) + " MT";

export default function TaxasPage() {
    const [taxas, setTaxas] = useState(TAXAS);
    const [pesquisa, setPesquisa] = useState("");
    const [mercado, setMercado] = useState("");
    const [tipo, setTipo] = useState("");
    const [estado, setEstado] = useState("");
    const [page, setPage] = useState(1);

    const filtrados = useMemo(() => {
        const q = pesquisa.trim().toLowerCase();
        return taxas.filter((t) => {
            const matchQ =
                !q ||
                t.nome.toLowerCase().includes(q) ||
                t.produto.toLowerCase().includes(q);
            const matchMercado = !mercado || t.mercado === mercado;
            const matchTipo = !tipo || t.tipo === tipo;
            const matchEstado = !estado || t.estado === estado;
            return matchQ && matchMercado && matchTipo && matchEstado;
        });
    }, [taxas, pesquisa, mercado, tipo, estado]);

    const totalPages = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE));
    const pageItems = filtrados.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    function resetPage(fn) {
        return (e) => {
            fn(e.target.value);
            setPage(1);
        };
    }

    function toggleEstado(t) {
        const activa = t.estado === "Activa";
        setTaxas((prev) =>
            prev.map((x) =>
                x.id === t.id
                    ? {
                        ...x,
                        estado: activa ? "Suspensa" : "Activa",
                        motivoSuspensao: activa
                            ? "Suspensão manual pelo gestor"
                            : undefined,
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
                    <h1 className="text-2xl font-semibold text-text">Taxas</h1>
                    <p className="mt-1 text-sm text-text-muted">
                        {taxas.length} taxas configuradas por mercado e tipo de produto.
                    </p>
                </div>
                <Link to="/taxas/nova">
                    <Button>
                        <Plus size={16} />
                        Nova taxa
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
                        placeholder="Pesquisar por nome da taxa ou produto…"
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
                    <option value="Activa">Activa</option>
                    <option value="Suspensa">Suspensa</option>
                    <option value="Inactiva">Inactiva</option>
                </select>
            </Card>

            {/* Tabela */}
            <Card className="overflow-hidden p-0">
                <Table>
                    <THead>
                        <TH>Nome</TH>
                        <TH>Mercado</TH>
                        <TH>Tipo</TH>
                        <TH>Produto</TH>
                        <TH className="text-right">Valor</TH>
                        <TH>Periodicidade</TH>
                        <TH className="text-right">Comerciantes</TH>
                        <TH>Estado</TH>
                        <TH className="text-right">Acções</TH>
                    </THead>
                    <TBody>
                        {pageItems.map((t) => (
                            <TR key={t.id}>
                                <TD className="font-medium text-text">{t.nome}</TD>
                                <TD className="text-text">{t.mercado}</TD>
                                <TD className="text-text-muted">{t.tipo}</TD>
                                <TD className="text-text">{t.produto}</TD>
                                <TD className="text-right font-mono text-sm text-text">
                                    {formatarValor(t.valor)}
                                </TD>
                                <TD className="text-text-muted">{t.periodicidade}</TD>
                                <TD className="text-right text-text-muted">
                                    {t.comerciantes}
                                </TD>
                                <TD>
                                    <Tooltip content={t.motivoSuspensao || ""}>
                                        <Badge variant={estadoVariants[t.estado]}>{t.estado}</Badge>
                                    </Tooltip>
                                </TD>
                                <TD className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <button
                                            className="rounded-md p-1.5 text-text-muted hover:bg-slate-100 hover:text-text"
                                            title="Ver"
                                            onClick={() => alert(`Ver ${t.nome} (mock).`)}
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button
                                            className="rounded-md p-1.5 text-text-muted hover:bg-slate-100 hover:text-text"
                                            title="Editar"
                                            onClick={() => alert(`Editar ${t.nome} (mock).`)}
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            className="rounded-md p-1.5 text-text-muted hover:bg-slate-100 hover:text-text"
                                            title={
                                                t.estado === "Activa" ? "Suspender" : "Activar"
                                            }
                                            onClick={() => toggleEstado(t)}
                                        >
                                            {t.estado === "Activa" ? (
                                                <Pause size={16} />
                                            ) : (
                                                <Play size={16} />
                                            )}
                                        </button>
                                    </div>
                                </TD>
                            </TR>
                        ))}
                        {pageItems.length === 0 && (
                            <TR>
                                <TD className="py-8 text-center text-sm text-text-muted">
                                    Nenhuma taxa encontrada.
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