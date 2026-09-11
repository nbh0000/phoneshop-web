import type { Metadata } from "next";
import { adminConfigured, isAdminAuthed } from "@/lib/admin-auth";
import { storageMode } from "@/lib/storage";
import { AdminDashboard } from "./AdminDashboard";
import { AdminLogin } from "./AdminLogin";

export const metadata: Metadata = { title: "관리자", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const authed = await isAdminAuthed();
  return (
    <main className="min-h-dvh bg-bg px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-extrabold">신청 내역 관리</h1>
          <span className="rounded-md bg-bg-3 px-2 py-1 text-xs text-fg-2">
            저장소: {storageMode() === "supabase" ? "Supabase" : "로컬 JSON (개발용)"}
          </span>
        </div>
        {!adminConfigured() ? (
          <p className="rounded-xl border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
            환경변수 <code>ADMIN_PASSWORD</code> 가 설정되지 않아 관리자 페이지가 비활성화되어 있습니다.
          </p>
        ) : authed ? (
          <AdminDashboard />
        ) : (
          <AdminLogin />
        )}
      </div>
    </main>
  );
}
