import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import QueryProvider from "@/providers/QueryProvider";

import Script from 'next/script';

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-noto-sans-kr",
});

export const metadata: Metadata = {
  title: "SkillHub - 나를 성장시키는 새로운 방식",
  description: "다양한 분야의 전문가들과 함께 실무에 바로 쓸 수 있는 기술을 배워보세요. 체계적인 커리큘럼과 함께하는 성장의 여정.",
  keywords: ["온라인 강의", "프로그래밍", "데이터 분석", "디자인", "비즈니스", "스킬허브"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${notoSansKR.variable} font-sans antialiased bg-cream-50 text-slate-800`}>

        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

