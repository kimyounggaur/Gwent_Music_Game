"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Bot, Crown, Flag, Music, RefreshCw, Settings, SkipForward, Sparkles, Trophy, Wand2 } from "lucide-react";
import { getCard } from "@/data/cards";
import { BOARD_ASSET, TOKEN_ASSETS } from "@/data/assets";
import { legalMoves, scoreRow, scoreTotal } from "@/engine/core";
import type { Move, RowId, Side } from "@/engine/types";
import { ROWS } from "@/engine/types";
import type { AiPersona } from "@/ai/persona";
import { useGameStore } from "@/store/game";
import { CardView } from "./CardView";
import { CadenzaModal } from "./CadenzaModal";

const ROW_LABEL: Record<RowId, string> = {
  melody: "멜로디",
  harmony: "화성",
  rhythm: "리듬"
};

interface GameBoardProps {
  persona: AiPersona;
  deckId?: string;
  campaign?: string;
}

export function GameBoard({ persona, deckId, campaign }: GameBoardProps) {
  const { state, initGame, applyPlayerMove, finishMulligan, aiMove, aiThinking, setAiThinking, banner, recordLearning } = useGameStore();
  const [selected, setSelected] = useState<string | null>(null);
  const [pending, setPending] = useState<Extract<Move, { kind: "play" }> | null>(null);

  useEffect(() => {
    initGame(persona, deckId ?? "PLAYER_STARTER", `${campaign ?? "free"}-${persona}-${Date.now()}`);
  }, [campaign, deckId, initGame, persona]);

  useEffect(() => {
    if (!state || state.phase !== "play" || state.turn !== "ai" || aiThinking) return;
    setAiThinking(true);
    const delay = 650 + (persona === "hard" ? 450 : persona === "normal" ? 250 : 0);
    const timer = window.setTimeout(() => aiMove(), delay);
    return () => window.clearTimeout(timer);
  }, [aiMove, aiThinking, persona, setAiThinking, state]);

  const legal = useMemo(() => (state ? legalMoves(state, "player") : []), [state]);
  const legalRows = useMemo(() => {
    if (!selected) return new Set<RowId>();
    return new Set(legal.filter((move): move is Extract<Move, { kind: "play" }> => move.kind === "play" && move.cardUid === selected).map((move) => move.row));
  }, [legal, selected]);

  if (!state) return <div className="loading-shell">조율 중...</div>;

  function playSelected(row: RowId) {
    if (!state || !selected || !legalRows.has(row)) return;
    const move: Extract<Move, { kind: "play" }> = { kind: "play", cardUid: selected, row };
    const card = getCard(selected);
    setSelected(null);
    if (card.cadenza) setPending(move);
    else applyPlayerMove(move);
  }

  function resolveCadenza(success: boolean, record?: Parameters<typeof recordLearning>[0]) {
    if (!pending) return;
    if (record) recordLearning(record);
    applyPlayerMove({ ...pending, cadenzaSuccess: success });
    setPending(null);
  }

  function playerPass() {
    applyPlayerMove({ kind: "pass" });
  }

  const phaseTitle = state.phase === "mulligan" ? "멀리건" : state.phase === "gameEnd" ? "피날레" : `악장 ${state.round}`;
  const playerTotal = scoreTotal(state, "player");
  const aiTotal = scoreTotal(state, "ai");

  return (
    <main className="game-shell">
      <Image className="board-bg" src={BOARD_ASSET} alt="" fill sizes="100vw" priority />
      <div className="game-overlay" />
      <header className="game-topbar">
        <div>
          <p className="eyebrow">Ensemble Clash Solo</p>
          <h1>앙상블 클래시</h1>
        </div>
        <nav className="top-actions">
          <a href="/deck" className="icon-link" aria-label="덱빌더"><Wand2 size={18} /></a>
          <a href="/review" className="icon-link" aria-label="오답노트"><Trophy size={18} /></a>
          <a href="/audio-test" className="icon-link" aria-label="오디오"><Music size={18} /></a>
          <a href="/" className="icon-link" aria-label="설정"><Settings size={18} /></a>
        </nav>
      </header>

      {state.phase === "mulligan" ? (
        <section className="mulligan-panel">
          <p className="eyebrow">Opening Hand</p>
          <h2>최대 2장을 교체하세요</h2>
          <div className="hand-row">
            {state.players.player.hand.map((cardId, index) => (
              <CardView key={`${cardId}-${index}`} cardId={cardId} onClick={() => applyPlayerMove({ kind: "mulligan", cardUid: cardId })} />
            ))}
          </div>
          <button className="primary-button" type="button" onClick={finishMulligan}>
            <Flag size={16} /> 멀리건 완료 ({state.players.player.mulligansLeft})
          </button>
        </section>
      ) : (
        <section className="battlefield">
          <ScorePanel side="ai" total={aiTotal} tokens={state.players.ai.tokens} hand={state.players.ai.hand.length} passed={state.players.ai.passed} leaderCharges={state.players.ai.leaderCharges} />
          <div className="rows ai-rows">
            {(["rhythm", "harmony", "melody"] as RowId[]).map((row) => (
              <BoardRow key={`ai-${row}`} state={state} side="ai" row={row} />
            ))}
          </div>

          <div className="center-bar">
            <span>{phaseTitle}</span>
            <strong>{playerTotal} : {aiTotal}</strong>
            <span>{state.turn === "player" ? "당신의 턴" : aiThinking ? "AI 지휘 중..." : "AI 턴"}</span>
          </div>

          <div className="rows player-rows">
            {ROWS.map((row) => (
              <BoardRow key={`player-${row}`} state={state} side="player" row={row} legal={legalRows.has(row)} onClick={() => playSelected(row)} />
            ))}
          </div>
          <ScorePanel side="player" total={playerTotal} tokens={state.players.player.tokens} hand={state.players.player.hand.length} passed={state.players.player.passed} leaderCharges={state.players.player.leaderCharges} />

          <footer className="hand-panel">
            <div className="hand-row">
              {state.players.player.hand.map((cardId, index) => (
                <CardView key={`${cardId}-${index}`} cardId={cardId} selected={selected === cardId} onClick={() => setSelected(cardId)} />
              ))}
            </div>
            <div className="command-row">
              <button className="secondary-button" type="button" onClick={() => applyPlayerMove({ kind: "leader" })} disabled={!legal.some((move) => move.kind === "leader")}>
                <Crown size={16} /> 리더
              </button>
              <button className="danger-button" type="button" onClick={playerPass} disabled={!legal.some((move) => move.kind === "pass")}>
                <SkipForward size={16} /> 패스
              </button>
              <button className="ghost-button" type="button" onClick={() => initGame(persona, deckId ?? "PLAYER_STARTER")}>
                <RefreshCw size={16} /> 재대국
              </button>
            </div>
          </footer>
        </section>
      )}

      {banner ? <div className="banner">{banner}</div> : null}
      {pending ? <CadenzaModal cardId={pending.cardUid} seed={state.seed} onResolve={resolveCadenza} onCancel={() => setPending(null)} /> : null}
      {state.phase === "gameEnd" ? (
        <div className="modal-backdrop">
          <section className="end-modal">
            <p className="eyebrow">Result</p>
            <h2>{state.winner === "player" ? "승리" : state.winner === "ai" ? "패배" : "무승부"}</h2>
            <p>{state.players.player.tokens} : {state.players.ai.tokens} 토큰</p>
            <button className="primary-button" type="button" onClick={() => initGame(persona, deckId ?? "PLAYER_STARTER")}>
              <RefreshCw size={16} /> 다시 연주
            </button>
          </section>
        </div>
      ) : null}
    </main>
  );
}

function ScorePanel({ side, total, tokens, hand, passed, leaderCharges }: { side: Side; total: number; tokens: number; hand: number; passed: boolean; leaderCharges: number }) {
  return (
    <div className={`score-panel ${side}`}>
      <span><Bot size={16} /> {side === "ai" ? "AI 지휘자" : "연주자"}</span>
      <strong>{total}</strong>
      <span className="mini-stat">
        <Image src={side === "player" ? TOKEN_ASSETS.pointBlue : TOKEN_ASSETS.pointRed} alt="" width={18} height={18} />
        {tokens} 승점 · {hand}장 · 큐 {leaderCharges}
      </span>
      {passed ? <em>패스</em> : null}
    </div>
  );
}

function BoardRow({ state, side, row, legal, onClick }: { state: ReturnType<typeof useGameStore.getState>["state"]; side: Side; row: RowId; legal?: boolean; onClick?: () => void }) {
  if (!state) return null;
  const units = state.players[side].rows[row];
  const weathered = state.weather[side][row];
  return (
    <button type="button" className={`board-row ${side} ${legal ? "legal" : ""} ${weathered ? "weathered" : ""}`} onClick={onClick}>
      <span className="row-label">{ROW_LABEL[row]} <strong>{scoreRow(state, side, row)}</strong></span>
      <span className="unit-line">
        {units.map((unit) => (
          <CardView key={unit.uid} cardId={unit.cardId} compact />
        ))}
      </span>
      {weathered ? <span className="weather-chip">방해</span> : null}
    </button>
  );
}
