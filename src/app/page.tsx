import { FunnelProvider } from "@/components/FunnelContext";
import { Header } from "@/components/Header";
import { Floating } from "@/components/Floating";
import { Hero } from "@/components/sections/Hero";
import { Preorder } from "@/components/sections/Preorder";
import { Products } from "@/components/sections/Products";
import { Reviews } from "@/components/sections/Reviews";
import { Faq } from "@/components/sections/Faq";
import { Footer } from "@/components/sections/Footer";
import { getBanners, getCompany, getFaqs, getProductsData, getReviews, KAKAO_CHANNEL_URL } from "@/lib/data";

export default function Home() {
  const company = getCompany();
  const { preorder, products } = getProductsData();
  const { reviews, isSample } = getReviews();
  const faqs = getFaqs();
  const banners = getBanners();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: company.brandName,
    telephone: company.phone,
    address: company.address,
    openingHours: company.hours,
  };

  return (
    <FunnelProvider>
      <Header brand={company.brandName} brandEn={company.brandEn} kakaoUrl={KAKAO_CHANNEL_URL} />
      <main>
        <Hero slides={banners.slides} intervalMs={banners.intervalMs} />
        <Preorder data={preorder} />
        <Products products={products} />
        <Reviews reviews={reviews} isSample={isSample} />
        <Faq faqs={faqs} />
      </main>
      <Footer company={company} />
      <Floating kakaoUrl={KAKAO_CHANNEL_URL} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </FunnelProvider>
  );
}
