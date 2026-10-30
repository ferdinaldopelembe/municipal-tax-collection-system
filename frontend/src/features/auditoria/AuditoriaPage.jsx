import { useMemo, useState } from "react";
import { Search, Download, ShieldCheck } from "lucide-react";
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
import {
    AUDITORIA,
    UTILIZADORES_AUDITORIA,
    ACCAO_AUDITORIA,
} from "../../data/mock";

const PAGE_SIZE = 10;

const accaoVariants = {
    Criação: "success",
    Edição: "info",
    Cobrança: "primary",
    Bloqueio: "danger",
    Suspensão: "warning",
    Login: "neutral",
};

const formatarDataHora = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString("pt-MZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const formatarDataHoraLonga = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString("pt-MZ", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
};

export default function AuditoriaPage() {
    const [registos] = useState(AUDITORIA);
    const [pesquisa, setPesquisa] = useState("");
    const [utilizador, setUtilizador] = useState("");
    const [accao, setAccao] = useState("");
    const [periodo, setPeriodo] = useState(""); // 7d, 30d, todos
    const [page, setPage] = useState(1);

    const filtrados = useMemo(() => {
        const q = pesquisa.trim().toLowerCase();
        const agora = new Date("2026-10-30T23:59:59");
        return registos.filter((r) => {
            const matchQ =
                !q ||
                r.descricao.toLowerCase().includes(q) ||
                r.entidade.toLowerCase().includes(q) ||
                r.utilizador.toLowerCase().includes(q);
            const matchUser = !utilizador || r.utilizador === utilizador;
            const matchAccao = !accao || r.accao === accao;
            let matchPeriodo = true;
            if (periodo === "7d") {
                const limite = new Date(agora);
                limite.setDate(limite.getDate() - 7);
                matchPeriodo = new Date(r.data) >= limite;
            } else if (periodo === "30d") {
                const limite = new Date(agora);
                limite.setDate(limite.getDate() - 30);
                matchPeriodo = new Date(r.data) >= limite;
            }
            return matchQ && matchUser && matchAccao && matchPeriodo;
        });
    }, [registos, pesquisa, utilizador, accao, periodo]);

    const totalPages = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE));
    const pageItems = filtrados.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    function resetPage(fn) {
        return (e) => {
            fn(e.target.value);
            setPage(1);
        };
    }

    function exportar() {
        const linhas = [
            ["Data", "Utilizador", "Perfil", "Acção", "Entidade", "Descrição", "IP"],
            ...filtrados.map((r) => [
                formatarDataHora(r.data),
                r.utilizador,
                r.perfil,
                r.accao,
                r.entidade,
                r.descricao,
                r.ip,
            ]),
        ];
        const csv = linhas
            .map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
            .join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "auditoria.csv";
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <div className="space-y-6">
            {/* Cabeçalho */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-semibold text-text">Auditoria</h1>
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                            <ShieldCheck size={12} />
                            Registo imutável
                        </span>
                    </div>
                    <p className="mt-1 text-sm text-text-muted">
                        {registos.length} eventos registados. Todas as acções são guardadas
                        com utilizador, data/hora e IP.
                    </p>
                </div>
                <Button variant="secondary" onClick={exportar}>
                    <Download size={16} />
                    Exportar CSV
                </Button>
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
                        placeholder="Pesquisar por descrição, entidade ou utilizador…"
                        value={pesquisa}
                        onChange={resetPage(setPesquisa)}
                        className="h-10 w-full rounded-lg border border-border bg-white pl-9 pr-3 text-sm text-text placeholder:text-text-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                <select
                    value={utilizador}
                    onChange={resetPage(setUtilizador)}
                    className="h-10 rounded-lg border border-border bg-white px-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                    <option value="">Todos os utilizadores</option>
                    {UTILIZADORES_AUDITORIA.map((u) => (
                        <option key={u} value={u}>
                            {u}
                        </option>
                    ))}
                </select>

                <select
                    value={accao}
                    onChange={resetPage(setAccao)}
                    className="h-10 rounded-lg border border-border bg-white px-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                    <option value="">Todas as acções</option>
                    {ACCAO_AUDITORIA.map((a) => (
                        <option key={a} value={a}>
                            {a}
                        </option>
                    ))}
                </select>

                <select
                    value={periodo}
                    onChange={resetPage(setPeriodo)}
                    className="h-10 rounded-lg border border-border bg-white px-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                    <option value="">Todo o período</option>
                    <option value="7d">Últimos 7 dias</option>
                    <option value="30d">Últimos 30 dias</option>
                </select>
            </Card>

            {/* Tabela */}
            <Card className="overflow-hidden p-0">
                <Table>
                    <THead>
                        <TH>Data / Hora</TH>
                        <TH>Utilizador</TH>
                        <TH>Acção</TH>
                        <TH>Entidade</TH>
                        <TH>Descrição</TH>
                        <TH>IP</TH>
                    </THead>
                    <TBody>
                        {pageItems.map((r) => (
                            <TR key={r.id}>
                                <TD className="whitespace-nowrap font-mono text-xs text-text-muted">
                                    {formatarDataHora(r.data)}
                                </TD>
                                <TD className="text-text">
                                    <span className="block text-sm font-medium">
                                        {r.utilizador}
                                    </span>
                                    <span className="text-xs text-text-muted">{r.perfil}</span>
                                </TD>
                                <TD>
                                    <Badge variant={accaoVariants[r.accao] || "neutral"}>
                                        {r.accao}
                                    </Badge>
                                </TD>
                                <TD className="text-text-muted">{r.entidade}</TD>
                                <TD className="max-w-md text-text">
                                    <Tooltip content={formatarDataHoraLonga(r.data)}>
                                        <span className="line-clamp-2 cursor-default text-sm">
                                            {r.descricao}
                                        </span>
                                    </Tooltip>
                                </TD>
                                <TD className="font-mono text-xs text-text-muted">{r.ip}</TD>
                            </TR>
                        ))}
                        {pageItems.length === 0 && (
                            <TR>
                                <TD className="py-8 text-center text-sm text-text-muted">
                                    Nenhum registo de auditoria encontrado.
                                </TD>
                            </TR>
                        )}
                    </TBody>
                </Table>

                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </Card>

            {/* Nota de rodapé */}
            <p className="text-xs text-text-muted">
                Os registos de auditoria não podem ser editados nem eliminados. Para
                exportar o histórico completo, usa o botão <strong>Exportar CSV</strong>{" "}
                sem filtros aplicados.
            </p>
        </div>
    );
}