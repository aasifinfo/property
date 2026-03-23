"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/auth/useAuth";
import { LoadingScreen } from "@/components/LoadingScreen";
import { getDefaultRouteForUser } from "@/lib/route-access";

export default function PendingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/signin");
      return;
    }
    if (!loading && user && user.status === "approved") {
      router.replace(getDefaultRouteForUser(user));
    }
  }, [loading, router, user]);

  if (loading || !user) return <LoadingScreen label="Checking application status..." />;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="panel w-full max-w-2xl p-10 text-center">
        <span className="badge bg-amber-50 text-amber-700">Application pending</span>
        <h1 className="mt-5 text-4xl font-bold text-brand-navy">Your broker profile is waiting for admin approval.</h1>
        <p className="mt-4 text-sm leading-7 text-brand-slate">We have your application, agency information, and coverage areas. Until approval, the private dashboard, listings, and buyer board remain locked.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="subtle-panel p-4">
            <p className="text-sm font-semibold text-brand-ink">Status</p>
            <p className="mt-2 text-brand-slate">{user.status}</p>
          </div>
          <div className="subtle-panel p-4">
            <p className="text-sm font-semibold text-brand-ink">Agency</p>
            <p className="mt-2 text-brand-slate">{user.agency?.name || "Under review"}</p>
          </div>
          <div className="subtle-panel p-4">
            <p className="text-sm font-semibold text-brand-ink">Speciality</p>
            <p className="mt-2 text-brand-slate">{user.brokerProfile?.speciality || "Broker application"}</p>
          </div>
        </div>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className="btn-secondary">Back Home</Link>
          <Link href="/signin" className="btn-primary">Refresh Status</Link>
        </div>
      </div>
    </div>
  );
}

