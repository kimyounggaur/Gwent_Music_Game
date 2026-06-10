"use client";

import { useMemo, useState } from "react";
import { Check, Music2, Volume2, X } from "lucide-react";
import { getCard } from "@/data/cards";
import { createRng } from "@/engine/rng";
import { checkAnswer } from "@/cadenza/answers";
import { drawChallenge } from "@/cadenza/draw";
import type { LearningRecord } from "@/store/progression";
import { playAudioPrompt } from "@/audio/engine";

interface CadenzaModalProps {
  cardId: string;
  seed: string;
  onResolve: (success: boolean, record?: LearningRecord) => void;
  onCancel: () => void;
}

export function CadenzaModal({ cardId, seed, onResolve, onCancel }: CadenzaModalProps) {
  const card = getCard(cardId);
  const spec = card.cadenza;
  const [startedAt] = useState(Date.now());
  const [challengeVisible, setChallengeVisible] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [playsLeft, setPlaysLeft] = useState(3);
  const challenge = useMemo(() => (spec ? drawChallenge(spec.kind, spec.tier, createRng(`${seed}:${cardId}`)) : null), [cardId, seed, spec]);

  if (!spec || !challenge) return null;

  async function submit(answer: string) {
    if (!challenge) return;
    const checked = await checkAnswer(challenge.ref, answer);
    const record: LearningRecord = {
      ts: Date.now(),
      cardId,
      kind: challenge.kind,
      tier: challenge.tier,
      correct: checked.correct,
      latencyMs: Date.now() - startedAt,
      conceptTag: checked.conceptTag
    };
    setResult(checked.correct ? "정답입니다. 보상이 발동합니다." : checked.explanation);
    window.setTimeout(() => onResolve(checked.correct, record), 650);
  }

  async function playPrompt() {
    if (!challenge) return;
    if (!challenge.audio || playsLeft <= 0) return;
    setPlaysLeft((value) => value - 1);
    await playAudioPrompt(challenge.audio);
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <section className="cadenza-modal">
        <header>
          <div>
            <p className="eyebrow">Cadenza Check</p>
            <h2>{card.nameKo}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onCancel} aria-label="닫기">
            <X size={18} />
          </button>
        </header>

        {!challengeVisible ? (
          <div className="modal-body">
            <div className="reward-strip">
              <span>T{spec.tier}</span>
              <strong>{spec.kind}</strong>
              <span>{spec.effect.kind} {spec.effect.amount ? `+${spec.effect.amount}` : ""}</span>
            </div>
            <p className="modal-copy">문제 유형과 보상을 먼저 확인한 뒤 도전하거나, 기본 파워만으로 배치할 수 있습니다.</p>
            <div className="modal-actions">
              <button className="primary-button" type="button" onClick={() => setChallengeVisible(true)}>
                <Music2 size={16} /> 도전
              </button>
              <button className="ghost-button" type="button" onClick={() => onResolve(false)}>
                기본 파워로 배치
              </button>
            </div>
          </div>
        ) : (
          <div className="modal-body">
            <div className="timer-bar"><span /></div>
            <p className="challenge-prompt">{challenge.prompt}</p>
            {challenge.audio ? (
              <button className="secondary-button" type="button" onClick={playPrompt} disabled={playsLeft <= 0}>
                <Volume2 size={16} /> 듣기 {playsLeft}
              </button>
            ) : null}
            <div className="answer-grid">
              {challenge.options.map((option) => (
                <button
                  type="button"
                  key={option}
                  className={selected === option ? "answer selected" : "answer"}
                  onClick={() => {
                    setSelected(option);
                    void submit(option);
                  }}
                >
                  {selected === option ? <Check size={14} /> : null}
                  {option}
                </button>
              ))}
            </div>
            {result ? <p className="result-copy">{result}</p> : null}
          </div>
        )}
      </section>
    </div>
  );
}
