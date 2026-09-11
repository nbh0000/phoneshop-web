export type Category = "galaxy" | "iphone";
export type Carrier = "SKT" | "KT" | "LGU+";
export type JoinType = "번호이동" | "기기변경" | "신규가입";
export type DiscountType = "공시지원" | "선택약정";

export interface Product {
  id: string;
  name: string;
  storage: string;
  category: Category;
  badge: string;
  image?: string; // public/ 기준 경로
  releasePrice: number;
  salePrice: number;
  carrier: Carrier;
  joinType: JoinType;
  discountType: DiscountType;
  plan: string;
  discounts: {
    official: number; // 공시지원금
    extra: number; // 추가지원금
    selectContract?: number; // 선택약정 24개월 총 할인액
  };
}

export interface PreorderItem extends Omit<Product, "discounts"> {
  benefits: string[];
}

export interface ProductsData {
  preorder: {
    deadline: string;
    title: string;
    subtitle: string;
    items: PreorderItem[];
  };
  products: Product[];
}

export interface Review {
  id: number;
  name: string;
  rating: number;
  model: string;
  text: string;
  date: string;
}

export interface Company {
  brandName: string;
  brandEn: string;
  companyName: string;
  ceo: string;
  businessNumber: string;
  address: string;
  mailOrderNumber: string;
  privacyOfficer: string;
  email: string;
  phone: string;
  hours: string;
}

export interface Faq {
  q: string;
  a: string;
}

export type AuthStatus = "pending" | "success" | "failed" | "expired";

export interface Inquiry {
  id: string;
  createdAt: string;
  name: string;
  birth: string; // YYYYMMDD
  phone: string;
  carrier: Carrier | "알뜰폰";
  model: string; // 희망 기종 (선택)
  productId?: string;
  authStatus: AuthStatus;
  authTxId?: string;
  memo?: string;
}

/** 클라이언트에서 퍼널에 미리 채워 넣을 상품 정보 */
export interface FunnelPreset {
  productId?: string;
  model?: string;
  carrier?: Carrier;
}

export interface BannerBenefit {
  label: string;
  title: string;
  desc: string;
}
export interface BannerSlide {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  images: string[];
  accent: string;
  benefits: BannerBenefit[];
  ctaLabel: string;
  ctaPreset?: FunnelPreset;
}
