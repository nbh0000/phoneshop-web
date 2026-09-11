export const dynamic = "force-static";
import { ImageResponse } from "next/og";
import { getCompany } from "@/lib/data";

export const alt = "휴대폰 다이렉트 특가";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  const company = getCompany();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "linear-gradient(135deg, #ffffff 0%, #f4f5f8 60%, #eceef3 100%)",
          color: "#111827",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 30, color: "#ff2d55", fontWeight: 700, marginBottom: 20 }}>{company.brandName}</div>
        <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.15 }}>출고가 거품 뺀</div>
        <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.15, color: "#ff2d55" }}>다이렉트 특가</div>
        <div style={{ fontSize: 30, color: "#4b5563", marginTop: 30 }}>갤럭시 · 아이폰 · 카카오 간편인증으로 1분 조회</div>
      </div>
    ),
    size,
  );
}
