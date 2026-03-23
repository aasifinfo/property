"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import { AppShell } from "@/components/AppShell";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useAuth } from "@/auth/useAuth";
import { createListing, fetchAreas } from "@/lib/deal-data";
import { dealTypeOptions, propertyTypeOptions } from "@/lib/deal-constants";
import { Area, ListingFormValues } from "@/lib/deal-types";
import { canAccessBrokerWorkspace, getDefaultRouteForUser } from "@/lib/route-access";

const steps = ["Property details", "Deal details", "Co-broke terms", "Media upload"];

const initialValues: ListingFormValues = {
  title: "",
  propertyType: "apartment",
  dealType: "sale",
  bedrooms: "",
  sizeSqft: "",
  areaId: "",
  developer: "",
  price: "",
  paymentPlan: "",
  handoverDate: "",
  yieldPercent: "",
  coBrokePercent: "",
  notes: "",
  description: "",
  paymentTerms: "",
};

export default function PostListingPage() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { user, loading } = useAuth();
  const [areas, setAreas] = useState<Area[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState<ListingFormValues>(initialValues);
  const [images, setImages] = useState<File[]>([]);
  const [documents, setDocuments] = useState<File[]>([]);

  useEffect(() => {
    if (!loading && (!user || !canAccessBrokerWorkspace(user))) {
      router.replace(getDefaultRouteForUser(user));
      return;
    }
    if (!loading && user) {
      fetchAreas()
        .then(setAreas)
        .finally(() => setPageLoading(false));
    }
  }, [loading, router, user]);

  const handleSubmit = async () => {
    if (!user) return;
    if (!values.title || !values.price || !values.areaId || !images.length || !values.coBrokePercent) {
      enqueueSnackbar("Complete the required fields and upload at least one image.", { variant: "error" });
      return;
    }

    setSubmitting(true);
    try {
      await createListing({
        values,
        userId: user.uid,
        agencyId: user.platformUser?.agency_id || null,
        images,
        documents,
      });
      enqueueSnackbar("Listing submitted for admin approval.", { variant: "success" });
      router.push("/dashboard");
    } catch (error) {
      enqueueSnackbar(error instanceof Error ? error.message : "Failed to submit listing.", { variant: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || pageLoading || !user) return <LoadingScreen label="Preparing listing wizard..." />;

  return (
    <AppShell title="Post Listing" subtitle="Create a moderated listing draft across property details, deal structure, and media. New submissions stay pending until admin approval.">
      <section className="panel p-6 lg:p-8">
        <div className="grid gap-3 lg:grid-cols-4">
          {steps.map((step, index) => (
            <button
              key={step}
              type="button"
              onClick={() => setCurrentStep(index)}
              className={`rounded-2xl border px-4 py-4 text-left transition ${currentStep === index ? "border-brand-navy bg-brand-navy text-white" : "border-brand-line bg-slate-50 text-brand-slate"}`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">Step {index + 1}</p>
              <p className="mt-2 text-sm font-semibold">{step}</p>
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-5">
          {currentStep === 0 ? (
            <>
              <div className="grid gap-5 md:grid-cols-2">
                <div><label className="label">Title</label><input className="input" value={values.title} onChange={(event) => setValues({ ...values, title: event.target.value })} required /></div>
                <div><label className="label">Property type</label><select className="input" value={values.propertyType} onChange={(event) => setValues({ ...values, propertyType: event.target.value as ListingFormValues["propertyType"] })}>{propertyTypeOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></div>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div><label className="label">Bedrooms</label><input className="input" value={values.bedrooms} onChange={(event) => setValues({ ...values, bedrooms: event.target.value })} /></div>
                <div><label className="label">Size (sqft)</label><input className="input" value={values.sizeSqft} onChange={(event) => setValues({ ...values, sizeSqft: event.target.value })} /></div>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div><label className="label">Area</label><select className="input" value={values.areaId} onChange={(event) => setValues({ ...values, areaId: event.target.value })}><option value="">Select area</option>{areas.map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}</select></div>
                <div><label className="label">Developer</label><input className="input" value={values.developer} onChange={(event) => setValues({ ...values, developer: event.target.value })} /></div>
              </div>
            </>
          ) : null}

          {currentStep === 1 ? (
            <>
              <div className="grid gap-5 md:grid-cols-2">
                <div><label className="label">Deal type</label><select className="input" value={values.dealType} onChange={(event) => setValues({ ...values, dealType: event.target.value as ListingFormValues["dealType"] })}>{dealTypeOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></div>
                <div><label className="label">Price</label><input className="input" value={values.price} onChange={(event) => setValues({ ...values, price: event.target.value })} required /></div>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div><label className="label">Payment plan</label><input className="input" value={values.paymentPlan} onChange={(event) => setValues({ ...values, paymentPlan: event.target.value })} /></div>
                <div><label className="label">Handover date</label><input className="input" type="date" value={values.handoverDate} onChange={(event) => setValues({ ...values, handoverDate: event.target.value })} /></div>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div><label className="label">Yield %</label><input className="input" value={values.yieldPercent} onChange={(event) => setValues({ ...values, yieldPercent: event.target.value })} /></div>
                <div><label className="label">Description</label><textarea className="input min-h-[120px]" value={values.description} onChange={(event) => setValues({ ...values, description: event.target.value })} /></div>
              </div>
            </>
          ) : null}

          {currentStep === 2 ? (
            <>
              <div className="grid gap-5 md:grid-cols-2">
                <div><label className="label">Co-broke %</label><input className="input" value={values.coBrokePercent} onChange={(event) => setValues({ ...values, coBrokePercent: event.target.value })} required /></div>
                <div><label className="label">Payment terms</label><input className="input" value={values.paymentTerms} onChange={(event) => setValues({ ...values, paymentTerms: event.target.value })} /></div>
              </div>
              <div><label className="label">Notes</label><textarea className="input min-h-[180px]" value={values.notes} onChange={(event) => setValues({ ...values, notes: event.target.value })} placeholder="Internal notes stay restricted from other brokers via platform controls." /></div>
            </>
          ) : null}

          {currentStep === 3 ? (
            <>
              <div><label className="label">Images upload (max 2MB each)</label><input className="input" type="file" multiple accept="image/*" onChange={(event) => setImages(Array.from(event.target.files || []))} /></div>
              <div><label className="label">Documents upload (max 2MB each)</label><input className="input" type="file" multiple onChange={(event) => setDocuments(Array.from(event.target.files || []))} /></div>
              <div className="rounded-2xl border border-brand-line bg-slate-50 p-5 text-sm text-brand-slate">
                <p className="font-semibold text-brand-ink">Submission status</p>
                <p className="mt-2">All new listings are created with <span className="font-semibold">Pending</span> status. They appear in the marketplace only after an admin approves them.</p>
                <p className="mt-2">Renewal reminders are tracked against a 14-day renewal window.</p>
              </div>
            </>
          ) : null}
        </div>

        <div className="mt-8 flex items-center justify-between gap-4">
          <button type="button" className="btn-secondary" disabled={currentStep === 0} onClick={() => setCurrentStep((step) => Math.max(0, step - 1))}>Previous</button>
          <div className="flex gap-3">
            {currentStep < steps.length - 1 ? (
              <button type="button" className="btn-primary" onClick={() => setCurrentStep((step) => Math.min(steps.length - 1, step + 1))}>Next</button>
            ) : (
              <button type="button" className="btn-primary" onClick={handleSubmit} disabled={submitting}>{submitting ? "Submitting..." : "Submit Listing"}</button>
            )}
          </div>
        </div>
      </section>
    </AppShell>
  );
}

