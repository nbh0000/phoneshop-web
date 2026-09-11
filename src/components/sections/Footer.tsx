import Link from "next/link";
import type { Company } from "@/types";

export function Footer({ company }: { company: Company }) {
  const rows: [string, string][] = [
    ["회사명", company.companyName],
    ["대표", company.ceo],
    ["사업자등록번호", company.businessNumber],
    ["통신판매업신고", company.mailOrderNumber],
    ["주소", company.address],
    ["개인정보관리책임자", company.privacyOfficer],
    ["이메일", company.email],
  ];
  return (
    <footer className="border-t border-line bg-bg pb-28 pt-12 text-[13px] text-fg-2 md:pb-12">
      <div className="container-x">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div>
            <p className="text-lg font-extrabold text-fg">{company.brandName}</p>
            <p className="mt-3 text-sm">
              고객센터 <a href={`tel:${company.phone}`} className="text-xl font-black text-accent">{company.phone}</a>
            </p>
            <p className="mt-1 text-fg-3">{company.hours}</p>
            <nav className="mt-5 flex gap-4 text-sm font-semibold text-fg" aria-label="약관">
              <Link href="/terms" className="hover:text-accent">이용약관</Link>
              <Link href="/privacy" className="font-extrabold hover:text-accent">개인정보처리방침</Link>
            </nav>
          </div>
          <dl className="grid max-w-xl grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
            {rows.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-fg-3">{k}</dt>
                <dd className="break-all">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <p className="mt-8 border-t border-line pt-6 text-xs leading-relaxed text-fg-3">
          본 사이트에 표기된 출고가·공시지원금·추가지원금은 통신사 및 제조사 정책에 따라 사전 고지 없이 변동될 수
          있습니다. 최종 가입 조건은 상담 후 확정되며, 지원금은 지정 요금제 유지 등 조건이 부과될 수 있습니다.
          <br />© {new Date().getFullYear()} {company.companyName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
