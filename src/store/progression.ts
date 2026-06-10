import type { ChallengeKind } from "@/engine/types";
import { readLocal, writeLocal } from "./local";

export interface LearningRecord {
  ts: number;
  cardId: string;
  kind: ChallengeKind;
  tier: 1 | 2 | 3 | 4;
  correct: boolean;
  latencyMs: number;
  conceptTag: string;
}

export interface ReviewQueueItem {
  conceptTag: string;
  ease: number;
  intervalDays: number;
  dueAt: number;
}

export interface SettingsState {
  volume: number;
  earTraining: boolean;
  reducedMotion: boolean;
  aiDelay: "fast" | "normal";
}

export const DEFAULT_SETTINGS: SettingsState = {
  volume: -10,
  earTraining: true,
  reducedMotion: false,
  aiDelay: "normal"
};

export function loadLearning(): LearningRecord[] {
  return readLocal<LearningRecord[]>("ec:learning", []);
}

export function appendLearning(record: LearningRecord): void {
  const next = [...loadLearning(), record];
  writeLocal("ec:learning", next);
  updateReviewQueue(record);
}

export function loadReviewQueue(): ReviewQueueItem[] {
  return readLocal<ReviewQueueItem[]>("ec:reviewQueue", []);
}

export function dueItems(now = Date.now()): ReviewQueueItem[] {
  return loadReviewQueue().filter((item) => item.dueAt <= now);
}

export function updateReviewQueue(record: LearningRecord): void {
  const queue = loadReviewQueue();
  const index = queue.findIndex((item) => item.conceptTag === record.conceptTag);
  const current = index >= 0 ? queue[index] : { conceptTag: record.conceptTag, ease: 2.5, intervalDays: 0, dueAt: Date.now() };
  const nextInterval = record.correct ? Math.max(1, Math.round(Math.max(1, current.intervalDays) * current.ease)) : 0;
  const next: ReviewQueueItem = {
    conceptTag: record.conceptTag,
    ease: record.correct ? Math.min(3, current.ease + 0.1) : Math.max(1.3, current.ease - 0.3),
    intervalDays: nextInterval,
    dueAt: record.correct ? Date.now() + nextInterval * 24 * 60 * 60 * 1000 : Date.now()
  };
  if (index >= 0) queue[index] = next;
  else queue.push(next);
  writeLocal("ec:reviewQueue", queue);
}

export function loadSettings(): SettingsState {
  return readLocal<SettingsState>("ec:settings", DEFAULT_SETTINGS);
}

export function saveSettings(settings: SettingsState): void {
  writeLocal("ec:settings", settings);
}
