"use client";

import { useEffect, useId, useMemo, useState } from "react";
import qrcode from "qrcode-generator";
import { PAYMENT_ASSETS, checkAmount, trimAmount, type PaymentAsset } from "../lib/payments.ts";

/** The payment link of a user: /pagar/<username>?monto=5&activo=USDC. */
export function paymentLink(origin: string, username: string, amount?: string, asset?: PaymentAsset): string {
  const url = new URL(`/pagar/${encodeURIComponent(username)}`, origin);
  if (amount) url.searchParams.set("monto", amount);
  if (asset && amount) url.searchParams.set("activo", asset);
  return url.toString();
}

/** Recibir: your payment link and its QR, optionally with an amount. */
export function ReceivePayment({ username }: { username: string | null }) {
  const amountId = useId();
  const [origin, setOrigin] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [asset, setAsset] = useState<PaymentAsset>("USDC");
  const [copied, setCopied] = useState(false);

  useEffect(() => setOrigin(window.location.origin), []);

  const check = amount.trim() ? checkAmount(amount, asset) : null;
  const link = origin && username ? paymentLink(origin, username, check?.ok ? trimAmount(check.amount) : undefined, asset) : null;

  async function copy() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  if (!username) {
    return (
      <section className="card pay-card" aria-label="Recibir">
        <h2>Recibir</h2>
        <p className="muted">Crea tu perfil para tener un link de cobro con tu @usuario.</p>
      </section>
    );
  }

  return (
    <section className="card pay-card" aria-label="Recibir">
      <h2>Recibir</h2>
      <p className="muted">Comparte tu link o tu QR: quien lo abra te paga a @{username}.</p>
      <div className="pay-receive">
        {link ? <Qr value={link} label={`QR para pagarle a @${username}`} /> : <div className="pay-qr" />}
        <div className="pay-receive-side">
          <div className="field">
            <label htmlFor={amountId}>Monto (opcional)</label>
            <div className="pay-receive-amount">
              <input
                id={amountId}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder="Lo elige quien paga"
                value={amount}
                aria-invalid={check !== null && !check.ok}
                onChange={(e) => setAmount(e.target.value)}
              />
              <select aria-label="Activo" value={asset} onChange={(e) => setAsset(e.target.value as PaymentAsset)}>
                {PAYMENT_ASSETS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            {check && !check.ok ? <p className="field-hint error">{check.error}</p> : null}
          </div>
          <code className="pay-link">{link ?? "…"}</code>
          <div className="form-actions">
            <button type="button" className="btn btn-primary" onClick={copy} disabled={!link}>
              {copied ? "Copiado" : "Copiar link"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/** A QR drawn as React rects (no innerHTML), in the app's colors with the light quiet zone scanners need. */
function Qr({ value, label }: { value: string; label: string }) {
  const { size, cells } = useMemo(() => {
    const qr = qrcode(0, "M");
    qr.addData(value);
    qr.make();
    const n = qr.getModuleCount();
    const dark: [number, number][] = [];
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) dark.push([c, r]);
    return { size: n, cells: dark };
  }, [value]);
  const margin = 4;
  const total = size + margin * 2;
  return (
    <svg className="pay-qr" viewBox={`0 0 ${total} ${total}`} role="img" aria-label={label} shapeRendering="crispEdges">
      <rect width={total} height={total} fill="#F2FBFA" />
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x + margin} y={y + margin} width={1} height={1} fill="#061314" />
      ))}
    </svg>
  );
}
