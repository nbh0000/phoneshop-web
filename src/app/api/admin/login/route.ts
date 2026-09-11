import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminConfigured, tokenFor, verifyPassword } from "@/lib/admin-auth";

export async function POST(req: Request) {
  if (!adminConfigured()) return NextResponse.json({ error: "ADMIN_PASSWORD 환경변수가 설정되지 않았습니다." }, { status: 500 });
  const { password } = await req.json().catch(() => ({ password: "" }));
  if (!verifyPassword(String(password || ""))) {
    return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, tokenFor(String(password)), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 8,
  });
  return res;
}
