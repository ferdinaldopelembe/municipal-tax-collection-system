import { PAGAMENTOS } from "../../data/mock";

const STORAGE_KEY = "cobranca_beira_pagamentos";

export function getStoredPayments() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  const payments = JSON.parse(raw);
  if (!Array.isArray(payments)) {
    throw new Error("Os dados dos pagamentos guardados são inválidos.");
  }
  return payments;
}

export function getNextPaymentReference() {
  const payments = [...PAGAMENTOS, ...getStoredPayments()];
  const lastNumber = Math.max(
    0,
    ...payments.map((payment) =>
      Number.parseInt(payment.senha?.split("-").pop(), 10) || 0
    )
  );
  return `PAG-2026-${String(lastNumber + 1).padStart(6, "0")}`;
}

export function savePayment(payment) {
  const payments = getStoredPayments();
  const savedPayment = { ...payment, id: `local-${Date.now()}` };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...payments, savedPayment]));
  return savedPayment;
}
