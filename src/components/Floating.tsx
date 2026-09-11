"use client";

import { useFunnel } from "./FunnelContext";
import { Button, ButtonLink } from "./ui/Button";
import { IconKakao, IconSearch } from "./ui/Icons";

/** PC: 우하단 플로팅 버튼 / 모바일: 하단 고정 바 */
export function Floating({ kakaoUrl }: { kakaoUrl: string }) {
  const { open } = useFunnel();
  return (
    <>
      {/* 모바일 하단 고정 바 */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
        <div className="grid grid-cols-[1fr_1.4fr] gap-2">
          <ButtonLink variant="kakao" size="lg" href={kakaoUrl} target="_blank" rel="noopener noreferrer" className="h-12 rounded-xl text-[15px]">
            <IconKakao width={18} height={18} />
            카톡 상담
          </ButtonLink>
          <Button size="lg" className="h-12 rounded-xl text-[15px]" onClick={() => open()}>
            <IconSearch width={18} height={18} />
            내 조건 조회하기
          </Button>
        </div>
      </div>

      {/* PC 우하단 플로팅 */}
      <div className="fixed bottom-6 right-6 z-30 hidden flex-col gap-2 md:flex">
        <ButtonLink
          variant="kakao"
          href={kakaoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="h-12 rounded-full px-5 shadow-lg"
        >
          <IconKakao width={18} height={18} />
          카카오톡 상담
        </ButtonLink>
        <Button className="h-12 rounded-full px-5" onClick={() => open()}>
          <IconSearch width={18} height={18} />
          조회하기
        </Button>
      </div>
    </>
  );
}
