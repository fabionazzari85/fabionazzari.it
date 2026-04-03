export interface UserProfile {
  riskLevel: "conservativo" | "moderato" | "aggressivo";
  monthlyBudget: number;
  investmentGoal: string;
  timeHorizon: string;
  experience: string;
}

export interface PortfolioItem {
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentValue: number;
  type: string;
  currency: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const PROFILE_KEY = "investment-advisor-profile";
const PORTFOLIO_KEY = "investment-advisor-portfolio";
const CHAT_KEY = "investment-advisor-chat";
const API_KEY_KEY = "investment-advisor-api-key";

export function getProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(PROFILE_KEY);
  return data ? JSON.parse(data) : null;
}

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function getPortfolio(): PortfolioItem[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(PORTFOLIO_KEY);
  return data ? JSON.parse(data) : [];
}

export function savePortfolio(items: PortfolioItem[]): void {
  localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(items));
}

export function addToPortfolio(item: PortfolioItem): void {
  const items = getPortfolio();
  items.push(item);
  savePortfolio(items);
}

export function removeFromPortfolio(index: number): void {
  const items = getPortfolio();
  items.splice(index, 1);
  savePortfolio(items);
}

export function getChatHistory(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(CHAT_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveChatHistory(messages: ChatMessage[]): void {
  localStorage.setItem(CHAT_KEY, JSON.stringify(messages));
}

export function clearChatHistory(): void {
  localStorage.removeItem(CHAT_KEY);
}

export function getApiKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(API_KEY_KEY) || "";
}

export function saveApiKey(key: string): void {
  localStorage.setItem(API_KEY_KEY, key);
}
