import Papa from "papaparse";
import { PortfolioItem } from "./storage";

// DeGiro portfolio export CSV columns may vary by language/region
// Common columns: Prodotto, Simbolo/Ticker, Quantità, Prezzo di chiusura, Valore, Valuta
// English: Product, Symbol/Ticker, Quantity, Closing Price, Value, Currency

interface DeGiroRow {
  [key: string]: string;
}

function findColumn(row: DeGiroRow, candidates: string[]): string {
  for (const candidate of candidates) {
    const key = Object.keys(row).find(
      (k) => k.toLowerCase().trim() === candidate.toLowerCase()
    );
    if (key && row[key]) return row[key];
  }
  return "";
}

export function parseDeGiroCSV(csvText: string): PortfolioItem[] {
  const result = Papa.parse<DeGiroRow>(csvText, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });

  if (result.errors.length > 0) {
    console.warn("CSV parsing warnings:", result.errors);
  }

  const items: PortfolioItem[] = [];

  for (const row of result.data) {
    const name = findColumn(row, [
      "Prodotto",
      "Product",
      "Nome",
      "Name",
      "Descrizione",
    ]);
    const symbol = findColumn(row, [
      "Simbolo",
      "Symbol",
      "Ticker",
      "ISIN",
      "Codice",
    ]);
    const quantityStr = findColumn(row, [
      "Quantità",
      "Quantity",
      "Qty",
      "Numero",
      "Size",
    ]);
    const priceStr = findColumn(row, [
      "Prezzo di chiusura",
      "Closing Price",
      "Prezzo",
      "Price",
      "Prezzo medio",
      "Average Price",
    ]);
    const valueStr = findColumn(row, [
      "Valore",
      "Value",
      "Valore in EUR",
      "Value in EUR",
      "Controvalore",
    ]);
    const currency = findColumn(row, ["Valuta", "Currency"]) || "EUR";
    const type = findColumn(row, [
      "Tipo",
      "Type",
      "Categoria",
      "Category",
      "Borsa",
      "Exchange",
    ]);

    if (!name && !symbol) continue;

    const quantity = parseFloat(quantityStr.replace(",", ".")) || 0;
    const price = parseFloat(priceStr.replace(",", ".")) || 0;
    const value = parseFloat(valueStr.replace(",", ".")) || quantity * price;

    if (quantity === 0 && value === 0) continue;

    items.push({
      symbol: symbol || name.substring(0, 10),
      name: name || symbol,
      quantity,
      avgPrice: price,
      currentValue: value,
      type: type || "Sconosciuto",
      currency,
    });
  }

  return items;
}
