import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "앙상블 클래시: 솔로",
  description: "음악이론 카덴차 체크와 AI 지휘자가 있는 1인용 카드배틀"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
