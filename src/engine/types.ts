export type RowId = "melody" | "harmony" | "rhythm";
export type Side = "player" | "ai";
export type Faction = "maggiore" | "minore" | "tempo" | "tension" | "neutral";
export type CardType = "bronze" | "virtuoso" | "special" | "leader";
export type ChallengeKind = "theory_mc" | "theory_build" | "ear_interval" | "ear_chord" | "ear_rhythm";

export interface EffectSpec {
  kind: "boost_self" | "boost_adjacent" | "boost_next_tag" | "boost_row" | "scorch" | "summon" | "multiply_row" | "draw";
  amount?: number;
  tag?: string;
  row?: RowId;
}

export interface CadenzaSpec {
  tier: 1 | 2 | 3 | 4;
  kind: ChallengeKind;
  effect: EffectSpec;
}

export interface EnsembleSpec {
  bondGroup?: string;
  bondMembers?: string[];
  cadence?: { withTag: string; bonus: number };
  keyTag?: string;
}

export interface CardDef {
  id: string;
  nameKo: string;
  faction: Faction;
  row: RowId | "any";
  type: CardType;
  basePower: number | null;
  tags: string[];
  cadenza?: CadenzaSpec;
  ensemble?: EnsembleSpec;
  immune?: boolean;
  special?:
    | EffectSpec
    | { kind: "weather"; row: RowId }
    | { kind: "clear" }
    | { kind: "fortissimo" }
    | { kind: "reprise" }
    | { kind: "fermata" };
}

export interface UnitInstance {
  uid: string;
  cardId: string;
  boost: number;
  damage: number;
  sustain: boolean;
  cadenzaDone: boolean;
}

export interface PlayerState {
  hand: string[];
  deck: string[];
  archive: string[];
  rows: Record<RowId, UnitInstance[]>;
  passed: boolean;
  tokens: number;
  mulligansLeft: number;
  mulliganDone: boolean;
  leaderId: string;
  leaderCharges: number;
  fortissimo: Partial<Record<RowId, boolean>>;
}

export interface GameEvent {
  id: number;
  type: string;
  side?: Side;
  message: string;
  data?: Record<string, unknown>;
}

export interface PendingEffect {
  side: Side;
  kind: "boost_next_tag";
  tag: string;
  amount: number;
  remaining: number;
}

export interface GameState {
  seed: string;
  rngState: number;
  round: 1 | 2 | 3;
  turn: Side;
  phase: "mulligan" | "play" | "roundEnd" | "gameEnd";
  players: Record<Side, PlayerState>;
  weather: Record<Side, Partial<Record<RowId, boolean>>>;
  winner: Side | "draw" | null;
  log: GameEvent[];
  pendingEffects: PendingEffect[];
}

export type Move =
  | { kind: "play"; cardUid: string; row: RowId; cadenzaSuccess?: boolean }
  | { kind: "pass" }
  | { kind: "leader" }
  | { kind: "mulligan"; cardUid: string }
  | { kind: "mulliganDone" };

export const ROWS: RowId[] = ["melody", "harmony", "rhythm"];

export function otherSide(side: Side): Side {
  return side === "player" ? "ai" : "player";
}
