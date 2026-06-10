import { getCard } from "@/data/cards";
import { createRng } from "@/engine/rng";
import type { CardDef } from "@/engine/types";
import { CADENZA_SUCCESS, type AiPersona } from "./persona";

export function cadenzaSuccessProbability(persona: AiPersona, tier: 1 | 2 | 3 | 4): number {
  return CADENZA_SUCCESS[persona][tier];
}

export function estimateCadenzaReward(card: CardDef, persona: AiPersona): number {
  if (!card.cadenza) return 0;
  const amount = card.cadenza.effect.amount ?? (card.cadenza.effect.kind === "multiply_row" ? 6 : 0);
  return amount * cadenzaSuccessProbability(persona, card.cadenza.tier);
}

export function rollAiCadenza(seed: string, logLength: number, cardId: string, persona: AiPersona): boolean | undefined {
  const card = getCard(cardId);
  if (!card.cadenza) return undefined;
  const rng = createRng(`${seed}:ai-cadenza:${logLength}:${cardId}:${persona}`);
  return rng.chance(cadenzaSuccessProbability(persona, card.cadenza.tier));
}
