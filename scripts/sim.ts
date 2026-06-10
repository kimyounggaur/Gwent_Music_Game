import fs from "node:fs";
import path from "node:path";
import { runGame } from "../src/ai/index";
import type { AiPersona } from "../src/ai/persona";

function arg(name: string, fallback: string): string {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] ?? fallback : fallback;
}

const games = Number(arg("games", "200"));
const a = arg("a", "hard") as AiPersona;
const b = arg("b", "normal") as AiPersona;
const deckA = a === "easy" ? "AI_EASY" : a === "normal" ? "AI_NORMAL" : "AI_HARD";
const deckB = b === "easy" ? "AI_EASY" : b === "normal" ? "AI_NORMAL" : "AI_HARD";

let aWins = 0;
let bWins = 0;
let draws = 0;
let totalRounds = 0;
let totalTurns = 0;
let attempts = 0;
let successes = 0;

for (let index = 0; index < games; index += 1) {
  const result = runGame(deckA, deckB, a, b, `sim-${a}-${b}-${index}`);
  if (result.winner === "player") aWins += 1;
  else if (result.winner === "ai") bWins += 1;
  else draws += 1;
  totalRounds += result.rounds;
  totalTurns += result.turns;
  attempts += result.cadenzaAttempts;
  successes += result.cadenzaSuccesses;
}

const report = {
  games,
  matchup: `${a} vs ${b}`,
  winRateA: aWins / games,
  winRateB: bWins / games,
  drawRate: draws / games,
  averageRounds: totalRounds / games,
  averageTurns: totalTurns / games,
  cadenzaSuccessRate: attempts === 0 ? 0 : successes / attempts
};

fs.mkdirSync("results", { recursive: true });
const file = path.join("results", `sim-${Date.now()}.json`);
fs.writeFileSync(file, JSON.stringify(report, null, 2), "utf8");
console.table(report);
console.log(`Saved ${file}`);
