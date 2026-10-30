/**
 * Abre uma janela de impressão com conteúdo formatado.
 * O utilizador pode escolher "Guardar como PDF" no diálogo do browser.
 *
 * @param {Object} opts
 * @param {string} opts.titulo       — Título do relatório
 * @param {string} opts.subtitulo    — Subtítulo (período, filtros…)
 * @param {Array<{label:string,value:string}>} opts.resumo — Bloco de KPIs
 * @param {Array<{title:string, columns:string[], rows:(string|number)[][]}>} opts.tabelas
 * @param {string} [opts.rodape]     — Texto de rodapé
 */
export function exportarPdf({ titulo, subtitulo, resumo = [], tabelas = [], rodape = "" }) {
  const agora = new Date().toLocaleString("pt-MZ");

  const resumoHtml = resumo.length
    ? `<section class="kpis">
        ${resumo
          .map(
            (k) => `
              <div class="kpi">
                <span class="kpi-label">${escapeHtml(k.label)}</span>
                <span class="kpi-value">${escapeHtml(k.value)}</span>
              </div>`
          )
          .join("")}
       </section>`
    : "";

  const tabelasHtml = tabelas
    .map(
      (t) => `
        <section class="bloco">
          <h2>${escapeHtml(t.title)}</h2>
          <table>
            <thead>
              <tr>${t.columns
                .map((c) => `<th>${escapeHtml(c)}</th>`)
                .join("")}</tr>
            </thead>
            <tbody>
              ${t.rows
                .map(
                  (r) =>
                    `<tr>${r
                      .map((cell) => `<td>${escapeHtml(String(cell ?? ""))}</td>`)
                      .join("")}</tr>`
                )
                .join("")}
            </tbody>
          </table>
        </section>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="pt-MZ">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(titulo)}</title>
<style>
  :root {
    --primary: #0d9488;
    --text: #0f172a;
    --muted: #64748b;
    --border: #e2e8f0;
  }
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: var(--text);
    margin: 0;
    padding: 32px 36px;
    font-size: 12px;
    line-height: 1.45;
  }
  header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    border-bottom: 2px solid var(--primary);
    padding-bottom: 12px;
    margin-bottom: 20px;
  }
  header h1 { font-size: 20px; margin: 0 0 4px 0; }
  header .subtitulo { color: var(--muted); font-size: 12px; }
  header .meta { text-align: right; color: var(--muted); font-size: 10px; }
  header .meta strong { color: var(--text); }

  .kpis {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    margin-bottom: 20px;
  }
  .kpi {
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .kpi-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--muted);
  }
  .kpi-value { font-size: 15px; font-weight: 600; }

  .bloco { margin-bottom: 22px; page-break-inside: avoid; }
  .bloco h2 {
    font-size: 13px;
    margin: 0 0 8px 0;
    color: var(--text);
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
  }
  thead th {
    background: #f8fafc;
    text-align: left;
    padding: 8px 10px;
    border-bottom: 1px solid var(--border);
    font-weight: 600;
    color: var(--text);
  }
  tbody td {
    padding: 7px 10px;
    border-bottom: 1px solid var(--border);
    vertical-align: top;
  }
  tbody tr:last-child td { border-bottom: none; }

  footer {
    margin-top: 28px;
    padding-top: 12px;
    border-top: 1px solid var(--border);
    font-size: 10px;
    color: var(--muted);
    display: flex;
    justify-content: space-between;
  }

  @media print {
    body { padding: 16mm 14mm; }
    .bloco { page-break-inside: avoid; }
  }
</style>
</head>
<body>
  <header>
    <div>
      <h1>${escapeHtml(titulo)}</h1>
      <div class="subtitulo">${escapeHtml(subtitulo)}</div>
    </div>
    <div class="meta">
      <div><strong>Emitido em</strong></div>
      <div>${escapeHtml(agora)}</div>
    </div>
  </header>

  ${resumoHtml}
  ${tabelasHtml}

  <footer>
    <span>${escapeHtml(rodape || "Sistema de Gestão de Mercados Informais")}</span>
    <span>Página 1</span>
  </footer>

  <script>
    window.onload = function () {
      setTimeout(function () { window.print(); }, 150);
    };
  </script>
</body>
</html>`;

  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) {
    alert(
      "O navegador bloqueou a nova janela. Permita pop-ups para este site e tente novamente."
    );
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}