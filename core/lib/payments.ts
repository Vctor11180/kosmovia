import { HORIZON_URL, USDC_CODE, USDC_ISSUER_TESTNET } from "./pollar-config.ts";

/**
 * Payments between Kosmovia users (stage C, testnet only). Pure helpers shared
 * by the client (validation before sending) and the server (checking on
 * Horizon that a payment really happened before it is recorded). Amounts are
 * decimal strings with up to 7 places and are compared as integer stroops
 * (BigInt): no float ever touches an amount.
 */

export type PaymentAsset = "XLM" | "USDC";
export const PAYMENT_ASSETS: readonly PaymentAsset[] = ["USDC", "XLM"];

/** Per-payment cap while we are on testnet: big enough to demo, small enough to catch typos. */
export const MAX_PAYMENT: Record<PaymentAsset, string> = { XLM: "10000", USDC: "10000" };

export const NOTE_MAX = 140;
/** A payment older than this can't be recorded: only fresh sends from the app. */
export const PAYMENT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export const TX_HASH_RE = /^[0-9a-f]{64}$/;
export const ADDRESS_RE = /^G[A-Z2-7]{55}$/;
const AMOUNT_RE = /^(\d{1,12})(?:\.(\d{1,7}))?$/;

const STROOPS = BigInt(10_000_000);
const ZERO = BigInt(0);

/** "1.5" -> 15000000 stroops. Null when it isn't a plain decimal with up to 7 places. */
export function toStroops(value: string): bigint | null {
  const match = AMOUNT_RE.exec(value);
  if (!match) return null;
  const [, whole, frac = ""] = match;
  return BigInt(whole) * STROOPS + BigInt(frac.padEnd(7, "0"));
}

/** 15000000 stroops -> "1.5000000" (Horizon's format). */
export function fromStroops(stroops: bigint): string {
  const whole = stroops / STROOPS;
  const frac = (stroops % STROOPS).toString().padStart(7, "0");
  return `${whole}.${frac}`;
}

export type AmountCheck = { ok: true; amount: string } | { ok: false; error: string };

/**
 * What the user typed -> the amount to send. Accepts a comma as the decimal
 * separator ("2,5"). Checks > 0, the per-payment cap and, when known, the
 * balance. Returns the amount normalized to 7 places.
 */
export function checkAmount(input: string, asset: PaymentAsset, balance?: string | null): AmountCheck {
  const raw = input.trim().replace(",", ".");
  if (raw === "") return { ok: false, error: "Escribe un monto." };
  const stroops = toStroops(raw);
  if (stroops === null) return { ok: false, error: "Usa solo números, con hasta 7 decimales." };
  if (stroops <= ZERO) return { ok: false, error: "El monto tiene que ser mayor que 0." };
  const max = toStroops(MAX_PAYMENT[asset]) as bigint;
  if (stroops > max) return { ok: false, error: `En la red de prueba el máximo por envío es ${MAX_PAYMENT[asset]} ${asset}.` };
  if (balance != null) {
    const have = toStroops(balance);
    if (have !== null && stroops > have) return { ok: false, error: `No te alcanza: tienes ${trimAmount(balance)} ${asset}.` };
  }
  return { ok: true, amount: fromStroops(stroops) };
}

/** "5.0000000" -> "5", "0.2500000" -> "0.25". */
export function trimAmount(value: string): string {
  return value.includes(".") ? value.replace(/\.?0+$/, "") : value;
}

/** The private note: trimmed, no control characters, capped. Empty -> null. */
export function cleanNote(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const note = raw.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, NOTE_MAX);
  return note === "" ? null : note;
}

/** The asset in the shape Pollar's sendPayment expects. */
export function pollarAsset(asset: PaymentAsset) {
  return asset === "XLM"
    ? ({ type: "native" } as const)
    : ({ type: "credit_alphanum4", code: USDC_CODE, issuer: USDC_ISSUER_TESTNET } as const);
}

// ------------------------------------------------------- Horizon verification

/** The fields of a Horizon payment operation we read. */
export interface HorizonOperation {
  id: string;
  type: string;
  transaction_successful?: boolean;
  transaction_hash: string;
  created_at: string;
  from?: string;
  to?: string;
  asset_type?: string;
  asset_code?: string;
  asset_issuer?: string;
  amount?: string;
}

export interface VerifiedPayment {
  opId: string;
  txHash: string;
  from: string;
  to: string;
  asset: PaymentAsset;
  amount: string;
  createdAt: string;
}

export type Verification =
  | { ok: true; payment: VerifiedPayment }
  | { ok: false; status: number; code: string; error: string };

function assetOf(op: HorizonOperation): PaymentAsset | null {
  if (op.asset_type === "native") return "XLM";
  if (op.asset_code === USDC_CODE && op.asset_issuer === USDC_ISSUER_TESTNET) return "USDC";
  return null;
}

/**
 * Picks the one payment of `wallet` out of a transaction's operations. The
 * sender is the operation's `from` as Horizon reports it, so a payment someone
 * else made can't be claimed. Exactly one XLM/USDC payment is required.
 */
export function pickPayment(ops: HorizonOperation[], wallet: string, now = Date.now()): Verification {
  const payments = ops.filter((op) => op.type === "payment");
  if (payments.length === 0) return { ok: false, status: 422, code: "not_a_payment", error: "Esa transacción no es un pago." };
  if (payments.some((op) => op.transaction_successful === false)) {
    return { ok: false, status: 422, code: "tx_failed", error: "Ese pago falló en la red." };
  }
  const mine = payments.filter((op) => op.from === wallet);
  if (mine.length === 0) return { ok: false, status: 403, code: "not_your_payment", error: "Ese pago no salió de tu wallet." };
  if (mine.length > 1) return { ok: false, status: 422, code: "many_payments", error: "Solo se registran envíos de un pago." };
  const op = mine[0];
  const asset = assetOf(op);
  if (!asset) return { ok: false, status: 422, code: "asset_not_supported", error: "Solo se registran pagos en XLM o USDC." };
  const stroops = op.amount ? toStroops(op.amount) : null;
  if (!op.to || !ADDRESS_RE.test(op.to) || stroops === null || stroops <= ZERO) {
    return { ok: false, status: 422, code: "bad_payment", error: "No pudimos leer ese pago." };
  }
  if (op.to === wallet) return { ok: false, status: 422, code: "self_payment", error: "No se registran pagos a ti mismo." };
  const at = Date.parse(op.created_at);
  if (!Number.isFinite(at) || now - at > PAYMENT_MAX_AGE_MS) {
    return { ok: false, status: 422, code: "too_old", error: "Ese pago es de hace más de 24 horas." };
  }
  if (!TX_HASH_RE.test(op.transaction_hash) || !/^\d{1,20}$/.test(op.id)) {
    return { ok: false, status: 422, code: "bad_payment", error: "No pudimos leer ese pago." };
  }
  return {
    ok: true,
    payment: {
      opId: op.id,
      txHash: op.transaction_hash,
      from: wallet,
      to: op.to,
      asset,
      amount: fromStroops(stroops),
      createdAt: new Date(at).toISOString(),
    },
  };
}

export type HorizonLookup =
  | { found: true; ops: HorizonOperation[] }
  | { found: false }
  | { error: string };

/**
 * The operations of a transaction on Horizon testnet. A 404 means it isn't
 * ingested yet (or doesn't exist): the client retries for a few seconds.
 */
export async function fetchTxOperations(
  hash: string,
  fetchImpl: typeof fetch = fetch,
): Promise<HorizonLookup> {
  try {
    const res = await fetchImpl(`${HORIZON_URL}/transactions/${hash}/operations?limit=20`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    if (res.status === 404) return { found: false };
    if (!res.ok) return { error: `horizon_${res.status}` };
    const body = (await res.json()) as { _embedded?: { records?: HorizonOperation[] } };
    return { found: true, ops: body._embedded?.records ?? [] };
  } catch {
    return { error: "horizon_unreachable" };
  }
}

export function explorerTxUrl(hash: string): string {
  return `https://stellar.expert/explorer/testnet/tx/${hash}`;
}

// ------------------------------------------------------------ send errors

/**
 * Pollar's error outcome -> a sentence the user understands. Stellar result
 * codes first (they are the most precise), then the wallet's own messages.
 */
export function sendErrorMessage(outcome: { resultCode?: string; code?: string; details?: string; message?: string }): string {
  const text = [outcome.resultCode, outcome.code, outcome.details, outcome.message].filter(Boolean).join(" ");
  if (/op_underfunded|insufficient|underfunded/i.test(text)) return "No tienes saldo suficiente para este envío.";
  if (/op_no_trust|no_trust|trustline/i.test(text)) return "Esa persona todavía no puede recibir ese activo.";
  if (/op_no_destination|no_destination/i.test(text)) return "Esa wallet todavía no está activa en la red de prueba.";
  if (/op_line_full/i.test(text)) return "Esa persona ya no puede recibir más de ese activo.";
  if (/tx_bad_seq/i.test(text)) return "La red estaba ocupada. Intenta de nuevo.";
  if (/reject|denied|declined|cancel/i.test(text)) return "Cancelaste la firma: no se envió nada.";
  return "No se pudo enviar el pago. No se movió dinero; intenta de nuevo.";
}
