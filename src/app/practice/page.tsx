"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { createRng } from "@/engine/rng";
import { drawChallenge } from "@/cadenza/draw";
import { checkAnswer } from "@/cadenza/answers";
import { appendLearning, dueItems } from "@/store/progression";

export default function PracticePage() {
  const due = dueItems();
  const [index, setIndex] = useState(0);
  const tag = due[index]?.conceptTag ?? "interval";
  const kind = tag === "rhythm" ? "ear_rhythm" : tag === "chord" ? "ear_chord" : "theory_mc";
  const challenge = useMemo(() => drawChallenge(kind, 2, createRng(`practice-${tag}-${index}`)), [index, kind, tag]);
  const [message, setMessage] = useState<string | null>(null);

  async function answer(option: string) {
    const result = await checkAnswer(challenge.ref, option);
    appendLearning({ ts: Date.now(), cardId: "practice", kind: challenge.kind, tier: challenge.tier, correct: result.correct, latencyMs: 0, conceptTag: result.conceptTag });
    setMessage(result.correct ? "정답" : result.explanation);
    window.setTimeout(() => {
      setMessage(null);
      setIndex((value) => value + 1);
    }, 650);
  }

  return (
    <main className="utility-page practice-page">
      <header className="utility-header">
        <div><p className="eyebrow">Practice</p><h1>간격 반복 연습</h1></div>
        <Link className="secondary-button" href="/review">오답 노트</Link>
      </header>
      <section className="practice-card">
        <p>{due.length ? `${index + 1}/${due.length} due` : "즉석 연습"}</p>
        <h2>{challenge.prompt}</h2>
        <div className="answer-grid">
          {challenge.options.map((option) => <button key={option} className="answer" onClick={() => void answer(option)}>{option}</button>)}
        </div>
        {message ? <p className="result-copy">{message}</p> : null}
      </section>
    </main>
  );
}
