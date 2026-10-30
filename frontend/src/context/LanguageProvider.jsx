import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { LANGUAGES } from "./languages";
import LanguageContext from "./languageContext";

const STORAGE_KEY = "cobranca_beira_language";

const translations = {
  "Dashboard": "Dashboard",
  "Mercados": "Markets",
  "Comerciantes": "Traders",
  "Taxas": "Fees",
  "Senhas": "Tickets",
  "Pagamentos": "Payments",
  "Fiscais": "Inspectors",
  "Relatórios": "Reports",
  "Auditoria": "Audit",
  "Configurações": "Settings",
  "Pesquisar…": "Search…",
  "Administrador": "Administrator",
  "Terminar sessão": "Sign out",
  "Geral": "General",
  "Cobrança": "Collection",
  "Notificações": "Notifications",
  "Segurança": "Security",
  "Definições gerais do sistema, regras de cobrança, notificações e segurança.":
    "General system settings, collection rules, notifications, and security.",
  "Restaurar": "Restore",
  "Guardar alterações": "Save changes",
  "Configurações guardadas com sucesso.": "Settings saved successfully.",
  "Informação do sistema": "System information",
  "Dados gerais apresentados em relatórios e documentos.":
    "General information shown in reports and documents.",
  "Nome do sistema": "System name",
  "Município": "Municipality",
  "Província": "Province",
  "Moeda": "Currency",
  "Metical (MZN)": "Metical (MZN)",
  "Dólar (USD)": "US dollar (USD)",
  "Rand (ZAR)": "Rand (ZAR)",
  "Idioma": "Language",
  "Fuso horário": "Time zone",
  "Responsável": "Administrator",
  "Contacto principal usado em notificações e relatórios.":
    "Main contact used for notifications and reports.",
  "Nome do responsável": "Administrator name",
  "Email de contacto": "Contact email",
  "Regras de cobrança": "Collection rules",
  "Parâmetros aplicados no momento de emissão de senhas.":
    "Settings applied when tickets are issued.",
  "Moeda de cobrança": "Collection currency",
  "Numeração de senha": "Ticket numbering",
  "Por mercado (ex.: MQ-0001)": "By market (e.g. MQ-0001)",
  "Sequencial global (ex.: 000001)": "Global sequence (e.g. 000001)",
  "Por comerciante (ex.: JT-001-D)": "By trader (e.g. JT-001-D)",
  "Arredondamento": "Rounding",
  "Nenhum": "None",
  "Arredondar para 1 MT": "Round to 1 MT",
  "Arredondar para 5 MT": "Round to 5 MT",
  "Arredondar para 10 MT": "Round to 10 MT",
  "Dias para bloqueio automático": "Days until automatic blocking",
  "Número de senhas vencidas até o comerciante ser bloqueado.":
    "Number of overdue tickets before a trader is blocked.",
  "Limite de senhas por operador / dia": "Ticket limit per operator / day",
  "Emitir recibo automático após cobrança": "Issue receipt automatically after collection",
  "O recibo é enviado para o email/SMS do comerciante.":
    "The receipt is sent to the trader by email/SMS.",
  "Aplicar IVA às taxas": "Apply VAT to fees",
  "Adiciona a percentagem de IVA no total a pagar.":
    "Adds the VAT percentage to the total due.",
  "Percentagem de IVA (%)": "VAT percentage (%)",
  "Alertas e notificações": "Alerts and notifications",
  "Escolhe quais eventos disparam notificações ao utilizador.":
    "Choose which events trigger user notifications.",
  "Alerta de dívida": "Debt alert",
  "Notificar quando um comerciante tem senhas vencidas.":
    "Notify when a trader has overdue tickets.",
  "Alerta de bloqueio": "Blocking alert",
  "Notificar quando um comerciante é bloqueado.":
    "Notify when a trader is blocked.",
  "Notificar quando é criada nova taxa": "Notify when a new fee is created",
  "Envia email aos gestores de mercado.":
    "Sends an email to market managers.",
  "Resumo diário por email": "Daily email summary",
  "Envia um resumo das cobranças do dia para o responsável.":
    "Sends the administrator a summary of the day's collections.",
  "Email de destino do resumo": "Summary recipient email",
  "Alertas por SMS": "SMS alerts",
  "Requer crédito SMS no gateway. Taxa por mensagem.":
    "Requires SMS credit in the gateway. A fee applies per message.",
  "Número para alertas SMS": "Number for SMS alerts",
  "Segurança e sessões": "Security and sessions",
  "Políticas de acesso aplicadas a todos os utilizadores.":
    "Access policies applied to all users.",
  "Expiração de sessão (minutos)": "Session expiration (minutes)",
  "Tentativas de login antes de bloquear": "Login attempts before blocking",
  "Política de passwords": "Password policy",
  "Mínimo de caracteres": "Minimum characters",
  "Exigir letras maiúsculas": "Require uppercase letters",
  "Exigir números": "Require numbers",
  "Exigir símbolos (!, @, #, …)": "Require symbols (!, @, #, …)",
  "Acesso": "Access",
  "Bloquear conta após tentativas falhadas": "Block account after failed attempts",
  "Impede novos logins até desbloqueio manual pelo administrador.":
    "Prevents new logins until an administrator manually unlocks the account.",
  "Autenticação de dois fatores (2FA)": "Two-factor authentication (2FA)",
  "Requer código temporário no login (mock).":
    "Requires a temporary code at login (mock).",
};

export default function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const savedLanguage = window.localStorage.getItem(STORAGE_KEY);
    return Object.values(LANGUAGES).includes(savedLanguage)
      ? savedLanguage
      : LANGUAGES.portuguese;
  });

  const setLanguage = useCallback((nextLanguage) => {
    if (!Object.values(LANGUAGES).includes(nextLanguage)) {
      throw new Error(`Idioma não suportado: ${nextLanguage}`);
    }

    window.localStorage.setItem(STORAGE_KEY, nextLanguage);
    setLanguageState(nextLanguage);
  }, []);

  useEffect(() => {
    document.documentElement.lang =
      language === LANGUAGES.english ? "en" : "pt-MZ";
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (text) =>
        language === LANGUAGES.english ? translations[text] ?? text : text,
    }),
    [language, setLanguage],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
