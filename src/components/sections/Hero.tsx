"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { asset } from "@/lib/asset";
import type { BannerSlide } from "@/types";
import { useFunnel } from "../FunnelContext";
import { Button, cn } from "../ui/Button";
import { IconArrow, IconCheck, IconChevron, IconShield, IconTruck } from "../ui/Icons";

const badges = [
  { icon: IconShield, label: "통신판매업 신고 완료" },
  { icon: IconCheck, label: "통신 3사 공식 개통" },
  { icon: IconTruck, label: "개통 후 당일 발송" },
];

/** 좌측에 겹쳐 놓는 제품 이미지 3장의 위치/회전 */
const stack = [
  "left-0 top-0 z-30 h-[54%] rotate-[-8deg] sm:h-[60%]",
  "left-[24%] top-[20%] z-20 h-[54%] rotate-[-4deg] sm:h-[60%]",
  "left-[48%] top-[40%] z-10 h-[54%] rotate-[2deg] sm:h-[60%]",
];

export function Hero({ slides, intervalMs = 6000 }: { slides: BannerSlide[]; intervalMs?: number }) {
  const { open } = useFunnel();
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const n = slides.length;

  const go = useCallback((i: number) => setIdx(((i % n) + n) % n), [n]);

  useEffect(() => {
    if (paused || n < 2) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % n), intervalMs);
    return () => clearInterval(id);
  }, [paused, n, intervalMs]);

  return (
    <section
      id="top"
      className="relative overflow-hidden border-b border-line/60"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(idx + (dx < 0 ? 1 : -1));
        touchX.current = null;
      }}
      aria-roledescription="carousel"
      aria-label="메인 배너"
    >
      {/* 슬라이드 트랙 */}
      <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${idx * 100}%)` }}>
        {slides.map((s, i) => (
          <article
            key={s.id}
            className="relative w-full shrink-0"
            aria-hidden={i !== idx}
            aria-roledescription="slide"
            aria-label={`${i + 1} / ${n}`}
          >
            {/* 배경 */}
            <div className="pointer-events-none absolute inset-0 -z-10">
              <div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(70% 70% at 15% 60%, ${s.accent}22, transparent 60%), radial-gradient(50% 60% at 90% 10%, ${s.accent}14, transparent 60%)`,
                }}
              />
              <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(70%_60%_at_50%_40%,#000,transparent)]" />
            </div>

            <div className="container-x grid gap-6 py-10 sm:py-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-10 lg:py-16">
              {/* 좌측 제품 이미지 스택 */}
              <div className="relative order-2 mx-auto h-56 w-full max-w-sm sm:h-72 lg:order-1 lg:h-[380px] lg:max-w-none">
                <div className="absolute inset-0 -z-10 rounded-full blur-3xl" style={{ background: `${s.accent}26` }} />
                {s.images.slice(0, 3).map((src, k) => (
                  <Image
                    key={src}
                    src={asset(src)}
                    alt=""
                    width={320}
                    height={320}
                    priority={i === 0 && k === 0}
                    loading={i === 0 ? "eager" : "lazy"}
                    className={cn("absolute w-auto object-contain drop-shadow-[0_24px_40px_rgba(0,0,0,0.25)]", stack[k])}
                  />
                ))}
              </div>

              {/* 우측 카피 + 혜택 */}
              <div className="order-1 lg:order-2">
                <span
                  className="relative inline-block rounded-full px-4 py-1.5 text-sm font-extrabold text-white"
                  style={{ background: s.accent }}
                >
                  {s.tag}
                  <span className="absolute -bottom-2 left-6 h-0 w-0 border-x-8 border-t-8 border-x-transparent" style={{ borderTopColor: s.accent }} />
                </span>
                <h1 className="mt-4 text-[2rem] font-black leading-[1.15] tracking-tight sm:text-5xl lg:text-[3.4rem]">{s.title}</h1>
                <p className="mt-3 text-[15px] text-fg-2 sm:text-lg">{s.subtitle}</p>

                <ul className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                  {s.benefits.map((b) => (
                    <li key={b.label} className="rounded-xl border border-line bg-bg-2/80 p-3 backdrop-blur">
                      <span className="rounded-md px-1.5 py-0.5 text-[10px] font-black text-white" style={{ background: s.accent }}>
                        {b.label}
                      </span>
                      <p className="mt-2 text-base font-black leading-tight sm:text-lg">{b.title}</p>
                      <p className="text-xs text-fg-2">{b.desc}</p>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button size="lg" className="w-full sm:w-auto" onClick={() => open(s.ctaPreset)} tabIndex={i === idx ? 0 : -1}>
                    {s.ctaLabel}
                    <IconArrow width={18} height={18} />
                  </Button>
                  <a href="#products" className="text-center text-sm font-semibold text-fg-2 underline-offset-4 hover:text-fg hover:underline" tabIndex={i === idx ? 0 : -1}>
                    전체 특가 보기
                  </a>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* 좌우 화살표 */}
      {n > 1 && (
        <>
          <button
            onClick={() => go(idx - 1)}
            className="absolute left-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-line bg-bg/70 text-fg backdrop-blur hover:border-accent hover:text-accent md:grid lg:left-6"
            aria-label="이전 배너"
          >
            <IconChevron className="rotate-90" />
          </button>
          <button
            onClick={() => go(idx + 1)}
            className="absolute right-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-line bg-bg/70 text-fg backdrop-blur hover:border-accent hover:text-accent md:grid lg:right-6"
            aria-label="다음 배너"
          >
            <IconChevron className="-rotate-90" />
          </button>
        </>
      )}

      {/* 인디케이터 + 신뢰 배지 */}
      <div className="container-x flex flex-col items-center gap-4 pb-6 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-1.5" role="tablist" aria-label="배너 선택">
          {slides.map((s, i) => (
            <button
              key={s.id}
              role="tab"
              aria-selected={i === idx}
              aria-label={`${i + 1}번 배너`}
              onClick={() => go(i)}
              className={cn("h-1.5 rounded-full transition-all", i === idx ? "w-8 bg-accent" : "w-2 bg-line-2 hover:bg-fg-3")}
            />
          ))}
        </div>
        <ul className="flex flex-wrap justify-center gap-2" aria-label="신뢰 요소">
          {badges.map(({ icon: Icon, label }) => (
            <li key={label} className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-bg-2/70 px-3 py-1.5 text-xs font-semibold text-fg-2">
              <Icon width={14} height={14} className="text-accent" />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
