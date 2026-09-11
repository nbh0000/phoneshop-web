"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { asset } from "@/lib/asset";
import type { Category, Product } from "@/types";
import { won } from "@/lib/format";
import { useFunnel } from "../FunnelContext";
import { Badge, CarrierChip } from "../ui/Badge";
import { cn } from "../ui/Button";
import { IconArrow } from "../ui/Icons";
import { SectionTitle } from "../ui/SectionTitle";

type Tab = "all" | Category;
const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "galaxy", label: "갤럭시" },
  { key: "iphone", label: "아이폰" },
];

function ProductCard({ p, onClick }: { p: Product; onClick: () => void }) {
  const isSelect = p.discountType === "선택약정";
  const officialLabel = isSelect ? "선택약정 할인(24개월)" : "공시지원금";
  const officialAmount = isSelect ? (p.discounts.selectContract ?? 0) : p.discounts.official;
  const total = officialAmount + p.discounts.extra;

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="group flex cursor-pointer flex-col rounded-2xl border border-line bg-bg-2 p-5 transition hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-glow focus-visible:border-accent"
      aria-label={`${p.name} ${p.storage} 조건 조회하기`}
    >
      {p.image && (
        <div className="relative mb-4 flex h-40 items-center justify-center rounded-xl bg-[radial-gradient(60%_60%_at_50%_50%,rgba(255,45,85,0.12),transparent_70%)]">
          <Image
            src={asset(p.image)}
            alt={`${p.name} 제품 이미지`}
            width={180}
            height={180}
            loading="lazy"
            className="h-36 w-auto object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.2)] transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-extrabold tracking-tight">
          {p.name} <span className="text-sm font-semibold text-fg-2">{p.storage}</span>
        </h3>
        <Badge label={p.badge} />
      </div>

      <div className="mt-3 flex flex-wrap items-baseline gap-x-2">
        <span className="tabular text-[28px] font-black leading-none text-accent">{won(p.salePrice)}</span>
        <span className="text-sm font-bold text-accent">원</span>
        <span className="tabular strike ml-1 text-xs text-fg-3">출고가 {won(p.releasePrice)}원</span>
      </div>

      <p className="mt-3 flex flex-wrap items-center gap-x-1.5 text-[12.5px] text-fg-2">
        <CarrierChip carrier={p.carrier} />
        <span className="text-line-2">ㅣ</span>
        <span>{p.joinType}</span>
        <span className="text-line-2">ㅣ</span>
        <span>{p.discountType}</span>
        <span className="text-line-2">ㅣ</span>
        <span className="truncate">{p.plan}</span>
      </p>

      <dl className="tabular mt-4 space-y-1.5 rounded-xl bg-bg/60 p-3 text-[13px]">
        <div className="flex justify-between">
          <dt className="text-fg-2">추가지원금</dt>
          <dd className="font-semibold text-accent-2">-{won(p.discounts.extra)}원</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-fg-2">{officialLabel}</dt>
          <dd className="font-semibold text-accent-2">-{won(officialAmount)}원</dd>
        </div>
        <div className="flex justify-between border-t border-line pt-1.5">
          <dt className="font-bold">총 할인금액</dt>
          <dd className="font-black text-accent">-{won(total)}원</dd>
        </div>
      </dl>

      <span className="mt-4 inline-flex items-center justify-center gap-1 rounded-xl border border-line-2 py-2.5 text-sm font-bold text-fg transition group-hover:border-accent group-hover:bg-accent group-hover:text-white">
        이 조건으로 조회하기
        <IconArrow width={16} height={16} />
      </span>
    </article>
  );
}

export function Products({ products }: { products: Product[] }) {
  const [tab, setTab] = useState<Tab>("all");
  const { open } = useFunnel();

  // 헤더의 #iphone / #galaxy 링크로 탭 전환
  useEffect(() => {
    const sync = () => {
      const h = window.location.hash.replace("#", "");
      if (h === "iphone" || h === "galaxy") setTab(h);
      else if (h === "products") setTab("all");
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  const list = useMemo(() => (tab === "all" ? products : products.filter((p) => p.category === tab)), [tab, products]);

  return (
    <section id="products" className="relative py-14 sm:py-20">
      <span id="iphone" className="absolute top-0" aria-hidden />
      <span id="galaxy" className="absolute top-0" aria-hidden />
      <div className="container-x">
        <SectionTitle
          eyebrow="Live deals"
          title="실시간 특가 상품"
          desc="카드를 누르면 해당 조건이 담긴 채로 조회 신청이 열립니다."
        />

        <div className="mt-6 flex gap-2" role="tablist" aria-label="상품 분류">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "h-10 rounded-full px-5 text-sm font-bold transition",
                tab === t.key ? "bg-accent text-white" : "bg-bg-2 text-fg-2 ring-1 ring-line hover:text-fg",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((p) => (
            <ProductCard
              key={p.id}
              p={p}
              onClick={() => open({ productId: p.id, model: `${p.name} ${p.storage}`, carrier: p.carrier })}
            />
          ))}
        </div>

        <p className="mt-6 text-xs leading-relaxed text-fg-3">
          ※ 표기된 출고가·지원금은 통신사 정책에 따라 변동될 수 있으며, 실제 조건은 상담 시 확정됩니다. 지원금은 지정
          요금제 일정 기간 유지를 조건으로 하며, 기존 통신사 약정 잔여 시 위약금이 발생할 수 있습니다.
        </p>
      </div>
    </section>
  );
}
