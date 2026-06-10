# Ensemble Clash Solo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the playable `앙상블 클래시: 솔로` web app from the prompt book and source assets.

**Architecture:** Pure TypeScript engine modules own rules, effects, scoring, AI, and cadenza generation. Next.js client pages use Zustand to wrap engine state and localStorage for deck, learning, campaign, and settings persistence.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, Zustand, Vitest, Tone.js, Recharts, Supabase client placeholder integration.

---

### Task 1: Foundation

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `vitest.config.ts`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- Create: `src/engine/types.ts`, `src/engine/rng.ts`, `src/engine/rng.test.ts`

- [ ] Install dependencies.
- [ ] Write failing RNG determinism tests.
- [ ] Implement shared engine types and seeded RNG.
- [ ] Render the home screen.
- [ ] Run `npm run build` and `npm run test:run`.

### Task 2: Data And Engine

**Files:**
- Create: `src/data/cards.ts`, `src/data/decks.ts`
- Create: `src/engine/core.ts`, `src/engine/effects.ts`, `src/engine/ensemble.ts`
- Test: `src/data/decks.test.ts`, `src/engine/core.test.ts`, `src/engine/effects.test.ts`

- [ ] Write tests for 30 cards, 4 valid decks, mulligan, pass, round end, row limits, effects, weather, fortissimo, and ensemble scoring.
- [ ] Implement card data, deck validation, core engine, effects, and scoring.
- [ ] Keep engine immutable and React-free.

### Task 3: AI And Simulation

**Files:**
- Create: `src/ai/persona.ts`, `src/ai/pass.ts`, `src/ai/cadenza.ts`, `src/ai/index.ts`
- Create: `scripts/sim.ts`
- Test: `src/ai/ai.test.ts`, `src/ai/pass.test.ts`

- [ ] Write tests for deterministic AI completion, legal moves, pass psychology, and normal-vs-easy strength.
- [ ] Implement easy, normal, and hard personas with cadenza rolls.
- [ ] Implement the simulation report command.

### Task 4: Cadenza, Audio, UI, Meta

**Files:**
- Create: `src/cadenza/*`, `src/audio/engine.ts`, `src/store/*`, `src/components/*`
- Create: `src/app/play/page.tsx`, `src/app/deck/page.tsx`, `src/app/review/page.tsx`, `src/app/practice/page.tsx`, `src/app/campaign/page.tsx`, `src/app/audio-test/page.tsx`

- [ ] Implement theory and ear-training cadenza flows with answer abstraction.
- [ ] Implement Tone.js helpers and audio test page.
- [ ] Build playable board UI, deck builder, review, practice, campaign, tutorial, settings, and local persistence.
- [ ] Verify the app with tests, build, and browser smoke test.
