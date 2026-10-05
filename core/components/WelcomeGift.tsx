"use client";

import { useEffect, useRef, useState } from "react";
import { usePollar } from "@pollar/react";
import { trimAmount } from "../lib/payments.ts";
import { claimFailure, pickWelcomeRule, type Rule } from "../lib/welcome.ts";

/**
 * Welcome gift (pattern from Pollar Pass): a Pollar distribution rule set up
 * in the dashboard (Treasury > Token Distribution), claimed from the SDK.
 * Pollar decides who may claim and pays from the app's distribution wallet,
 * never from our server. No claimable rule, no card.
 */

type Offer = { id: string; amount: string; assetCode: string };
type State =
  | { step: "hidden" }
  | { step: "offer"; rule: Offer; error?: string }
  | { step: "claiming"; rule: Offer }
  | { step: "claimed"; rule: Offer };

export function WelcomeGift({ onClaimed }: { onClaimed?: () => void }) {
  const pollar = usePollar();
  const pollarRef = useRef(pollar);
  pollarRef.current = pollar;
  const [state, setState] = useState<State>({ step: "hidden" });
  const { isAuthenticated } = pollar;

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    pollarRef.current
      .getClient()
      .listDistributionRules()
      .then((rules) => {
        const rule = pickWelcomeRule(rules as Rule[]);
        if (!cancelled && rule) setState({ step: "offer", rule: { id: rule.id, amount: rule.amount, assetCode: rule.assetCode } });
      })
      // No rules, no card: a gift that can't be listed isn't worth an error.
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  if (state.step === "hidden") return null;
  const { rule } = state;
  const amount = `${trimAmount(rule.amount)} ${rule.assetCode}`;

  async function claim() {
    setState({ step: "claiming", rule });
    try {
      await pollarRef.current.getClient().claimDistributionRule({ ruleId: rule.id });
      setState({ step: "claimed", rule });
      onClaimed?.();
    } catch (err) {
      const failure = claimFailure(err);
      if (failure === "claimed") return setState({ step: "hidden" });
      setState({
        step: "offer",
        rule,
        error: failure === "gone" ? "El regalo de bienvenida se terminó por ahora." : "No se pudo reclamar. Intenta de nuevo.",
      });
    }
  }

  return (
    <section className="card pay-card pay-gift" aria-label="Regalo de bienvenida">
      <h2>{state.step === "claimed" ? "¡Listo!" : "Regalo de bienvenida"}</h2>
      <p className="muted">
        {state.step === "claimed"
          ? `Recibiste ${amount} de prueba en tu wallet.`
          : `Recibe ${amount} de prueba para tus primeros pagos en Kosmovia.`}
      </p>
      {state.step === "offer" && state.error ? (
        <p className="field-hint error" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.step !== "claimed" ? (
        <div className="form-actions">
          <button type="button" className="btn btn-primary" onClick={() => void claim()} disabled={state.step === "claiming"}>
            {state.step === "claiming" ? "Reclamando…" : `Reclamar ${amount}`}
          </button>
        </div>
      ) : null}
    </section>
  );
}
