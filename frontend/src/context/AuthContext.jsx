import { useEffect, useState } from "react";
import AuthContext from "./auth-context";
import { api, apiPost } from "../lib/api";

function mapAccount(account) {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    phone: account.phone,
    role: account.role === "ADMIN" ? "Administrador" : "Usuário",
    marketId: account.marketId,
    mercado: account.market,
    stallId: account.stallId,
    banca: account.stall,
    produto: account.product,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api("/auth/me")
      .then((account) => {
        if (active) setUser(mapAccount(account));
      })
      .catch((error) => {
        if (active && error.message !== "Inicie sessão para continuar.") {
          console.error("Falha ao validar sessão:", error);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function login({ identifier, password }) {
    const account = await apiPost("/auth/login", { identifier, password });
    const authenticatedUser = mapAccount(account);
    setUser(authenticatedUser);
    return authenticatedUser;
  }

  async function register({ name, email, phone, password, marketId, stallId, product }) {
    const account = await apiPost("/auth/register", {
      name,
      email: email.trim() || null,
      phone: phone.trim() || null,
      password,
      marketId: Number(marketId),
      stallId: Number(stallId),
      product,
    });
    const authenticatedUser = mapAccount(account);
    setUser(authenticatedUser);
    return authenticatedUser;
  }

  async function updateUserProfile({ marketId, stallId, product }) {
    const account = await api("/auth/profile", {
      method: "PUT",
      body: JSON.stringify({
        marketId: Number(marketId),
        stallId: Number(stallId),
        product,
      }),
    });
    const updatedUser = mapAccount(account);
    setUser(updatedUser);
    return updatedUser;
  }

  async function logout() {
    try {
      await apiPost("/auth/logout", {});
    } finally {
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, updateUserProfile, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
