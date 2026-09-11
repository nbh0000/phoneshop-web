import { NextResponse } from "next/server";
import { getAuthProvider } from "@/lib/auth-provider";
import { updateInquiry } from "@/lib/storage";
import { notifyAdmin } from "@/lib/notify";

export const runtime = "nodejs";

/**
 * GET /api/auth/status?txId=...&inquiryId=...
 * Step2 폴링. 인증 완료 시 신청 상태를 success 로 갱신하고 관리자 알림을 보냅니다.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const txId = searchParams.get("txId") || "";
  const inquiryId = searchParams.get("inquiryId") || "";
  if (!txId || !inquiryId) return NextResponse.json({ error: "bad request" }, { status: 400 });

  const provider = getAuthProvider();
  let status;
  try {
    status = (await provider.checkAuthStatus(txId)).status;
  } catch {
    return NextResponse.json({ status: "pending" });
  }

  if (status === "success" || status === "failed" || status === "expired") {
    // 상태 전이는 1회만 (이미 갱신된 경우 알림 중복 방지)
    const updated = await updateInquiry(inquiryId, { authStatus: status });
    if (status === "success" && updated && !searchParams.get("silent")) {
      await notifyAdmin(updated);
    }
  }

  return NextResponse.json({ status });
}
