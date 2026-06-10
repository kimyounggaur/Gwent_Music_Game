"use client";

import Link from "next/link";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { loadLearning } from "@/store/progression";

export default function ReviewPage() {
  const records = loadLearning();
  const grouped = Object.values(records.reduce<Record<string, { tag: string; tries: number; correct: number }>>((acc, record) => {
    acc[record.conceptTag] ??= { tag: record.conceptTag, tries: 0, correct: 0 };
    acc[record.conceptTag].tries += 1;
    if (record.correct) acc[record.conceptTag].correct += 1;
    return acc;
  }, {})).map((item) => ({ ...item, rate: item.tries ? Math.round((item.correct / item.tries) * 100) : 0 }));

  const chartData = grouped.length ? grouped : [
    { tag: "interval", tries: 0, correct: 0, rate: 0 },
    { tag: "chord", tries: 0, correct: 0, rate: 0 },
    { tag: "rhythm", tries: 0, correct: 0, rate: 0 }
  ];

  return (
    <main className="utility-page">
      <header className="utility-header">
        <div><p className="eyebrow">Review</p><h1>오답 노트</h1></div>
        <Link className="secondary-button" href="/practice">연습 모드</Link>
      </header>
      <section className="review-grid">
        <div className="chart-panel">
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={chartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="tag" />
              <Radar dataKey="rate" stroke="#66e3ff" fill="#66e3ff" fillOpacity={0.35} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="review-list">
          {grouped.map((item) => <article key={item.tag}><strong>{item.tag}</strong><span>{item.correct}/{item.tries} · {item.rate}%</span></article>)}
          {grouped.length === 0 ? <p>아직 기록된 카덴차가 없습니다.</p> : null}
        </div>
      </section>
    </main>
  );
}
