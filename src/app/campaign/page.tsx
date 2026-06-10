import Link from "next/link";
import { Trophy } from "lucide-react";

const stages = [
  ["S1", "음정 입문", "easy"],
  ["S2", "음계", "easy"],
  ["S3", "3화음", "normal"],
  ["S4", "V7과 종지", "normal"],
  ["S5", "리듬·박자", "normal"],
  ["S6", "당김음·셋잇단", "hard"],
  ["S7", "텐션 화성", "hard"],
  ["S8", "마에스트로", "hard"]
];

export default function CampaignPage() {
  return (
    <main className="utility-page">
      <header className="utility-header">
        <div><p className="eyebrow">Campaign</p><h1>캠페인 사다리</h1></div>
        <Link className="secondary-button" href="/">처음으로</Link>
      </header>
      <section className="campaign-ladder">
        {stages.map(([id, title, ai]) => (
          <Link key={id} href={`/play?ai=${ai}&campaign=${id}`} className="stage-card">
            <Trophy size={18} />
            <strong>{id} · {title}</strong>
            <span>{ai}</span>
            <em>☆☆☆</em>
          </Link>
        ))}
      </section>
    </main>
  );
}
