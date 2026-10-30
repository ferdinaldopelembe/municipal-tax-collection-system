import useAuth from "../../context/useAuth";
import ComerciantePagamentoPage from "./ComerciantePagamentoPage";
import EmitirSenhaPage from "../senhas/EmitirSenhaPage";

export default function RegistarPagamentoPage() {
  const { user } = useAuth();
  return user?.role === "Administrador"
    ? <EmitirSenhaPage />
    : <ComerciantePagamentoPage />;
}
