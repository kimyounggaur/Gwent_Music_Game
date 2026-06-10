import { getCard } from "@/data/cards";
import { applyMove, createGame, legalMoves, scoreTotal } from "@/engine/core";
import { createRng } from "@/engine/rng";
import { otherSide, ROWS } from "@/engine/types";
import type { GameState, Move, Side } from "@/engine/types";
import { rollAiCadenza, estimateCadenzaReward } from "./cadenza";
import { AI_WEIGHTS, type AiPersona } from "./persona";
import { shouldPass } from "./pass";

export interface Candidate {
  move: Move;
  preview: string;
}

function spentCards(state: GameState, side: Side): number {
  const player = state.players[side];
  return player.archive.length + ROWS.reduce((sum, row) => sum + player.rows[row].length, 0);
}

function aiView(state: GameState, side: Side, persona: AiPersona) {
  const opponent = otherSide(side);
  return {
    round: state.round,
    myScore: scoreTotal(state, side),
    oppScore: scoreTotal(state, opponent),
    myTokens: state.players[side].tokens,
    oppTokens: state.players[opponent].tokens,
    myHand: state.players[side].hand,
    oppHand: state.players[opponent].hand.length,
    oppPassed: state.players[opponent].passed,
    cardsSpentDiff: spentCards(state, opponent) - spentCards(state, side),
    persona
  };
}

export function generateCandidates(state: GameState, side: Side = state.turn): Candidate[] {
  return legalMoves(state, side).map((move) => ({
    move,
    preview: move.kind === "play" ? `${move.cardUid} -> ${move.row}` : move.kind
  }));
}

function withAiCadenza(state: GameState, move: Move, persona: AiPersona): Move {
  if (move.kind !== "play") return move;
  const success = rollAiCadenza(state.seed, state.log.length, move.cardUid, persona);
  return success === undefined ? move : { ...move, cadenzaSuccess: success };
}

function applyPreview(state: GameState, side: Side, move: Move, persona: AiPersona): GameState | null {
  try {
    const previewState = state.turn === side ? state : { ...state, turn: side };
    return applyMove(previewState, withAiCadenza(previewState, move, persona));
  } catch {
    return null;
  }
}

export function evaluateGreedy(state: GameState, move: Move, side: Side = state.turn): number {
  const before = scoreTotal(state, side) - scoreTotal(state, otherSide(side));
  const after = applyPreview(state, side, move, "easy");
  if (!after) return -9999;
  return scoreTotal(after, side) - scoreTotal(after, otherSide(side)) - before;
}

function synergyEstimate(state: GameState, move: Move, side: Side): number {
  if (move.kind !== "play") return 0;
  const card = getCard(move.cardUid);
  const rowUnits = state.players[side].rows[move.row].map((unit) => getCard(unit.cardId));
  if (card.ensemble?.bondGroup) {
    const members = card.ensemble.bondMembers ?? [];
    const present = new Set([...rowUnits.map((unitCard) => unitCard.id), card.id]);
    if (members.every((member) => present.has(member))) return 8;
    if (members.filter((member) => present.has(member)).length === members.length - 1) return 3;
  }
  if (card.tags.includes("dominant") || card.tags.includes("tonic")) return 2;
  if (card.ensemble?.keyTag) return 1;
  return 0;
}

function weatherRisk(state: GameState, move: Move, side: Side): number {
  if (move.kind !== "play") return 0;
  const card = getCard(move.cardUid);
  if (!card.basePower || card.immune) return 0;
  return state.weather[side][move.row] ? Math.max(0, card.basePower - 1) : 0;
}

function interferenceValue(state: GameState, move: Move, side: Side): number {
  if (move.kind !== "play") return 0;
  const card = getCard(move.cardUid);
  if (!card.special || card.special.kind !== "weather") return 0;
  const opponent = otherSide(side);
  const row = card.special.row;
  const rowCards = state.players[opponent].rows[row];
  const lost = rowCards.reduce((sum, unit) => sum + Math.max(0, (getCard(unit.cardId).basePower ?? 0) - 1), 0);
  return lost * (state.players[opponent].passed ? 1.2 : 0.8);
}

export function evaluate(state: GameState, move: Move, persona: AiPersona, side: Side = state.turn): number {
  if (move.kind === "pass") return shouldPass(aiView(state, side, persona)) ? 1000 : -10;
  const greedy = evaluateGreedy(state, move, side);
  const card = move.kind === "play" ? getCard(move.cardUid) : null;
  const cadenzaEV = card ? estimateCadenzaReward(card, persona) : 0;
  const holdPenalty = card?.type === "virtuoso" && state.round === 1 && scoreTotal(state, side) > scoreTotal(state, otherSide(side)) ? 6 : 0;
  const overcommit =
    state.players[otherSide(side)].passed && greedy > 1 ? Math.max(0, scoreTotal(state, side) + greedy - scoreTotal(state, otherSide(side)) - 1) : 0;
  return (
    greedy * AI_WEIGHTS.immediatePoints +
    cadenzaEV * AI_WEIGHTS.cadenzaEV +
    synergyEstimate(state, move, side) * AI_WEIGHTS.synergyDelta +
    interferenceValue(state, move, side) * AI_WEIGHTS.interferenceValue -
    weatherRisk(state, move, side) * AI_WEIGHTS.weatherRisk -
    holdPenalty * AI_WEIGHTS.holdPenalty -
    overcommit * AI_WEIGHTS.overcommit
  );
}

function evaluateHard(state: GameState, move: Move, side: Side): number {
  const base = evaluate(state, move, "hard", side);
  const after = applyPreview(state, side, move, "hard");
  const opponent = otherSide(side);
  if (!after || after.phase !== "play" || after.turn !== opponent) return base;
  const reply =
    generateCandidates(after, opponent)
      .map((candidate) => evaluate(after, candidate.move, "normal", opponent))
      .sort((a, b) => b - a)[0] ?? 0;
  return base - reply * 0.45;
}

function chooseMinimalOvertake(state: GameState, side: Side, persona: AiPersona): Move | null {
  const opponent = otherSide(side);
  if (!state.players[opponent].passed || scoreTotal(state, side) > scoreTotal(state, opponent)) return null;
  const target = scoreTotal(state, opponent) + 1;
  const options = generateCandidates(state, side)
    .filter((candidate) => candidate.move.kind === "play")
    .map((candidate) => {
      const next = applyPreview(state, side, candidate.move, persona);
      return { move: candidate.move, score: next ? scoreTotal(next, side) : -9999 };
    })
    .filter((item) => item.score >= target)
    .sort((a, b) => a.score - b.score);
  return options[0]?.move ?? null;
}

export function chooseMove(state: GameState, persona: AiPersona, side: Side = state.turn): Move {
  const view = aiView(state, side, persona);
  const minimal = chooseMinimalOvertake(state, side, persona);
  if (minimal) return withAiCadenza(state, minimal, persona);
  if (persona === "easy") {
    if ((view.oppPassed && view.myScore > view.oppScore) || view.myHand.length === 0) return { kind: "pass" };
  } else if (shouldPass(view)) {
    return { kind: "pass" };
  }

  const candidates = generateCandidates(state, side).filter((candidate) => candidate.move.kind !== "mulligan" && candidate.move.kind !== "mulliganDone");
  const scored = candidates
    .map((candidate) => ({
      ...candidate,
      score: persona === "easy" ? evaluateGreedy(state, candidate.move, side) : persona === "hard" ? evaluateHard(state, candidate.move, side) : evaluate(state, candidate.move, persona, side)
    }))
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) return { kind: "pass" };
  if (persona === "easy") {
    const rng = createRng(`${state.seed}:easy:${state.log.length}:${side}`);
    if (rng.chance(0.5)) {
      const loosePool = scored.filter((item) => item.move.kind !== "pass");
      const pool = loosePool.length > 0 ? loosePool : scored;
      return withAiCadenza(state, pool[rng.int(pool.length)].move, persona);
    }
    return withAiCadenza(state, scored[0].move, persona);
  }
  if (persona === "hard" && view.myScore > view.oppScore && view.myHand.length > 2 && !view.oppPassed) {
    const rng = createRng(`${state.seed}:bait:${state.log.length}:${side}`);
    if (rng.chance(0.18)) return withAiCadenza(state, scored[0].move, persona);
  }
  return withAiCadenza(state, scored[0].move, persona);
}

export interface SimulationResult {
  winner: Side | "draw" | null;
  rounds: number;
  finalScores: Record<Side, number>;
  turns: number;
  cadenzaAttempts: number;
  cadenzaSuccesses: number;
}

export function runGame(deckA: string, deckB: string, personaA: AiPersona, personaB: AiPersona, seed: string): SimulationResult {
  let state = createGame(deckA, deckB, seed);
  state = applyMove(state, { kind: "mulliganDone" });
  state = applyMove(state, { kind: "mulliganDone" });
  let turns = 0;
  while (state.phase !== "gameEnd" && turns < 200) {
    const side = state.turn;
    const persona = side === "player" ? personaA : personaB;
    const move = chooseMove(state, persona, side);
    state = applyMove(state, move);
    turns += 1;
  }
  const cadenzaMoves = state.log.filter((item) => item.type === "play" && typeof item.data?.cardId === "string" && getCard(item.data.cardId).cadenza);
  return {
    winner: state.winner,
    rounds: state.round,
    finalScores: { player: scoreTotal(state, "player"), ai: scoreTotal(state, "ai") },
    turns,
    cadenzaAttempts: cadenzaMoves.length,
    cadenzaSuccesses: cadenzaMoves.filter((item) => Boolean(item.data?.cadenzaSuccess)).length
  };
}
