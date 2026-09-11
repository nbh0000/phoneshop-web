"use client";

import { useEffect, useState } from "react";

function diff(deadline: number) {
  const ms = Math.max(0, deadline - Date.now());
  const s = Math.floor(ms / 1000);
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
    over: ms === 0,
  };
}

export function Countdown({ deadline }: { deadline: string }) {
  const target = new Date(deadline).getTime();
  // SSR hydration mismatch 방지: 마운트 후에만 실제 값 표시
  const [t, setT] = useState<ReturnType<typeof diff> | null>(null);

  useEffect(() => {
    const id = setInterval(() => setT(diff(target)), 1000);
    const first = setTimeout(() => setT(diff(target)), 0);
    return () => {
      clearInterval(id);
      clearTimeout(first);
    };
  }, [target]);

  const cell = (v: number | null, label: string) => (
    <div className="flex flex-col items-center">
      <span className="tabular grid h-12 min-w-12 place-items-center rounded-lg bg-bg px-2 text-2xl font-black text-accent ring-1 ring-accent/30 sm:h-14 sm:min-w-14 sm:text-3xl">
        {v === null ? "--" : String(v).padStart(2, "0")}
      </span>
      <span className="mt-1 text-[11px] font-semibold text-fg-3">{label}</span>
    </div>
  );

  if (t?.over) {
    return <p className="text-sm font-bold text-danger">마감되었습니다. 다음 회차를 기다려 주세요.</p>;
  }

  return (
    <div className="flex items-start gap-1.5 sm:gap-2" role="timer" aria-live="off" aria-label="마감까지 남은 시간">
      {cell(t?.d ?? null, "일")}
      <span className="mt-2 text-2xl font-black text-fg-3">:</span>
      {cell(t?.h ?? null, "시간")}
      <span className="mt-2 text-2xl font-black text-fg-3">:</span>
      {cell(t?.m ?? null, "분")}
      <span className="mt-2 text-2xl font-black text-fg-3">:</span>
      {cell(t?.s ?? null, "초")}
    </div>
  );
}
