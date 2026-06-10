import { describe, expect, it } from "vitest";
import { createRng } from "@/engine/rng";
import { checkAnswer } from "./answers";
import { drawChallenge } from "./draw";

describe("cadenza challenges", () => {
  it("draws deterministic theory challenges and checks answers through the answer module", async () => {
    const challenge = drawChallenge("theory_mc", 1, createRng("cadence"));
    const again = drawChallenge("theory_mc", 1, createRng("cadence"));

    expect(challenge.id).toBe(again.id);
    expect(challenge.options.length).toBeGreaterThanOrEqual(2);

    const result = await checkAnswer(challenge.ref, challenge.options[challenge.correctIndex]);
    expect(result.correct).toBe(true);
  });

  it("supports ear-training challenge kinds", () => {
    const interval = drawChallenge("ear_interval", 2, createRng("ear"));
    const chord = drawChallenge("ear_chord", 3, createRng("ear"));
    const rhythm = drawChallenge("ear_rhythm", 1, createRng("ear"));

    expect(interval.audio?.type).toBe("interval");
    expect(chord.audio?.type).toBe("chord");
    expect(rhythm.audio?.type).toBe("rhythm");
  });
});
