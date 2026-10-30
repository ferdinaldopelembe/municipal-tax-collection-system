import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, UserPlus } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { MERCADOS } from "../../data/mock";

const ZONAS = ["Zona A", "Zona B", "Zona C", "Zona D"];
const TURNOS = ["Manhã · 06h–14h", "Tarde · 14h–22h", "Noite · 22h–06h"];

const initialState = {
  nome: "",
  nuit: "",
  contacto: "",
  email: "",
  mercado: "",
  zona: "",
  turno: "",
};

export default function NovoFiscalPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function setField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function validate() {
    const e = {};

    if (!form.nome.trim()) e.nome = "O nome é obrigatório.";
    else if (form.nome.trim().length < 3)
      e.nome = "O nome deve ter pelo menos 3 caracteres.";

    if (!form.nuit.trim()) e.nuit = "O NUIT é obrigatório.";
    else if (!/^\d{9}$/.test(form.nuit.trim()))
      e.nuit = "O NUIT deve ter exactamente 9 dígitos.";

    if (!form.contacto.trim()) e.contacto = "O contacto é obrigatório.";
    else if (!/^\+258\s?\d{2}\s?\d{3}\s?\d{4}$/.test(form.contacto.trim()))
      e.contacto = "Formato esperado: +258 84 123 4567.";

    if (!form.email.trim()) e.email = "O e-mail é obrigatório.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      e.email = "Introduza um e-mail válido.";

    if (!form.mercado) e.mercado = "Seleccione o mercado.";
    if (!form.zona) e.zona = "Seleccione a zona.";
    if (!form.turno) e.turno = "Seleccione o turno.";

    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSubmitting(true);
    // Simula chamada à API (mock)
    await new Promise((r) => setTimeout(r, 400));

    const novo = {
      id: Date.now(),
      nome: form.nome.trim(),
      nuit: form.nuit.trim(),
      contacto: form.contacto.trim(),
      email: form.email.trim(),
      mercado: form.mercado,
      zona: form.zona,
      turno: form.turno,
      estado: "Activo",
    };

    // Guarda em memória para a lista (mock). Se a lista usar estado local,
    // passamos o novo fiscal via state de navegação ou sessionStorage.
    // Solução simples e robusta para mock: sessionStorage + evento.
    const chave = "proxima:novo-fiscal";
    sessionStorage.setItem(chave, JSON.stringify(novo));
    window.dispatchEvent(new Event("novo-fiscal"));

    setSubmitting(false);
    navigate("/fiscais");
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/fiscais"
            className="rounded-md p-2 text-text-muted hover:bg-slate-100 hover:text-text"
            title="Voltar"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-text">Novo fiscal</h1>
            <p className="mt-1 text-sm text-text-muted">
              Preencha os dados do fiscal para o registar no sistema.
            </p>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <Card className="p-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-text">
            <UserPlus size={16} />
            Dados pessoais
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Nome */}
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-text">
                Nome completo <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) => setField("nome", e.target.value)}
                placeholder="Ex.: Ernesto Mabote"
                className={`h-10 w-full rounded-lg border bg-white px-3 text-sm text-text placeholder:text-text-muted/70 focus:outline-none focus:ring-2 ${
                  errors.nome
                    ? "border-danger focus:ring-danger/20"
                    : "border-border focus:border-primary focus:ring-primary/20"
                }`}
              />
              {errors.nome && (
                <p className="mt-1 text-xs text-danger">{errors.nome}</p>
              )}
            </div>

            {/* NUIT */}
            <div>
              <label className="mb-1 block text-sm font-medium text-text">
                NUIT <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={9}
                value={form.nuit}
                onChange={(e) =>
                  setField("nuit", e.target.value.replace(/\D/g, ""))
                }
                placeholder="9 dígitos"
                className={`h-10 w-full rounded-lg border bg-white px-3 font-mono text-sm text-text placeholder:text-text-muted/70 focus:outline-none focus:ring-2 ${
                  errors.nuit
                    ? "border-danger focus:ring-danger/20"
                    : "border-border focus:border-primary focus:ring-primary/20"
                }`}
              />
              {errors.nuit && (
                <p className="mt-1 text-xs text-danger">{errors.nuit}</p>
              )}
            </div>

            {/* Contacto */}
            <div>
              <label className="mb-1 block text-sm font-medium text-text">
                Contacto <span className="text-danger">*</span>
              </label>
              <input
                type="tel"
                value={form.contacto}
                onChange={(e) => setField("contacto", e.target.value)}
                placeholder="+258 84 123 4567"
                className={`h-10 w-full rounded-lg border bg-white px-3 text-sm text-text placeholder:text-text-muted/70 focus:outline-none focus:ring-2 ${
                  errors.contacto
                    ? "border-danger focus:ring-danger/20"
                    : "border-border focus:border-primary focus:ring-primary/20"
                }`}
              />
              {errors.contacto && (
                <p className="mt-1 text-xs text-danger">{errors.contacto}</p>
              )}
            </div>

            {/* E-mail */}
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-text">
                E-mail <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="nome@proxima.mz"
                className={`h-10 w-full rounded-lg border bg-white px-3 text-sm text-text placeholder:text-text-muted/70 focus:outline-none focus:ring-2 ${
                  errors.email
                    ? "border-danger focus:ring-danger/20"
                    : "border-border focus:border-primary focus:ring-primary/20"
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-danger">{errors.email}</p>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-sm font-semibold text-text">
            Alocação no mercado
          </h2>

          <div className="grid gap-4 sm:grid-cols-3">
            {/* Mercado */}
            <div>
              <label className="mb-1 block text-sm font-medium text-text">
                Mercado <span className="text-danger">*</span>
              </label>
              <select
                value={form.mercado}
                onChange={(e) => setField("mercado", e.target.value)}
                className={`h-10 w-full rounded-lg border bg-white px-3 text-sm text-text focus:outline-none focus:ring-2 ${
                  errors.mercado
                    ? "border-danger focus:ring-danger/20"
                    : "border-border focus:border-primary focus:ring-primary/20"
                }`}
              >
                <option value="">Seleccione…</option>
                {MERCADOS.map((m) => (
                  <option key={m.id} value={m.nome}>
                    {m.nome}
                  </option>
                ))}
              </select>
              {errors.mercado && (
                <p className="mt-1 text-xs text-danger">{errors.mercado}</p>
              )}
            </div>

            {/* Zona */}
            <div>
              <label className="mb-1 block text-sm font-medium text-text">
                Zona <span className="text-danger">*</span>
              </label>
              <select
                value={form.zona}
                onChange={(e) => setField("zona", e.target.value)}
                className={`h-10 w-full rounded-lg border bg-white px-3 text-sm text-text focus:outline-none focus:ring-2 ${
                  errors.zona
                    ? "border-danger focus:ring-danger/20"
                    : "border-border focus:border-primary focus:ring-primary/20"
                }`}
              >
                <option value="">Seleccione…</option>
                {ZONAS.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
              {errors.zona && (
                <p className="mt-1 text-xs text-danger">{errors.zona}</p>
              )}
            </div>

            {/* Turno */}
            <div>
              <label className="mb-1 block text-sm font-medium text-text">
                Turno <span className="text-danger">*</span>
              </label>
              <select
                value={form.turno}
                onChange={(e) => setField("turno", e.target.value)}
                className={`h-10 w-full rounded-lg border bg-white px-3 text-sm text-text focus:outline-none focus:ring-2 ${
                  errors.turno
                    ? "border-danger focus:ring-danger/20"
                    : "border-border focus:border-primary focus:ring-primary/20"
                }`}
              >
                <option value="">Seleccione…</option>
                {TURNOS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {errors.turno && (
                <p className="mt-1 text-xs text-danger">{errors.turno}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Acções */}
        <div className="flex flex-wrap items-center justify-end gap-3">
          <Link to="/fiscais">
            <Button variant="secondary" type="button">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={submitting}>
            <Save size={16} />
            {submitting ? "A guardar…" : "Guardar fiscal"}
          </Button>
        </div>
      </form>
    </div>
  );
}