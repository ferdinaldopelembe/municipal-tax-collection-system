import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Printer } from "lucide-react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import {
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "../../components/ui/Table";
import { api } from "../../lib/api";
import { exportReceiptPdf } from "../../utils/exportReceiptPdf";
import { mapApiPayment } from "./paymentView";

const fmtMT = (value) =>
  Number(value).toLocaleString("pt-MZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + " MT";

export default function ComerciantePagamentosPage() {
  const [pagamentos, setPagamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api("/payments")
      .then((items) => {
        if (active) setPagamentos(items.map(mapApiPayment));
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const totalPago = useMemo(
    () =>
      pagamentos
        .filter((payment) => payment.estado === "Pago")
        .reduce((total, payment) => total + Number(payment.valor), 0),
    [pagamentos]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text">Meus pagamentos</h1>
          <p className="mt-1 text-sm text-text-muted">
            Histórico dos pagamentos efectuados pela sua conta.
          </p>
        </div>
        <Link to="/pagamentos/novo">
          <Button>
            <Plus size={16} />
            Fazer pagamento
          </Button>
        </Link>
      </div>

      <Card className="p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
          Total pago
        </p>
        <p className="mt-2 text-xl font-semibold text-emerald-600">
          {fmtMT(totalPago)}
        </p>
      </Card>

      <Card className="overflow-hidden p-0">
        {error && <p className="p-4 text-sm text-danger">{error}</p>}
        {loading && <p className="p-4 text-sm text-text-muted">A carregar pagamentos…</p>}
        <Table>
          <THead>
            <TH>Referência</TH>
            <TH>Taxa</TH>
            <TH>Período</TH>
            <TH>Método</TH>
            <TH className="text-right">Valor</TH>
            <TH>Data</TH>
            <TH>Estado</TH>
            <TH className="text-right">Recibo</TH>
          </THead>
          <TBody>
            {pagamentos.map((payment) => (
              <TR key={payment.id}>
                <TD className="font-mono text-xs text-text">{payment.senha}</TD>
                <TD className="text-text">{payment.taxa}</TD>
                <TD className="text-text-muted">{payment.periodo}</TD>
                <TD className="text-text">{payment.metodo}</TD>
                <TD className="text-right font-medium text-text">
                  {fmtMT(payment.valor)}
                </TD>
                <TD className="text-text-muted">{payment.data}</TD>
                <TD>
                  <Badge variant={payment.estado === "Pago" ? "success" : "warning"}>
                    {payment.estado}
                  </Badge>
                </TD>
                <TD className="text-right">
                  <button
                    type="button"
                    className="rounded-md p-1.5 text-text-muted hover:bg-slate-100 hover:text-text disabled:opacity-40"
                    title="Imprimir recibo"
                    onClick={() => exportReceiptPdf(payment)}
                    disabled={payment.estado !== "Pago"}
                  >
                    <Printer size={16} />
                  </button>
                </TD>
              </TR>
            ))}
            {!loading && !error && pagamentos.length === 0 && (
              <TR>
                <TD colSpan={8} className="py-8 text-center text-sm text-text-muted">
                  Ainda não efectuou pagamentos.
                </TD>
              </TR>
            )}
          </TBody>
        </Table>
      </Card>
    </div>
  );
}
