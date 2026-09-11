"use client";

import Image from "next/image";
import { asset } from "@/lib/asset";
import type { ProductsData } from "@/types";
import { won } from "@/lib/format";
import Link from "next/link";
import { Countdown } from "../Countdown";
import { Badge, CarrierChip } from "../ui/Badge";
import { Button } from "../ui/Button";
import { IconCheck, IconClock } from "../ui/Icons";
import { SectionTitle } from "../ui/SectionTitle";

export function Preorder({ data }: { data: ProductsData["preorder"] }) {
  return (
    <section id="hot" className="border-t border-line/60 bg-bg-2/40 py-14 sm:py-20">
      <div className="container-x">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionTitle eyebrow="Pre-order · Hot deal" title={data.title} desc={data.subtitle} />
          <div className="rounded-2xl border border-line bg-bg-2 p-4 sm:p-5">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-bold text-fg-2">
              <IconClock width={14} height={14} className="text-accent" />
              사전예약 마감까지
            </p>
            <Countdown deadline={data.deadline} />
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {data.items.map((p) => {
            const discount = p.releasePrice - p.salePrice;
            return (
              <article
                key={p.id}
                className="group relative overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-bg-2 to-bg-3 p-5 transition hover:border-accent-2/50 sm:p-6"
              >
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent-2/10 blur-2xl transition group-hover:bg-accent-2/20" />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge label={p.badge} />
                    <h3 className="mt-2 text-xl font-extrabold tracking-tight sm:text-2xl">
                      {p.name} <span className="text-base font-semibold text-fg-2">{p.storage}</span>
                    </h3>
                  </div>
                  {p.image && (
                    <Image
                      src={asset(p.image)}
                      alt={`${p.name} 제품 이미지`}
                      width={176}
                      height={176}
                      priority
                      className="relative -mr-2 -mt-2 h-36 w-36 shrink-0 object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.2)] sm:h-44 sm:w-44"
                    />
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="tabular text-3xl font-black text-accent sm:text-4xl">{won(p.salePrice)}원</span>
                  <span className="tabular strike text-sm text-fg-3">출고가 {won(p.releasePrice)}원</span>
                </div>
                <p className="tabular mt-1 text-sm font-semibold text-accent-2">총 {won(discount)}원 할인</p>

                <p className="mt-4 flex flex-wrap items-center gap-x-2 text-[13px] text-fg-2">
                  <CarrierChip carrier={p.carrier} />
                  <span className="text-line-2">|</span>
                  <span>{p.joinType}</span>
                  <span className="text-line-2">|</span>
                  <span>{p.discountType}</span>
                  <span className="text-line-2">|</span>
                  <span>{p.plan}</span>
                </p>

                <ul className="mt-4 space-y-1.5">
                  {p.benefits.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm text-fg">
                      <IconCheck width={16} height={16} className="text-accent-2" />
                      {b}
                    </li>
                  ))}
                </ul>

                <Link href={`/p/${p.id}`} className="mt-5 block">
                  <Button className="w-full" tabIndex={-1}>사전예약 조건 조회하기</Button>
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
