export async function api(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response;
  try {
    response = await fetch(`/api${path}`, {
      ...options,
      headers,
      credentials: "include",
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        "Não foi possível ligar à API. Confirme se o backend está em execução na porta 8080.",
        { cause: error }
      );
    }
    throw error;
  }
  if (response.status === 204) return null;

  const responseText = await response.text();
  let body = null;
  if (responseText) {
    try {
      body = JSON.parse(responseText);
    } catch {
      if (response.ok) {
        throw new Error("A API respondeu num formato inesperado. Verifique os logs do backend.");
      }
    }
  }
  if (!response.ok) {
    throw new Error(
      body?.detail
      || body?.message
      || `A API rejeitou o pedido (HTTP ${response.status}). Consulte os logs do backend.`
    );
  }
  return body;
}

export function apiPost(path, body) {
  return api(path, { method: "POST", body: JSON.stringify(body) });
}

export function apiPut(path, body) {
  return api(path, { method: "PUT", body: JSON.stringify(body) });
}

export function apiPatch(path, body) {
  return api(path, { method: "PATCH", body: JSON.stringify(body) });
}
