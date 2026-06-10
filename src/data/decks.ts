import { getCard } from "./cards";
import type { Faction } from "@/engine/types";

export interface DeckDef {
  id: string;
  name: string;
  faction: Faction;
  leaderId: string;
  cards: string[];
}

function many(...pairs: Array<[string, number]>): string[] {
  return pairs.flatMap(([id, count]) => Array.from({ length: count }, () => id));
}

export const DECKS: DeckDef[] = [
  {
    id: "PLAYER_STARTER",
    name: "마조레 스타터",
    faction: "maggiore",
    leaderId: "ld_maggiore",
    cards: many(
      ["mel_maj3", 2], ["mel_p5", 2], ["mel_scale", 2], ["mel_do", 2], ["mel_mi", 2], ["mel_sol", 2],
      ["har_tonic", 2], ["har_subdom", 2], ["har_dom7", 2], ["rhy_quarter", 2], ["rhy_eighth", 2],
      ["sp_fortissimo", 1], ["sp_fermata", 1], ["sp_clear", 1]
    )
  },
  {
    id: "AI_EASY",
    name: "리듬 연구소",
    faction: "tempo",
    leaderId: "ld_tempo",
    cards: many(
      ["rhy_quarter", 2], ["rhy_dotted", 2], ["rhy_triplet", 2], ["rhy_eighth", 2], ["rhy_sync", 1], ["rhy_metro", 2],
      ["mel_p5", 2], ["har_subdom", 2], ["sp_rest", 2], ["sp_mute", 2], ["sp_staccato", 1], ["sp_fortissimo", 1],
      ["sp_clear", 2], ["sp_fermata", 2]
    )
  },
  {
    id: "AI_NORMAL",
    name: "단조 길드",
    faction: "minore",
    leaderId: "ld_minore",
    cards: many(
      ["mel_chrom", 1], ["har_min", 2], ["har_dim", 2], ["mel_min3", 2], ["mel_p5", 2],
      ["har_tonic", 2], ["har_dom7", 2], ["sp_reprise", 2], ["sp_fermata", 2], ["sp_mute", 2],
      ["sp_dissonance", 2], ["sp_staccato", 1], ["sp_clear", 2], ["rhy_eighth", 1]
    )
  },
  {
    id: "AI_HARD",
    name: "재즈 화성 클럽",
    faction: "tension",
    leaderId: "ld_tension",
    cards: many(
      ["har_c9", 1], ["mel_chrom", 1], ["rhy_sync", 1], ["har_sus4", 2], ["har_dom7", 2], ["har_tonic", 2],
      ["mel_scale", 2], ["mel_p5", 2], ["rhy_triplet", 2], ["sp_fortissimo", 2], ["sp_dissonance", 2],
      ["sp_staccato", 1], ["sp_clear", 2], ["sp_fermata", 2], ["rhy_metro", 1]
    )
  }
];

export function getDeck(id: string): DeckDef {
  const deck = DECKS.find((item) => item.id === id);
  if (!deck) throw new Error(`Unknown deck: ${id}`);
  return deck;
}

export function validateDeck(deck: DeckDef): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (deck.cards.length !== 25) errors.push("덱은 정확히 25장이어야 합니다.");

  const leader = getCard(deck.leaderId);
  if (leader.type !== "leader") errors.push("리더 카드가 필요합니다.");
  if (leader.faction !== deck.faction) errors.push("리더 진영이 덱 진영과 맞지 않습니다.");

  const counts = new Map<string, number>();
  for (const id of deck.cards) {
    const card = getCard(id);
    counts.set(id, (counts.get(id) ?? 0) + 1);
    if (card.type === "leader") errors.push("리더는 25장 덱 목록에 포함할 수 없습니다.");
  }

  for (const [id, count] of counts) {
    const card = getCard(id);
    if (card.type === "bronze" && count > 2) errors.push(`${card.nameKo}는 최대 2장입니다.`);
    if (card.type === "virtuoso" && count > 1) errors.push(`${card.nameKo} 명인은 최대 1장입니다.`);
    if (card.type === "special" && count > 2) errors.push(`${card.nameKo} 특수 카드는 최대 2장입니다.`);
  }

  return { valid: errors.length === 0, errors };
}
