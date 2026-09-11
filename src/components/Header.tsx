"use client";

import { useEffect, useState } from "react";
import { useFunnel } from "./FunnelContext";
import { ButtonLink, Button, cn } from "./ui/Button";
import { IconKakao, IconSearch } from "./ui/Icons";

export function Header({ brand, brandEn, kakaoUrl }: { brand: string; brandEn: string; kakaoUrl: string }) {
  const [first, ...rest] = brandEn.split(" ");
  const [shrunk, setShrunk] = useState(false);
  const { open } = useFunnel();

  useEffect(() => {
    const onScroll = () => setShrunk(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-line/60 bg-bg-2/90 backdrop-blur-md transition-[height,background-color] duration-200",
        shrunk ? "h-12" : "h-16",
      )}
    >
      <div className="container-x flex h-full items-center justify-between">
        {/* 워드마크 로고 — 추후 <img> 로 교체 가능 */}
        <a href="#top" className="flex items-baseline gap-0.5 select-none" aria-label={brand}>
          <span
            className={cn(
              "font-black uppercase leading-none tracking-[-0.06em] text-fg transition-[font-size]",
              shrunk ? "text-[22px]" : "text-[26px]",
            )}
          >
            {first}
            <span className="text-accent">{rest.join(" ")}</span>
          </span>
          <span className={cn("inline-block rounded-full bg-accent transition-all", shrunk ? "h-1.5 w-1.5" : "h-2 w-2")} />
        </a>

        <nav className="hidden items-center gap-10 text-[17px] font-bold text-fg md:flex" aria-label="주요 메뉴">
          <a href="#hot" className="hover:text-accent">🔥 선착순 핫딜</a>
          <a href="#products" className="hover:text-accent">🏆 BEST</a>
          <a href="#iphone" className="hover:text-accent">🍎 iPhone</a>
          <a href="#galaxy" className="hover:text-accent">🌌 Galaxy</a>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:inline-flex" onClick={() => open()}>
            <IconSearch width={16} height={16} />
            조회하기
          </Button>
          <ButtonLink variant="kakao" size="sm" href={kakaoUrl} target="_blank" rel="noopener noreferrer">
            <IconKakao width={16} height={16} />
            카카오톡 상담
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
