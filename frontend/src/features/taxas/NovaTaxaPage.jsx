import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, X } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { MERCADOS, TIPOS_TAXA, TIPOS_PRODUTO } from "../../data/mock";

const estadoInicial = {
    nome: "",
    mercado: "",
    tipo: "",
    produto: "",
    valor: "",
    periodicidade: "Por dia",
    estado: "Activa",
    descricao: "",
};

const periodicidades = ["Por dia", "Por semana", "Por mês", "Por trimestre"];

export default function NovaTaxaPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState(estadoInicial);
    const [erros, setErros] = useState({});
    const [guardado, setGuardado] = useState(false);

    function set(campo, valor) {
        setForm((f) => ({ ...f, [campo]: valor }));
        setErros((e) => ({ ...e, [campo]: undefined }));
    }

    function validar() {
        const e = {};
        if (!form.nome.trim()) e.nome = "Indique o nome da taxa.";
        if (!form.mercado) e.mercado = "Seleccione o mercado.";
        if (!form.tipo) e.tipo = "Seleccione o tipo de taxa.";
        if (!form.produto) e.produto = "Seleccione o tipo de produto.";
        const valorNum = Number(form.valor);
        if (!form.valor || Number.isNaN(valorNum) || valorNum <= 0) {
            e.valor = "Introduza um valor válido superior a 0.";
        }
        if (!form.periodicidade) e.periodicidade = "Seleccione a periodicidade.";
        return e;
    }

    function submeter(ev) {
        ev.preventDefault();
        const e = validar();
        if (Object.keys(e).length) {
            setErros(e);
            return;
        }
        // Mock: guarda localmente e mostra confirmação
        console.log("Nova taxa:", form);
        setGuardado(true);
        setTimeout(() => navigate("/taxas"), 900);
    }

    return (
        <div className="space-y-6">
            {/* Cabeçalho */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate("/taxas")}
                        className="rounded-lg border border-border bg-white p-2 text-text-muted hover:bg-slate-100 hover:text-text"
                        title="Voltar"
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-semibold text-text">Nova taxa</h1>
                        <p className="mt-1 text-sm text-text-muted">
                            Configure uma nova taxa aplicável a um mercado e tipo de produto.
                        </p>
                    </div>
                </div>
            </div>

            {guardado && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    Taxa criada com sucesso. A redireccionar para a lista…
                </div>
            )}

            <form onSubmit={submeter} className="space-y-6">
                {/* Secção 1: Identificação */}
                <Card className="space-y-5 p-6">
                    <h2 className="text-base font-semibold text-text">
                        Identificação da taxa
                    </h2>

                    <Campo label="Nome da taxa" erro={erros.nome} obrigatorio>
                        <input
                            type="text"
                            value={form.nome}
                            onChange={(e) => set("nome", e.target.value)}
                            placeholder="Ex.: Taxa diária — Peixe"
                            className={inputCls(erros.nome)}
                        />
                    </Campo>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Campo label="Mercado" erro={erros.mercado} obrigatorio>
                            <select
                                value={form.mercado}
                                onChange={(e) => set("mercado", e.target.value)}
                                className={inputCls(erros.mercado)}
                            >
                                <option value="">Seleccione o mercado</option>
                                {MERCADOS.map((m) => (
                                    <option key={m.id} value={m.nome}>
                                        {m.nome}
                                    </option>
                                ))}
                            </select>
                        </Campo>

                        <Campo label="Tipo de produto" erro={erros.produto} obrigatorio>
                            <select
                                value={form.produto}
                                onChange={(e) => set("produto", e.target.value)}
                                className={inputCls(erros.produto)}
                            >
                                <option value="">Seleccione o produto</option>
                                {TIPOS_PRODUTO.map((p) => (
                                    <option key={p} value={p}>
                                        {p}
                                    </option>
                                ))}
                            </select>
                        </Campo>
                    </div>

                    <Campo label="Descrição (opcional)">
                        <textarea
                            rows={3}
                            value={form.descricao}
                            onChange={(e) => set("descricao", e.target.value)}
                            placeholder="Notas internas sobre esta taxa…"
                            className={inputCls() + " resize-none"}
                        />
                    </Campo>
                </Card>

                {/* Secção 2: Valores e periodicidade */}
                <Card className="space-y-5 p-6">
                    <h2 className="text-base font-semibold text-text">
                        Valor e periodicidade
                    </h2>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <Campo label="Tipo de taxa" erro={erros.tipo} obrigatorio>
                            <select
                                value={form.tipo}
                                onChange={(e) => {
                                    set("tipo", e.target.value);
                                    if (e.target.value === "Diária") set("periodicidade", "Por dia");
                                    if (e.target.value === "Semanal") set("periodicidade", "Por semana");
                                    if (e.target.value === "Mensal") set("periodicidade", "Por mês");
                                }}
                                className={inputCls(erros.tipo)}
                            >
                                <option value="">Seleccione o tipo</option>
                                {TIPOS_TAXA.map((t) => (
                                    <option key={t} value={t}>
                                        {t}
                                    </option>
                                ))}
                            </select>
                        </Campo>

                        <Campo label="Valor (MT)" erro={erros.valor} obrigatorio>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.valor}
                                onChange={(e) => set("valor", e.target.value)}
                                placeholder="Ex.: 50.00"
                                className={inputCls(erros.valor)}
                            />
                        </Campo>

                        <Campo label="Periodicidade" erro={erros.periodicidade} obrigatorio>
                            <select
                                value={form.periodicidade}
                                onChange={(e) => set("periodicidade", e.target.value)}
                                className={inputCls(erros.periodicidade)}
                            >
                                {periodicidades.map((p) => (
                                    <option key={p} value={p}>
                                        {p}
                                    </option>
                                ))}
                            </select>
                        </Campo>
                    </div>
                </Card>

                {/* Secção 3: Estado */}
                <Card className="space-y-5 p-6">
                    <h2 className="text-base font-semibold text-text">
                        Estado inicial
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        {["Activa", "Suspensa"].map((op) => {
                            const activo = form.estado === op;
                            return (
                                <button
                                    key={op}
                                    type="button"
                                    onClick={() => set("estado", op)}
                                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${activo
                                            ? "border-primary bg-primary/10 text-primary"
                                            : "border-border bg-white text-text-muted hover:bg-slate-50"
                                        }`}
                                >
                                    {op}
                                </button>
                            );
                        })}
                    </div>
                    <p className="text-xs text-text-muted">
                        As taxas suspensas não são cobradas até serem reactivadas.
                    </p>
                </Card>

                {/* Barra de acções */}
                <div className="flex flex-wrap items-center justify-end gap-3">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => navigate("/taxas")}
                    >
                        <X size={16} />
                        Cancelar
                    </Button>
                    <Button type="submit">
                        <Save size={16} />
                        Guardar taxa
                    </Button>
                </div>
            </form>
        </div>
    );
}

/* Helpers */

function Campo({ label, erro, obrigatorio, children }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text">
                {label}{" "}
                {obrigatorio && <span className="text-danger">*</span>}
            </label>
            {children}
            {erro && <p className="text-xs text-danger">{erro}</p>}
        </div>
    );
}

function inputCls(erro) {
    const base =
        "h-10 w-full rounded-lg border bg-white px-3 text-sm text-text focus:outline-none focus:ring-2";
    return erro
        ? `${base} border-danger focus:border-danger focus:ring-danger/20`
        : `${base} border-border focus:border-primary focus:ring-primary/20`;
}