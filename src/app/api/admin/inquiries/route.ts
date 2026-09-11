import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { listInquiries } from "@/lib/storage";
import { maskName } from "@/lib/format";

export const runtime = "nodejs";

/** GET /api/admin/inquiries?format=csv  — 관리자 전용 */
export async function GET(req: Request) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const list = await listInquiries();
  const { searchParams } = new URL(req.url);

  if (searchParams.get("format") === "csv") {
    const header = ["접수일시", "이름", "생년월일", "연락처", "통신사", "희망기종", "인증상태", "ID"];
    const esc = (v: string) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = list.map((i) =>
      [new Date(i.createdAt).toLocaleString("ko-KR"), i.name, i.birth, i.phone, i.carrier, i.model, i.authStatus, i.id].map(esc).join(","),
    );
    const BOM = String.fromCharCode(0xfeff); // 엑셀 한글 깨짐 방지
    const csv = BOM + [header.map(esc).join(","), ...rows].join("\r\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="inquiries_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  return NextResponse.json({
    inquiries: list.map((i) => ({ ...i, nameMasked: maskName(i.name), birth: undefined })),
  });
}
