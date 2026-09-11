import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getCompany } from "@/lib/data";

const company = getCompany();
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
const TITLE = `${company.brandName} | 출고가 거품 뺀 휴대폰 다이렉트 특가`;
const DESC =
  "갤럭시·아이폰 최신 기종을 대리점보다 저렴하게. 번호이동·기기변경 조건별 실구매가 확인하고 카카오 간편인증으로 1분 만에 조회 신청하세요.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESC,
  keywords: ["휴대폰 성지", "휴대폰 특가", "갤럭시 특가", "아이폰 특가", "번호이동", "기기변경", "공시지원금"],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    siteName: company.brandName,
    title: TITLE,
    description: DESC,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: TITLE }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC },
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        {/* Pretendard (CDN) — preload + display=swap 로 CLS 최소화 */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="preload"
          as="style"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
