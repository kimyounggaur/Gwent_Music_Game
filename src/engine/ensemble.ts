import { getCard } from "@/data/cards";
import type { GameState, RowId, Side, UnitInstance } from "./types";

export function rawUnitPower(state: GameState, side: Side, row: RowId, unit: UnitInstance): number {
  const card = getCard(unit.cardId);
  const base = state.weather[side][row] && !card.immune ? 1 : card.basePower ?? 0;
  return Math.max(0, base + unit.boost - unit.damage);
}

function unitKeyTag(unit: UnitInstance): string | undefined {
  const card = getCard(unit.cardId);
  return card.ensemble?.keyTag;
}

export function scoreRowUnits(state: GameState, side: Side, row: RowId): number[] {
  const units = state.players[side].rows[row];
  const values = units.map((unit) => rawUnitPower(state, side, row, unit));

  const groups = new Map<string, string[]>();
  for (const unit of units) {
    const card = getCard(unit.cardId);
    if (card.ensemble?.bondGroup && card.ensemble.bondMembers) {
      groups.set(card.ensemble.bondGroup, card.ensemble.bondMembers);
    }
  }

  for (const [group, members] of groups) {
    const present = new Set(units.filter((unit) => getCard(unit.cardId).ensemble?.bondGroup === group).map((unit) => unit.cardId));
    if (members.every((member) => present.has(member))) {
      units.forEach((unit, index) => {
        if (getCard(unit.cardId).ensemble?.bondGroup === group) values[index] *= 2;
      });
    }
  }

  if (row === "harmony") {
    for (let index = 0; index < units.length; index += 1) {
      const card = getCard(units[index].cardId);
      const cadence = card.ensemble?.cadence;
      if (!cadence) continue;
      for (const neighborIndex of [index - 1, index + 1]) {
        const neighbor = units[neighborIndex];
        if (neighbor && getCard(neighbor.cardId).tags.includes(cadence.withTag)) {
          values[index] += cadence.bonus;
          values[neighborIndex] += cadence.bonus;
        }
      }
    }
  }

  const keyCounts = new Map<string, number>();
  for (const unit of units) {
    const keyTag = unitKeyTag(unit);
    if (keyTag) keyCounts.set(keyTag, (keyCounts.get(keyTag) ?? 0) + 1);
  }
  const activeKeys = [...keyCounts.entries()].filter(([, count]) => count >= 3).map(([key]) => key);
  if (activeKeys.length > 0) {
    units.forEach((unit, index) => {
      const keyTag = unitKeyTag(unit);
      if (keyTag && activeKeys.includes(keyTag)) values[index] += 1;
    });
  }

  if (state.players[side].fortissimo[row]) {
    units.forEach((unit, index) => {
      if (getCard(unit.cardId).type !== "virtuoso") values[index] *= 2;
    });
  }

  return values.map((value) => Math.max(0, value));
}

export function scoreRowWithEnsemble(state: GameState, side: Side, row: RowId): number {
  return scoreRowUnits(state, side, row).reduce((sum, value) => sum + value, 0);
}
