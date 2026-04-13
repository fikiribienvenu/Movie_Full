// src/app/admin/subscriptions/page.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Clock, RefreshCw, User, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

interface PendingSubscription {
  _id: string;
  user: { _id: string; name: string; email: string };
  plan: string;
  status: string;
  price: { amount: number; currency: string };
  afripay: { transactionId?: string; clientToken: string; callbackReceivedAt?: string };
  createdAt: string;
}

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<PendingSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"pending" | "active" | "all">("pending");

  const fetchSubscriptions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("cinemax_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/subscriptions?status=${filter}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSubscriptions(data.data.subscriptions);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchSubscriptions(); }, [filter]);

  const handleAction = async (subscriptionId: string, action: "approve" | "reject") => {
    setActionLoading(subscriptionId + action);
    try {
      const token = localStorage.getItem("cinemax_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/subscriptions/${subscriptionId}/${action}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      // Refresh list
      await fetchSubscriptions();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const statusColor = {
    pending: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    active: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    failed: "text-red-400 bg-red-500/10 border-red-500/20",
    cancelled: "text-text-muted bg-bg-elevated border-border",
  };

  const planColor = {
    basic: "text-text-secondary",
    premium: "text-brand-gold",
    annual: "text-brand-red",
  };

  return (
    <div className="min-h-screen bg-bg-primary p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Subscription Management</h1>
            <p className="text-text-muted text-sm mt-1">Review and confirm user payments</p>
          </div>
          <button
            onClick={fetchSubscriptions}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-card border border-border text-text-secondary hover:text-text-primary text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {(["pending", "active", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors",
                filter === f
                  ? "bg-brand-gold text-black"
                  : "bg-bg-card border border-border text-text-muted hover:text-text-primary"
              )}
            >
              {f}
              {f === "pending" && (
                <span className="ml-2 text-xs bg-brand-red text-white px-1.5 py-0.5 rounded-full">
                  {subscriptions.filter(s => s.status === "pending").length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-6 h-6 text-brand-gold animate-spin" />
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="text-center py-20 text-text-muted">
            <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No {filter === "all" ? "" : filter} subscriptions found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {subscriptions.map((sub, i) => (
              <motion.div
                key={sub._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                {/* User info */}
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-bg-elevated border border-border flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-text-muted" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-text-primary">{sub.user?.name ?? "Unknown"}</p>
                    <p className="text-xs text-text-muted">{sub.user?.email ?? "—"}</p>
                  </div>
                </div>

                {/* Plan & amount */}
                <div className="flex items-center gap-4 flex-1">
                  <div>
                    <p className={cn("font-bold text-sm capitalize", planColor[sub.plan as keyof typeof planColor])}>
                      {sub.plan} Plan
                    </p>
                    <p className="text-xs text-text-muted">
                      {sub.price.currency} {sub.price.amount.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Transaction info */}
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 text-xs text-text-muted">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span className="font-mono truncate max-w-[120px]">
                      {sub.afripay?.transactionId ?? "No TXN yet"}
                    </span>
                  </div>
                  <p className="text-[10px] text-text-muted mt-0.5">
                    {new Date(sub.createdAt).toLocaleDateString("en-RW", {
                      day: "numeric", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit"
                    })}
                  </p>
                </div>

                {/* Status */}
                <div>
                  <span className={cn(
                    "text-xs font-bold px-3 py-1 rounded-full border capitalize",
                    statusColor[sub.status as keyof typeof statusColor] ?? statusColor.cancelled
                  )}>
                    {sub.status}
                  </span>
                </div>

                {/* Actions — only for pending */}
                {sub.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(sub._id, "approve")}
                      disabled={!!actionLoading}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      {actionLoading === sub._id + "approve" ? "..." : "Approve"}
                    </button>
                    <button
                      onClick={() => handleAction(sub._id, "reject")}
                      disabled={!!actionLoading}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-bold transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      {actionLoading === sub._id + "reject" ? "..." : "Reject"}
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}