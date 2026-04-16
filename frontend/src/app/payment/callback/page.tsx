// src/app/payment/callback/page.tsx
"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { PlanType } from "@/types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const SUCCESS_STATUSES = ["success", "completed", "paid", "approved"];
const FAILED_STATUSES  = ["failed", "cancelled", "rejected", "error"];

function CallbackContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const { token: authToken, subscribe } = useAuthStore();

  useEffect(() => {
    // ── Read AfriPay redirect params ──────────────────────────────
    const status      = (searchParams.get("status") || "").toLowerCase();
    const clientToken = searchParams.get("token") || searchParams.get("client_token") || "";
    const txnId       = searchParams.get("transaction_id") || searchParams.get("txn_id") || "";

    if (!clientToken) {
      router.replace("/payment/failed");
      return;
    }

    if (FAILED_STATUSES.includes(status)) {
      router.replace("/payment/failed");
      return;
    }

    if (SUCCESS_STATUSES.includes(status)) {
      // Decode the client token to get plan — format is base64url of "userId:planId:timestamp"
      activateAndRedirect(clientToken, txnId);
      return;
    }

    // Status missing or "pending" — poll the backend
    pollBackend(clientToken, txnId, 0);
  }, []);

  // ── Activate subscription then redirect to success ──────────────
  const activateAndRedirect = async (clientToken: string, txnId: string) => {
    try {
      // Decode planId from the client token (base64url: "userId:planId:timestamp")
      const decoded = atob(clientToken.replace(/-/g, "+").replace(/_/g, "/"));
      const parts   = decoded.split(":");
      const planId  = (parts[1] || "basic") as PlanType;

      // Also notify backend to confirm subscription in DB
      if (authToken) {
        await fetch(`${API}/subscriptions/status/${clientToken}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        }).catch(() => {/* non-blocking */});
      }

      subscribe(planId);
      router.replace(`/payment/success?plan=${planId}&txn=${txnId}`);
    } catch {
      // Token decode failed — still mark as subscribed with basic plan
      subscribe("basic");
      router.replace(`/payment/success?plan=basic&txn=${txnId}`);
    }
  };

  // ── Poll backend up to 6 times if status is unknown/pending ─────
  const pollBackend = async (clientToken: string, txnId: string, attempt: number) => {
    if (attempt >= 6) {
      // Give up — go to pending page (admin will approve manually)
      router.replace("/payment/pending");
      return;
    }

    try {
      const res  = await fetch(`${API}/subscriptions/status/${clientToken}`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });
      const data = await res.json();

      const payStatus =
        data?.data?.status ||
        data?.subscription?.status ||
        data?.status || "pending";

      const plan =
        data?.data?.plan ||
        data?.subscription?.plan ||
        "basic";

      if (["active", "success", "completed"].includes(payStatus)) {
        subscribe(plan as PlanType);
        router.replace(`/payment/success?plan=${plan}&txn=${txnId}`);
      } else if (FAILED_STATUSES.includes(payStatus)) {
        router.replace("/payment/failed");
      } else {
        // Still pending — wait 2s and retry
        setTimeout(() => pollBackend(clientToken, txnId, attempt + 1), 2000);
      }
    } catch {
      setTimeout(() => pollBackend(clientToken, txnId, attempt + 1), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-brand-gold animate-spin" />
        </div>
        <h1 className="text-white text-2xl font-bold mb-3">Processing Payment</h1>
        <p className="text-white/60 text-sm">Verifying your payment, please wait...</p>
        <p className="text-white/30 text-xs mt-3">Do not close this page</p>
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-bg-primary flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-brand-gold animate-spin" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}