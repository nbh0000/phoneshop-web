/** 외부 이미지 없이 CSS 로만 그린 휴대폰 목업 */
export function PhoneMockup({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`} aria-hidden>
      {/* 글로우 */}
      <div className="absolute inset-0 -z-10 rounded-full bg-accent/20 blur-3xl" />
      <div className="animate-float relative mx-auto h-[420px] w-[205px] rounded-[38px] border border-white/10 bg-gradient-to-b from-[#2a3653] to-[#0f1526] p-2 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]">
        {/* 사이드 버튼 */}
        <div className="absolute -left-[3px] top-24 h-10 w-[3px] rounded-l bg-white/20" />
        <div className="absolute -left-[3px] top-36 h-14 w-[3px] rounded-l bg-white/20" />
        <div className="absolute -right-[3px] top-32 h-16 w-[3px] rounded-r bg-white/20" />
        {/* 스크린 */}
        <div className="relative h-full w-full overflow-hidden rounded-[30px] bg-gradient-to-br from-[#0d1a2b] via-[#101a3a] to-[#062126]">
          {/* 펀치홀 */}
          <div className="absolute left-1/2 top-3 h-3 w-3 -translate-x-1/2 rounded-full bg-black ring-1 ring-white/10" />
          {/* 스크린 UI */}
          <div className="absolute inset-x-4 top-12 space-y-3">
            <div className="h-2 w-16 rounded bg-white/20" />
            <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
              <div className="mb-2 h-2 w-20 rounded bg-white/25" />
              <div className="mb-1 h-2 w-12 rounded bg-white/15" />
              <div className="h-5 w-24 rounded bg-accent/90" />
              <div className="mt-2 flex gap-1">
                <div className="h-2 w-8 rounded bg-white/15" />
                <div className="h-2 w-8 rounded bg-white/15" />
                <div className="h-2 w-8 rounded bg-white/15" />
              </div>
            </div>
            <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
              <div className="mb-2 h-2 w-16 rounded bg-white/25" />
              <div className="h-5 w-20 rounded bg-accent-2/80" />
            </div>
            <div className="mt-6 h-10 rounded-xl bg-accent shadow-glow" />
          </div>
          {/* 반사광 */}
          <div className="pointer-events-none absolute -left-10 top-0 h-full w-24 rotate-12 bg-gradient-to-r from-white/10 to-transparent" />
        </div>
      </div>
    </div>
  );
}
