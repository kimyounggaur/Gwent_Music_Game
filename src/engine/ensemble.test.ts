import { describe, expect, it } from "vitest";
import { createGame, scoreRow } from "./core";
import type { GameState, RowId } from "./types";

function rowState(cardIds: string[], row: RowId = "melody", weather = false): GameState {
  const state = createGame("PLAYER_STARTER", "AI_EASY", `ensemble-${cardIds.join("-")}`);
  return {
    ...state,
    phase: "play",
    weather: {
      ...state.weather,
      player: { ...state.weather.player, [row]: weather }
    },
    players: {
      ...state.players,
      player: {
        ...state.players.player,
        fortissimo: {},
        rows: {
          ...state.players.player.rows,
          [row]: cardIds.map((cardId, index) => ({
            uid: `u-${index}`,
            cardId,
            boost: 0,
            damage: 0,
            sustain: false,
            cadenzaDone: false
          }))
        }
      }
    }
  };
}

describe("ensemble scoring", () => {
  it("doubles do-mi-sol when all bond members share a row", () => {
    expect(scoreRow(rowState(["mel_do", "mel_mi", "mel_sol"]), "player", "melody")).toBe(14);
  });

  it("does not trigger bond with only two members", () => {
    expect(scoreRow(rowState(["mel_do", "mel_mi"]), "player", "melody")).toBe(4);
  });

  it("adds cadence bonus only for adjacent V7 and tonic", () => {
    expect(scoreRow(rowState(["har_dom7", "har_tonic"], "harmony"), "player", "harmony")).toBe(14);
    expect(scoreRow(rowState(["har_dom7", "har_subdom", "har_tonic"], "harmony"), "player", "harmony")).toBe(14);
  });

  it("adds key cohesion when three keyC cards share a row", () => {
    expect(scoreRow(rowState(["mel_maj3", "mel_p5", "mel_scale"]), "player", "melody")).toBe(15);
  });

  it("stacks bond before fortissimo", () => {
    const state = rowState(["mel_do", "mel_mi", "mel_sol"]);
    const boosted = {
      ...state,
      players: {
        ...state.players,
        player: { ...state.players.player, fortissimo: { melody: true } }
      }
    };

    expect(scoreRow(boosted, "player", "melody")).toBe(28);
  });

  it("applies bond over weathered base one", () => {
    expect(scoreRow(rowState(["mel_do", "mel_mi", "mel_sol"], "melody", true), "player", "melody")).toBe(6);
  });
});
