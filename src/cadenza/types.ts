import type { ChallengeKind } from "@/engine/types";

export type ChallengeRef = string;

export interface AudioPrompt {
  type: "interval" | "chord" | "rhythm";
  rootMidi?: number;
  semitones?: number;
  mode?: "melodic" | "harmonic";
  quality?: "maj" | "min" | "dim" | "aug" | "dom7" | "maj7" | "min7" | "C9" | "sus4";
  pattern?: Array<{ dur: "4n" | "8n" | "8t" | "4n." | "16n"; rest?: boolean }>;
  bpm?: number;
}

export interface Challenge {
  id: string;
  ref: ChallengeRef;
  kind: ChallengeKind;
  tier: 1 | 2 | 3 | 4;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  conceptTag: string;
  audio?: AudioPrompt;
}

export interface AnswerResult {
  correct: boolean;
  explanation: string;
  conceptTag: string;
}
