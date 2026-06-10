"use client";

import Image from "next/image";
import { Sparkles, Shield, Volume2 } from "lucide-react";
import { getCard } from "@/data/cards";
import { FACTION_ASSETS } from "@/data/assets";

interface CardViewProps {
  cardId: string;
  selected?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

export function CardView({ cardId, selected, compact, onClick }: CardViewProps) {
  const card = getCard(cardId);
  const audio = card.cadenza?.kind.startsWith("ear");
  return (
    <button
      type="button"
      className={`card-view ${selected ? "selected" : ""} ${compact ? "compact" : ""}`}
      onClick={onClick}
      title={`${card.nameKo}${card.cadenza ? ` - T${card.cadenza.tier} ${card.cadenza.kind}` : ""}`}
    >
      <span className="card-art">
        <Image src={FACTION_ASSETS[card.faction]} alt="" fill sizes="120px" />
      </span>
      <span className="card-glass" />
      <span className="card-top">
        <strong>{card.basePower ?? "◆"}</strong>
        {card.immune ? <Shield size={13} /> : null}
      </span>
      <span className="card-name">{card.nameKo}</span>
      <span className="card-meta">
        {card.row === "any" ? "any" : card.row}
        {card.cadenza ? (
          <span className="card-cadenza">
            {audio ? <Volume2 size={12} /> : <Sparkles size={12} />}T{card.cadenza.tier}
          </span>
        ) : null}
      </span>
    </button>
  );
}
