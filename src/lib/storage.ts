/**
 * 신청 내역 저장소
 * - SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY 가 있으면 Supabase `inquiries` 테이블 사용
 * - 없으면 로컬 JSON 파일(data/inquiries.local.json)로 폴백 (개발용. Vercel 서버리스에서는
 *   파일 쓰기가 영속되지 않으므로 운영 시 반드시 Supabase 설정 필요)
 *
 * 개인정보 보호: 이 모듈은 절대 이름/생년월일/연락처를 console 에 남기지 않습니다.
 *
 * Supabase 테이블 스키마 (SQL):
 *   create table inquiries (
 *     id text primary key,
 *     created_at timestamptz not null default now(),
 *     name text not null,
 *     birth text not null,
 *     phone text not null,
 *     carrier text not null,
 *     model text,
 *     product_id text,
 *     auth_status text not null default 'pending',
 *     auth_tx_id text,
 *     memo text
 *   );
 */
import { promises as fs } from "fs";
import path from "path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Inquiry } from "@/types";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TABLE = "inquiries";
const LOCAL_FILE = path.join(process.cwd(), "data", "inquiries.local.json");

let supabase: SupabaseClient | null = null;
function sb(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  if (!supabase) supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
  return supabase;
}

export const storageMode = (): "supabase" | "local" => (sb() ? "supabase" : "local");

// ── Supabase row <-> Inquiry 매핑 ───────────────────────────────────────────
type Row = {
  id: string; created_at: string; name: string; birth: string; phone: string; carrier: string;
  model: string | null; product_id: string | null; auth_status: string; auth_tx_id: string | null; memo: string | null;
};
const toRow = (i: Inquiry): Row => ({
  id: i.id, created_at: i.createdAt, name: i.name, birth: i.birth, phone: i.phone, carrier: i.carrier,
  model: i.model || null, product_id: i.productId || null, auth_status: i.authStatus, auth_tx_id: i.authTxId || null, memo: i.memo || null,
});
const fromRow = (r: Row): Inquiry => ({
  id: r.id, createdAt: r.created_at, name: r.name, birth: r.birth, phone: r.phone, carrier: r.carrier as Inquiry["carrier"],
  model: r.model || "", productId: r.product_id || undefined, authStatus: r.auth_status as Inquiry["authStatus"],
  authTxId: r.auth_tx_id || undefined, memo: r.memo || undefined,
});

// ── 로컬 JSON 폴백 ──────────────────────────────────────────────────────────
async function readLocal(): Promise<Inquiry[]> {
  try {
    const raw = await fs.readFile(LOCAL_FILE, "utf8");
    return JSON.parse(raw) as Inquiry[];
  } catch {
    return [];
  }
}
async function writeLocal(list: Inquiry[]) {
  await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
  await fs.writeFile(LOCAL_FILE, JSON.stringify(list, null, 2), "utf8");
}

// ── Public API ──────────────────────────────────────────────────────────────
export async function saveInquiry(inquiry: Inquiry): Promise<void> {
  const client = sb();
  if (client) {
    const { error } = await client.from(TABLE).upsert(toRow(inquiry));
    if (error) throw new Error(`Supabase insert failed: ${error.code}`);
    return;
  }
  const list = await readLocal();
  const idx = list.findIndex((x) => x.id === inquiry.id);
  if (idx >= 0) list[idx] = inquiry;
  else list.unshift(inquiry);
  await writeLocal(list);
}

export async function updateInquiry(id: string, patch: Partial<Inquiry>): Promise<Inquiry | null> {
  const client = sb();
  if (client) {
    const { data, error } = await client.from(TABLE).select("*").eq("id", id).maybeSingle();
    if (error || !data) return null;
    const merged = { ...fromRow(data as Row), ...patch };
    const { error: e2 } = await client.from(TABLE).update(toRow(merged)).eq("id", id);
    if (e2) throw new Error(`Supabase update failed: ${e2.code}`);
    return merged;
  }
  const list = await readLocal();
  const idx = list.findIndex((x) => x.id === id);
  if (idx < 0) return null;
  list[idx] = { ...list[idx], ...patch };
  await writeLocal(list);
  return list[idx];
}

export async function listInquiries(): Promise<Inquiry[]> {
  const client = sb();
  if (client) {
    const { data, error } = await client.from(TABLE).select("*").order("created_at", { ascending: false }).limit(1000);
    if (error) throw new Error(`Supabase select failed: ${error.code}`);
    return (data as Row[]).map(fromRow);
  }
  const list = await readLocal();
  return list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
