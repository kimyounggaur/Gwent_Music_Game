import { describe, expect, it } from "vitest";
import { shouldPass } from "./pass";

describe("AI pass decision tree", () => {
  it("passes immediately when opponent has passed and AI is ahead", () => {
    expect(shouldPass({ round: 2, myScore: 20, oppScore: 18, myTokens: 1, oppTokens: 0, myHand: [], oppHand: 3, oppPassed: true, cardsSpentDiff: 0, persona: "normal" })).toBe(true);
  });

  it("passes when a comeback is impossible", () => {
    expect(shouldPass({ round: 2, myScore: 3, oppScore: 30, myTokens: 0, oppTokens: 0, myHand: ["mel_do"], oppHand: 3, oppPassed: true, cardsSpentDiff: 0, persona: "normal" })).toBe(true);
  });

  it("does not pass in must-win state while holding cards", () => {
    expect(shouldPass({ round: 3, myScore: 3, oppScore: 30, myTokens: 0, oppTokens: 1, myHand: ["mel_do"], oppHand: 3, oppPassed: false, cardsSpentDiff: 0, persona: "normal" })).toBe(false);
  });

  it("passes round one when far behind with card advantage", () => {
    expect(shouldPass({ round: 1, myScore: 5, oppScore: 20, myTokens: 0, oppTokens: 0, myHand: ["mel_do"], oppHand: 2, oppPassed: false, cardsSpentDiff: -1, persona: "normal" })).toBe(true);
  });

  it("passes late when ahead and the opponent is nearly empty", () => {
    expect(shouldPass({ round: 2, myScore: 21, oppScore: 18, myTokens: 1, oppTokens: 0, myHand: ["mel_do"], oppHand: 1, oppPassed: false, cardsSpentDiff: 0, persona: "normal" })).toBe(true);
  });
});
