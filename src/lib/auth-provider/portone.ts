/**
 * PortOne(구 아임포트) 본인인증 어댑터 — 골격
 *
 * ⚠️ 실 연동에는 PortOne 가입, 발주사 명의의 본인확인 서비스 계약(KMC/NICE/다날 등
 *    본인확인기관 심사 포함), 채널 설정이 필요합니다. 인증 건당 과금이 발생합니다.
 *
 * 참고 문서: https://developers.portone.io/opi/ko/extra/identity-verification/readme-v2
 *
 * [V2 REST API 흐름 — 서버 사이드 발송 방식]
 *  1) 인증 요청 발송
 *     POST https://api.portone.io/identity-verifications/{identityVerificationId}/send
 *     Headers: Authorization: PortOne {PORTONE_API_SECRET}
 *     Body: {
 *       storeId, channelKey,
 *       customer: { name, phoneNumber, identityNumber: "YYMMDD..." },
 *       method: "SMS" | "APP",   // 카카오 간편인증은 채널(다날 등)에 따라 APP 방식으로 제공
 *       operator: "SKT"|"KT"|"LGU"|"SKT_MVNO"|"KT_MVNO"|"LGU_MVNO"
 *     }
 *  2) 상태 조회
 *     GET https://api.portone.io/identity-verifications/{identityVerificationId}
 *     → status: "READY" | "VERIFIED" | "FAILED"
 *  3) 인증 결과의 verifiedCustomer { name, birthDate, phoneNumber, ci, di } 사용
 *
 * 필요 환경변수: PORTONE_API_SECRET, PORTONE_STORE_ID, PORTONE_CHANNEL_KEY
 */
import type { AuthProvider } from "./types";

const API = "https://api.portone.io";
const secret = process.env.PORTONE_API_SECRET;
const storeId = process.env.PORTONE_STORE_ID;
const channelKey = process.env.PORTONE_CHANNEL_KEY;

export const portoneConfigured = Boolean(secret && storeId && channelKey);

const carrierMap: Record<string, string> = {
  SKT: "SKT",
  KT: "KT",
  "LGU+": "LGU",
  알뜰폰: "SKT_MVNO",
};

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(API + path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `PortOne ${secret}`,
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`PortOne ${res.status}`);
  return res.json() as Promise<T>;
}

type PortOneVerification = {
  status: string;
  verifiedCustomer?: { name: string; birthDate: string; phoneNumber: string; ci?: string };
};

export const portoneProvider: AuthProvider = {
  name: "portone",
  async requestAuth(input) {
    const txId = `pv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await call(`/identity-verifications/${txId}/send`, {
      method: "POST",
      body: JSON.stringify({
        storeId,
        channelKey,
        customer: {
          name: input.name,
          phoneNumber: input.phone,
          identityNumber: input.birth.slice(2),
        },
        method: "APP",
        operator: carrierMap[input.carrier] || "SKT",
      }),
    });
    return { txId };
  },
  async checkAuthStatus(txId) {
    const r = await call<PortOneVerification>(`/identity-verifications/${txId}`);
    return {
      status: r.status === "VERIFIED" ? "success" : r.status === "FAILED" ? "failed" : "pending",
    };
  },
  async getResult(txId) {
    const r = await call<PortOneVerification>(`/identity-verifications/${txId}`);
    const v = r.verifiedCustomer;
    return {
      status: r.status === "VERIFIED" ? "success" : "pending",
      name: v?.name,
      birth: v?.birthDate?.replace(/-/g, ""),
      phone: v?.phoneNumber,
      ci: v?.ci,
    };
  },
};
