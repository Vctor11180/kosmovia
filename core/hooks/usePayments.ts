"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../lib/api-client.ts";
import { isApiBackend } from "../lib/backend.ts";
import type { PaymentWire } from "../lib/db/repo.ts";
import { useSupabase } from "./useSupabase.ts";

export type { PaymentWire };

export type RecordResult = { ok: true; payment: PaymentWire } | { ok: false; error: string };

const RETRIES = 8;
const RETRY_MS = 2_000;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * The payments of the logged-in wallet (api backend) and `record`, which asks
 * the server to verify a sent payment on Horizon and save it. Horizon may take
 * a few seconds to see a fresh transaction, so a 202 is retried.
 */
export function usePayments() {
  const { session } = useSupabase();
  const enabled = isApiBackend() && session !== null;
  const [payments, setPayments] = useState<PaymentWire[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    const res = await apiRequest<{ payments: PaymentWire[] }>("/api/payments");
    setLoading(false);
    if (!res.ok) {
      setError(res.status === 503 ? res.error : "No se pudo cargar tu historial de pagos.");
      return;
    }
    setError(null);
    setPayments(res.data.payments);
  }, [enabled]);

  useEffect(() => {
    void load();
  }, [load]);

  const record = useCallback(
    async (hash: string, note: string): Promise<RecordResult> => {
      if (!enabled) return { ok: false, error: "El pago salió, pero no hay sesión para guardarlo en tu historial." };
      for (let i = 0; i < RETRIES; i++) {
        const res = await apiRequest<{ payment?: PaymentWire; pending?: boolean }>("/api/payments", {
          method: "POST",
          body: { hash, note },
        });
        if (res.ok && res.data.payment) {
          const payment = res.data.payment;
          setPayments((list) => [payment, ...list.filter((p) => p.id !== payment.id)]);
          return { ok: true, payment };
        }
        if (!res.ok) return { ok: false, error: res.error };
        await wait(RETRY_MS);
      }
      return { ok: false, error: "La red todavía no confirma el pago. Revisa tu historial en un momento." };
    },
    [enabled],
  );

  return { enabled, payments, loading, error, reload: load, record };
}
