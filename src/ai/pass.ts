import { getCard } from "@/data/cards";
import type { AiPersona } from "./persona";
import { estimateCadenzaReward } from "./cadenza";

export interface AiView {
  round: 1 | 2 | 3;
  myScore: number;
  oppScore: number;
  myTokens: number;
  oppTokens: number;
  myHand: string[];
  oppHand: number;
  oppPassed: boolean;
  cardsSpentDiff: number;
  persona: AiPersona;
}

export function maxSwing(hand: string[], persona: AiPersona = "normal"): number {
  return hand.reduce((sum, cardId) => {
    const card = getCard(cardId);
    return sum + (card.basePower ?? 0) + estimateCadenzaReward(card, persona);
  }, 0);
}

export function shouldPass(s: AiView): boolean {
  const lead = s.myScore - s.oppScore;
  const mustWin = s.myTokens === 0 && s.oppTokens === 1;

  if (s.oppPassed) {
    if (lead > 0) return true;
    if (-lead > maxSwing(s.myHand, s.persona)) return true;
    return false;
  }
  if (mustWin) return s.myHand.length === 0;
  if (lead >= 16) return true;
  if (lead >= 10 && s.myHand.length <= s.oppHand) return true;
  if (lead <= -18) return true;
  if (lead <= -10 && s.cardsSpentDiff >= 1) return true;
  if (s.round === 1) {
    if (-lead >= 12 && s.cardsSpentDiff <= -1) return true;
    if (-lead >= 20) return true;
  }
  if (s.round >= 2 && s.myTokens === 1 && lead > 0 && s.oppHand <= 1) return true;
  return false;
}
