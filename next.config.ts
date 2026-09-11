import type { NextConfig } from "next";

/**
 * STATIC_EXPORT=1 → GitHub Pages 용 정적 데모 빌드 (API/관리자 없음, 퍼널은 클라이언트 mock)
 * 운영 배포는 Vercel (기본 설정) 을 사용하세요.
 */
const isStatic = process.env.STATIC_EXPORT === "1";
const basePath = isStatic ? process.env.BASE_PATH || "" : "";

const nextConfig: NextConfig = {
  ...(isStatic
    ? { output: "export", basePath, images: { unoptimized: true }, trailingSlash: true }
    : {}),
  env: { NEXT_PUBLIC_BASE_PATH: basePath, NEXT_PUBLIC_STATIC_DEMO: isStatic ? "1" : "" },
};

export default nextConfig;
