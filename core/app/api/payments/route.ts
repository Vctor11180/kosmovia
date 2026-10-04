import { failure, handled, json, readJsonBody, requireGate } from "../../../lib/api-route.ts";
import { limitedResponse } from "../../../lib/api-limits.ts";
import * as repo from "../../../lib/db/repo.ts";
import { cleanNote, fetchTxOperations, pickPayment, TX_HASH_RE } from "../../../lib/payments.ts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/payments (api backend)
 *
 * The payments the session's wallet sent or received, newest first, with both
 * sides' public profiles. -> { payments: PaymentWire[] }
 */
export async function GET(request: Request): Promise<Response> {
  const g = requireGate(request);
  if (!g.ok) return g.response;
  const limited = limitedResponse("paymentRead", g.session.profileId);
  if (limited) return limited;
  return handled("GET /api/payments", async () => json({ payments: await repo.listPayments(g.session.wallet) }));
}

/**
 * POST /api/payments { hash, note? } (api backend)
 *
 * Records a payment the user just sent with Pollar. Nothing from the body is
 * trusted but the hash: the server reads the transaction on Horizon testnet
 * and records it only if it is one successful XLM/USDC payment whose sender is
 * the session's wallet, made in the last 24 hours.
 * -> 201 { payment } | 200 { payment } (already recorded) | 202 { pending } (Horizon hasn't seen it yet)
 */
export async function POST(request: Request): Promise<Response> {
  const g = requireGate(request);
  if (!g.ok) return g.response;
  const limited = limitedResponse("paymentRecord", g.session.profileId);
  if (limited) return limited;

  const body = await readJsonBody(request, 2_048);
  if (!body.ok) return body.response;
  const input = (body.value ?? {}) as { hash?: unknown; note?: unknown };
  const hash = typeof input.hash === "string" ? input.hash.trim().toLowerCase() : "";
  if (!TX_HASH_RE.test(hash)) return failure(400, "Falta el hash de la transacción.", "invalid_hash");
  const note = cleanNote(input.note);

  const lookup = await fetchTxOperations(hash);
  if ("error" in lookup) {
    console.error(`api.error route=POST /api/payments code=${lookup.error}`);
    return failure(502, "No pudimos consultar la red de Stellar. Intenta de nuevo en unos segundos.", "horizon_error");
  }
  if (!lookup.found) return json({ pending: true }, 202);

  const verified = pickPayment(lookup.ops, g.session.wallet);
  if (!verified.ok) return failure(verified.status, verified.error, verified.code);
  const p = verified.payment;

  return handled("POST /api/payments", async () => {
    const outcome = await repo.recordPayment({
      opId: p.opId,
      txHash: p.txHash,
      fromWallet: g.session.wallet,
      toWallet: p.to,
      asset: p.asset,
      amount: p.amount,
      note,
      registeredBy: g.session.profileId,
      paidAt: p.createdAt,
    });
    if (outcome.status === "conflict") return failure(409, "Ese pago ya está registrado.", "payment_exists");
    return json({ payment: outcome.payment }, outcome.status === "created" ? 201 : 200);
  });
}
