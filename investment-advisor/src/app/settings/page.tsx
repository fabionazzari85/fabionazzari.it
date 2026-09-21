"use client";

import { useState, useEffect } from "react";
import { Key, Save, CheckCircle, Eye, EyeOff } from "lucide-react";
import { getApiKey, saveApiKey } from "@/lib/storage";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setApiKey(getApiKey());
  }, []);

  const handleSave = () => {
    saveApiKey(apiKey.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Impostazioni</h1>
        <p className="text-sm text-muted mt-1">
          Configura la tua API key per usare l&apos;assistente
        </p>
      </div>

      {/* API Key */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Key size={18} className="text-primary" />
          <h2 className="font-medium">Anthropic API Key</h2>
        </div>
        <p className="text-xs text-muted">
          Inserisci la tua API key di Anthropic per abilitare la chat con
          Claude. La chiave viene salvata solo nel tuo browser (localStorage).
        </p>
        <div className="relative">
          <input
            type={showKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-ant-..."
            className="w-full bg-background border border-border rounded-xl px-4 py-3 pr-12 text-sm font-mono focus:outline-none focus:border-primary"
          />
          <button
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
          >
            {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <button
          onClick={handleSave}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
            saved
              ? "bg-accent text-white"
              : "bg-primary hover:bg-primary-hover text-white"
          }`}
        >
          {saved ? (
            <>
              <CheckCircle size={18} /> Salvato!
            </>
          ) : (
            <>
              <Save size={18} /> Salva API Key
            </>
          )}
        </button>
      </div>

      {/* Info */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <h2 className="font-medium">Come ottenere la API Key</h2>
        <ol className="text-sm text-muted space-y-2 list-decimal ml-4">
          <li>
            Vai su{" "}
            <span className="text-primary font-mono text-xs">
              console.anthropic.com
            </span>
          </li>
          <li>Crea un account o accedi</li>
          <li>Vai nella sezione &quot;API Keys&quot;</li>
          <li>Crea una nuova chiave e copiala qui</li>
        </ol>
      </div>

      {/* About */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-2">
        <h2 className="font-medium">Investment Advisor</h2>
        <p className="text-xs text-muted">
          Assistente AI per investimenti. Utilizza Claude di Anthropic con
          ricerca web integrata per fornirti informazioni aggiornate sul mercato
          finanziario.
        </p>
        <p className="text-xs text-muted">
          Le informazioni fornite non costituiscono consulenza finanziaria
          professionale.
        </p>
      </div>
    </div>
  );
}
