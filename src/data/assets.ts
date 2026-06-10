import type { Faction } from "@/engine/types";

function asset(path: string): string {
  return `/assets/${path.split("/").map(encodeURIComponent).join("/")}`;
}

export const BOARD_ASSET = asset("Boards/Main Board LowerRes.png");

export const FACTION_ASSETS: Record<Faction, string> = {
  maggiore: asset("Cards (Separated)/Northern Realms - Shani (count 1).png"),
  minore: asset("Cards (Separated)/Nilfgaard - Cantarella (count 1).png"),
  tempo: asset("Cards (Separated)/Northern Realms - Siege Master (count 2).png"),
  tension: asset("Cards (Separated)/Neutrals - Alzur (count 1).png"),
  neutral: asset("Cards (Separated)/Neutrals - Geralt of Rivia (count 1).png")
};

export const TOKEN_ASSETS = {
  shield: asset("Tokens/Shield.png"),
  lock: asset("Tokens/Lock.png"),
  pointBlue: asset("Tokens/PointBlue.png"),
  pointRed: asset("Tokens/PointRed.png"),
  cooldown: asset("Tokens/Token_Cooldown.png")
};
