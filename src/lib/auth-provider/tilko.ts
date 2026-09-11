/**
 * Tilko 카카오 간편인증 어댑터 — 골격
 *
 * ⚠️ 실 연동에는 Tilko(https://tilko.net) API 키 발급과 발주사 명의 계약이 필요하며
 *    간편인증 건당 과금이 발생합니다. 카카오 인증서가 발급된 사용자만 인증 가능합니다.
 *
 * [Tilko 간편인증 흐름 (일반적 형태 — 실제 스펙은 계약 후 제공되는 문서 확인)]
 *  0) 공개키 조회: GET  {BASE}/api/Auth/GetPublicKey?APIkey={TILKO_API_KEY}
 *     → 응답 PublicKey 로 AES 키를 RSA 암호화하여 이후 요청 헤더에 사용
 *     Headers: API-KEY, ENC-KEY(RSA로 암호화된 AES 키)
 *  1) 인증 요청:  POST {BASE}/api/v2.0/Kakao/SimpleAuth
 *     Body(AES 암호화): { PrivateAuthType: "0"(카카오), UserName, BirthDate(YYYYMMDD),
 *                          UserCellphoneNumber, ... }
 *     → 응답 { Status, ResultData: { CxId, PrivateAuthType, ReqTxId, Token, TxId, ... } }
 *     사용자에게 "카카오톡에서 인증을 완료하세요" 안내
 *  2) 인증 완료 확인/결과 조회: POST {BASE}/api/v2.0/Kakao/SimpleAuthCheck
 *     Body: 1)에서 받은 CxId/ReqTxId/Token/TxId 등 그대로 전달
 *     → 사용자가 카카오톡 인증을 아직 안 했으면 오류/대기 응답, 완료 시 결과 반환
 *
 * 필요 환경변수: TILKO_API_KEY, (선택) TILKO_BASE_URL
 */
import type { AuthProvider } from "./types";

const BASE = process.env.TILKO_BASE_URL || "https://api.tilko.net";
const apiKey = process.env.TILKO_API_KEY;

export const tilkoConfigured = Boolean(apiKey);

/** 1)에서 받은 세션 값들을 txId 하나로 직렬화 (서버리스 stateless) */
type TilkoSession = {
  CxId: string;
  ReqTxId: string;
  Token: string;
  TxId: string;
  PrivateAuthType: string;
  name: string;
  birth: string;
  phone: string;
  t: number;
};
const pack = (s: TilkoSession) => "tk_" + Buffer.from(JSON.stringify(s)).toString("base64url");
const unpack = (id: string): TilkoSession =>
  JSON.parse(Buffer.from(id.slice(3), "base64url").toString());

// TODO: AES/RSA 암호화 유틸 (Tilko 제공 샘플 참고). 여기서는 골격만 둡니다.
async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(BASE + path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "API-KEY": apiKey || "",
      // "ENC-KEY": rsaEncryptedAesKey,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Tilko ${res.status}`);
  return res.json() as Promise<T>;
}

type TilkoAuthRes = {
  Status: string;
  ResultData: { CxId: string; ReqTxId: string; Token: string; TxId: string; PrivateAuthType: string };
};

export const tilkoProvider: AuthProvider = {
  name: "tilko",
  async requestAuth(input) {
    const r = await post<TilkoAuthRes>("/api/v2.0/Kakao/SimpleAuth", {
      PrivateAuthType: "0",
      UserName: input.name,
      BirthDate: input.birth,
      UserCellphoneNumber: input.phone,
    });
    if (r.Status !== "OK") throw new Error("Tilko 요청 실패");
    return {
      txId: pack({ ...r.ResultData, name: input.name, birth: input.birth, phone: input.phone, t: Date.now() }),
    };
  },
  async checkAuthStatus(txId) {
    const s = unpack(txId);
    if (Date.now() - s.t > 5 * 60 * 1000) return { status: "expired" };
    try {
      const r = await post<{ Status: string }>("/api/v2.0/Kakao/SimpleAuthCheck", {
        CxId: s.CxId,
        ReqTxId: s.ReqTxId,
        Token: s.Token,
        TxId: s.TxId,
        PrivateAuthType: s.PrivateAuthType,
      });
      return { status: r.Status === "OK" ? "success" : "pending" };
    } catch {
      return { status: "pending" };
    }
  },
  async getResult(txId) {
    const s = unpack(txId);
    const { status } = await this.checkAuthStatus(txId);
    return { status, name: s.name, birth: s.birth, phone: s.phone };
  },
};
