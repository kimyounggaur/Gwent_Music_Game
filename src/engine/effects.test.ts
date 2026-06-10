import { describe, expect, it } from "vitest";
import { applyMove, createGame, scoreRow } from "./core";
import type { GameState } from "./types";

function playable(seed = "effects"): GameState {
  const base = createGame("PLAYER_STARTER", "AI_EASY", seed);
  return {
    ...base,
    phase: "play",
    turn: "player",
    players: {
      ...base.players,
      player: { ...base.players.player, hand: ["mel_scale", "har_tonic", "sp_fortissimo", "sp_reprise", "sp_fermata"] },
      ai: { ...base.players.ai, hand: ["sp_mute", "sp_staccato"] }
    }
  };
}

describe("effects and weather", () => {
  it("scores weathered base five plus boost three as four", () => {
    let state = playable();
    state = {
      ...state,
      players: { ...state.players, player: { ...state.players.player, hand: ["mel_maj3"] } }
    };
    state = applyMove(state, { kind: "play", cardUid: "mel_maj3", row: "melody", cadenzaSuccess: true });
    state = { ...state, turn: "ai" };
    state = applyMove(state, { kind: "play", cardUid: "sp_mute", row: "melody" });

    expect(scoreRow(state, "player", "melody")).toBe(4);
  });

  it("lets virtuosos ignore weather", () => {
    let state = playable("virtuoso");
    state = {
      ...state,
      players: { ...state.players, player: { ...state.players.player, hand: ["mel_chrom"] } }
    };
    state = applyMove(state, { kind: "play", cardUid: "mel_chrom", row: "melody", cadenzaSuccess: true });
    state = { ...state, turn: "ai", players: { ...state.players, ai: { ...state.players.ai, hand: ["sp_mute"] } } };
    state = applyMove(state, { kind: "play", cardUid: "sp_mute", row: "melody" });

    expect(scoreRow(state, "player", "melody")).toBeGreaterThanOrEqual(7);
  });

  it("removes all enemy units tied for highest raw power with staccato", () => {
    let state = playable("staccato");
    state = {
      ...state,
      turn: "ai",
      players: {
        ...state.players,
        player: {
          ...state.players.player,
          rows: {
            ...state.players.player.rows,
            melody: [
              { uid: "a", cardId: "mel_scale", boost: 0, damage: 0, sustain: false, cadenzaDone: false },
              { uid: "b", cardId: "har_sus4", boost: 0, damage: 0, sustain: false, cadenzaDone: false },
              { uid: "c", cardId: "mel_do", boost: 0, damage: 0, sustain: false, cadenzaDone: false }
            ]
          }
        },
        ai: { ...state.players.ai, hand: ["sp_staccato"] }
      }
    };

    state = applyMove(state, { kind: "play", cardUid: "sp_staccato", row: "melody" });

    expect(state.players.player.rows.melody.map((unit) => unit.uid)).toEqual(["c"]);
  });

  it("doubles only non-virtuoso units with fortissimo", () => {
    let state = playable("fortissimo");
    state = {
      ...state,
      players: {
        ...state.players,
        player: {
          ...state.players.player,
          hand: ["sp_fortissimo"],
          rows: {
            ...state.players.player.rows,
            melody: [
              { uid: "a", cardId: "mel_do", boost: 0, damage: 0, sustain: false, cadenzaDone: false },
              { uid: "b", cardId: "mel_chrom", boost: 0, damage: 0, sustain: false, cadenzaDone: false }
            ]
          }
        }
      }
    };
    state = applyMove(state, { kind: "play", cardUid: "sp_fortissimo", row: "melody" });

    expect(scoreRow(state, "player", "melody")).toBe(11);
  });

  it("applies boost_next_tag only to the next matching tonic card", () => {
    let state = playable("next-tag");
    state = { ...state, players: { ...state.players, player: { ...state.players.player, hand: ["har_dom7", "har_tonic", "har_tonic"] } } };
    state = applyMove(state, { kind: "play", cardUid: "har_dom7", row: "harmony", cadenzaSuccess: true });
    state = { ...state, turn: "player" };
    state = applyMove(state, { kind: "play", cardUid: "har_tonic", row: "harmony" });
    state = { ...state, turn: "player" };
    state = applyMove(state, { kind: "play", cardUid: "har_tonic", row: "harmony" });

    const boosts = state.players.player.rows.harmony.filter((unit) => unit.cardId === "har_tonic").map((unit) => unit.boost);
    expect(boosts).toEqual([3, 0]);
  });

  it("marks reprised units as already cadenza-checked", () => {
    let state = playable("reprise");
    state = {
      ...state,
      players: {
        ...state.players,
        player: { ...state.players.player, hand: ["sp_reprise"], archive: ["mel_maj3"] }
      }
    };
    state = applyMove(state, { kind: "play", cardUid: "sp_reprise", row: "melody" });

    expect(state.players.player.rows.melody[0].cadenzaDone).toBe(true);
  });

  it("keeps sustained units after movement cleanup and resets boosts", () => {
    let state = playable("sustain");
    state = {
      ...state,
      players: {
        ...state.players,
        player: {
          ...state.players.player,
          rows: {
            ...state.players.player.rows,
            melody: [{ uid: "a", cardId: "mel_do", boost: 3, damage: 0, sustain: true, cadenzaDone: false }]
          }
        }
      }
    };
    state = applyMove(state, { kind: "pass" });
    state = applyMove(state, { kind: "pass" });

    expect(state.players.player.rows.melody[0]).toMatchObject({ cardId: "mel_do", boost: 0, sustain: false });
  });
});
