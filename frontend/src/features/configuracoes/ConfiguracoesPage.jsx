import { useState } from "react";
import {
    Save,
    RotateCcw,
    Settings,
    Coins,
    Bell,
    ShieldCheck,
    Check,
} from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { CONFIGURACOES } from "../../data/mock";

const abas = [
    { id: "geral", label: "Geral", icon: Settings },
    { id: "cobranca", label: "Cobrança", icon: Coins },
    { id: "notificacoes", label: "Notificações", icon: Bell },
    { id: "seguranca", label: "Segurança", icon: ShieldCheck },
];

export default function ConfiguracoesPage() {
    const [abaAtiva, setAbaAtiva] = useState("geral");
    const [config, setConfig] = useState(CONFIGURACOES);
    const [guardado, setGuardado] = useState(false);

    function atualizar(seccao, campo, valor) {
        setConfig((c) => ({
            ...c,
            [seccao]: { ...c[seccao], [campo]: valor },
        }));
        setGuardado(false);
    }

    function guardar() {
        console.log("Configurações guardadas:", config);
        setGuardado(true);
        setTimeout(() => setGuardado(false), 2500);
    }

    function restaurar() {
        setConfig(CONFIGURACOES);
        setGuardado(false);
    }

    return (
        <div className="space-y-6">
            {/* Cabeçalho */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-text">Configurações</h1>
                    <p className="mt-1 text-sm text-text-muted">
                        Definições gerais do sistema, regras de cobrança, notificações e
                        segurança.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="secondary" onClick={restaurar}>
                        <RotateCcw size={16} />
                        Restaurar
                    </Button>
                    <Button onClick={guardar}>
                        <Save size={16} />
                        Guardar alterações
                    </Button>
                </div>
            </div>

            {guardado && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    <Check size={16} />
                    Configurações guardadas com sucesso.
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
                {/* Menu lateral */}
                <Card className="h-fit p-2">
                    <nav className="space-y-1">
                        {abas.map(({ id, label, icon: Icon }) => {
                            const ativo = abaAtiva === id;
                            return (
                                <button
                                    key={id}
                                    onClick={() => setAbaAtiva(id)}
                                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${ativo
                                            ? "bg-primary/10 text-primary"
                                            : "text-text-muted hover:bg-slate-100 hover:text-text"
                                        }`}
                                >
                                    <Icon size={16} />
                                    {label}
                                </button>
                            );
                        })}
                    </nav>
                </Card>

                {/* Conteúdo */}
                <div className="space-y-6">
                    {abaAtiva === "geral" && (
                        <Card className="space-y-6 p-6">
                            <CabecalhoSecao
                                titulo="Informação do sistema"
                                descricao="Dados gerais apresentados em relatórios e documentos."
                            />
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <Campo label="Nome do sistema">
                                    <input
                                        type="text"
                                        value={config.geral.nomeSistema}
                                        onChange={(e) => atualizar("geral", "nomeSistema", e.target.value)}
                                        className={inputCls}
                                    />
                                </Campo>
                                <Campo label="Município">
                                    <input
                                        type="text"
                                        value={config.geral.municipio}
                                        onChange={(e) => atualizar("geral", "municipio", e.target.value)}
                                        className={inputCls}
                                    />
                                </Campo>
                                <Campo label="Província">
                                    <input
                                        type="text"
                                        value={config.geral.provincia}
                                        onChange={(e) => atualizar("geral", "provincia", e.target.value)}
                                        className={inputCls}
                                    />
                                </Campo>
                                <Campo label="Moeda">
                                    <select
                                        value={config.geral.moeda}
                                        onChange={(e) => atualizar("geral", "moeda", e.target.value)}
                                        className={inputCls}
                                    >
                                        <option value="MZN">Metical (MZN)</option>
                                        <option value="USD">Dólar (USD)</option>
                                        <option value="ZAR">Rand (ZAR)</option>
                                    </select>
                                </Campo>
                                <Campo label="Idioma">
                                    <select
                                        value={config.geral.idioma}
                                        onChange={(e) => atualizar("geral", "idioma", e.target.value)}
                                        className={inputCls}
                                    >
                                        <option value="Português (Moçambique)">Português (Moçambique)</option>
                                        <option value="English">English</option>
                                    </select>
                                </Campo>
                                <Campo label="Fuso horário">
                                    <select
                                        value={config.geral.fusoHorario}
                                        onChange={(e) =>
                                            atualizar("geral", "fusoHorario", e.target.value)
                                        }
                                        className={inputCls}
                                    >
                                        <option value="Africa/Maputo">Africa/Maputo (UTC+2)</option>
                                    </select>
                                </Campo>
                            </div>

                            <div className="border-t border-border pt-6">
                                <CabecalhoSecao
                                    titulo="Responsável"
                                    descricao="Contacto principal usado em notificações e relatórios."
                                />
                                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <Campo label="Nome do responsável">
                                        <input
                                            type="text"
                                            value={config.geral.nomeResponsavel}
                                            onChange={(e) =>
                                                atualizar("geral", "nomeResponsavel", e.target.value)
                                            }
                                            className={inputCls}
                                        />
                                    </Campo>
                                    <Campo label="Email de contacto">
                                        <input
                                            type="email"
                                            value={config.geral.emailContacto}
                                            onChange={(e) =>
                                                atualizar("geral", "emailContacto", e.target.value)
                                            }
                                            className={inputCls}
                                        />
                                    </Campo>
                                </div>
                            </div>
                        </Card>
                    )}

                    {abaAtiva === "cobranca" && (
                        <Card className="space-y-6 p-6">
                            <CabecalhoSecao
                                titulo="Regras de cobrança"
                                descricao="Parâmetros aplicados no momento de emissão de senhas."
                            />
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <Campo label="Moeda de cobrança">
                                    <select
                                        value={config.cobranca.moeda}
                                        onChange={(e) => atualizar("cobranca", "moeda", e.target.value)}
                                        className={inputCls}
                                    >
                                        <option value="MZN">Metical (MZN)</option>
                                    </select>
                                </Campo>
                                <Campo label="Numeração de senha">
                                    <select
                                        value={config.cobranca.numeracaoSenha}
                                        onChange={(e) =>
                                            atualizar("cobranca", "numeracaoSenha", e.target.value)
                                        }
                                        className={inputCls}
                                    >
                                        <option>Por mercado (ex.: MQ-0001)</option>
                                        <option>Sequencial global (ex.: 000001)</option>
                                        <option>Por comerciante (ex.: JT-001-D)</option>
                                    </select>
                                </Campo>
                                <Campo label="Arredondamento">
                                    <select
                                        value={config.cobranca.arredondamento}
                                        onChange={(e) =>
                                            atualizar("cobranca", "arredondamento", e.target.value)
                                        }
                                        className={inputCls}
                                    >
                                        <option>Nenhum</option>
                                        <option>Arredondar para 1 MT</option>
                                        <option>Arredondar para 5 MT</option>
                                        <option>Arredondar para 10 MT</option>
                                    </select>
                                </Campo>
                                <Campo label="Dias para bloqueio automático">
                                    <input
                                        type="number"
                                        min="1"
                                        value={config.cobranca.diasParaBloqueio}
                                        onChange={(e) =>
                                            atualizar("cobranca", "diasParaBloqueio", Number(e.target.value))
                                        }
                                        className={inputCls}
                                    />
                                    <p className="text-xs text-text-muted">
                                        Número de senhas vencidas até o comerciante ser bloqueado.
                                    </p>
                                </Campo>
                                <Campo label="Limite de senhas por operador / dia">
                                    <input
                                        type="number"
                                        min="1"
                                        value={config.cobranca.limiteSenhasPorOperador}
                                        onChange={(e) =>
                                            atualizar(
                                                "cobranca",
                                                "limiteSenhasPorOperador",
                                                Number(e.target.value)
                                            )
                                        }
                                        className={inputCls}
                                    />
                                </Campo>
                            </div>

                            <div className="space-y-3 border-t border-border pt-6">
                                <Toggle
                                    label="Emitir recibo automático após cobrança"
                                    descricao="O recibo é enviado para o email/SMS do comerciante."
                                    checked={config.cobranca.emitirReciboAutomatico}
                                    onChange={(v) =>
                                        atualizar("cobranca", "emitirReciboAutomatico", v)
                                    }
                                />
                                <Toggle
                                    label="Aplicar IVA às taxas"
                                    descricao="Adiciona a percentagem de IVA no total a pagar."
                                    checked={config.cobranca.ivaAtivo}
                                    onChange={(v) => atualizar("cobranca", "ivaAtivo", v)}
                                />
                                {config.cobranca.ivaAtivo && (
                                    <div className="ml-12 max-w-xs">
                                        <Campo label="Percentagem de IVA (%)">
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={config.cobranca.ivaPercentagem}
                                                onChange={(e) =>
                                                    atualizar(
                                                        "cobranca",
                                                        "ivaPercentagem",
                                                        Number(e.target.value)
                                                    )
                                                }
                                                className={inputCls}
                                            />
                                        </Campo>
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}

                    {abaAtiva === "notificacoes" && (
                        <Card className="space-y-6 p-6">
                            <CabecalhoSecao
                                titulo="Alertas e notificações"
                                descricao="Escolhe quais eventos disparam notificações ao utilizador."
                            />

                            <div className="space-y-3">
                                <Toggle
                                    label="Alerta de dívida"
                                    descricao="Notificar quando um comerciante tem senhas vencidas."
                                    checked={config.notificacoes.alertaDivida}
                                    onChange={(v) => atualizar("notificacoes", "alertaDivida", v)}
                                />
                                <Toggle
                                    label="Alerta de bloqueio"
                                    descricao="Notificar quando um comerciante é bloqueado."
                                    checked={config.notificacoes.alertaBloqueio}
                                    onChange={(v) =>
                                        atualizar("notificacoes", "alertaBloqueio", v)
                                    }
                                />
                                <Toggle
                                    label="Notificar quando é criada nova taxa"
                                    descricao="Envia email aos gestores de mercado."
                                    checked={config.notificacoes.notificarNovaTaxa}
                                    onChange={(v) =>
                                        atualizar("notificacoes", "notificarNovaTaxa", v)
                                    }
                                />
                                <Toggle
                                    label="Resumo diário por email"
                                    descricao="Envia um resumo das cobranças do dia para o responsável."
                                    checked={config.notificacoes.resumoDiarioEmail}
                                    onChange={(v) =>
                                        atualizar("notificacoes", "resumoDiarioEmail", v)
                                    }
                                />
                                {config.notificacoes.resumoDiarioEmail && (
                                    <div className="ml-12 max-w-sm">
                                        <Campo label="Email de destino do resumo">
                                            <input
                                                type="email"
                                                value={config.notificacoes.emailResumo}
                                                onChange={(e) =>
                                                    atualizar(
                                                        "notificacoes",
                                                        "emailResumo",
                                                        e.target.value
                                                    )
                                                }
                                                className={inputCls}
                                            />
                                        </Campo>
                                    </div>
                                )}
                                <Toggle
                                    label="Alertas por SMS"
                                    descricao="Requer crédito SMS no gateway. Taxa por mensagem."
                                    checked={config.notificacoes.alertaSMS}
                                    onChange={(v) => atualizar("notificacoes", "alertaSMS", v)}
                                />
                                {config.notificacoes.alertaSMS && (
                                    <div className="ml-12 max-w-sm">
                                        <Campo label="Número para alertas SMS">
                                            <input
                                                type="tel"
                                                value={config.notificacoes.numeroSMS}
                                                onChange={(e) =>
                                                    atualizar(
                                                        "notificacoes",
                                                        "numeroSMS",
                                                        e.target.value
                                                    )
                                                }
                                                className={inputCls}
                                            />
                                        </Campo>
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}

                    {abaAtiva === "seguranca" && (
                        <Card className="space-y-6 p-6">
                            <CabecalhoSecao
                                titulo="Segurança e sessões"
                                descricao="Políticas de acesso aplicadas a todos os utilizadores."
                            />

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <Campo label="Expiração de sessão (minutos)">
                                    <input
                                        type="number"
                                        min="5"
                                        value={config.seguranca.expiracaoSessaoMinutos}
                                        onChange={(e) =>
                                            atualizar(
                                                "seguranca",
                                                "expiracaoSessaoMinutos",
                                                Number(e.target.value)
                                            )
                                        }
                                        className={inputCls}
                                    />
                                </Campo>
                                <Campo label="Tentativas de login antes de bloquear">
                                    <input
                                        type="number"
                                        min="1"
                                        value={config.seguranca.maxTentativasLogin}
                                        onChange={(e) =>
                                            atualizar(
                                                "seguranca",
                                                "maxTentativasLogin",
                                                Number(e.target.value)
                                            )
                                        }
                                        className={inputCls}
                                    />
                                </Campo>
                            </div>

                            <div className="space-y-3 border-t border-border pt-6">
                                <h3 className="text-sm font-semibold text-text">
                                    Política de passwords
                                </h3>
                                <Campo label="Mínimo de caracteres">
                                    <input
                                        type="number"
                                        min="6"
                                        max="32"
                                        value={config.seguranca.minimoCaracteresPassword}
                                        onChange={(e) =>
                                            atualizar(
                                                "seguranca",
                                                "minimoCaracteresPassword",
                                                Number(e.target.value)
                                            )
                                        }
                                        className={inputCls + " max-w-[160px]"}
                                    />
                                </Campo>
                                <Toggle
                                    label="Exigir letras maiúsculas"
                                    checked={config.seguranca.exigirMaiusculas}
                                    onChange={(v) =>
                                        atualizar("seguranca", "exigirMaiusculas", v)
                                    }
                                />
                                <Toggle
                                    label="Exigir números"
                                    checked={config.seguranca.exigirNumeros}
                                    onChange={(v) => atualizar("seguranca", "exigirNumeros", v)}
                                />
                                <Toggle
                                    label="Exigir símbolos (!, @, #, …)"
                                    checked={config.seguranca.exigirSimbolos}
                                    onChange={(v) =>
                                        atualizar("seguranca", "exigirSimbolos", v)
                                    }
                                />
                            </div>

                            <div className="space-y-3 border-t border-border pt-6">
                                <h3 className="text-sm font-semibold text-text">Acesso</h3>
                                <Toggle
                                    label="Bloquear conta após tentativas falhadas"
                                    descricao="Impede novos logins até desbloqueio manual pelo administrador."
                                    checked={config.seguranca.bloquearAposTentativas}
                                    onChange={(v) =>
                                        atualizar("seguranca", "bloquearAposTentativas", v)
                                    }
                                />
                                <Toggle
                                    label="Autenticação de dois fatores (2FA)"
                                    descricao="Requer código temporário no login (mock)."
                                    checked={config.seguranca.autenticacaoDoisFatores}
                                    onChange={(v) =>
                                        atualizar("seguranca", "autenticacaoDoisFatores", v)
                                    }
                                />
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

/* Helpers */

const inputCls =
    "h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

function Campo({ label, children }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text">{label}</label>
            {children}
        </div>
    );
}

function CabecalhoSecao({ titulo, descricao }) {
    return (
        <div>
            <h2 className="text-base font-semibold text-text">{titulo}</h2>
            {descricao && (
                <p className="mt-1 text-sm text-text-muted">{descricao}</p>
            )}
        </div>
    );
}

function Toggle({ label, descricao, checked, onChange }) {
    return (
        <label className="flex cursor-pointer items-start gap-3">
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={`mt-0.5 flex h-5 w-9 items-center rounded-full p-0.5 transition ${checked ? "bg-primary" : "bg-slate-300"
                    }`}
            >
                <span
                    className={`h-4 w-4 rounded-full bg-white shadow transition ${checked ? "translate-x-4" : "translate-x-0"
                        }`}
                />
            </button>
            <span className="text-sm">
                <span className="block font-medium text-text">{label}</span>
                {descricao && (
                    <span className="block text-xs text-text-muted">{descricao}</span>
                )}
            </span>
        </label>
    );
}