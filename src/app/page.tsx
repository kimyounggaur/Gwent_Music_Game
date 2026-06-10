import Link from "next/link";
import Image from "next/image";
import { BookOpen, Brain, Music2, Swords } from "lucide-react";
import { BOARD_ASSET } from "@/data/assets";

const levels = [
  { id: "easy", name: "견습 지휘자", copy: "그리디 수 선택과 낮은 카덴차 성공률" },
  { id: "normal", name: "단원장", copy: "패스 심리전과 평가 함수 풀가동" },
  { id: "hard", name: "마에스트로", copy: "고성공 카덴차와 한 수 앞 응수 추정" }
];

export default function HomePage() {
  return (
    <main className="home-screen">
      <Image src={BOARD_ASSET} alt="" fill priority sizes="100vw" className="home-bg" />
      <div className="home-scrim" />
      <section className="home-panel">
        <p className="eyebrow">Solo Music Card Battle</p>
        <h1>앙상블 클래시: 솔로</h1>
        <p className="lead">멜로디, 화성, 리듬 3개 행에 카드를 배치하고 카덴차 체크로 강한 효과를 발동하세요.</p>
        <div className="difficulty-grid">
          {levels.map((level) => (
            <Link key={level.id} className="difficulty-card" href={`/play?ai=${level.id}`}>
              <Swords size={20} />
              <strong>{level.name}</strong>
              <span>{level.copy}</span>
            </Link>
          ))}
        </div>
        <div className="quick-links">
          <Link href="/deck"><BookOpen size={16} /> 덱빌더</Link>
          <Link href="/practice"><Brain size={16} /> 연습</Link>
          <Link href="/audio-test"><Music2 size={16} /> 청음 테스트</Link>
        </div>
      </section>
    </main>
  );
}
