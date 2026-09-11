"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import type { FunnelPreset } from "@/types";
import { formatPhone } from "@/lib/format";
import { IS_STATIC_DEMO } from "@/lib/asset";
import { Button, ButtonLink, cn } from "../ui/Button";
import { IconCheck, IconClose, IconKakao } from "../ui/Icons";

type Step = 1 | 2 | 3;
const CARRIERS = ["SKT", "KT", "LGU+", "알뜰폰"] as const;
const KAKAO_URL = process.env.NEXT_PUBLIC_KAKAO_CHANNEL_URL || "https://pf.kakao.com/";

const POLL_MS = 1500;
const TIMEOUT_MS = 5 * 60 * 1000;

export function FunnelModal({ preset, onClose }: { preset: FunnelPreset; onClose: () => void }) {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState({
    name: "",
    birth: "",
    phone: "",
    carrier: (preset.carrier as string) || "",
    model: preset.model || "",
    agreed: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<{ inquiryId: string; txId: string; provider: string; message?: string } | null>(null);
  const [authState, setAuthState] = useState<"pending" | "failed" | "expired">("pending");
  const [elapsed, setElapsed] = useState(0);
  const firstInput = useRef<HTMLInputElement>(null);

  // 바디 스크롤 잠금 + ESC 닫기 + 첫 입력 포커스
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    firstInput.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // Step 2: 인증 상태 폴링
  useEffect(() => {
    if (step !== 2 || !session) return;
    const started = Date.now();
    let stopped = false;
    const tick = async () => {
      if (stopped) return;
      setElapsed(Math.floor((Date.now() - started) / 1000));
      if (Date.now() - started > TIMEOUT_MS) {
        setAuthState("expired");
        return;
      }
      if (IS_STATIC_DEMO) {
        if (Date.now() - started >= 5000) {
          setStep(3);
          return;
        }
        if (!stopped) setTimeout(tick, POLL_MS);
        return;
      }
      try {
        const r = await fetch(`/api/auth/status?txId=${encodeURIComponent(session.txId)}&inquiryId=${encodeURIComponent(session.inquiryId)}`, {
          cache: "no-store",
        });
        const j = await r.json();
        if (j.status === "success") {
          setStep(3);
          return;
        }
        if (j.status === "failed" || j.status === "expired") {
          setAuthState(j.status);
          return;
        }
      } catch {
        /* 네트워크 오류 시 다음 폴링에서 재시도 */
      }
      if (!stopped) setTimeout(tick, POLL_MS);
    };
    const id = setTimeout(tick, POLL_MS);
    return () => {
      stopped = true;
      clearTimeout(id);
    };
  }, [step, session]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.agreed) return setError("개인정보 수집·이용에 동의해 주세요.");
    if (form.name.trim().length < 2) return setError("이름을 입력해 주세요.");
    if (!/^\d{8}$/.test(form.birth)) return setError("생년월일 8자리(예: 19900101)를 입력해 주세요.");
    if (!/^01\d{8,9}$/.test(form.phone.replace(/\D/g, ""))) return setError("휴대폰 번호를 확인해 주세요.");
    if (!form.carrier) return setError("현재 사용 중인 통신사를 선택해 주세요.");

    setLoading(true);
    if (IS_STATIC_DEMO) {
      // GitHub Pages 정적 데모: 서버 없이 클라이언트에서 인증 흐름만 시연
      setSession({ inquiryId: "demo", txId: `demo_${Date.now()}`, provider: "mock" });
      setAuthState("pending");
      setStep(2);
      setLoading(false);
      return;
    }
    try {
      const r = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, phone: form.phone.replace(/\D/g, ""), productId: preset.productId }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "요청에 실패했습니다.");
      setSession(j);
      setAuthState("pending");
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "요청에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const retry = () => {
    setSession(null);
    setAuthState("pending");
    setStep(1);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="funnel-title"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex h-[100dvh] w-full flex-col bg-bg-2 sm:h-auto sm:max-h-[90vh] sm:max-w-md sm:rounded-2xl sm:border sm:border-line">
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 id="funnel-title" className="text-lg font-extrabold">
              {step === 1 && "내 조건 조회하기"}
              {step === 2 && "카카오 간편인증"}
              {step === 3 && "접수 완료"}
            </h2>
            <Stepper step={step} />
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg text-fg-2 hover:bg-bg-3 hover:text-fg" aria-label="닫기">
            <IconClose />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {step === 1 && (
            <form onSubmit={submit} className="space-y-4" noValidate>
              {preset.model && (
                <div className="rounded-xl border border-accent/30 bg-accent/10 px-3 py-2 text-sm">
                  <span className="text-fg-2">선택 상품 </span>
                  <span className="font-bold text-accent">{preset.model}</span>
                </div>
              )}
              <Field label="이름" required>
                <input
                  ref={firstInput}
                  className={inputCls}
                  placeholder="홍길동"
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </Field>
              <Field label="생년월일" required hint="8자리 숫자">
                <input
                  className={inputCls}
                  placeholder="19900101"
                  inputMode="numeric"
                  autoComplete="bday"
                  maxLength={8}
                  value={form.birth}
                  onChange={(e) => setForm({ ...form, birth: e.target.value.replace(/\D/g, "").slice(0, 8) })}
                />
              </Field>
              <Field label="휴대폰 번호" required>
                <input
                  className={inputCls}
                  placeholder="010-0000-0000"
                  inputMode="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })}
                />
              </Field>
              <Field label="현재 통신사" required as="div">
                <div className="grid grid-cols-4 gap-2" role="radiogroup">
                  {CARRIERS.map((c) => (
                    <button
                      type="button"
                      key={c}
                      role="radio"
                      aria-checked={form.carrier === c}
                      onClick={() => setForm({ ...form, carrier: c })}
                      className={cn(
                        "h-11 rounded-xl text-sm font-bold ring-1 transition",
                        form.carrier === c ? "bg-accent text-white ring-accent" : "bg-bg text-fg-2 ring-line hover:text-fg",
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="원하는 기종" hint="선택">
                <input
                  className={inputCls}
                  placeholder="예: 갤럭시 S26 울트라 / 아이폰 17 Pro"
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                />
              </Field>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-bg p-3 text-[13px] leading-snug">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 accent-accent"
                  checked={form.agreed}
                  onChange={(e) => setForm({ ...form, agreed: e.target.checked })}
                />
                <span>
                  <span className="font-bold text-fg">[필수]</span> 개인정보 수집·이용에 동의합니다.
                  <span className="mt-1 block text-fg-3">
                    수집 항목: 이름, 생년월일, 휴대폰번호, 통신사 · 목적: 가입 조건 조회 및 상담 · 보유기간: 상담 완료 후 1년
                    (관계 법령에 따른 보관 제외).{" "}
                    <Link href="/privacy" target="_blank" className="underline hover:text-fg">
                      전문 보기
                    </Link>
                  </span>
                </span>
              </label>

              {error && (
                <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm font-semibold text-danger" role="alert">
                  {error}
                </p>
              )}

              <Button type="submit" size="lg" className="w-full" disabled={loading || !form.agreed}>
                {loading ? "요청 중..." : "카카오 인증 요청하기"}
              </Button>
              <p className="text-center text-[11px] text-fg-3">인증은 본인확인 중개사를 통해 안전하게 처리됩니다.</p>
            </form>
          )}

          {step === 2 && session && (
            <div className="flex flex-col items-center py-6 text-center">
              {authState === "pending" ? (
                <>
                  <div className="relative grid h-20 w-20 place-items-center">
                    <span className="animate-pulse-ring absolute inset-0 rounded-full bg-kakao/40" />
                    <span className="relative grid h-16 w-16 place-items-center rounded-full bg-kakao text-kakao-fg">
                      <IconKakao width={32} height={32} />
                    </span>
                  </div>
                  <h3 className="mt-6 text-xl font-extrabold">카카오톡으로 인증 요청을 보냈습니다</h3>
                  <p className="mt-2 text-sm leading-relaxed text-fg-2">
                    <b className="text-fg">{formatPhone(form.phone)}</b> 휴대폰의 카카오톡을 열어
                    <br />
                    인증 요청을 승인해 주세요. 완료되면 자동으로 다음 단계로 넘어갑니다.
                  </p>
                  <p className="mt-6 flex items-center gap-2 text-xs text-fg-3">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
                    인증 대기 중 · {elapsed}초
                  </p>
                  {session.provider === "mock" && (
                    <p className="mt-4 rounded-lg border border-accent-2/30 bg-accent-2/10 px-3 py-2 text-xs text-accent-2">
                      시연 모드(MOCK): 실제 카카오톡 알림은 발송되지 않으며 약 5초 후 자동 인증됩니다.
                    </p>
                  )}
                </>
              ) : (
                <>
                  <span className="grid h-16 w-16 place-items-center rounded-full bg-danger/15 text-danger">
                    <IconClose width={32} height={32} />
                  </span>
                  <h3 className="mt-6 text-xl font-extrabold">
                    {authState === "expired" ? "인증 시간이 초과되었습니다" : "인증에 실패했습니다"}
                  </h3>
                  <p className="mt-2 text-sm text-fg-2">입력 정보를 확인한 뒤 다시 시도해 주세요.</p>
                  <Button className="mt-6" onClick={retry}>
                    다시 시도
                  </Button>
                </>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center py-6 text-center">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-accent text-white shadow-glow">
                <IconCheck width={32} height={32} strokeWidth={3} />
              </span>
              <h3 className="mt-6 text-xl font-extrabold">조회 신청이 접수되었습니다</h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-2">
                인증이 완료되었습니다. 상담사가 <b className="text-fg">{formatPhone(form.phone)}</b> 으로
                <br />
                곧 연락드려 가입 조건을 안내해 드립니다.
              </p>
              <div className="mt-6 w-full rounded-xl bg-bg p-4 text-left text-sm">
                <Row k="이름" v={form.name} />
                <Row k="통신사" v={form.carrier} />
                <Row k="희망 기종" v={form.model || "상담 시 결정"} />
              </div>
              <ButtonLink variant="kakao" size="lg" href={KAKAO_URL} target="_blank" rel="noopener noreferrer" className="mt-6 w-full">
                <IconKakao />
                카카오톡으로 바로 상담하기
              </ButtonLink>
              <button onClick={onClose} className="mt-3 text-sm text-fg-2 underline-offset-4 hover:underline">
                닫기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "h-12 w-full rounded-xl border border-line bg-bg px-4 text-[15px] text-fg placeholder:text-fg-3 focus:border-accent focus:outline-none";

function Field({
  label, required, hint, children, as = "label",
}: { label: string; required?: boolean; hint?: string; children: React.ReactNode; as?: "label" | "div" }) {
  const Tag = as;
  return (
    <Tag className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-[13px] font-bold text-fg-2">
        {label}
        {required && <span className="text-accent">*</span>}
        {hint && <span className="font-normal text-fg-3">({hint})</span>}
      </span>
      {children}
    </Tag>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-fg-3">{k}</span>
      <span className="font-semibold">{v}</span>
    </div>
  );
}

function Stepper({ step }: { step: Step }) {
  const labels = ["정보 입력", "간편인증", "완료"];
  return (
    <ol className="mt-1 flex items-center gap-1.5 text-[11px]" aria-label="진행 단계">
      {labels.map((l, i) => {
        const n = (i + 1) as Step;
        return (
          <li key={l} className="flex items-center gap-1.5">
            <span
              className={cn(
                "grid h-4 w-4 place-items-center rounded-full text-[10px] font-black",
                n < step ? "bg-accent text-white" : n === step ? "bg-accent text-white" : "bg-bg-3 text-fg-3",
              )}
            >
              {n < step ? "✓" : n}
            </span>
            <span className={n === step ? "font-bold text-fg" : "text-fg-3"}>{l}</span>
            {i < labels.length - 1 && <span className="mx-0.5 h-px w-3 bg-line-2" />}
          </li>
        );
      })}
    </ol>
  );
}
