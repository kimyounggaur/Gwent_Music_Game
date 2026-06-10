import { getCard, isUnitCard } from "@/data/cards";
import { getDeck, type DeckDef } from "@/data/decks";
import { consumePendingForUnit, resolveEffect, resolveSpecial, useLeader } from "./effects";
import { createRng, shuffle } from "./rng";
import { otherSide, ROWS } from "./types";
import type { GameEvent, GameState, Move, PlayerState, RowId, Side, UnitInstance } from "./types";
import { scoreRowWithEnsemble } from "./ensemble";

function emptyRows(): PlayerState["rows"] {
  return { melody: [], harmony: [], rhythm: [] };
}

function leaderCharges(leaderId: string): number {
  if (leaderId === "ld_tempo") return 3;
  if (leaderId === "ld_tension") return 1;
  return 2;
}

function event(state: GameState, type: string, message: string, side?: Side, data?: Record<string, unknown>): GameEvent {
  return { id: state.log.length, type, side, message, data };
}

function pushEvent(state: GameState, type: string, message: string, side?: Side, data?: Record<string, unknown>): GameState {
  return { ...state, log: [...state.log, event(state, type, message, side, data)] };
}

function createPlayer(deckInput: string | DeckDef, seed: string, side: Side): { player: PlayerState; rngState: number } {
  const deck = typeof deckInput === "string" ? getDeck(deckInput) : deckInput;
  const rng = createRng(`${seed}:${side}:deck`);
  const shuffled = shuffle(deck.cards, rng);
  return {
    player: {
      hand: shuffled.slice(0, 10),
      deck: shuffled.slice(10),
      archive: [],
      rows: emptyRows(),
      passed: false,
      tokens: 0,
      mulligansLeft: 2,
      mulliganDone: false,
      leaderId: deck.leaderId,
      leaderCharges: leaderCharges(deck.leaderId),
      fortissimo: {}
    },
    rngState: rng.getState()
  };
}

export function createGame(playerDeckId: string, aiDeckId: string, seed: string): GameState {
  return createGameFromDecks(getDeck(playerDeckId), getDeck(aiDeckId), seed);
}

export function createGameFromDecks(playerDeck: DeckDef, aiDeck: DeckDef, seed: string): GameState {
  const player = createPlayer(playerDeck, seed, "player");
  const ai = createPlayer(aiDeck, seed, "ai");
  const coin = createRng(`${seed}:coin`);
  return {
    seed,
    rngState: coin.getState() ^ player.rngState ^ ai.rngState,
    round: 1,
    turn: coin.chance(0.5) ? "player" : "ai",
    phase: "mulligan",
    players: { player: player.player, ai: ai.player },
    weather: { player: {}, ai: {} },
    winner: null,
    log: [],
    pendingEffects: []
  };
}

function playableRows(cardId: string): RowId[] {
  const card = getCard(cardId);
  if (card.type === "special") {
    if (card.special?.kind === "weather") return [card.special.row];
    return ROWS;
  }
  if (card.row === "any") return ROWS;
  return [card.row];
}

function sameMove(a: Move, b: Move): boolean {
  if (a.kind !== b.kind) return false;
  if (a.kind === "play" && b.kind === "play") return a.cardUid === b.cardUid && a.row === b.row;
  if (a.kind === "mulligan" && b.kind === "mulligan") return a.cardUid === b.cardUid;
  return true;
}

export function legalMoves(state: GameState, side: Side): Move[] {
  const player = state.players[side];
  if (state.phase === "gameEnd") return [];
  if (state.phase === "mulligan") {
    if (player.mulliganDone) return [];
    const mulligans: Move[] = player.mulligansLeft > 0 ? [...new Set(player.hand)].map((cardUid) => ({ kind: "mulligan", cardUid })) : [];
    return [...mulligans, { kind: "mulliganDone" }];
  }
  if (state.phase !== "play" || state.turn !== side || player.passed) return [];

  const moves: Move[] = [{ kind: "pass" }];
  if (player.leaderCharges > 0) moves.push({ kind: "leader" });
  for (const cardUid of [...new Set(player.hand)]) {
    for (const row of playableRows(cardUid)) {
      if (getCard(cardUid).type === "special" || player.rows[row].length < 7) {
        moves.push({ kind: "play", cardUid, row });
      }
    }
  }
  return moves;
}

function assertLegal(state: GameState, side: Side, move: Move): void {
  if (!legalMoves(state, side).some((legal) => sameMove(legal, move))) {
    throw new Error(`Illegal move: ${JSON.stringify(move)}`);
  }
}

function withTurnAdvanced(state: GameState, side: Side): GameState {
  const opponent = otherSide(side);
  if (state.phase !== "play") return state;
  if (state.players[opponent].passed) return { ...state, turn: side };
  return { ...state, turn: opponent };
}

function removeFirst(items: readonly string[], value: string): string[] {
  const copy = [...items];
  const index = copy.indexOf(value);
  if (index >= 0) copy.splice(index, 1);
  return copy;
}

function applyMulligan(state: GameState, side: Side, cardUid: string): GameState {
  const player = state.players[side];
  const rng = createRng(state.seed, state.rngState);
  const hand = removeFirst(player.hand, cardUid);
  const deck = shuffle([...player.deck, cardUid], rng);
  const drawn = deck[0];
  const nextPlayer: PlayerState = {
    ...player,
    hand: [...hand, drawn],
    deck: deck.slice(1),
    mulligansLeft: player.mulligansLeft - 1
  };
  return {
    ...pushEvent(state, "mulligan", `${side} mulliganed ${cardUid}`, side),
    rngState: rng.getState(),
    players: { ...state.players, [side]: nextPlayer }
  };
}

function applyMulliganDone(state: GameState, side: Side): GameState {
  const updated = {
    ...state,
    players: {
      ...state.players,
      [side]: { ...state.players[side], mulliganDone: true }
    }
  };
  const bothDone = updated.players.player.mulliganDone && updated.players.ai.mulliganDone;
  return pushEvent({ ...updated, phase: bothDone ? "play" : "mulligan" }, "mulliganDone", `${side} is ready`, side);
}

function resetAfterRound(state: GameState): GameState {
  const nextPlayers = { ...state.players };
  for (const side of ["player", "ai"] as Side[]) {
    const player = state.players[side];
    const archive = [...player.archive];
    const rows = emptyRows();
    for (const row of ROWS) {
      for (const unit of player.rows[row]) {
        if (unit.sustain) {
          rows[row].push({ ...unit, boost: 0, damage: 0, sustain: false });
        } else {
          archive.push(unit.cardId);
        }
      }
    }
    nextPlayers[side] = { ...player, rows, archive, passed: false, fortissimo: {} };
  }
  return {
    ...state,
    players: nextPlayers,
    weather: { player: {}, ai: {} },
    pendingEffects: []
  };
}

function endRoundIfNeeded(state: GameState): GameState {
  if (state.phase !== "play" || !state.players.player.passed || !state.players.ai.passed) return state;
  const playerScore = scoreTotal(state, "player");
  const aiScore = scoreTotal(state, "ai");
  const players = { ...state.players };
  if (playerScore >= aiScore) players.player = { ...players.player, tokens: players.player.tokens + 1 };
  if (aiScore >= playerScore) players.ai = { ...players.ai, tokens: players.ai.tokens + 1 };

  let next: GameState = pushEvent({ ...state, players }, "roundEnd", `Movement ${state.round} ended ${playerScore}-${aiScore}`);
  const playerWon = next.players.player.tokens >= 2;
  const aiWon = next.players.ai.tokens >= 2;
  if (playerWon || aiWon || state.round >= 3) {
    const winner = playerWon && aiWon ? "draw" : playerWon ? "player" : aiWon ? "ai" : "draw";
    return pushEvent({ ...resetAfterRound(next), phase: "gameEnd", winner }, "gameEnd", `Game ended: ${winner}`);
  }
  next = resetAfterRound(next);
  return { ...next, round: (state.round + 1) as 1 | 2 | 3, turn: state.turn === "player" ? "ai" : "player" };
}

function applyPlay(state: GameState, side: Side, move: Extract<Move, { kind: "play" }>): GameState {
  const card = getCard(move.cardUid);
  const player = state.players[side];
  let next: GameState = {
    ...state,
    players: {
      ...state.players,
      [side]: {
        ...player,
        hand: removeFirst(player.hand, move.cardUid)
      }
    }
  };

  if (card.type === "special") {
    next = resolveSpecial(next, side, card.id, move.row);
    next = {
      ...next,
      players: {
        ...next.players,
        [side]: { ...next.players[side], archive: [...next.players[side].archive, card.id] }
      }
    };
    return pushEvent(withTurnAdvanced(next, side), "play", `${side} played ${card.nameKo}`, side, { cardId: card.id, row: move.row, cadenzaSuccess: false });
  }

  if (!isUnitCard(card)) throw new Error("Leaders cannot be played as units");
  if (next.players[side].rows[move.row].length >= 7) throw new Error("Row is full");
  const unit: UnitInstance = {
    uid: `${side}-${state.round}-${state.log.length}-${card.id}`,
    cardId: card.id,
    boost: 0,
    damage: 0,
    sustain: false,
    cadenzaDone: Boolean(card.cadenza)
  };
  next = {
    ...next,
    players: {
      ...next.players,
      [side]: {
        ...next.players[side],
        rows: { ...next.players[side].rows, [move.row]: [...next.players[side].rows[move.row], unit] }
      }
    }
  };
  next = consumePendingForUnit(next, side, move.row, unit.uid);
  if (move.cadenzaSuccess && card.cadenza) {
    next = resolveEffect(next, side, card.cadenza.effect, { row: move.row, unitUid: unit.uid });
  }
  return pushEvent(withTurnAdvanced(next, side), "play", `${side} played ${card.nameKo}`, side, { cardId: card.id, row: move.row, cadenzaSuccess: Boolean(move.cadenzaSuccess) });
}

export function applyMove(state: GameState, move: Move): GameState {
  const side = state.phase === "mulligan" ? (state.players.player.mulliganDone ? "ai" : "player") : state.turn;
  assertLegal(state, side, move);

  if (move.kind === "mulligan") return applyMulligan(state, side, move.cardUid);
  if (move.kind === "mulliganDone") return applyMulliganDone(state, side);
  if (move.kind === "leader") return pushEvent(withTurnAdvanced(useLeader(state, side), side), "leader", `${side} used leader`, side);
  if (move.kind === "pass") {
    const next = pushEvent(
      {
        ...state,
        players: { ...state.players, [side]: { ...state.players[side], passed: true } }
      },
      "pass",
      `${side} passed`,
      side
    );
    return endRoundIfNeeded(withTurnAdvanced(next, side));
  }
  return endRoundIfNeeded(applyPlay(state, side, move));
}

export function scoreRow(state: GameState, side: Side, row: RowId): number {
  return scoreRowWithEnsemble(state, side, row);
}

export function scoreTotal(state: GameState, side: Side): number {
  return ROWS.reduce((sum, row) => sum + scoreRow(state, side, row), 0);
}
