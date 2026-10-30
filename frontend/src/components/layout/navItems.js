import {
  LayoutDashboard,
  Store,
  Users,
  Receipt,
  Ticket,
  CreditCard,
  ShieldCheck,
  BarChart3,
  History,
  Settings,
} from "lucide-react";

export const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/mercados", label: "Mercados", icon: Store },
  { to: "/comerciantes", label: "Comerciantes", icon: Users },
  { to: "/taxas", label: "Taxas", icon: Receipt },
  { to: "/senhas", label: "Senhas", icon: Ticket },
  { to: "/pagamentos", label: "Pagamentos", icon: CreditCard },
  { to: "/fiscais", label: "Fiscais", icon: ShieldCheck },
  { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { to: "/auditoria", label: "Auditoria", icon: History },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
];
