/** 정적 배포(basePath) 시 public 경로 보정 */
export const asset = (src: string) => `${process.env.NEXT_PUBLIC_BASE_PATH || ""}${src}`;
export const IS_STATIC_DEMO = process.env.NEXT_PUBLIC_STATIC_DEMO === "1";
