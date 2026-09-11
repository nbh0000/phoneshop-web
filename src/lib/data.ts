import productsJson from "../../data/products.json";
import reviewsJson from "../../data/reviews.json";
import companyJson from "../../data/company.json";
import faqJson from "../../data/faq.json";
import bannersJson from "../../data/banners.json";
import plansJson from "../../data/plans.json";
import type { BannerSlide, Company, Faq, PlansData, Product, ProductsData, Review } from "@/types";

export function getProductsData(): ProductsData {
  return productsJson as unknown as ProductsData;
}

export function getPlans(): PlansData {
  return plansJson as unknown as PlansData;
}

/** 특가 상품 + 사전예약 상품을 id 로 조회 */
export function getAllProducts(): Product[] {
  const { products, preorder } = getProductsData();
  const pre = preorder.items.map((p) => ({ ...p, discounts: { official: 0, extra: 0 } })) as Product[];
  return [...products, ...pre];
}
export function getProductById(id: string): Product | undefined {
  return getAllProducts().find((p) => p.id === id);
}

export function getReviews(): { reviews: Review[]; isSample: boolean } {
  return { reviews: reviewsJson.reviews as Review[], isSample: !!reviewsJson._isSampleData };
}

export function getBanners(): { slides: BannerSlide[]; intervalMs: number } {
  return { slides: bannersJson.slides as BannerSlide[], intervalMs: bannersJson.intervalMs };
}

export function getFaqs(): Faq[] {
  return faqJson.faqs;
}

/** 환경변수 NEXT_PUBLIC_COMPANY_* 가 있으면 우선, 없으면 data/company.json */
export function getCompany(): Company {
  const j = companyJson;
  const e = process.env;
  return {
    brandName: e.NEXT_PUBLIC_COMPANY_BRAND || j.brandName,
    brandEn: e.NEXT_PUBLIC_COMPANY_BRAND_EN || j.brandEn,
    companyName: e.NEXT_PUBLIC_COMPANY_NAME || j.companyName,
    ceo: e.NEXT_PUBLIC_COMPANY_CEO || j.ceo,
    businessNumber: e.NEXT_PUBLIC_COMPANY_BIZ_NO || j.businessNumber,
    address: e.NEXT_PUBLIC_COMPANY_ADDRESS || j.address,
    mailOrderNumber: e.NEXT_PUBLIC_COMPANY_MAIL_ORDER_NO || j.mailOrderNumber,
    privacyOfficer: e.NEXT_PUBLIC_COMPANY_PRIVACY_OFFICER || j.privacyOfficer,
    email: e.NEXT_PUBLIC_COMPANY_EMAIL || j.email,
    phone: e.NEXT_PUBLIC_COMPANY_PHONE || j.phone,
    hours: e.NEXT_PUBLIC_COMPANY_HOURS || j.hours,
  };
}

export const KAKAO_CHANNEL_URL =
  process.env.NEXT_PUBLIC_KAKAO_CHANNEL_URL || "https://pf.kakao.com/";
