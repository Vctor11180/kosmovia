"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../lib/api-client.ts";
import { isApiBackend } from "../lib/backend.ts";
import type { PaymentWire } from "../lib/db/repo.ts";
import { useSupabase } from "./useSupabase.ts";

export type { PaymentWire };

/**
 * - `recorded`: verified on Horizon and saved.
 * - `pending`: not on Horizon yet, or it can't be told yet. Ask again; never resend.
 * - `never_landed`: searched past the attempt's deadline and it isn't there. Safe to send again.
 * - `failed`: the server refused it (e.g. the payment failed on the network).
 */
export type RecordResult =
  | { kind: "recorded"; payment: PaymentWire }
  | { kind: "pending" }
  | { kind: "never_landed"; error: string }
  | { kind: "failed"; error: string };

export interface RecordInput {
  hash?: string;
  memo: string;
  startedAt: string;
  note: string;
}

/**
 * The payments of the logged-in wallet (api backend) and `record`, one ask of
 * the server to verify a sent payment on Horizon (by hash, or by memo when no
 * hash came back) and save it.
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
    async (input: RecordInput): Promise<RecordResult> => {
      // No session yet (it is restored a moment after a reload): ask again later, never treat as "not sent".
      if (!enabled) return { kind: "pending" };
      const res = await apiRequest<{ payment?: PaymentWire; pending?: boolean }>("/api/payments", {
        method: "POST",
        body: { hash: input.hash, memo: input.memo, startedAt: input.startedAt, note: input.note },
      });
      if (res.ok && res.data.payment) {
        const payment = res.data.payment;
        setPayments((list) => [payment, ...list.filter((p) => p.id !== payment.id)]);
        return { kind: "recorded", payment };
      }
      if (res.ok) return { kind: "pending" };
      if (res.status === 404 && res.code === "not_found") return { kind: "never_landed", error: res.error };
      // A lost session, network trouble, rate limits or a Horizon outage say nothing about the payment.
      if (res.status === 0 || res.status === 401 || res.status === 429 || res.status >= 500) return { kind: "pending" };
      return { kind: "failed", error: res.error };
    },
    [enabled],
  );

  return { enabled, payments, loading, error, reload: load, record };
}
