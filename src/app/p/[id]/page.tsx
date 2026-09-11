import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FunnelProvider } from "@/components/FunnelContext";
import { Header } from "@/components/Header";
import { Floating } from "@/components/Floating";
import { Footer } from "@/components/sections/Footer";
import { ProductDetail } from "@/components/product/ProductDetail";
import { getAllProducts, getCompany, getPlans, getProductById, KAKAO_CHANNEL_URL } from "@/lib/data";
import { won } from "@/lib/format";

export const dynamic = "force-static";

export function generateStaticParams() {
  return getAllProducts().map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = getProductById(id);
  if (!p) return {};
  return {
    title: `${p.name} ${p.storage} 실구매가 ${won(p.salePrice)}원 | 조건 조회`,
    description: `${p.name} ${p.carrier} ${p.joinType} ${p.discountType} 기준 실구매가 ${won(p.salePrice)}원. 통신사·요금제·할부 조건을 직접 선택하고 월 납부금액을 확인하세요.`,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product || !product.pricing) notFound();
  const company = getCompany();
  const plans = getPlans();

  return (
    <FunnelProvider>
      <Header brand={company.brandName} brandEn={company.brandEn} kakaoUrl={KAKAO_CHANNEL_URL} />
      <main className="container-x py-6 sm:py-10">
        <ProductDetail product={product} plans={plans} kakaoUrl={KAKAO_CHANNEL_URL} />
      </main>
      <Footer company={company} />
      <Floating kakaoUrl={KAKAO_CHANNEL_URL} />
    </FunnelProvider>
  );
}
