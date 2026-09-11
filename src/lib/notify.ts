/**
 * 관리자 알림 (선택)
 * - ADMIN_WEBHOOK_URL 이 설정되어 있으면 신청 접수 시 JSON POST (Slack/Discord/Make/Zapier 등 호환)
 * - 없으면 아무 동작도 하지 않음
 * 알림 본문에는 마스킹된 이름/연락처만 포함합니다.
 */
import { maskName, maskPhone } from "./format";
import type { Inquiry } from "@/types";

export async function notifyAdmin(inquiry: Inquiry): Promise<void> {
  const url = process.env.ADMIN_WEBHOOK_URL;
  if (!url) return;
  const text = [
    "📱 새 조회 신청 접수",
    `이름: ${maskName(inquiry.name)}`,
    `연락처: ${maskPhone(inquiry.phone)}`,
    `통신사: ${inquiry.carrier}`,
    `희망 기종: ${inquiry.model || "-"}`,
    `인증: ${inquiry.authStatus}`,
    `접수: ${inquiry.createdAt}`,
  ].join("\n");
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Slack/Discord 둘 다 인식하도록 text + content 동시 전송
      body: JSON.stringify({ text, content: text, inquiryId: inquiry.id }),
    });
  } catch {
    // 알림 실패는 접수 자체를 실패시키지 않음
  }
}
