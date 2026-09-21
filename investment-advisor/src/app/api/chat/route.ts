import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

interface ChatRequestBody {
  messages: { role: "user" | "assistant"; content: string }[];
  apiKey: string;
  profile: {
    riskLevel: string;
    monthlyBudget: number;
    investmentGoal: string;
    timeHorizon: string;
    experience: string;
  } | null;
  portfolio: {
    symbol: string;
    name: string;
    quantity: number;
    avgPrice: number;
    currentValue: number;
    type: string;
    currency: string;
  }[];
}

function buildSystemPrompt(
  profile: ChatRequestBody["profile"],
  portfolio: ChatRequestBody["portfolio"]
): string {
  let prompt = `Sei un assistente esperto di investimenti finanziari. Il tuo ruolo e aiutare l'utente a prendere decisioni informate sui propri investimenti.

REGOLE IMPORTANTI:
- Rispondi SEMPRE in italiano
- Fornisci analisi dettagliate ma comprensibili
- Considera sempre il profilo di rischio dell'utente
- Suggerisci diversificazione quando appropriato
- Menziona sempre i rischi associati agli investimenti
- Quando possibile, suggerisci strumenti specifici (ETF, azioni, obbligazioni, ecc.) con i relativi ticker/ISIN
- Considera il mercato globale (non solo italiano)
- Ricorda che le tue risposte NON sono consulenza finanziaria professionale
- Quando l'utente chiede dove investire, fai domande specifiche se necessario (orizzonte temporale, obiettivi, ecc.)
- Se l'utente ha un portfolio, tienine conto per evitare sovraesposizioni
- Fornisci sempre una breve spiegazione del PERCHE' suggerisci un determinato investimento
- Usa il web search per cercare notizie finanziarie recenti quando rilevante

Strumenti disponibili per l'utente: ETF, Azioni, Obbligazioni, Crypto, Conti deposito, Fondi comuni, PAC (Piano di Accumulo).
L'utente ha un account DeGiro per operare.
Data odierna: ${new Date().toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })}.`;

  if (profile) {
    prompt += `

PROFILO INVESTITORE:
- Livello di rischio: ${profile.riskLevel}
- Budget mensile disponibile: €${profile.monthlyBudget}
- Obiettivo: ${profile.investmentGoal}
- Orizzonte temporale: ${profile.timeHorizon}
- Esperienza: ${profile.experience}`;
  }

  if (portfolio && portfolio.length > 0) {
    const totalValue = portfolio.reduce((sum, p) => sum + p.currentValue, 0);
    prompt += `

PORTFOLIO ATTUALE (valore totale: €${totalValue.toFixed(2)}):`;
    for (const item of portfolio) {
      prompt += `\n- ${item.name} (${item.symbol}): ${item.quantity} unita, valore €${item.currentValue.toFixed(2)}, tipo: ${item.type}`;
    }
  }

  return prompt;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequestBody = await request.json();
    const { messages, apiKey, profile, portfolio } = body;

    if (!apiKey) {
      return Response.json(
        { error: "API key mancante. Configurala nelle Impostazioni." },
        { status: 400 }
      );
    }

    if (!messages || messages.length === 0) {
      return Response.json(
        { error: "Nessun messaggio fornito." },
        { status: 400 }
      );
    }

    const client = new Anthropic({ apiKey });
    const systemPrompt = buildSystemPrompt(profile, portfolio);

    // Use Claude with web search for financial news
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 5,
        },
      ],
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    // Extract text content from the response
    const textContent = response.content
      .filter((block) => block.type === "text")
      .map((block) => {
        if (block.type === "text") return block.text;
        return "";
      })
      .join("\n\n");

    return Response.json({ content: textContent });
  } catch (err) {
    console.error("Chat API error:", err);
    const message =
      err instanceof Error ? err.message : "Errore interno del server";
    return Response.json({ error: message }, { status: 500 });
  }
}
