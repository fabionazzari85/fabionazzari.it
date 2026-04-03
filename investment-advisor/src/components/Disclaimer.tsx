"use client";

import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export function Disclaimer() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const seen = localStorage.getItem("disclaimer-seen");
    if (!seen) setDismissed(false);
  }, []);

  if (dismissed) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl p-6 max-w-md w-full space-y-4">
        <div className="flex items-center gap-3 text-yellow-400">
          <AlertTriangle size={28} />
          <h2 className="text-lg font-bold">Disclaimer</h2>
        </div>
        <div className="text-sm text-foreground/80 space-y-3">
          <p>
            Questa applicazione utilizza l&apos;intelligenza artificiale per fornire
            <strong> suggerimenti informativi</strong> sugli investimenti.
          </p>
          <p>
            Le informazioni fornite <strong>NON costituiscono consulenza
            finanziaria professionale</strong>, raccomandazioni di investimento
            personalizzate, o sollecitazione all&apos;acquisto/vendita di strumenti
            finanziari.
          </p>
          <p>
            Le decisioni di investimento sono sempre a <strong>tuo rischio
            esclusivo</strong>. Consulta un consulente finanziario abilitato
            prima di prendere decisioni di investimento importanti.
          </p>
          <p>
            I rendimenti passati non sono indicativi dei risultati futuri.
          </p>
        </div>
        <button
          onClick={() => {
            localStorage.setItem("disclaimer-seen", "true");
            setDismissed(true);
          }}
          className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-3 rounded-xl transition-colors"
        >
          Ho capito e accetto
        </button>
      </div>
    </div>
  );
}
