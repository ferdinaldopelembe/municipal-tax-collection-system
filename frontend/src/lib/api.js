export async function api(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`/api${path}`, {
    ...options,
    headers,
    credentials: "include",
  });
  if (response.status === 204) return null;

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      body?.detail || body?.message || "Não foi possível concluir o pedido."
    );
  }
  return body;
}

export function apiPost(path, body) {
  return api(path, { method: "POST", body: JSON.stringify(body) });
}
