/**
 * MOCK 어댑터 — 개발·시연용
 * 인증 요청 후 MOCK_AUTH_DELAY_MS(기본 5초)가 지나면 자동으로 성공 처리됩니다.
 * 실제 카카오톡 push 는 발송되지 않습니다.
 *
 * ⚠️ 실 인증 연동은 본인확인 중개사(PortOne/Tilko 등)와 발주사 명의 계약 및 심사 필요. 건당 과금 발생.
 */
import type { AuthProvider, AuthRequestInput } from "./types";

const DELAY_MS = Number(process.env.MOCK_AUTH_DELAY_MS || 5000);
const EXPIRE_MS = 5 * 60 * 1000;

// 서버리스 환경에서는 인스턴스 간 메모리가 공유되지 않으므로,
// txId 자체에 요청 시각을 인코딩해 상태를 계산합니다 (stateless).
function encode(input: AuthRequestInput): string {
  const payload = JSON.stringify({ t: Date.now(), n: input.name, b: input.birth, p: input.phone });
  return "mock_" + Buffer.from(payload, "utf8").toString("base64url");
}
function decode(txId: string): { t: number; n: string; b: string; p: string } | null {
  try {
    if (!txId.startsWith("mock_")) return null;
    return JSON.parse(Buffer.from(txId.slice(5), "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

export const mockProvider: AuthProvider = {
  name: "mock",
  async requestAuth(input) {
    return { txId: encode(input), message: "MOCK: 5초 후 자동 인증됩니다." };
  },
  async checkAuthStatus(txId) {
    const d = decode(txId);
    if (!d) return { status: "failed" };
    const elapsed = Date.now() - d.t;
    if (elapsed > EXPIRE_MS) return { status: "expired" };
    return { status: elapsed >= DELAY_MS ? "success" : "pending" };
  },
  async getResult(txId) {
    const d = decode(txId);
    const { status } = await this.checkAuthStatus(txId);
    return { status, name: d?.n, birth: d?.b, phone: d?.p };
  },
};
