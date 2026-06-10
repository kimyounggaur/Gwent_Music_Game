export type AiPersona = "easy" | "normal" | "hard";

export const CADENZA_SUCCESS: Record<AiPersona, Record<1 | 2 | 3 | 4, number>> = {
  easy: { 1: 0.5, 2: 0.3, 3: 0.15, 4: 0.05 },
  normal: { 1: 0.75, 2: 0.6, 3: 0.45, 4: 0.25 },
  hard: { 1: 0.95, 2: 0.85, 3: 0.7, 4: 0.55 }
};

export const AI_WEIGHTS = {
  immediatePoints: 1,
  cadenzaEV: 0.9,
  synergyDelta: 1.1,
  interferenceValue: 0.8,
  weatherRisk: 1,
  holdPenalty: 1,
  overcommit: 0.5
};
