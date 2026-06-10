import { describe, expect, it } from "vitest";
import { CARDS, getCard } from "./cards";
import { DECKS, validateDeck } from "./decks";

describe("card and deck seeds", () => {
  it("loads the full prompt-book card seed", () => {
    expect(CARDS.length).toBeGreaterThanOrEqual(30);
    expect(getCard("har_dom7").cadenza?.effect.kind).toBe("boost_next_tag");
    expect(getCard("ld_tension").type).toBe("leader");
  });

  it("validates the four starter decks", () => {
    for (const deck of DECKS) {
      expect(validateDeck(deck).valid, deck.id).toBe(true);
      expect(deck.cards).toHaveLength(25);
    }
  });

  it("rejects decks with too many copies of one bronze card", () => {
    const deck = {
      ...DECKS[0],
      cards: Array.from({ length: 25 }, () => "mel_maj3")
    };

    expect(validateDeck(deck).valid).toBe(false);
  });
});
