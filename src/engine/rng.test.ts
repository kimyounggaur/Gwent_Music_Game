import { describe, expect, it } from "vitest";
import { createRng, shuffle } from "./rng";

describe("seeded rng", () => {
  it("produces the same shuffled order for the same seed", () => {
    const first = shuffle([1, 2, 3, 4, 5, 6], createRng("same-seed"));
    const second = shuffle([1, 2, 3, 4, 5, 6], createRng("same-seed"));

    expect(first).toEqual(second);
    expect(first).not.toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("can resume from a stored rng state", () => {
    const rng = createRng("resume");
    const first = rng.next();
    const state = rng.getState();
    const resumed = createRng("ignored", state);

    expect(resumed.next()).toBe(createRng("ignored", state).next());
    expect(first).not.toBe(resumed.next());
  });
});
