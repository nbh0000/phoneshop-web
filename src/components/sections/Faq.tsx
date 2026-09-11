"use client";

import { useState } from "react";
import type { Faq as FaqItem } from "@/types";
import { cn } from "../ui/Button";
import { IconChevron } from "../ui/Icons";
import { SectionTitle } from "../ui/SectionTitle";

export function Faq({ faqs }: { faqs: FaqItem[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  return (
    <section id="faq" className="border-t border-line/60 bg-bg-2/40 py-14 sm:py-20">
      <div className="container-x max-w-3xl">
        <SectionTitle eyebrow="FAQ" title="자주 묻는 질문" />
        <ul className="mt-8 divide-y divide-line rounded-2xl border border-line bg-bg-2">
          {faqs.map((f, i) => {
            const isOpen = openIdx === i;
            return (
              <li key={f.q}>
                <button
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[15px] font-bold hover:text-accent"
                  aria-expanded={isOpen}
                  aria-controls={`faq-${i}`}
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                >
                  <span className="flex items-start gap-3">
                    <span className="mt-0.5 text-accent">Q.</span>
                    {f.q}
                  </span>
                  <IconChevron className={cn("shrink-0 text-fg-3 transition-transform", isOpen && "rotate-180")} />
                </button>
                <div
                  id={`faq-${i}`}
                  className={cn("grid transition-[grid-template-rows] duration-200", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 pl-12 text-sm leading-relaxed text-fg-2">{f.a}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
