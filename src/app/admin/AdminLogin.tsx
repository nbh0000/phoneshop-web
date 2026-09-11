"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function AdminLogin() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const r = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    setLoading(false);
    if (r.ok) router.refresh();
    else setErr((await r.json()).error || "로그인 실패");
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-sm space-y-3 rounded-2xl border border-line bg-bg-2 p-6">
      <label className="block text-sm font-bold text-fg-2">
        관리자 비밀번호
        <input
          type="password"
          autoComplete="current-password"
          className="mt-1.5 h-11 w-full rounded-xl border border-line bg-bg px-4 text-fg focus:border-accent focus:outline-none"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
        />
      </label>
      {err && <p className="text-sm font-semibold text-danger">{err}</p>}
      <Button type="submit" className="w-full" disabled={loading || !pw}>
        로그인
      </Button>
    </form>
  );
}
