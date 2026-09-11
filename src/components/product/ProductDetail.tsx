"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Carrier, DiscountType, PlansData, Product } from "@/types";
import { asset } from "@/lib/asset";
import { won } from "@/lib/format";
import { quote, recommendDiscount, type Selection } from "@/lib/pricing";
import { useFunnel } from "../FunnelContext";
import { Badge, CarrierChip } from "../ui/Badge";
import { Button, ButtonLink, cn } from "../ui/Button";
import { IconChevron, IconKakao } from "../ui/Icons";

const CARRIERS: Carrier[] = ["SKT", "KT", "LGU+"];
const CURRENT = [...CARRIERS, "알뜰폰"] as const;
const MONTHS = [0, 24, 30, 36] as const;

const carrierStyle: Record<string, string> = {
  SKT: "text-[#ff6a3d]",
  KT: "text-[#2f8fd8]",
  "LGU+": "text-[#e6007e]",
  알뜰폰: "text-fg-2",
};

function Row({ label, children, note }: { label: string; children: React.ReactNode; note?: React.ReactNode }) {
  return (
    <div className="grid gap-2 border-b border-line py-4 sm:grid-cols-[110px_1fr] sm:gap-4">
      <dt className="text-sm font-semibold text-fg-2 sm:pt-2.5">{label}</dt>
      <dd>
        {children}
        {note && <div className="mt-2 text-xs text-fg-3">{note}</div>}
      </dd>
    </div>
  );
}

const optBtn = (active: boolean, extra = "") =>
  cn(
    "h-11 min-w-[72px] rounded-lg border px-4 text-sm font-bold transition",
    active ? "border-accent bg-bg-2 text-fg ring-1 ring-accent" : "border-line bg-bg-3 text-fg-2 hover:border-line-2 hover:bg-bg-2",
    extra,
  );

export function ProductDetail({ product: p, plans, kakaoUrl }: { product: Product; plans: PlansData; kakaoUrl: string }) {
  const { open } = useFunnel();
  const pr = p.pricing!;
  const [sel, setSel] = useState<Selection>(() => ({
    storage: pr.storages[0].label,
    color: pr.colors[0].name,
    currentCarrier: p.joinType === "기기변경" ? p.carrier : CARRIERS.find((c) => c !== p.carrier) || "KT",
    carrier: p.carrier,
    plan: plans.carriers[p.carrier].plans[0],
    discountType: p.discountType,
    months: 24,
    card: plans.cards[0],
  }));
  const [planOpen, setPlanOpen] = useState(false);
  const [cardOpen, setCardOpen] = useState(false);

  const q = useMemo(() => quote(p, plans, sel), [p, plans, sel]);
  const recommended = useMemo(() => recommendDiscount(p, plans, sel), [p, plans, sel]);
  const altQuotes = useMemo(
    () => ({
      공시지원: quote(p, plans, { ...sel, discountType: "공시지원" }),
      선택약정: quote(p, plans, { ...sel, discountType: "선택약정" }),
    }),
    [p, plans, sel],
  );

  const setCarrier = (c: Carrier) => setSel((s) => ({ ...s, carrier: c, plan: plans.carriers[c].plans[0] }));

  const memo = [
    `${p.name} ${sel.storage} ${sel.color}`,
    `${sel.currentCarrier}→${sel.carrier} (${q.joinType})`,
    `${sel.plan.name} 월${won(sel.plan.monthly)}원`,
    sel.discountType,
    sel.months ? `할부 ${sel.months}개월` : "일시불",
    sel.card.monthlyDiscount ? sel.card.name : null,
    `월 납부 ${won(q.monthlyTotal)}원`,
  ]
    .filter(Boolean)
    .join(" / ");

  const apply = () => open({ productId: p.id, model: `${p.name} ${sel.storage}`, carrier: sel.currentCarrier, memo });

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_300px] lg:gap-10">
      {/* ── 좌측: 상품 + 옵션 ── */}
      <div>
        <nav className="mb-3 text-xs text-fg-3" aria-label="경로">
          <Link href="/" className="hover:text-accent">홈</Link>
          <span className="mx-1.5">/</span>
          <Link href={`/#${p.category}`} className="hover:text-accent">{p.category === "iphone" ? "iPhone" : "Galaxy"}</Link>
        </nav>
        <div className="flex flex-wrap items-center gap-2 border-b-2 border-fg pb-3">
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
            {p.name} <span className="text-accent">전국최저가</span> {sel.storage}
          </h1>
          <span className="rounded border border-line px-1.5 py-0.5 text-[11px] font-bold text-fg-2">5G</span>
          <Badge label={p.badge} />
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-[260px_1fr]">
          {/* 이미지 */}
          <div className="flex items-start justify-center">
            {p.image && (
              <Image
                src={asset(p.image)}
                alt={`${p.name} 제품 이미지`}
                width={320}
                height={320}
                priority
                className="h-56 w-auto object-contain drop-shadow-[0_16px_28px_rgba(0,0,0,0.18)] md:h-64"
              />
            )}
          </div>

          {/* 옵션 */}
          <dl>
            <Row label="용량">
              <div className="flex flex-wrap gap-2">
                {pr.storages.map((s) => (
                  <button key={s.label} className={optBtn(sel.storage === s.label)} onClick={() => setSel({ ...sel, storage: s.label })}>
                    {s.label}
                  </button>
                ))}
              </div>
            </Row>
            <Row label="색상" note={sel.color}>
              <div className="flex flex-wrap gap-2">
                {pr.colors.map((c) => (
                  <button
                    key={c.name}
                    aria-label={c.name}
                    aria-pressed={sel.color === c.name}
                    onClick={() => setSel({ ...sel, color: c.name })}
                    className={cn(
                      "h-10 w-10 rounded-md border-2 transition",
                      sel.color === c.name ? "border-accent ring-2 ring-accent/30" : "border-line hover:border-line-2",
                    )}
                    style={{ background: c.hex }}
                  />
                ))}
              </div>
            </Row>
            <Row label="사용중인 통신사">
              <div className="flex flex-wrap gap-2">
                {CURRENT.map((c) => (
                  <button key={c} className={optBtn(sel.currentCarrier === c, carrierStyle[c])} onClick={() => setSel({ ...sel, currentCarrier: c })}>
                    {c}
                  </button>
                ))}
              </div>
            </Row>
            <Row
              label="사용하실 통신사"
              note={
                <span>
                  <b className="rounded bg-fg px-1.5 py-0.5 text-[10px] text-white">{q.joinType}</b>{" "}
                  {q.joinType === "번호이동"
                    ? `쓰던 번호 그대로 ${sel.carrier}로 통신사만 바꿀래요`
                    : `${sel.carrier} 번호 그대로 기기만 바꿀래요`}
                </span>
              }
            >
              <div className="flex flex-wrap gap-2">
                {CARRIERS.map((c) => (
                  <button key={c} className={optBtn(sel.carrier === c, carrierStyle[c])} onClick={() => setCarrier(c)}>
                    {c}
                  </button>
                ))}
              </div>
            </Row>
            <Row label="요금제" note={sel.plan.desc}>
              <div className="relative">
                <button
                  className="flex h-12 w-full items-center justify-between rounded-lg border border-line bg-bg-2 px-4 text-left text-sm"
                  onClick={() => setPlanOpen((v) => !v)}
                  aria-expanded={planOpen}
                >
                  <span>
                    <b>{sel.plan.name}</b> <span className="text-fg-3">| 월 {won(sel.plan.monthly)}원</span>
                  </span>
                  <IconChevron className={cn("text-fg-3 transition", planOpen && "rotate-180")} />
                </button>
                {planOpen && (
                  <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-line bg-bg-2 shadow-lg" role="listbox">
                    {plans.carriers[sel.carrier].plans.map((pl) => (
                      <li key={pl.name}>
                        <button
                          role="option"
                          aria-selected={pl.name === sel.plan.name}
                          className={cn("flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-bg-3", pl.name === sel.plan.name && "bg-bg-3 font-bold")}
                          onClick={() => {
                            setSel({ ...sel, plan: pl });
                            setPlanOpen(false);
                          }}
                        >
                          <span>{pl.name}</span>
                          <span className="text-fg-2">월 {won(pl.monthly)}원</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Row>
            <Row
              label="할인방법"
              note={
                <span>
                  <b className="rounded bg-fg px-1.5 py-0.5 text-[10px] text-white">{sel.discountType === "공시지원" ? "단말기 할인" : "요금 할인"}</b>{" "}
                  {sel.discountType === "공시지원" ? "개통 당시 1회 단말기 구매 비용 할인" : "24개월간 매월 통신요금 25% 할인"}
                </span>
              }
            >
              <div className="flex flex-wrap gap-2">
                {(["공시지원", "선택약정"] as DiscountType[]).map((d) => (
                  <button
                    key={d}
                    className={cn(optBtn(sel.discountType === d), "relative h-auto flex-col items-start py-2 leading-tight")}
                    onClick={() => setSel({ ...sel, discountType: d })}
                  >
                    {recommended === d && (
                      <span className="absolute -right-2 -top-2 rounded-full bg-accent-2 px-1.5 py-0.5 text-[10px] font-black text-white">추천</span>
                    )}
                    <span className="block">{d === "공시지원" ? "공시지원금" : "선택약정할인"}</span>
                    <span className="block text-xs font-semibold text-fg-2">
                      총 {won(d === "공시지원" ? altQuotes.공시지원.official : altQuotes.선택약정.selectContractTotal)}원
                    </span>
                  </button>
                ))}
              </div>
            </Row>
            <Row label="구매방법">
              <div className="flex flex-wrap gap-2">
                {MONTHS.map((m) => (
                  <button key={m} className={cn(optBtn(sel.months === m), "relative")} onClick={() => setSel({ ...sel, months: m })}>
                    {m === 24 && <span className="absolute -right-2 -top-2 rounded-full bg-accent-2 px-1.5 py-0.5 text-[10px] font-black text-white">인기</span>}
                    {m === 0 ? "일시불" : `${m}개월`}
                  </button>
                ))}
              </div>
            </Row>
            <Row label="제휴카드" note={sel.card.condition}>
              <div className="relative">
                <button
                  className="flex h-12 w-full items-center justify-between rounded-lg border border-line bg-bg-2 px-4 text-left text-sm"
                  onClick={() => setCardOpen((v) => !v)}
                  aria-expanded={cardOpen}
                >
                  <span className={sel.card.monthlyDiscount ? "font-bold" : "text-fg-3"}>{sel.card.name}</span>
                  <IconChevron className={cn("text-fg-3 transition", cardOpen && "rotate-180")} />
                </button>
                {cardOpen && (
                  <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-line bg-bg-2 shadow-lg" role="listbox">
                    {plans.cards.map((c) => (
                      <li key={c.name}>
                        <button
                          role="option"
                          aria-selected={c.name === sel.card.name}
                          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-bg-3"
                          onClick={() => {
                            setSel({ ...sel, card: c });
                            setCardOpen(false);
                          }}
                        >
                          <span>{c.name}</span>
                          {c.monthlyDiscount > 0 && <span className="text-accent">-{won(c.monthlyDiscount)}원/월</span>}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Row>
          </dl>
        </div>

        <div className="mt-6 rounded-lg bg-bg-3 px-4 py-3 text-sm font-semibold text-fg-2">
          개통 후 {sel.discountType === "공시지원" ? "185일" : "93일"}간은 반드시 회선(요금제)을 유지해 주셔야 합니다.
          <span className="mt-1 block text-xs font-normal text-fg-3">
            기간 내 회선 해지·타 통신사 재이동·일시정지 시 약정 위약금이 부과되고 단말기 할부금이 청구됩니다. 지원금은 통신사 정책에 따라 변동될 수 있습니다.
          </span>
        </div>
      </div>

      {/* ── 우측: 견적 요약 ── */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="overflow-hidden rounded-xl border border-line bg-bg-2 shadow-sm">
          <div className="flex items-center justify-between bg-accent px-4 py-3 text-white">
            <span className="flex items-center gap-2 text-sm font-bold">
              <Tag>A</Tag> {sel.months ? `월 할부금 (${sel.months}개월)` : "단말기 일시불"}
            </span>
            <span className="tabular text-lg font-black">{won(sel.months ? q.deviceMonthly : q.principal)}원</span>
          </div>
          <dl className="tabular divide-y divide-line text-sm">
            <Line k="출고가" v={`${won(q.releasePrice)}원`} />
            <Line k="제휴할인 (추가지원금)" v={`-${won(q.extra)}원`} accent />
            {sel.discountType === "공시지원" ? (
              <Line k="공시지원금" v={`-${won(q.official)}원`} accent />
            ) : (
              <Line k="선택약정 (요금 25% 할인)" v="적용" accent />
            )}
            <Line k="할부원금" v={<mark className="bg-[#fff3a8] px-1 font-black">{won(q.principal)}원</mark>} bold />
          </dl>

          <div className="flex items-center justify-between bg-accent-2 px-4 py-3 text-white">
            <span className="flex items-center gap-2 text-sm font-bold">
              <Tag>B</Tag> 월 통신요금
            </span>
            <span className="tabular text-lg font-black">{won(q.planMonthly - q.planDiscount - q.cardDiscount)}원</span>
          </div>
          <dl className="tabular divide-y divide-line text-sm">
            <Line k={sel.plan.name} v={`${won(q.planMonthly)}원`} />
            {q.planDiscount > 0 && <Line k="선택약정 할인" v={`-${won(q.planDiscount)}원`} accent />}
            {q.cardDiscount > 0 && <Line k="제휴카드 할인" v={`-${won(q.cardDiscount)}원`} accent />}
          </dl>

          <div className="m-3 rounded-lg border-2 border-accent-2 bg-accent-2 p-4 text-white">
            <p className="flex items-center gap-1.5 text-sm font-bold">
              <Tag>A</Tag>+<Tag>B</Tag> 월 납부금액
            </p>
            <p className="tabular mt-2 text-right text-3xl font-black">
              {won(q.monthlyTotal)}<span className="text-base font-bold">원</span>
            </p>
          </div>
          <p className="px-4 pb-3 text-center text-[11px] leading-relaxed text-fg-3">
            ※ 부가세(VAT) 포함 금액
            {sel.months > 0 && ` · 할부이자 연 ${(plans.installmentRate * 100).toFixed(1)}% 기준 총 ${won(q.interestTotal)}원 포함`}
          </p>
          <p className="border-t border-line px-4 py-3 text-center text-xs leading-relaxed text-fg-2">
            {p.name}을(를) <CarrierChip carrier={sel.carrier} /> {q.joinType}으로 총{" "}
            <b className="text-accent">{won(q.totalBenefit)}원</b>의 할인 혜택을 받아 구매하실 수 있습니다.
          </p>
        </div>

        <Button size="lg" className="mt-3 w-full rounded-lg bg-fg text-white hover:bg-fg/90" onClick={apply}>
          온라인 신청하기
        </Button>
        <ButtonLink variant="kakao" size="lg" href={kakaoUrl} target="_blank" rel="noopener noreferrer" className="mt-2 w-full rounded-lg">
          <IconKakao />
          카카오톡 상담
        </ButtonLink>
      </aside>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-[11px] font-black text-accent">{children}</span>;
}

function Line({ k, v, accent, bold }: { k: string; v: React.ReactNode; accent?: boolean; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <dt className={cn("text-fg-2", accent && "text-accent", bold && "font-bold text-fg")}>{k}</dt>
      <dd className={cn("font-semibold", accent && "text-accent", bold && "font-black")}>{v}</dd>
    </div>
  );
}
