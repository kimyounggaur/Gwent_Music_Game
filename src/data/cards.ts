import type { CardDef } from "@/engine/types";

const cTriad = {
  bondGroup: "C_triad",
  bondMembers: ["mel_do", "mel_mi", "mel_sol"]
};

export const CARDS: CardDef[] = [
  { id: "mel_maj3", nameKo: "장3도", faction: "maggiore", row: "melody", type: "bronze", basePower: 3, tags: ["interval", "keyC"], cadenza: { tier: 1, kind: "theory_mc", effect: { kind: "boost_self", amount: 3 } }, ensemble: { keyTag: "keyC" } },
  { id: "mel_min3", nameKo: "단3도", faction: "minore", row: "melody", type: "bronze", basePower: 3, tags: ["interval", "minor"], cadenza: { tier: 1, kind: "theory_mc", effect: { kind: "boost_self", amount: 3 } } },
  { id: "mel_p5", nameKo: "완전5도", faction: "neutral", row: "melody", type: "bronze", basePower: 4, tags: ["interval", "keyC"], cadenza: { tier: 1, kind: "ear_interval", effect: { kind: "boost_adjacent", amount: 2 } }, ensemble: { keyTag: "keyC" } },
  { id: "mel_scale", nameKo: "장음계", faction: "maggiore", row: "melody", type: "bronze", basePower: 5, tags: ["scale", "keyC", "solfege"], cadenza: { tier: 2, kind: "theory_build", effect: { kind: "boost_row", amount: 2, tag: "solfege" } }, ensemble: { keyTag: "keyC" } },
  { id: "mel_do", nameKo: "도", faction: "maggiore", row: "melody", type: "bronze", basePower: 2, tags: ["note", "keyC"], ensemble: cTriad },
  { id: "mel_mi", nameKo: "미", faction: "maggiore", row: "melody", type: "bronze", basePower: 2, tags: ["note", "keyC"], ensemble: cTriad },
  { id: "mel_sol", nameKo: "솔", faction: "maggiore", row: "melody", type: "bronze", basePower: 3, tags: ["note", "keyC"], ensemble: cTriad },
  { id: "mel_chrom", nameKo: "반음계 진행", faction: "tension", row: "melody", type: "virtuoso", basePower: 7, tags: ["chromatic", "virtuoso"], cadenza: { tier: 3, kind: "ear_interval", effect: { kind: "boost_self", amount: 6 } }, immune: true },

  { id: "har_tonic", nameKo: "으뜸화음 I", faction: "maggiore", row: "harmony", type: "bronze", basePower: 3, tags: ["chord", "tonic", "keyC"], cadenza: { tier: 1, kind: "theory_build", effect: { kind: "boost_self", amount: 2 } }, ensemble: { cadence: { withTag: "dominant", bonus: 3 }, keyTag: "keyC" } },
  { id: "har_subdom", nameKo: "버금딸림 IV", faction: "maggiore", row: "harmony", type: "bronze", basePower: 3, tags: ["chord", "subdominant", "keyC"], cadenza: { tier: 1, kind: "theory_mc", effect: { kind: "boost_self", amount: 2 } }, ensemble: { keyTag: "keyC" } },
  { id: "har_dom7", nameKo: "딸림7화음 V7", faction: "maggiore", row: "harmony", type: "bronze", basePower: 5, tags: ["chord", "dominant", "keyC"], cadenza: { tier: 2, kind: "theory_build", effect: { kind: "boost_next_tag", tag: "tonic", amount: 3 } }, ensemble: { keyTag: "keyC" } },
  { id: "har_min", nameKo: "단3화음", faction: "minore", row: "harmony", type: "bronze", basePower: 4, tags: ["chord", "minor"], cadenza: { tier: 1, kind: "ear_chord", effect: { kind: "boost_self", amount: 3 } } },
  { id: "har_dim", nameKo: "감3화음", faction: "minore", row: "harmony", type: "bronze", basePower: 4, tags: ["chord", "diminished"], cadenza: { tier: 2, kind: "ear_chord", effect: { kind: "boost_self", amount: 4 } } },
  { id: "har_c9", nameKo: "텐션코드 C9", faction: "tension", row: "harmony", type: "virtuoso", basePower: 8, tags: ["chord", "tension", "keyC"], cadenza: { tier: 3, kind: "ear_chord", effect: { kind: "boost_self", amount: 6 } }, immune: true, ensemble: { keyTag: "keyC" } },
  { id: "har_sus4", nameKo: "서스포", faction: "tension", row: "harmony", type: "bronze", basePower: 5, tags: ["chord", "suspension"], cadenza: { tier: 2, kind: "theory_mc", effect: { kind: "boost_adjacent", amount: 1 } } },

  { id: "rhy_quarter", nameKo: "4분음표 비트", faction: "tempo", row: "rhythm", type: "bronze", basePower: 2, tags: ["rhythm", "beat"] },
  { id: "rhy_dotted", nameKo: "점음표", faction: "tempo", row: "rhythm", type: "bronze", basePower: 3, tags: ["rhythm", "dotted"], cadenza: { tier: 1, kind: "theory_mc", effect: { kind: "boost_self", amount: 3 } } },
  { id: "rhy_triplet", nameKo: "셋잇단음표", faction: "tempo", row: "rhythm", type: "bronze", basePower: 4, tags: ["rhythm", "triplet"], cadenza: { tier: 2, kind: "ear_rhythm", effect: { kind: "boost_self", amount: 4 } } },
  { id: "rhy_eighth", nameKo: "8분음표 그루브", faction: "tempo", row: "rhythm", type: "bronze", basePower: 3, tags: ["rhythm", "groove"], cadenza: { tier: 1, kind: "ear_rhythm", effect: { kind: "boost_adjacent", amount: 1 } } },
  { id: "rhy_sync", nameKo: "당김음", faction: "tempo", row: "rhythm", type: "virtuoso", basePower: 7, tags: ["rhythm", "syncopation"], cadenza: { tier: 3, kind: "ear_rhythm", effect: { kind: "boost_self", amount: 6 } }, immune: true },
  { id: "rhy_metro", nameKo: "메트로놈", faction: "tempo", row: "rhythm", type: "special", basePower: null, tags: ["rhythm", "summon"], special: { kind: "summon", amount: 2 } },

  { id: "sp_staccato", nameKo: "스타카토", faction: "neutral", row: "any", type: "special", basePower: null, tags: ["special"], special: { kind: "scorch" } },
  { id: "sp_fortissimo", nameKo: "포르티시모", faction: "neutral", row: "any", type: "special", basePower: null, tags: ["special"], special: { kind: "fortissimo" } },
  { id: "sp_reprise", nameKo: "도돌이표", faction: "neutral", row: "any", type: "special", basePower: null, tags: ["special"], special: { kind: "reprise" } },
  { id: "sp_fermata", nameKo: "페르마타", faction: "neutral", row: "any", type: "special", basePower: null, tags: ["special"], special: { kind: "fermata" } },
  { id: "sp_rest", nameKo: "쉼표", faction: "neutral", row: "rhythm", type: "special", basePower: null, tags: ["weather"], special: { kind: "weather", row: "rhythm" } },
  { id: "sp_mute", nameKo: "약음기", faction: "neutral", row: "melody", type: "special", basePower: null, tags: ["weather"], special: { kind: "weather", row: "melody" } },
  { id: "sp_dissonance", nameKo: "불협화음", faction: "neutral", row: "harmony", type: "special", basePower: null, tags: ["weather"], special: { kind: "weather", row: "harmony" } },
  { id: "sp_clear", nameKo: "투티 클리어", faction: "neutral", row: "any", type: "special", basePower: null, tags: ["clear"], special: { kind: "clear" } },

  { id: "ld_maggiore", nameKo: "마에스트라 마조레", faction: "maggiore", row: "any", type: "leader", basePower: null, tags: ["leader"] },
  { id: "ld_tempo", nameKo: "퍼커션 디렉터", faction: "tempo", row: "any", type: "leader", basePower: null, tags: ["leader"] },
  { id: "ld_minore", nameKo: "길드마스터 미노레", faction: "minore", row: "any", type: "leader", basePower: null, tags: ["leader"] },
  { id: "ld_tension", nameKo: "텐션 디렉터", faction: "tension", row: "any", type: "leader", basePower: null, tags: ["leader"], cadenza: { tier: 2, kind: "ear_chord", effect: { kind: "multiply_row" } } },

  { id: "token_ensemble", nameKo: "단원 토큰", faction: "neutral", row: "any", type: "bronze", basePower: 2, tags: ["token"] }
];

const CARD_MAP = new Map(CARDS.map((card) => [card.id, card]));

export function getCard(id: string): CardDef {
  const card = CARD_MAP.get(id);
  if (!card) throw new Error(`Unknown card: ${id}`);
  return card;
}

export function isUnitCard(card: CardDef): boolean {
  return card.basePower !== null && card.type !== "leader" && card.type !== "special";
}
