"use client";

import Link from "next/link";
import { playChord, playInterval, playRhythm, stopAll } from "@/audio/engine";

export default function AudioTestPage() {
  return (
    <main className="utility-page">
      <header className="utility-header">
        <div><p className="eyebrow">Audio Lab</p><h1>Tone.js 청음 테스트</h1></div>
        <Link className="secondary-button" href="/">처음으로</Link>
      </header>
      <section className="audio-grid">
        <button className="primary-button" onClick={() => void playInterval(60, 4, "melodic")}>장3도</button>
        <button className="primary-button" onClick={() => void playInterval(60, 3, "melodic")}>단3도</button>
        <button className="primary-button" onClick={() => void playInterval(60, 7, "harmonic")}>완전5도</button>
        <button className="primary-button" onClick={() => void playChord(60, "maj")}>장화음</button>
        <button className="primary-button" onClick={() => void playChord(60, "min")}>단화음</button>
        <button className="primary-button" onClick={() => void playChord(60, "C9")}>C9</button>
        <button className="primary-button" onClick={() => void playRhythm([{ dur: "8t" }, { dur: "8t" }, { dur: "8t" }], 88)}>셋잇단</button>
        <button className="danger-button" onClick={() => void stopAll()}>정지</button>
      </section>
    </main>
  );
}
