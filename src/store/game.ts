"use client";

import { create } from "zustand";
import { chooseMove } from "@/ai";
import type { AiPersona } from "@/ai/persona";
import { applyMove, createGame, createGameFromDecks } from "@/engine/core";
import type { GameState, Move } from "@/engine/types";
import { appendLearning, type LearningRecord } from "./progression";
import { DECKS, getDeck, type DeckDef } from "@/data/decks";
import { readLocal } from "./local";

function deckForPersona(persona: AiPersona): string {
  if (persona === "easy") return "AI_EASY";
  if (persona === "normal") return "AI_NORMAL";
  return "AI_HARD";
}

interface GameStore {
  state: GameState | null;
  persona: AiPersona;
  aiThinking: boolean;
  banner: string | null;
  initGame: (persona: AiPersona, playerDeckId?: string, seed?: string) => void;
  applyPlayerMove: (move: Move) => void;
  finishMulligan: () => void;
  aiMove: () => void;
  recordLearning: (record: LearningRecord) => void;
  setAiThinking: (value: boolean) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  state: null,
  persona: "easy",
  aiThinking: false,
  banner: null,
  initGame(persona, playerDeckId = "PLAYER_STARTER", seed = `solo-${Date.now()}`) {
    const customDeck = readLocal<DeckDef[]>("ec:decks", DECKS).find((deck) => deck.id === playerDeckId);
    const state = customDeck
      ? createGameFromDecks(customDeck, getDeck(deckForPersona(persona)), seed)
      : createGame(playerDeckId, deckForPersona(persona), seed);
    set({ state, persona, banner: null, aiThinking: false });
  },
  applyPlayerMove(move) {
    const state = get().state;
    if (!state) return;
    const next = applyMove(state, move);
    set({ state: next, banner: move.kind === "pass" ? "당신이 종지를 선언했습니다." : null });
  },
  finishMulligan() {
    const state = get().state;
    if (!state) return;
    let next = applyMove(state, { kind: "mulliganDone" });
    if (next.phase === "mulligan") next = applyMove(next, { kind: "mulliganDone" });
    set({ state: next });
  },
  aiMove() {
    const state = get().state;
    if (!state || state.phase !== "play" || state.turn !== "ai") return;
    const move = chooseMove(state, get().persona, "ai");
    const next = applyMove(state, move);
    set({
      state: next,
      banner: move.kind === "pass" ? "AI가 종지를 선언했습니다." : move.kind === "play" ? `AI: ${move.cardUid}` : "AI가 지휘자 큐를 사용했습니다.",
      aiThinking: false
    });
  },
  recordLearning(record) {
    appendLearning(record);
  },
  setAiThinking(value) {
    set({ aiThinking: value });
  }
}));
