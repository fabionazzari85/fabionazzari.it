"use client";

import { useState, useEffect } from "react";
import { Save, CheckCircle } from "lucide-react";
import { UserProfile, getProfile, saveProfile } from "@/lib/storage";

const riskOptions = [
  {
    value: "conservativo" as const,
    label: "Conservativo",
    desc: "Preferisci sicurezza e stabilita. Basso rischio, rendimenti moderati.",
    color: "bg-green-500/20 border-green-500/50 text-green-400",
  },
  {
    value: "moderato" as const,
    label: "Moderato",
    desc: "Bilancio tra rischio e rendimento. Mix di asset sicuri e dinamici.",
    color: "bg-yellow-500/20 border-yellow-500/50 text-yellow-400",
  },
  {
    value: "aggressivo" as const,
    label: "Aggressivo",
    desc: "Punti a rendimenti elevati. Accetti volatilita e rischi maggiori.",
    color: "bg-red-500/20 border-red-500/50 text-red-400",
  },
];

const timeOptions = [
  "Breve termine (< 1 anno)",
  "Medio termine (1-5 anni)",
  "Lungo termine (5-10 anni)",
  "Molto lungo termine (10+ anni)",
];

const experienceOptions = [
  "Principiante - Ho appena iniziato",
  "Base - Conosco ETF e azioni",
  "Intermedio - Investo da qualche anno",
  "Avanzato - Conosco derivati e strategie complesse",
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>({
    riskLevel: "moderato",
    monthlyBudget: 300,
    investmentGoal: "",
    timeHorizon: timeOptions[1],
    experience: experienceOptions[0],
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = getProfile();
    if (existing) setProfile(existing);
  }, []);

  const handleSave = () => {
    saveProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profilo Investitore</h1>
        <p className="text-sm text-muted mt-1">
          Configura il tuo profilo per ricevere consigli personalizzati
        </p>
      </div>

      {/* Risk Level */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Livello di rischio</label>
        <div className="space-y-2">
          {riskOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() =>
                setProfile({ ...profile, riskLevel: opt.value })
              }
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                profile.riskLevel === opt.value
                  ? opt.color
                  : "bg-card border-border hover:border-muted"
              }`}
            >
              <div className="font-medium">{opt.label}</div>
              <div className="text-xs text-muted mt-1">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Monthly Budget */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Budget mensile disponibile
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
            &euro;
          </span>
          <input
            type="number"
            value={profile.monthlyBudget}
            onChange={(e) =>
              setProfile({
                ...profile,
                monthlyBudget: Number(e.target.value) || 0,
              })
            }
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary"
            placeholder="300"
          />
        </div>
      </div>

      {/* Investment Goal */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Obiettivo di investimento</label>
        <textarea
          value={profile.investmentGoal}
          onChange={(e) =>
            setProfile({ ...profile, investmentGoal: e.target.value })
          }
          rows={3}
          className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-primary"
          placeholder="Es: Costruire un fondo per la pensione, comprare casa tra 5 anni, generare reddito passivo..."
        />
      </div>

      {/* Time Horizon */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Orizzonte temporale</label>
        <select
          value={profile.timeHorizon}
          onChange={(e) =>
            setProfile({ ...profile, timeHorizon: e.target.value })
          }
          className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary appearance-none"
        >
          {timeOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {/* Experience */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Esperienza</label>
        <select
          value={profile.experience}
          onChange={(e) =>
            setProfile({ ...profile, experience: e.target.value })
          }
          className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary appearance-none"
        >
          {experienceOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {/* Save Button */}
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
            <Save size={18} /> Salva Profilo
          </>
        )}
      </button>
    </div>
  );
}
