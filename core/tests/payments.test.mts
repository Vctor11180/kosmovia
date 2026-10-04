import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
// @ts-ignore: Node necesita la extensión .ts al importar; Next la resuelve sin ella.
import { checkAmount, cleanNote, fromStroops, pickPayment, sendErrorMessage, toStroops, trimAmount, PAYMENT_MAX_AGE_MS } from "../lib/payments.ts";
// @ts-ignore
import * as q from "../lib/db/sql.ts";
// @ts-ignore
import { USDC_ISSUER_TESTNET } from "../lib/pollar-config.ts";

const ME = "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7";
const YOU = "GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H";
const HASH = "a".repeat(64);
const NOW = Date.parse("2026-10-04T12:00:00Z");

const op = (over: Record<string, unknown> = {}) => ({
  id: "123456789",
  type: "payment",
  transaction_successful: true,
  transaction_hash: HASH,
  created_at: "2026-10-04T11:59:00Z",
  from: ME,
  to: YOU,
  asset_type: "credit_alphanum4",
  asset_code: "USDC",
  asset_issuer: USDC_ISSUER_TESTNET,
  amount: "5.0000000",
  ...over,
});

test("los montos se manejan como stroops, sin floats", () => {
  assert.equal(toStroops("1.5"), BigInt(15_000_000));
  assert.equal(toStroops("0.0000001"), BigInt(1));
  assert.equal(toStroops("1.12345678"), null);
  assert.equal(toStroops("-1"), null);
  assert.equal(toStroops("1e3"), null);
  assert.equal(fromStroops(BigInt(15_000_000)), "1.5000000");
  assert.equal(trimAmount("5.0000000"), "5");
  assert.equal(trimAmount("0.2500000"), "0.25");
});

test("checkAmount: coma decimal, mayor que 0, tope y saldo", () => {
  assert.deepEqual(checkAmount("2,5", "USDC"), { ok: true, amount: "2.5000000" });
  assert.equal(checkAmount("", "USDC").ok, false);
  assert.equal(checkAmount("0", "USDC").ok, false);
  assert.equal(checkAmount("abc", "XLM").ok, false);
  assert.equal(checkAmount("10000.0000001", "XLM").ok, false);
  assert.equal(checkAmount("10000", "XLM").ok, true);
  const short = checkAmount("6", "USDC", "5.0000000");
  assert.equal(short.ok, false);
  assert.match((short as { error: string }).error, /tienes 5 USDC/);
  assert.equal(checkAmount("5", "USDC", "5.0000000").ok, true);
});

test("cleanNote quita caracteres de control y recorta a 140", () => {
  assert.equal(cleanNote("  hola\u0000mundo  "), "hola mundo");
  assert.equal(cleanNote("   "), null);
  assert.equal(cleanNote(42), null);
  assert.equal(cleanNote("x".repeat(500))?.length, 140);
});

test("pickPayment acepta un pago de USDC o XLM de tu wallet", () => {
  const usdc = pickPayment([op()], ME, NOW);
  assert.ok(usdc.ok);
  assert.deepEqual(usdc.payment, {
    opId: "123456789",
    txHash: HASH,
    from: ME,
    to: YOU,
    asset: "USDC",
    amount: "5.0000000",
    createdAt: "2026-10-04T11:59:00.000Z",
  });
  const xlm = pickPayment([op({ asset_type: "native", asset_code: undefined, asset_issuer: undefined })], ME, NOW);
  assert.ok(xlm.ok && xlm.payment.asset === "XLM");
});

test("pickPayment rechaza lo que no se puede reclamar", () => {
  const code = (ops: unknown[], wallet = ME) => {
    const r = pickPayment(ops as never, wallet, NOW);
    return r.ok ? "ok" : r.code;
  };
  assert.equal(code([]), "not_a_payment");
  assert.equal(code([op({ type: "create_account" })]), "not_a_payment");
  assert.equal(code([op()], YOU), "not_your_payment");
  assert.equal(code([op({ transaction_successful: false })]), "tx_failed");
  assert.equal(code([op(), op({ id: "2" })]), "many_payments");
  assert.equal(code([op({ asset_issuer: YOU })]), "asset_not_supported");
  assert.equal(code([op({ asset_code: "EURC" })]), "asset_not_supported");
  assert.equal(code([op({ to: ME })]), "self_payment");
  assert.equal(code([op({ to: "not-an-address" })]), "bad_payment");
  assert.equal(code([op({ amount: "0.0000000" })]), "bad_payment");
  assert.equal(code([op({ created_at: new Date(NOW - PAYMENT_MAX_AGE_MS - 1000).toISOString() })]), "too_old");
  assert.equal(code([op({ id: "1; drop table" })]), "bad_payment");
});

test("los errores de envío salen en palabras simples", () => {
  assert.match(sendErrorMessage({ resultCode: "op_underfunded" }), /saldo suficiente/);
  assert.match(sendErrorMessage({ resultCode: "op_no_trust" }), /no puede recibir/);
  assert.match(sendErrorMessage({ resultCode: "op_no_destination" }), /no está activa/);
  assert.match(sendErrorMessage({ message: "User declined access" }), /Cancelaste/);
  assert.match(sendErrorMessage({}), /No se movió dinero/);
});

test("las consultas de pagos van parametrizadas", () => {
  const hostile = "x'; drop table payments; --";
  const ins = q.insertPayment({
    opId: hostile, txHash: hostile, fromWallet: hostile, toWallet: hostile, asset: "USDC",
    amount: "1.0000000", note: hostile, registeredBy: hostile, paidAt: "2026-10-04T00:00:00Z",
  });
  assert.ok(!ins.text.includes("drop table"));
  assert.match(ins.text, /on conflict \(op_id\) do nothing/);
  assert.equal(ins.values.length, 9);
  for (const query of [q.paymentByOpForSender(hostile, hostile), q.paymentsOfWallet(hostile, 50)]) {
    assert.ok(!query.text.includes("drop table"));
  }
});

test("0004_pagos.sql: un pago por operación y CHECKs de formato", () => {
  const sql = readFileSync(new URL("../db/migrations/0004_pagos.sql", import.meta.url), "utf8");
  assert.match(sql, /constraint payments_op_id_key unique \(op_id\)/);
  assert.match(sql, /payments_not_self check \(from_wallet <> to_wallet\)/);
  assert.match(sql, /asset in \('XLM', 'USDC'\)/);
  assert.match(sql, /amount > 0/);
  assert.match(sql, /char_length\(note\) between 1 and 140/);
});
