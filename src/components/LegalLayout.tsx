import Link from "next/link";
import type { ReactNode } from "react";

export function LegalLayout({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <main className="min-h-dvh bg-bg">
      <div className="container-x max-w-3xl py-10 sm:py-16">
        <Link href="/" className="text-sm text-fg-2 hover:text-accent">← 홈으로</Link>
        <h1 className="mt-4 text-2xl font-extrabold sm:text-3xl">{title}</h1>
        <p className="mt-1 text-xs text-fg-3">시행일: {updated}</p>
        <article className="prose-legal mt-8 space-y-6 text-[14.5px] leading-relaxed text-fg-2 [&_h2]:mt-8 [&_h2]:text-base [&_h2]:font-extrabold [&_h2]:text-fg [&_li]:ml-5 [&_li]:list-disc [&_table]:w-full [&_table]:text-sm [&_td]:border [&_td]:border-line [&_td]:p-2 [&_th]:border [&_th]:border-line [&_th]:bg-bg-3 [&_th]:p-2 [&_th]:text-left">
          {children}
        </article>
      </div>
    </main>
  );
}
