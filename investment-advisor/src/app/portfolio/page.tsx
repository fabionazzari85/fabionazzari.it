"use client";

import { useState, useEffect, useRef } from "react";
import {
  Upload,
  Trash2,
  Plus,
  X,
  TrendingUp,
  PieChart,
} from "lucide-react";
import {
  PortfolioItem,
  getPortfolio,
  savePortfolio,
  removeFromPortfolio,
} from "@/lib/storage";
import { parseDeGiroCSV } from "@/lib/degiro-parser";

export default function PortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newItem, setNewItem] = useState<PortfolioItem>({
    symbol: "",
    name: "",
    quantity: 0,
    avgPrice: 0,
    currentValue: 0,
    type: "ETF",
    currency: "EUR",
  });

  useEffect(() => {
    setItems(getPortfolio());
  }, []);

  const totalValue = items.reduce((sum, item) => sum + item.currentValue, 0);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError("");
    setImportSuccess("");

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseDeGiroCSV(text);
        if (parsed.length === 0) {
          setImportError(
            "Nessun asset trovato nel CSV. Verifica il formato del file DeGiro."
          );
          return;
        }
        const merged = [...items, ...parsed];
        savePortfolio(merged);
        setItems(merged);
        setImportSuccess(`Importati ${parsed.length} asset da DeGiro!`);
        setTimeout(() => setImportSuccess(""), 3000);
      } catch {
        setImportError("Errore nel parsing del CSV. Verifica il formato.");
      }
    };
    reader.readAsText(file);

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemove = (index: number) => {
    removeFromPortfolio(index);
    setItems(getPortfolio());
  };

  const handleAdd = () => {
    if (!newItem.symbol || !newItem.name) return;
    const updated = [
      ...items,
      { ...newItem, currentValue: newItem.currentValue || newItem.quantity * newItem.avgPrice },
    ];
    savePortfolio(updated);
    setItems(updated);
    setNewItem({
      symbol: "",
      name: "",
      quantity: 0,
      avgPrice: 0,
      currentValue: 0,
      type: "ETF",
      currency: "EUR",
    });
    setShowAdd(false);
  };

  const handleClearAll = () => {
    savePortfolio([]);
    setItems([]);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Portfolio</h1>
          <p className="text-sm text-muted mt-1">Gestisci i tuoi asset</p>
        </div>
        {items.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-muted hover:text-danger text-xs flex items-center gap-1"
          >
            <Trash2 size={14} /> Svuota
          </button>
        )}
      </div>

      {/* Total Value Card */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 text-muted text-sm mb-1">
          <TrendingUp size={16} />
          Valore totale portfolio
        </div>
        <div className="text-3xl font-bold">
          &euro;{totalValue.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
        </div>
        <div className="text-xs text-muted mt-1">{items.length} asset</div>
      </div>

      {/* Import & Add */}
      <div className="flex gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-2 bg-card hover:bg-card-hover border border-border rounded-xl py-3 text-sm transition-colors"
        >
          <Upload size={16} /> Importa DeGiro
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleImport}
          className="hidden"
        />
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-xl py-3 text-sm transition-colors"
        >
          <Plus size={16} /> Aggiungi
        </button>
      </div>

      {importError && (
        <div className="bg-danger/10 border border-danger/30 rounded-xl px-4 py-3 text-sm text-danger">
          {importError}
        </div>
      )}
      {importSuccess && (
        <div className="bg-accent/10 border border-accent/30 rounded-xl px-4 py-3 text-sm text-accent">
          {importSuccess}
        </div>
      )}

      {/* Add Form */}
      {showAdd && (
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm">Nuovo asset</h3>
            <button onClick={() => setShowAdd(false)} className="text-muted">
              <X size={18} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Simbolo/ISIN"
              value={newItem.symbol}
              onChange={(e) =>
                setNewItem({ ...newItem, symbol: e.target.value })
              }
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
            <input
              placeholder="Nome"
              value={newItem.name}
              onChange={(e) =>
                setNewItem({ ...newItem, name: e.target.value })
              }
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
            <input
              type="number"
              placeholder="Quantita"
              value={newItem.quantity || ""}
              onChange={(e) =>
                setNewItem({
                  ...newItem,
                  quantity: Number(e.target.value) || 0,
                })
              }
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
            <input
              type="number"
              placeholder="Prezzo medio"
              value={newItem.avgPrice || ""}
              onChange={(e) =>
                setNewItem({
                  ...newItem,
                  avgPrice: Number(e.target.value) || 0,
                })
              }
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
            <input
              type="number"
              placeholder="Valore attuale"
              value={newItem.currentValue || ""}
              onChange={(e) =>
                setNewItem({
                  ...newItem,
                  currentValue: Number(e.target.value) || 0,
                })
              }
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
            <select
              value={newItem.type}
              onChange={(e) =>
                setNewItem({ ...newItem, type: e.target.value })
              }
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary appearance-none"
            >
              <option>ETF</option>
              <option>Azione</option>
              <option>Obbligazione</option>
              <option>Crypto</option>
              <option>Fondo</option>
              <option>Altro</option>
            </select>
          </div>
          <button
            onClick={handleAdd}
            disabled={!newItem.symbol || !newItem.name}
            className="w-full bg-primary hover:bg-primary-hover disabled:opacity-40 text-white rounded-lg py-2 text-sm transition-colors"
          >
            Aggiungi al portfolio
          </button>
        </div>
      )}

      {/* Portfolio List */}
      {items.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <PieChart size={48} className="mx-auto text-muted" />
          <p className="text-muted text-sm">
            Nessun asset nel portfolio.
            <br />
            Importa il CSV da DeGiro o aggiungi manualmente.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">
                    {item.name}
                  </span>
                  <span className="text-xs text-muted bg-background px-2 py-0.5 rounded">
                    {item.type}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted">
                  <span>{item.symbol}</span>
                  <span>{item.quantity} unita</span>
                  <span>
                    &euro;{item.avgPrice.toFixed(2)} avg
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-medium text-sm">
                    &euro;{item.currentValue.toLocaleString("it-IT", {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                  <div className="text-xs text-muted">{item.currency}</div>
                </div>
                <button
                  onClick={() => handleRemove(i)}
                  className="text-muted hover:text-danger p-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
