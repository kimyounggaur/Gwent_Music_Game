import { getCard, isUnitCard } from "@/data/cards";
import type { EffectSpec, GameState, RowId, Side, UnitInstance } from "./types";
import { otherSide, ROWS } from "./types";
import { rawUnitPower } from "./ensemble";

function cloneRows(rows: GameState["players"][Side]["rows"]): GameState["players"][Side]["rows"] {
  return {
    melody: rows.melody.map((unit) => ({ ...unit })),
    harmony: rows.harmony.map((unit) => ({ ...unit })),
    rhythm: rows.rhythm.map((unit) => ({ ...unit }))
  };
}

export function archiveUnit(state: GameState, side: Side, row: RowId, uid: string): GameState {
  const player = state.players[side];
  const rows = cloneRows(player.rows);
  const unit = rows[row].find((candidate) => candidate.uid === uid);
  if (!unit) return state;
  rows[row] = rows[row].filter((candidate) => candidate.uid !== uid);
  return {
    ...state,
    players: {
      ...state.players,
      [side]: {
        ...player,
        rows,
        archive: [...player.archive, unit.cardId]
      }
    }
  };
}

export function cleanupDead(state: GameState): GameState {
  let next = state;
  for (const side of ["player", "ai"] as Side[]) {
    for (const row of ROWS) {
      for (const unit of [...next.players[side].rows[row]]) {
        if (rawUnitPower(next, side, row, unit) <= 0) {
          next = archiveUnit(next, side, row, unit.uid);
        }
      }
    }
  }
  return next;
}

function updateUnit(state: GameState, side: Side, row: RowId, uid: string, updater: (unit: UnitInstance) => UnitInstance): GameState {
  const player = state.players[side];
  const rows = cloneRows(player.rows);
  rows[row] = rows[row].map((unit) => (unit.uid === uid ? updater(unit) : unit));
  return {
    ...state,
    players: {
      ...state.players,
      [side]: { ...player, rows }
    }
  };
}

function boostUnit(state: GameState, side: Side, row: RowId, uid: string, amount: number): GameState {
  return updateUnit(state, side, row, uid, (unit) => ({ ...unit, boost: unit.boost + amount }));
}

function boostRow(state: GameState, side: Side, row: RowId, amount: number, tag?: string): GameState {
  let next = state;
  for (const unit of next.players[side].rows[row]) {
    if (!tag || getCard(unit.cardId).tags.includes(tag)) {
      next = boostUnit(next, side, row, unit.uid, amount);
    }
  }
  return next;
}

function findUnitRow(state: GameState, side: Side, uid: string): RowId | null {
  for (const row of ROWS) {
    if (state.players[side].rows[row].some((unit) => unit.uid === uid)) return row;
  }
  return null;
}

export function consumePendingForUnit(state: GameState, side: Side, row: RowId, uid: string): GameState {
  const unit = state.players[side].rows[row].find((candidate) => candidate.uid === uid);
  if (!unit) return state;
  const card = getCard(unit.cardId);
  let next = state;
  const pending = [...next.pendingEffects];
  for (let index = 0; index < pending.length; index += 1) {
    const effect = pending[index];
    if (effect.side === side && card.tags.includes(effect.tag) && effect.remaining > 0) {
      next = boostUnit(next, side, row, uid, effect.amount);
      pending[index] = { ...effect, remaining: effect.remaining - 1 };
      break;
    }
  }
  return { ...next, pendingEffects: pending.filter((effect) => effect.remaining > 0) };
}

export function resolveEffect(state: GameState, side: Side, effect: EffectSpec, ctx: { row: RowId; unitUid?: string }): GameState {
  let next = state;
  if (effect.kind === "boost_self" && ctx.unitUid) {
    next = boostUnit(next, side, ctx.row, ctx.unitUid, effect.amount ?? 0);
  }
  if (effect.kind === "boost_adjacent" && ctx.unitUid) {
    const units = next.players[side].rows[ctx.row];
    const index = units.findIndex((unit) => unit.uid === ctx.unitUid);
    for (const neighborIndex of [index - 1, index + 1]) {
      const neighbor = units[neighborIndex];
      if (neighbor) next = boostUnit(next, side, ctx.row, neighbor.uid, effect.amount ?? 0);
    }
  }
  if (effect.kind === "boost_next_tag" && effect.tag) {
    next = {
      ...next,
      pendingEffects: [
        ...next.pendingEffects,
        { side, kind: "boost_next_tag", tag: effect.tag, amount: effect.amount ?? 0, remaining: 1 }
      ]
    };
  }
  if (effect.kind === "boost_row") {
    next = boostRow(next, side, effect.row ?? ctx.row, effect.amount ?? 0, effect.tag);
  }
  if (effect.kind === "scorch") {
    const opponent = otherSide(side);
    const candidates = ROWS.flatMap((row) =>
      next.players[opponent].rows[row].map((unit) => ({ row, unit, power: rawUnitPower(next, opponent, row, unit) }))
    );
    const max = Math.max(0, ...candidates.map((candidate) => candidate.power));
    for (const candidate of candidates.filter((item) => item.power === max && item.power > 0)) {
      next = archiveUnit(next, opponent, candidate.row, candidate.unit.uid);
    }
  }
  if (effect.kind === "summon") {
    const player = next.players[side];
    if (player.rows[ctx.row].length < 7) {
      const token: UnitInstance = {
        uid: `${side}-${next.log.length}-token-${player.rows[ctx.row].length}`,
        cardId: "token_ensemble",
        boost: Math.max(0, (effect.amount ?? 2) - 2),
        damage: 0,
        sustain: false,
        cadenzaDone: true
      };
      next = {
        ...next,
        players: {
          ...next.players,
          [side]: {
            ...player,
            rows: { ...player.rows, [ctx.row]: [...player.rows[ctx.row], token] }
          }
        }
      };
    }
  }
  if (effect.kind === "multiply_row") {
    next = {
      ...next,
      players: {
        ...next.players,
        [side]: {
          ...next.players[side],
          fortissimo: { ...next.players[side].fortissimo, [ctx.row]: true }
        }
      }
    };
  }
  return cleanupDead(next);
}

export function resolveSpecial(state: GameState, side: Side, cardId: string, row: RowId): GameState {
  const card = getCard(cardId);
  const special = card.special;
  let next = state;
  if (!special) return next;

  if (special.kind === "weather") {
    const opponent = otherSide(side);
    next = {
      ...next,
      weather: {
        ...next.weather,
        [opponent]: { ...next.weather[opponent], [special.row]: true }
      }
    };
  } else if (special.kind === "clear") {
    next = { ...next, weather: { player: {}, ai: {} } };
  } else if (special.kind === "fortissimo") {
    next = resolveEffect(next, side, { kind: "multiply_row" }, { row });
  } else if (special.kind === "reprise") {
    const player = next.players[side];
    const cardIdFromArchive = player.archive.find((id) => isUnitCard(getCard(id)));
    if (cardIdFromArchive && player.rows[row].length < 7) {
      const archive = [...player.archive];
      archive.splice(archive.indexOf(cardIdFromArchive), 1);
      const unit: UnitInstance = {
        uid: `${side}-${next.log.length}-reprise-${cardIdFromArchive}`,
        cardId: cardIdFromArchive,
        boost: 0,
        damage: 0,
        sustain: false,
        cadenzaDone: true
      };
      next = {
        ...next,
        players: {
          ...next.players,
          [side]: {
            ...player,
            archive,
            rows: { ...player.rows, [row]: [...player.rows[row], unit] }
          }
        }
      };
    }
  } else if (special.kind === "fermata") {
    const unit = next.players[side].rows[row][0];
    if (unit) next = updateUnit(next, side, row, unit.uid, (target) => ({ ...target, sustain: true }));
  } else {
    next = resolveEffect(next, side, special, { row });
  }
  return cleanupDead(next);
}

export function useLeader(state: GameState, side: Side): GameState {
  const player = state.players[side];
  if (player.leaderCharges <= 0) throw new Error("Leader has no charges");
  const leader = getCard(player.leaderId);
  let next: GameState = {
    ...state,
    players: {
      ...state.players,
      [side]: { ...player, leaderCharges: player.leaderCharges - 1 }
    }
  };

  if (leader.id === "ld_maggiore") {
    const target = ROWS.flatMap((row) => next.players[side].rows[row].map((unit) => ({ row, unit }))).sort(
      (a, b) => rawUnitPower(next, side, b.row, b.unit) - rawUnitPower(next, side, a.row, a.unit)
    )[0];
    if (target) next = boostUnit(next, side, target.row, target.unit.uid, 3);
  }
  if (leader.id === "ld_tempo") next = boostRow(next, side, "rhythm", 1);
  if (leader.id === "ld_minore") {
    const bronze = next.players[side].archive.find((id) => getCard(id).type === "bronze");
    if (bronze) {
      const archive = [...next.players[side].archive];
      archive.splice(archive.indexOf(bronze), 1);
      next = {
        ...next,
        players: {
          ...next.players,
          [side]: { ...next.players[side], archive, hand: [...next.players[side].hand, bronze] }
        }
      };
    }
  }
  if (leader.id === "ld_tension") {
    const bestRow = ROWS.map((row) => ({ row, score: next.players[side].rows[row].length })).sort((a, b) => b.score - a.score)[0]?.row ?? "harmony";
    next = resolveEffect(next, side, { kind: "multiply_row" }, { row: bestRow });
  }
  return cleanupDead(next);
}

export function locateUnit(state: GameState, side: Side, uid: string): { row: RowId; unit: UnitInstance } | null {
  const row = findUnitRow(state, side, uid);
  if (!row) return null;
  const unit = state.players[side].rows[row].find((candidate) => candidate.uid === uid);
  return unit ? { row, unit } : null;
}
