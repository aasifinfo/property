"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import { PublicHeader } from "@/components/PublicHeader";
import { LoadingScreen } from "@/components/LoadingScreen";
import { specialityOptions } from "@/lib/deal-constants";
import { Area } from "@/lib/deal-types";
import { fetchAreas } from "@/lib/deal-data";

export default function ApplyPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [areas, setAreas] = useState<Area[]>([]);
  const [loadingAreas, setLoadingAreas] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agencyName: "",
    reraBrn: "",
    coveredAreaIds: [] as string[],
    speciality: specialityOptions[0],
    experienceYears: "3",
  });

  useEffect(() => {
    fetchAreas()
      .then(setAreas)
      .finally(() => setLoadingAreas(false));
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (form.password.length < 6) {
      enqueueSnackbar("Password must be at least 6 characters.", { variant: "error" });
      return;
    }
    if (form.password !== form.confirmPassword) {
      enqueueSnackbar("Passwords do not match.", { variant: "error" });
      return;
    }
    if (!form.coveredAreaIds.length) {
      enqueueSnackbar("Select at least one area.", { variant: "error" });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          password: form.password,
          agencyName: form.agencyName,
          reraBrn: form.reraBrn,
          coveredAreaIds: form.coveredAreaIds,
          speciality: form.speciality,
          experienceYears: Number(form.experienceYears),
        }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || "Application failed.");
      }

      setSubmitted(true);
      enqueueSnackbar("Application submitted for admin review.", { variant: "success" });
    } catch (error) {
      enqueueSnackbar(error instanceof Error ? error.message : "Application failed.", { variant: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingAreas) return <LoadingScreen label="Loading broker application..." />;

  return (
    <div className="min-h-screen">
      <PublicHeader />
      <div className="shell py-10">
        <div className="mx-auto max-w-5xl panel overflow-hidden">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
            <div className="bg-brand-navy p-8 text-white lg:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-brand-orange">Apply</p>
              <h1 className="mt-4 text-4xl font-bold leading-tight">Join the private broker exchange.</h1>
              <p className="mt-5 text-sm leading-7 text-white/75">Share your agency credentials, target areas, and speciality so admins can review access. Approved brokers receive full dashboard access after moderation.</p>
              <div className="mt-8 space-y-4 text-sm text-white/75">
                <p>1. Submit broker profile</p>
                <p>2. Admin reviews agency + RERA/BRN data</p>
                <p>3. Approved brokers can log in and post listings</p>
              </div>
              <p className="mt-8 text-sm text-white/65">Already approved? <Link href="/signin" className="font-semibold text-brand-orange">Sign in</Link></p>
            </div>

            <div className="p-8 lg:p-10">
              {submitted ? (
                <div className="flex min-h-[540px] flex-col items-center justify-center text-center">
                  <div className="badge bg-emerald-50 text-emerald-700">Application received</div>
                  <h2 className="mt-5 text-3xl font-bold text-brand-navy">Your broker application is now pending review.</h2>
                  <p className="mt-4 max-w-lg text-sm leading-7 text-brand-slate">An admin will review your profile and listing coverage. You can sign in anytime to check status, but platform access stays locked until approval.</p>
                  <div className="mt-6 flex gap-3">
                    <Link href="/signin" className="btn-primary">Go to Sign In</Link>
                    <Link href="/" className="btn-secondary">Back Home</Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="grid gap-5">
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="label">First name</label>
                      <input className="input" value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} required />
                    </div>
                    <div>
                      <label className="label">Last name</label>
                      <input className="input" value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} required />
                    </div>
                  </div>
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="label">Email</label>
                      <input className="input" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
                    </div>
                    <div>
                      <label className="label">Phone</label>
                      <input className="input" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required />
                    </div>
                  </div>
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="label">Password</label>
                      <input className="input" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
                    </div>
                    <div>
                      <label className="label">Confirm password</label>
                      <input className="input" type="password" value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} required />
                    </div>
                  </div>
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="label">Agency name</label>
                      <input className="input" value={form.agencyName} onChange={(event) => setForm({ ...form, agencyName: event.target.value })} required />
                    </div>
                    <div>
                      <label className="label">RERA / BRN</label>
                      <input className="input" value={form.reraBrn} onChange={(event) => setForm({ ...form, reraBrn: event.target.value })} required />
                    </div>
                  </div>
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="label">Speciality</label>
                      <select className="input" value={form.speciality} onChange={(event) => setForm({ ...form, speciality: event.target.value })}>
                        {specialityOptions.map((option) => <option key={option}>{option}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Experience (years)</label>
                      <input className="input" type="number" min="0" value={form.experienceYears} onChange={(event) => setForm({ ...form, experienceYears: event.target.value })} required />
                    </div>
                  </div>
                  <div>
                    <label className="label">Areas covered</label>
                    <div className="grid max-h-56 gap-3 overflow-auto rounded-2xl border border-brand-line bg-slate-50 p-4 sm:grid-cols-2">
                      {areas.map((area) => {
                        const checked = form.coveredAreaIds.includes(area.id);
                        return (
                          <label key={area.id} className="flex items-center gap-3 text-sm text-brand-ink">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                setForm({
                                  ...form,
                                  coveredAreaIds: checked
                                    ? form.coveredAreaIds.filter((id) => id !== area.id)
                                    : [...form.coveredAreaIds, area.id],
                                })
                              }
                            />
                            <span>{area.name} <span className="text-brand-slate">{area.city}</span></span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-brand-slate">Invite-only access. Admin approval is required before dashboard access.</p>
                    <button type="submit" className="btn-primary" disabled={submitting}>
                      {submitting ? "Submitting..." : "Submit Application"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

