"use client";

import { ADDRESS_RE, MEMO_RE, type PaymentAsset } from "./payments.ts";

/**
 * What the browser remembers about a send while money may be in flight, per
 * wallet. Written BEFORE the SDK is called and cleared only when the payment
 * is recorded, provably rejected, or provably never landed. A reload with a
 * memory only verifies; it never offers to send again. (Pattern from Pollar
 * Pass, lib/checkout.ts.) Storage can be missing (private window, blocked):
 * then the in-tab state still protects the send in progress.
 */

export interface InFlightPayment {
  memo: string;
  startedAt: string;
  toWallet: string;
  toLabel: string;
  amount: string;
  asset: PaymentAsset;
  note: string;
}

const key = (wallet: string) => `kosmovia:pago-en-curso:${wallet}`;

export function rememberPayment(wallet: string, p: InFlightPayment): void {
  try {
    localStorage.setItem(key(wallet), JSON.stringify(p));
  } catch {
    // No storage: the tab's own state still blocks a second send.
  }
}

export function recallPayment(wallet: string): InFlightPayment | null {
  try {
    const raw = localStorage.getItem(key(wallet));
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<InFlightPayment>;
    if (
      typeof p.memo !== "string" ||
      !MEMO_RE.test(p.memo) ||
      typeof p.startedAt !== "string" ||
      !Number.isFinite(Date.parse(p.startedAt)) ||
      typeof p.toWallet !== "string" ||
      !ADDRESS_RE.test(p.toWallet) ||
      typeof p.amount !== "string" ||
      (p.asset !== "XLM" && p.asset !== "USDC")
    ) {
      return null;
    }
    return {
      memo: p.memo,
      startedAt: p.startedAt,
      toWallet: p.toWallet,
      toLabel: typeof p.toLabel === "string" ? p.toLabel.slice(0, 60) : "",
      amount: p.amount,
      asset: p.asset,
      note: typeof p.note === "string" ? p.note.slice(0, 140) : "",
    };
  } catch {
    return null;
  }
}

export function forgetPayment(wallet: string): void {
  try {
    localStorage.removeItem(key(wallet));
  } catch {
    // Nothing to clear.
  }
}
