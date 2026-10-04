"use client";

import { Avatar } from "./Avatar";
import { shortAddress } from "../lib/pollar-horizon.ts";
import { explorerTxUrl, trimAmount } from "../lib/payments.ts";
import type { PaymentWire } from "../hooks/usePayments.ts";

const fecha = new Intl.DateTimeFormat("es-BO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/** The payments the wallet sent and received, with who was on the other side. */
export function PaymentHistory({
  address,
  payments,
  loading,
  error,
}: {
  address: string;
  payments: PaymentWire[];
  loading: boolean;
  error: string | null;
}) {
  return (
    <section className="card pay-card" aria-label="Historial de pagos">
      <h2>Historial</h2>
      {error ? (
        <p className="field-hint error" role="alert">
          {error}
        </p>
      ) : null}
      {!error && loading && payments.length === 0 ? <p className="muted">Cargando…</p> : null}
      {!error && !loading && payments.length === 0 ? (
        <p className="muted">Todavía no enviaste ni recibiste pagos.</p>
      ) : null}
      {payments.length > 0 ? (
        <ul className="pay-list">
          {payments.map((p) => {
            const sent = p.from_wallet === address;
            const other = sent ? p.to_profile : p.from_profile;
            const otherWallet = sent ? p.to_wallet : p.from_wallet;
            const who = other ? `@${other.username}` : shortAddress(otherWallet);
            return (
              <li key={p.id} className="pay-row">
                {other ? (
                  <Avatar seed={other.avatar_seed || otherWallet} style={other.avatar_style} size={40} username={other.username} />
                ) : (
                  <span className="pay-row-blank" aria-hidden="true">
                    G
                  </span>
                )}
                <div className="pay-row-main">
                  <p className="pay-row-title">
                    {sent ? "Enviaste a " : "Recibiste de "}
                    <strong>{who}</strong>
                  </p>
                  {p.note ? <p className="muted pay-row-note">{p.note}</p> : null}
                  <p className="muted pay-row-meta">
                    <time dateTime={p.paid_at}>{fecha.format(new Date(p.paid_at))}</time> ·{" "}
                    <a href={explorerTxUrl(p.tx_hash)} target="_blank" rel="noreferrer">
                      Ver en la red
                    </a>
                  </p>
                </div>
                <p className="pay-row-amount" data-dir={sent ? "out" : "in"}>
                  <span className="visually-hidden">{sent ? "Enviado: " : "Recibido: "}</span>
                  {sent ? "−" : "+"}
                  {trimAmount(p.amount)} {p.asset}
                </p>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
