import { describe, expect, it } from "vitest";
import { chooseMove, runGame } from "./index";
import { createGame, legalMoves } from "@/engine/core";

describe("AI conductor", () => {
  it("finishes deterministic AI mirror games", () => {
    const first = runGame("AI_EASY", "AI_NORMAL", "easy", "normal", "ai-0");
    const second = runGame("AI_EASY", "AI_NORMAL", "easy", "normal", "ai-0");

    expect(first.winner).toBe(second.winner);
    expect(first.rounds).toBeGreaterThanOrEqual(1);
    expect(first.rounds).toBeLessThanOrEqual(3);
    expect(first.turns).toBeLessThan(200);
  });

  it("only chooses legal moves", () => {
    let state = createGame("PLAYER_STARTER", "AI_EASY", "legal-ai");
    state = { ...state, phase: "play", turn: "ai" };
    const move = chooseMove(state, "easy");

    expect(
      legalMoves(state, "ai").some((legal) =>
        legal.kind === move.kind &&
        (legal.kind !== "play" || (move.kind === "play" && legal.cardUid === move.cardUid && legal.row === move.row))
      )
    ).toBe(true);
  });

  it("gives normal a measurable edge over easy", () => {
    let normalWins = 0;
    for (let seed = 0; seed < 30; seed += 1) {
      const result = runGame("AI_NORMAL", "AI_EASY", "normal", "easy", `edge-${seed}`);
      if (result.winner === "player") normalWins += 1;
    }

    expect(normalWins / 30).toBeGreaterThanOrEqual(0.6);
  });
});
