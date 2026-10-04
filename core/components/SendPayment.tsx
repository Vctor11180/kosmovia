"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { usePollar } from "@pollar/react";
import { Avatar } from "./Avatar";
import { apiRequest } from "../lib/api-client.ts";
import { isApiBackend } from "../lib/backend.ts";
import type { ProfileRow } from "../lib/mappers.ts";
import { fetchBalances, shortAddress, type AccountBalances } from "../lib/pollar-horizon.ts";
import {
  ADDRESS_RE,
  NOTE_MAX,
  PAYMENT_ASSETS,
  checkAmount,
  explorerTxUrl,
  pollarAsset,
  sendErrorMessage,
  trimAmount,
  type PaymentAsset,
} from "../lib/payments.ts";
import { USERNAME_RE } from "../lib/validation.ts";
import type { RecordResult } from "../hooks/usePayments.ts";

/** Who the money goes to: a Kosmovia profile or a bare Stellar address. */
type Recipient =
  | { kind: "profile"; wallet: string; username: string; displayName: string; avatarSeed: string | null; avatarStyle: string | null }
  | { kind: "address"; wallet: string };

type Lookup =
  | { step: "idle" }
  | { step: "searching" }
  | { step: "found"; recipient: Recipient }
  | { step: "error"; message: string };

type Stage =
  | { step: "form" }
  | { step: "checking" }
  | { step: "review"; recipient: Recipient; amount: string }
  | { step: "sending"; recipient: Recipient; amount: string }
  | { step: "done"; recipient: Recipient; amount: string; hash: string; warning: string | null };

export interface SendPaymentProps {
  /** The sender's wallet (the session's). */
  address: string;
  balances: AccountBalances | null;
  record: (hash: string, note: string) => Promise<RecordResult>;
  /** Called after a payment leaves the wallet, to refresh balances. */
  onSent?: () => void;
  /** Prefill from a payment link (/pagar/@usuario?monto=5&activo=USDC). */
  preset?: { to?: string; amount?: string; asset?: PaymentAsset };
}

/** "@Nova_Pilot" -> "nova_pilot"; a G-address is kept as is (upper case). */
function normalizeRecipient(raw: string): { kind: "address"; wallet: string } | { kind: "username"; username: string } | null {
  const value = raw.trim();
  if (ADDRESS_RE.test(value.toUpperCase()) && value.length === 56) return { kind: "address", wallet: value.toUpperCase() };
  const username = value.replace(/^@/, "").toLowerCase();
  return USERNAME_RE.test(username) ? { kind: "username", username } : null;
}

function recipientLabel(r: Recipient): string {
  return r.kind === "profile" ? `@${r.username}` : shortAddress(r.wallet);
}

/** Send USDC or XLM to a @username (or a G-address) with Pollar, then record it on our server. */
export function SendPayment({ address, balances, record, onSent, preset }: SendPaymentProps) {
  const { sendPayment } = usePollar();
  const toId = useId();
  const amountId = useId();
  const noteId = useId();
  const [to, setTo] = useState(preset?.to ?? "");
  const [asset, setAsset] = useState<PaymentAsset>(preset?.asset ?? "USDC");
  const [amount, setAmount] = useState(preset?.amount ?? "");
  const [note, setNote] = useState("");
  const [lookup, setLookup] = useState<Lookup>({ step: "idle" });
  const [stage, setStage] = useState<Stage>({ step: "form" });
  const [formError, setFormError] = useState<string | null>(null);

  // Resolve the recipient as the user types (debounced).
  useEffect(() => {
    const parsed = normalizeRecipient(to);
    if (!to.trim()) return setLookup({ step: "idle" });
    if (!parsed) return setLookup({ step: "error", message: "Escribe un @usuario o una dirección G… de Stellar." });
    if (parsed.kind === "address") {
      return setLookup(
        parsed.wallet === address
          ? { step: "error", message: "Esa es tu propia wallet." }
          : { step: "found", recipient: { kind: "address", wallet: parsed.wallet } },
      );
    }
    if (!isApiBackend()) return setLookup({ step: "error", message: "Buscar por @usuario necesita el servidor de Kosmovia." });
    setLookup({ step: "searching" });
    let cancelled = false;
    const timer = setTimeout(async () => {
      const res = await apiRequest<{ profile: ProfileRow }>(`/api/profiles/${encodeURIComponent(parsed.username)}`);
      if (cancelled) return;
      if (!res.ok) {
        setLookup({ step: "error", message: res.status === 404 ? `No existe @${parsed.username}.` : res.error });
        return;
      }
      const p = res.data.profile;
      if (p.wallet === address) return setLookup({ step: "error", message: "Ese eres tú." });
      setLookup({
        step: "found",
        recipient: {
          kind: "profile",
          wallet: p.wallet,
          username: p.username,
          displayName: p.display_name || `@${p.username}`,
          avatarSeed: p.avatar_seed,
          avatarStyle: p.avatar_style,
        },
      });
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [to, address]);

  const balance = balances?.exists ? (asset === "XLM" ? balances.xlm : balances.usdc) : null;
  const amountCheck = amount.trim() ? checkAmount(amount, asset, balance) : null;

  const onReview = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (lookup.step !== "found") return setFormError("Elige a quién le envías.");
    const checked = checkAmount(amount, asset, balance);
    if (!checked.ok) return setFormError(checked.error);
    if (asset === "USDC" && balances?.exists && balances.usdc === null) {
      return setFormError("Tu wallet todavía no tiene USDC habilitado. Envía XLM o espera a que termine de activarse.");
    }
    // The network rejects a payment the recipient can't receive: check first, in words.
    setStage({ step: "checking" });
    try {
      const theirs = await fetchBalances(lookup.recipient.wallet);
      if (!theirs.exists) {
        setStage({ step: "form" });
        return setFormError(`${recipientLabel(lookup.recipient)} todavía no tiene la wallet activa en la red de prueba.`);
      }
      if (asset === "USDC" && theirs.usdc === null) {
        setStage({ step: "form" });
        return setFormError(`${recipientLabel(lookup.recipient)} todavía no puede recibir USDC. Envíale XLM.`);
      }
    } catch {
      setStage({ step: "form" });
      return setFormError("No pudimos consultar la red de Stellar. Intenta de nuevo.");
    }
    setStage({ step: "review", recipient: lookup.recipient, amount: checked.amount });
  };

  const onConfirm = async () => {
    if (stage.step !== "review") return;
    const { recipient, amount: value } = stage;
    setStage({ step: "sending", recipient, amount: value });
    let outcome: Awaited<ReturnType<typeof sendPayment>>;
    try {
      outcome = await sendPayment({ destination: recipient.wallet, amount: value, asset: pollarAsset(asset) });
    } catch (err) {
      outcome = { status: "error", message: err instanceof Error ? err.message : undefined };
    }
    if (outcome.status === "error" || !outcome.hash) {
      setStage({ step: "review", recipient, amount: value });
      setFormError(sendErrorMessage(outcome.status === "error" ? outcome : {}));
      return;
    }
    onSent?.();
    const saved = await record(outcome.hash, note);
    setStage({
      step: "done",
      recipient,
      amount: value,
      hash: outcome.hash,
      warning: saved.ok ? null : saved.error,
    });
  };

  const reset = () => {
    setStage({ step: "form" });
    setAmount("");
    setNote("");
    setFormError(null);
  };

  if (stage.step === "done") {
    return (
      <section className="card pay-card" aria-label="Pago enviado">
        <h2>Pago enviado</h2>
        <PayWho recipient={stage.recipient} />
        <p className="pay-amount">
          {trimAmount(stage.amount)} {asset}
        </p>
        <p role="status" className="muted">
          Listo: el pago ya está en la red de prueba.
        </p>
        {stage.warning ? <p className="field-hint error">{stage.warning}</p> : null}
        <div className="form-actions">
          <a className="btn" href={explorerTxUrl(stage.hash)} target="_blank" rel="noreferrer">
            Ver en stellar.expert
          </a>
          <button type="button" className="btn btn-primary" onClick={reset}>
            Enviar otro
          </button>
        </div>
      </section>
    );
  }

  if (stage.step === "review" || stage.step === "sending") {
    const sending = stage.step === "sending";
    return (
      <section className="card pay-card" aria-label="Revisa el envío">
        <h2>Revisa el envío</h2>
        <PayWho recipient={stage.recipient} />
        <p className="pay-amount">
          {trimAmount(stage.amount)} {asset}
        </p>
        {note.trim() ? <p className="muted pay-note">“{note.trim()}”</p> : null}
        <p className="muted field-hint">Red de prueba (testnet): este dinero no tiene valor real. Un pago enviado no se puede deshacer.</p>
        {formError ? (
          <p className="field-hint error" role="alert">
            {formError}
          </p>
        ) : null}
        <div className="form-actions">
          <button type="button" className="btn btn-primary" onClick={onConfirm} disabled={sending}>
            {sending ? "Enviando…" : `Enviar ${trimAmount(stage.amount)} ${asset}`}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            disabled={sending}
            onClick={() => {
              setStage({ step: "form" });
              setFormError(null);
            }}
          >
            Editar
          </button>
        </div>
        {sending ? <p className="muted field-hint">Si usas Freighter, confirma el pago en la extensión.</p> : null}
      </section>
    );
  }

  return (
    <form className="card pay-card" onSubmit={onReview} noValidate aria-label="Enviar dinero">
      <h2>Enviar</h2>
      <div className="field">
        <label htmlFor={toId}>Para</label>
        <input
          id={toId}
          type="text"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={60}
          placeholder="@usuario o dirección G…"
          value={to}
          aria-describedby={`${toId}-hint`}
          onChange={(e) => setTo(e.target.value)}
        />
        <div id={`${toId}-hint`} aria-live="polite">
          {lookup.step === "searching" ? <p className="field-hint muted">Buscando…</p> : null}
          {lookup.step === "error" ? <p className="field-hint error">{lookup.message}</p> : null}
          {lookup.step === "found" ? <PayWho recipient={lookup.recipient} compact /> : null}
        </div>
      </div>

      <fieldset className="pay-assets">
        <legend>Activo</legend>
        {PAYMENT_ASSETS.map((a) => (
          <label key={a} className="pay-asset" data-active={asset === a}>
            <input type="radio" name="asset" value={a} checked={asset === a} onChange={() => setAsset(a)} />
            {a}
          </label>
        ))}
      </fieldset>

      <div className="field">
        <label htmlFor={amountId}>Monto</label>
        <input
          id={amountId}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0,00"
          value={amount}
          aria-invalid={amountCheck !== null && !amountCheck.ok}
          aria-describedby={`${amountId}-hint`}
          onChange={(e) => setAmount(e.target.value)}
        />
        <p id={`${amountId}-hint`} className={amountCheck && !amountCheck.ok ? "field-hint error" : "field-hint muted"}>
          {amountCheck && !amountCheck.ok
            ? amountCheck.error
            : balance !== null
              ? `Tienes ${trimAmount(balance)} ${asset}.`
              : " "}
        </p>
      </div>

      <div className="field">
        <label htmlFor={noteId}>Nota (opcional)</label>
        <input
          id={noteId}
          type="text"
          autoComplete="off"
          maxLength={NOTE_MAX}
          placeholder="Ej.: la pizza del viernes"
          value={note}
          aria-describedby={`${noteId}-hint`}
          onChange={(e) => setNote(e.target.value)}
        />
        <p id={`${noteId}-hint`} className="field-hint muted">
          Solo la ven tú y quien recibe. No se guarda en la red.
        </p>
      </div>

      {formError ? (
        <p className="field-hint error" role="alert">
          {formError}
        </p>
      ) : null}
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={stage.step === "checking" || lookup.step !== "found"}>
          {stage.step === "checking" ? "Revisando…" : "Revisar envío"}
        </button>
      </div>
    </form>
  );
}

/** The recipient with their Kosmonauta, so the user sees who gets the money before confirming. */
function PayWho({ recipient, compact = false }: { recipient: Recipient; compact?: boolean }) {
  if (recipient.kind === "address") {
    return (
      <div className="pay-who" data-compact={compact}>
        <div>
          <p className="pay-who-name">Wallet de Stellar</p>
          <p className="muted pay-who-sub">
            <code>{shortAddress(recipient.wallet)}</code> · no es un usuario de Kosmovia
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="pay-who" data-compact={compact}>
      <Avatar
        seed={recipient.avatarSeed || recipient.wallet}
        style={recipient.avatarStyle}
        size={compact ? 36 : 56}
        username={recipient.username}
      />
      <div>
        <p className="pay-who-name">{recipient.displayName}</p>
        <p className="muted pay-who-sub">
          @{recipient.username} · <code>{shortAddress(recipient.wallet)}</code>
        </p>
      </div>
    </div>
  );
}
