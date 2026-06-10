import { GameBoard } from "@/components/GameBoard";
import type { AiPersona } from "@/ai/persona";

const personas = new Set(["easy", "normal", "hard"]);

export default async function PlayPage({ searchParams }: { searchParams: Promise<{ ai?: string; deck?: string; campaign?: string }> }) {
  const params = await searchParams;
  const persona = personas.has(params.ai ?? "") ? (params.ai as AiPersona) : "easy";
  return <GameBoard persona={persona} deckId={params.deck} campaign={params.campaign} />;
}
