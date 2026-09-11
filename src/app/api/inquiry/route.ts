import { NextResponse } from "next/server";
import { getAuthProvider } from "@/lib/auth-provider";
import { saveInquiry } from "@/lib/storage";
import type { Inquiry } from "@/types";

export const runtime = "nodejs";

const CARRIERS = ["SKT", "KT", "LGU+", "알뜰폰"];

/**
 * POST /api/inquiry
 * Step1 정보 입력 → 신청 생성(pending) + 카카오 인증 요청 발송
 * 개인정보는 로그에 남기지 않습니다.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const name = String(body.name || "").trim();
  const birth = String(body.birth || "").replace(/\D/g, "");
  const phone = String(body.phone || "").replace(/\D/g, "");
  const carrier = String(body.carrier || "");
  const model = String(body.model || "").trim().slice(0, 60);
  const productId = body.productId ? String(body.productId).slice(0, 60) : undefined;
  const agreed = body.agreed === true;

  if (!agreed) return NextResponse.json({ error: "개인정보 수집·이용에 동의해 주세요." }, { status: 400 });
  if (name.length < 2 || name.length > 20) return NextResponse.json({ error: "이름을 확인해 주세요." }, { status: 400 });
  if (!/^\d{8}$/.test(birth)) return NextResponse.json({ error: "생년월일 8자리를 입력해 주세요." }, { status: 400 });
  if (!/^01\d{8,9}$/.test(phone)) return NextResponse.json({ error: "휴대폰 번호를 확인해 주세요." }, { status: 400 });
  if (!CARRIERS.includes(carrier)) return NextResponse.json({ error: "통신사를 선택해 주세요." }, { status: 400 });

  const provider = getAuthProvider();
  let txId: string;
  let message: string | undefined;
  try {
    const r = await provider.requestAuth({ name, birth, phone, carrier });
    txId = r.txId;
    message = r.message;
  } catch {
    return NextResponse.json({ error: "인증 요청에 실패했습니다. 잠시 후 다시 시도해 주세요." }, { status: 502 });
  }

  const inquiry: Inquiry = {
    id: `inq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    name,
    birth,
    phone,
    carrier: carrier as Inquiry["carrier"],
    model,
    productId,
    authStatus: "pending",
    authTxId: txId,
  };

  try {
    await saveInquiry(inquiry);
  } catch {
    return NextResponse.json({ error: "접수 저장에 실패했습니다. 잠시 후 다시 시도해 주세요." }, { status: 500 });
  }

  return NextResponse.json({ inquiryId: inquiry.id, txId, provider: provider.name, message });
}
