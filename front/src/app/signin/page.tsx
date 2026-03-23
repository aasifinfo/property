"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import { authOperations } from "@/auth/authOperations";
import { useAuth } from "@/auth/useAuth";
import { PublicHeader } from "@/components/PublicHeader";
import { getDefaultRouteForUser } from "@/lib/route-access";

export default function SignInPage() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(getDefaultRouteForUser(user));
    }
  }, [authLoading, router, user]);

  useEffect(() => {
    if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await authOperations.signIn(email, password);
      enqueueSnackbar("Signed in successfully.", { variant: "success" });
    } catch (error) {
      enqueueSnackbar(error instanceof Error ? error.message : "Failed to sign in.", { variant: "error" });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <PublicHeader />
      <div className="shell py-10">
        <div className="mx-auto max-w-5xl panel overflow-hidden">
          <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
            <div className="bg-brand-sand p-8 lg:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-brand-orange">Broker login</p>
              <h1 className="mt-4 text-4xl font-bold text-brand-navy">Access your moderated deal workspace.</h1>
              <p className="mt-5 text-sm leading-7 text-brand-slate">Approved brokers can browse listings, post inventory, and respond to buyer requirements. Pending applications can sign in to check review status.</p>
              <div className="mt-8 space-y-4 text-sm text-brand-slate">
                <p>Approved broker: full access to the workspace</p>
                <p>Pending broker: status page only</p>
                <p>Admin: approvals, broker management, logs, CSV export</p>
              </div>
            </div>
            <div className="p-8 lg:p-10">
              <form onSubmit={handleSubmit} className="grid gap-5">
                <div>
                  <label className="label">Email</label>
                  <input className="input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
                </div>
                <div>
                  <label className="label">Password</label>
                  <input className="input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>

              <div className="mt-6 rounded-2xl border border-brand-line bg-slate-50 p-5 text-sm text-brand-slate">
                <p className="font-semibold text-brand-ink">Invite-only access</p>
                <p className="mt-2">No broker account yet? Apply for access and wait for admin approval before the marketplace unlocks.</p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/apply" className="btn-accent">Apply for Access</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

