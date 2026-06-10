# Ensemble Clash Solo Design

Source of truth: `앙상블클래시_솔로_바이브코딩_프롬프트북.md`.

The implementation follows the prompt book autonomously. The app is a single-player music-theory card battler inspired by Gwent: three movements, two tokens to win, three rows per side, seeded randomness, pure engine logic, AI personas, cadenza theory and ear-training checks, local deck and learning persistence, campaign/tutorial surfaces, and deployment-ready Next.js structure.

Key implementation decisions:
- Build in the current folder because the source folder already contains board, card, token, and rulebook assets.
- Use Next.js App Router with TypeScript, Tailwind, Zustand, Vitest, Tone.js, Recharts, and localStorage-first persistence.
- Keep `src/engine` free of React and DOM imports.
- Use seeded RNG for shuffling, AI decisions, cadenza rolls, and challenge draws.
- Use the prompt book as prior approval for all design gates, per the user's autonomous approval instruction.
