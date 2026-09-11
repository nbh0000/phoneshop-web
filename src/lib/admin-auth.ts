import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "ps_admin";

function secret() {
  return process.env.ADMIN_PASSWORD || "";
}
export const adminConfigured = () => secret().length > 0;

export function tokenFor(password: string) {
  return createHmac("sha256", "phoneshop-admin").update(password).digest("hex");
}

export function verifyPassword(input: string) {
  const s = secret();
  if (!s) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(s);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function isAdminAuthed(): Promise<boolean> {
  if (!adminConfigured()) return false;
  const c = (await cookies()).get(ADMIN_COOKIE)?.value || "";
  const expected = tokenFor(secret());
  if (c.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(c), Buffer.from(expected));
}
