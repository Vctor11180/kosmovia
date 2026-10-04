"use client";

import { useCallback, useEffect, useState } from "react";
import { LoginPanel } from "./LoginPanel";
import { SendPayment } from "./SendPayment";
import { PollarGate } from "../lib/pollar.tsx";
import { usePollarAuth } from "../hooks/usePollarAuth.ts";
import { usePayments } from "../hooks/usePayments.ts";
import { fetchBalances, type AccountBalances } from "../lib/pollar-horizon.ts";
import { checkAmount, trimAmount, type PaymentAsset } from "../lib/payments.ts";
import { USERNAME_RE } from "../lib/validation.ts";
import "./pagos.css";

/** What a payment link opens: log in if needed, then the send form already filled in. */
export function PayLink({ username, amount, asset }: { username: string; amount?: string; asset?: PaymentAsset }) {
  const valid = USERNAME_RE.test(username);
  const preset = amount ? checkAmount(amount, asset ?? "USDC") : null;
  const presetAmount = preset?.ok ? trimAmount(preset.amount) : undefined;
  return (
    <>
      <h1>{valid ? `Pagarle a @${username}` : "Link de pago"}</h1>
      {!valid ? (
        <p className="error">Este link de pago no es válido.</p>
      ) : (
        <PollarGate>
          <Inner username={username} amount={presetAmount} asset={asset} />
        </PollarGate>
      )}
    </>
  );
}

function Inner({ username, amount, asset }: { username: string; amount?: string; asset?: PaymentAsset }) {
  const { user } = usePollarAuth();
  const address = user?.address ?? null;
  const pay = usePayments();
  const [balances, setBalances] = useState<AccountBalances | null>(null);

  const refresh = useCallback(async () => {
    if (!address) return;
    try {
      setBalances(await fetchBalances(address));
    } catch {
      setBalances(null);
    }
  }, [address]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (!address) {
    return (
      <>
        <p className="muted">Entra con tu wallet para pagar. Todo corre en la red de prueba.</p>
        <LoginPanel />
      </>
    );
  }
  return (
    <SendPayment
      address={address}
      balances={balances}
      record={pay.record}
      onSent={() => void refresh()}
      preset={{ to: `@${username}`, amount, asset }}
    />
  );
}
