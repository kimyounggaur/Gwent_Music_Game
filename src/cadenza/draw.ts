import type { Rng } from "@/engine/rng";
import type { ChallengeKind } from "@/engine/types";
import { CHALLENGE_BANK } from "./bank";
import type { Challenge } from "./types";

export function drawChallenge(kind: ChallengeKind, tier: 1 | 2 | 3 | 4, rng: Rng, seen: Set<string> = new Set()): Challenge {
  const candidates = CHALLENGE_BANK.filter((challenge) => challenge.kind === kind && challenge.tier <= tier && !seen.has(challenge.id));
  const pool = candidates.length > 0 ? candidates : CHALLENGE_BANK.filter((challenge) => challenge.kind === kind);
  const challenge = pool[rng.int(pool.length)];
  return { ...challenge, ref: challenge.id };
}
