"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Inquiry } from "@/types";
import { Button, ButtonLink, cn } from "@/components/ui/Button";

type Row = Inquiry & { nameMasked: string };

const statusLabel: Record<string, { text: string; cls: string }> = {
  success: { text: "인증완료", cls: "bg-accent/15 text-accent" },
  pending: { text: "인증대기", cls: "bg-bg-3 text-fg-2" },
  failed: { text: "인증실패", cls: "bg-danger/15 text-danger" },
  expired: { text: "만료", cls: "bg-danger/15 text-danger" },
};

export function AdminDashboard() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [err, setErr] = useState("");
  const [filter, setFilter] = useState<"all" | "success" | "pending">("all");
  const router = useRouter();

  const load = useCallback(async () => {
    setErr("");
    const r = await fetch("/api/admin/inquiries", { cache: "no-store" });
    if (!r.ok) {
      setErr("불러오기 실패 (세션 만료 시 새로고침)");
      return;
    }
    setRows((await r.json()).inquiries);
  }, []);

  useEffect(() => {
    const id = setTimeout(load, 0);
    return () => clearTimeout(id);
  }, [load]);

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  };

  const list = (rows || []).filter((r) => (filter === "all" ? true : r.authStatus === filter));
  const count = { all: rows?.length ?? 0, success: rows?.filter((r) => r.authStatus === "success").length ?? 0, pending: rows?.filter((r) => r.authStatus === "pending").length ?? 0 };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(["all", "success", "pending"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={cn(
                "h-9 rounded-full px-4 text-sm font-bold ring-1",
                filter === k ? "bg-accent text-white ring-accent" : "bg-bg-2 text-fg-2 ring-line",
              )}
            >
              {k === "all" ? "전체" : k === "success" ? "인증완료" : "인증대기"} {count[k]}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={load}>새로고침</Button>
          <ButtonLink variant="outline" size="sm" href="/api/admin/inquiries?format=csv">CSV 내보내기</ButtonLink>
          <Button variant="ghost" size="sm" onClick={logout}>로그아웃</Button>
        </div>
      </div>

      {err && <p className="text-sm text-danger">{err}</p>}

      <div className="overflow-x-auto rounded-2xl border border-line bg-bg-2">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-bg-3 text-left text-xs text-fg-2">
            <tr>
              <th className="px-4 py-3">접수일시</th>
              <th className="px-4 py-3">이름</th>
              <th className="px-4 py-3">연락처</th>
              <th className="px-4 py-3">통신사</th>
              <th className="px-4 py-3">희망 기종</th>
              <th className="px-4 py-3">인증 상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows === null && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-fg-3">불러오는 중...</td></tr>
            )}
            {rows && list.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-fg-3">신청 내역이 없습니다.</td></tr>
            )}
            {list.map((r) => {
              const s = statusLabel[r.authStatus] || statusLabel.pending;
              return (
                <tr key={r.id} className="hover:bg-bg-3/40">
                  <td className="tabular whitespace-nowrap px-4 py-3 text-fg-2">{new Date(r.createdAt).toLocaleString("ko-KR")}</td>
                  <td className="px-4 py-3 font-bold">{r.nameMasked}</td>
                  <td className="tabular px-4 py-3"><a href={`tel:${r.phone}`} className="hover:text-accent">{r.phone.replace(/(\d{3})(\d{3,4})(\d{4})/, "$1-$2-$3")}</a></td>
                  <td className="px-4 py-3">{r.carrier}</td>
                  <td className="px-4 py-3 text-fg-2">{r.model || "-"}</td>
                  <td className="px-4 py-3"><span className={cn("rounded-md px-2 py-0.5 text-xs font-bold", s.cls)}>{s.text}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-fg-3">CSV 파일에는 마스킹되지 않은 이름·생년월일이 포함됩니다. 외부 유출에 주의하세요.</p>
    </div>
  );
}
