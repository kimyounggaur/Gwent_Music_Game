import { describe, expect, it } from "vitest";
import { applyMove, createGame, legalMoves, scoreTotal } from "./core";

describe("core engine", () => {
  it("creates deterministic opening hands for the same seed", () => {
    const a = createGame("PLAYER_STARTER", "AI_EASY", "concert");
    const b = createGame("PLAYER_STARTER", "AI_EASY", "concert");

    expect(a.players.player.hand).toEqual(b.players.player.hand);
    expect(a.players.ai.hand).toEqual(b.players.ai.hand);
    expect(a.turn).toBe(b.turn);
  });

  it("hides legal moves after a side passes", () => {
    let state = createGame("PLAYER_STARTER", "AI_EASY", "pass-test");
    state = applyMove(state, { kind: "mulliganDone" });
    state = applyMove(state, { kind: "mulliganDone" });
    state = state.turn === "player" ? state : applyMove(state, { kind: "pass" });
    state = applyMove(state, { kind: "pass" });

    expect(legalMoves(state, "player")).toEqual([]);
  });

  it("awards the round token to the higher score when both pass", () => {
    let state = createGame("PLAYER_STARTER", "AI_EASY", "round-token");
    state = applyMove(state, { kind: "mulliganDone" });
    state = applyMove(state, { kind: "mulliganDone" });
    state = state.turn === "player" ? state : applyMove(state, { kind: "pass" });
    const cardId = state.players.player.hand.find((id) => id === "mel_sol") ?? state.players.player.hand[0];
    state = applyMove(state, { kind: "play", cardUid: cardId, row: "melody" });
    state = state.turn === "ai" ? applyMove(state, { kind: "pass" }) : state;
    state = applyMove(state, { kind: "pass" });

    expect(state.players.player.tokens).toBe(1);
  });

  it("awards both sides a token for tied movements", () => {
    let state = createGame("PLAYER_STARTER", "AI_EASY", "tie-round");
    state = applyMove(state, { kind: "mulliganDone" });
    state = applyMove(state, { kind: "mulliganDone" });
    state = { ...state, turn: "player" };
    state = applyMove(state, { kind: "pass" });
    state = applyMove(state, { kind: "pass" });

    expect(state.players.player.tokens).toBe(1);
    expect(state.players.ai.tokens).toBe(1);
  });

  it("ends the game when a side reaches two tokens", () => {
    let state = createGame("PLAYER_STARTER", "AI_EASY", "endgame");
    state = {
      ...state,
      phase: "play",
      players: {
        ...state.players,
        player: { ...state.players.player, tokens: 1, passed: false },
        ai: { ...state.players.ai, tokens: 1, passed: true }
      }
    };
    state = applyMove({ ...state, turn: "player" }, { kind: "pass" });

    expect(state.phase).toBe("gameEnd");
    expect(state.winner).toBe("draw");
  });

  it("rejects placement beyond seven cards in a row", () => {
    let state = createGame("PLAYER_STARTER", "AI_EASY", "row-limit");
    state = {
      ...state,
      phase: "play",
      turn: "player",
      players: {
        ...state.players,
        player: {
          ...state.players.player,
          hand: ["mel_maj3"],
          rows: {
            ...state.players.player.rows,
            melody: Array.from({ length: 7 }, (_, index) => ({
              uid: `u-${index}`,
              cardId: "mel_do",
              boost: 0,
              damage: 0,
              sustain: false,
              cadenzaDone: false
            }))
          }
        }
      }
    };

    expect(() => applyMove(state, { kind: "play", cardUid: "mel_maj3", row: "melody" })).toThrow();
  });

  it("clears non-sustained boards at movement end", () => {
    let state = createGame("PLAYER_STARTER", "AI_EASY", "clear-board");
    state = {
      ...state,
      phase: "play",
      turn: "player",
      players: {
        ...state.players,
        player: {
          ...state.players.player,
          rows: {
            ...state.players.player.rows,
            melody: [{ uid: "u", cardId: "mel_do", boost: 0, damage: 0, sustain: false, cadenzaDone: false }]
          }
        }
      }
    };
    expect(scoreTotal(state, "player")).toBeGreaterThan(0);
    state = applyMove(state, { kind: "pass" });
    state = applyMove(state, { kind: "pass" });

    expect(state.players.player.rows.melody).toEqual([]);
    expect(state.players.player.archive).toContain("mel_do");
  });
});
