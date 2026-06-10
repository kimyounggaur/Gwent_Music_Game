"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Save, Trash2 } from "lucide-react";
import { CARDS, getCard } from "@/data/cards";
import { DECKS, type DeckDef, validateDeck } from "@/data/decks";
import type { Faction } from "@/engine/types";
import { CardView } from "@/components/CardView";
import { readLocal, writeLocal } from "@/store/local";

const factions: Faction[] = ["maggiore", "minore", "tempo", "tension"];

export default function DeckPage() {
  const [faction, setFaction] = useState<Faction>("maggiore");
  const [name, setName] = useState("나의 앙상블");
  const [cards, setCards] = useState<string[]>(() => DECKS[0].cards);
  const [saved, setSaved] = useState<DeckDef[]>(() => readLocal<DeckDef[]>("ec:decks", [DECKS[0]]));
  const leaderId = faction === "maggiore" ? "ld_maggiore" : faction === "minore" ? "ld_minore" : faction === "tempo" ? "ld_tempo" : "ld_tension";
  const deck: DeckDef = { id: `custom-${faction}`, name, faction, leaderId, cards };
  const validation = validateDeck(deck);
  const pool = useMemo(() => CARDS.filter((card) => card.type !== "leader" && card.id !== "token_ensemble" && (card.faction === faction || card.faction === "neutral")), [faction]);

  function add(id: string) {
    if (cards.length < 25) setCards((value) => [...value, id]);
  }

  function remove(index: number) {
    setCards((value) => value.filter((_, cardIndex) => cardIndex !== index));
  }

  function save() {
    if (!validation.valid) return;
    const next = [...saved.filter((item) => item.id !== deck.id), deck];
    setSaved(next);
    writeLocal("ec:decks", next);
  }

  return (
    <main className="utility-page">
      <header className="utility-header">
        <div>
          <p className="eyebrow">Deck Builder</p>
          <h1>덱빌더</h1>
        </div>
        <Link className="secondary-button" href="/play?ai=hard">마에스트로 대국</Link>
      </header>
      <section className="builder-grid">
        <aside className="builder-side">
          <label>덱 이름<input value={name} onChange={(event) => setName(event.target.value)} /></label>
          <div className="segmented">
            {factions.map((item) => <button key={item} className={item === faction ? "active" : ""} onClick={() => setFaction(item)}>{item}</button>)}
          </div>
          <p>{cards.length}/25 · 리더 {getCard(leaderId).nameKo}</p>
          <div className="deck-list">
            {cards.map((id, index) => (
              <button key={`${id}-${index}`} onClick={() => remove(index)}>{getCard(id).nameKo}<Trash2 size={13} /></button>
            ))}
          </div>
          {!validation.valid ? <div className="error-list">{validation.errors.slice(0, 4).map((error) => <p key={error}>{error}</p>)}</div> : null}
          <button className="primary-button" onClick={save} disabled={!validation.valid}><Save size={16} /> 저장</button>
        </aside>
        <section className="card-pool">
          {pool.map((card) => <CardView key={card.id} cardId={card.id} onClick={() => add(card.id)} />)}
        </section>
      </section>
      <section className="saved-strip">
        {saved.map((deckItem) => <Link key={deckItem.id} href={`/play?ai=hard&deck=${deckItem.id}`}>{deckItem.name}</Link>)}
      </section>
    </main>
  );
}
