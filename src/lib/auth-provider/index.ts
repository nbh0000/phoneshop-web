/**
 * AUTH_PROVIDER 환경변수에 따라 어댑터를 선택합니다.
 * 키가 없으면 무조건 mock 으로 폴백 → 전체 퍼널을 항상 시연할 수 있습니다.
 *
 * ⚠️ 실 인증 연동은 본인확인 중개사(PortOne/Tilko 등)와 발주사 명의 계약 및 심사 필요. 건당 과금 발생.
 */
import { mockProvider } from "./mock";
import { portoneConfigured, portoneProvider } from "./portone";
import { tilkoConfigured, tilkoProvider } from "./tilko";
import type { AuthProvider } from "./types";

export function getAuthProvider(): AuthProvider {
  const want = (process.env.AUTH_PROVIDER || "mock").toLowerCase();
  if (want === "portone" && portoneConfigured) return portoneProvider;
  if (want === "tilko" && tilkoConfigured) return tilkoProvider;
  if (want !== "mock" && process.env.NODE_ENV !== "production") {
    console.warn(`[auth-provider] AUTH_PROVIDER=${want} 이지만 키가 없어 mock 으로 동작합니다.`);
  }
  return mockProvider;
}

export type { AuthProvider } from "./types";
