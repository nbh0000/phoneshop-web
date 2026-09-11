/**
 * ─────────────────────────────────────────────────────────────────────────────
 * 본인확인(카카오 간편인증) 어댑터 인터페이스
 *
 * ⚠️ 실 인증 연동은 본인확인 중개사(PortOne/Tilko 등)와 발주사 명의의 계약 및
 *    심사가 필요합니다. 인증 건당 과금이 발생합니다.
 *
 * 환경변수 AUTH_PROVIDER=mock | portone | tilko 로 어댑터를 전환하며,
 * 해당 어댑터에 필요한 키가 없으면 무조건 mock 으로 동작합니다.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import type { AuthStatus } from "@/types";

export interface AuthRequestInput {
  name: string;
  birth: string; // YYYYMMDD
  phone: string; // 숫자만
  carrier: string;
}

export interface AuthRequestResult {
  /** 중개사 트랜잭션 ID. 이후 상태 조회에 사용 */
  txId: string;
  /** 사용자에게 보여줄 안내 메시지 (선택) */
  message?: string;
}

export interface AuthStatusResult {
  status: AuthStatus;
}

export interface AuthVerifiedResult {
  status: AuthStatus;
  /** 인증된 이름/생년월일/휴대폰 (중개사가 반환하는 경우) */
  name?: string;
  birth?: string;
  phone?: string;
  /** 연계정보(CI) 등 — 저장 필요 시 암호화 필수 */
  ci?: string;
}

export interface AuthProvider {
  readonly name: "mock" | "portone" | "tilko";
  /** 카카오톡으로 인증 요청 push 발송 */
  requestAuth(input: AuthRequestInput): Promise<AuthRequestResult>;
  /** 인증 완료 여부 폴링 */
  checkAuthStatus(txId: string): Promise<AuthStatusResult>;
  /** 인증 완료 후 최종 결과(검증된 신원 정보) 조회 */
  getResult(txId: string): Promise<AuthVerifiedResult>;
}
