import type { Carrier, DiscountType, JoinType, PartnerCard, Plan, PlansData, Product } from "@/types";

export interface Selection {
  storage: string;
  color: string;
  currentCarrier: Carrier | "알뜰폰";
  carrier: Carrier;
  plan: Plan;
  discountType: DiscountType;
  months: 0 | 24 | 30 | 36; // 0 = 일시불
  card: PartnerCard;
}

export interface Quote {
  releasePrice: number;
  joinType: JoinType;
  extra: number; // 제휴(추가) 할인
  official: number; // 공시지원금 (선택약정 시 0)
  selectContractTotal: number; // 선택약정 24개월 총 할인
  principal: number; // 할부원금
  deviceMonthly: number; // 월 할부금 (일시불이면 0)
  interestTotal: number;
  planMonthly: number; // 요금제 원가
  planDiscount: number; // 선택약정 월 할인
  cardDiscount: number;
  monthlyTotal: number; // 월 납부금액
  totalBenefit: number; // 총 혜택 금액
}

export function joinTypeOf(current: string, next: string): JoinType {
  return current === next ? "기기변경" : "번호이동";
}

export function quote(p: Product, plans: PlansData, s: Selection): Quote {
  const pricing = p.pricing!;
  const releasePrice = pricing.storages.find((x) => x.label === s.storage)?.releasePrice ?? p.releasePrice;
  const joinType = joinTypeOf(s.currentCarrier, s.carrier);
  const sup = pricing.support[s.carrier];
  const extra = Math.max(0, sup.extra + (plans.extraByJoinType[joinType] || 0));
  const officialFull = Math.round((sup.official * s.plan.supportRate) / 10000) * 10000;
  const official = s.discountType === "공시지원" ? officialFull : 0;
  const selectContractTotal = Math.round(s.plan.monthly * plans.selectContractRate) * 24;
  const principal = Math.max(0, releasePrice - extra - official);

  let deviceMonthly = 0;
  let interestTotal = 0;
  if (s.months > 0) {
    const r = plans.installmentRate / 12;
    deviceMonthly = Math.round((principal * r) / (1 - Math.pow(1 + r, -s.months)));
    interestTotal = deviceMonthly * s.months - principal;
  }
  const planDiscount = s.discountType === "선택약정" ? Math.round(s.plan.monthly * plans.selectContractRate) : 0;
  const cardDiscount = s.card.monthlyDiscount;
  const monthlyTotal = Math.max(0, deviceMonthly + s.plan.monthly - planDiscount - cardDiscount);
  const totalBenefit = extra + (s.discountType === "공시지원" ? official : selectContractTotal);

  return {
    releasePrice, joinType, extra, official, selectContractTotal, principal, deviceMonthly, interestTotal,
    planMonthly: s.plan.monthly, planDiscount, cardDiscount, monthlyTotal, totalBenefit,
  };
}

/** 공시지원 vs 선택약정 중 24개월 총액이 유리한 쪽 */
export function recommendDiscount(p: Product, plans: PlansData, s: Selection): DiscountType {
  const a = quote(p, plans, { ...s, discountType: "공시지원" });
  const b = quote(p, plans, { ...s, discountType: "선택약정" });
  return a.official >= b.selectContractTotal ? "공시지원" : "선택약정";
}
