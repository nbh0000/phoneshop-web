import type { Review } from "@/types";
import { IconStar } from "../ui/Icons";
import { SectionTitle } from "../ui/SectionTitle";

function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`별점 ${n}점`}>
      {Array.from({ length: 5 }, (_, i) => (
        <IconStar key={i} width={14} height={14} className={i < n ? "text-accent" : "text-line-2"} />
      ))}
    </span>
  );
}

export function Reviews({ reviews, isSample }: { reviews: Review[]; isSample: boolean }) {
  return (
    <section id="reviews" className="border-y border-line/60 bg-bg-2/40 py-14 sm:py-20">
      <div className="container-x">
        <SectionTitle eyebrow="Reviews" title="먼저 개통한 고객님들의 후기" desc="실제 개통 고객의 후기만 게시합니다." />
        {isSample && process.env.NODE_ENV !== "production" && (
          <p className="mt-3 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-xs font-bold text-danger">
            ⚠ 개발용 예시 후기입니다. data/reviews.json 을 실제 후기로 교체하기 전 배포 금지. (이 경고는 개발 환경에서만 표시)
          </p>
        )}
      </div>

      {/* 가로 스크롤 캐러셀 (scroll-snap) */}
      <div className="no-scrollbar mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:px-6 lg:mx-auto lg:max-w-6xl">
        {reviews.map((r) => (
          <figure
            key={r.id}
            className="flex w-[82vw] max-w-[320px] shrink-0 snap-start flex-col rounded-2xl border border-line bg-bg-2 p-5 sm:w-[320px]"
          >
            <div className="flex items-center justify-between">
              <Stars n={r.rating} />
              <span className="text-xs text-fg-3">{r.date}</span>
            </div>
            <blockquote className="mt-3 flex-1 text-[14.5px] leading-relaxed text-fg">{r.text}</blockquote>
            <figcaption className="mt-4 flex items-center gap-2 text-xs text-fg-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-bg-3 font-bold text-fg">{r.name[0]}</span>
              <span className="font-semibold text-fg">{r.name}</span>
              <span className="text-fg-3">·</span>
              <span>{r.model}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
