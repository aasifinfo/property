"use client";

import { FormEvent, useMemo, useState } from "react";
import { useSnackbar } from "notistack";
import { apiFetch } from "@/lib/deal-api";
import { Requirement, Listing } from "@/lib/deal-types";
import { getMailtoLink, getWhatsappLink } from "@/lib/deal-utils";

type Subject =
  | { kind: "listing"; listing: Listing }
  | { kind: "requirement"; requirement: Requirement };

export function EnquiryModal({
  open,
  onClose,
  subject,
}: {
  open: boolean;
  onClose: () => void;
  subject: Subject | null;
}) {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [preferredChannel, setPreferredChannel] = useState<"both" | "email" | "whatsapp">("both");
  const [message, setMessage] = useState("");

  const target = useMemo(() => {
    if (!subject) return null;
    return subject.kind === "listing" ? subject.listing.owner : subject.requirement.owner;
  }, [subject]);

  if (!open || !subject) return null;

  const title = subject.kind === "listing" ? subject.listing.title : subject.requirement.title;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await apiFetch("/api/leads", {
        method: "POST",
        body: JSON.stringify({
          listingId: subject.kind === "listing" ? subject.listing.id : null,
          requirementId: subject.kind === "requirement" ? subject.requirement.id : null,
          targetUserId:
            subject.kind === "listing" ? subject.listing.created_by : subject.requirement.posted_by,
          leadType: subject.kind === "listing" ? "listing_enquiry" : "requirement_match",
          contactName,
          contactEmail,
          contactPhone,
          preferredChannel,
          message,
        }),
      });

      const outboundMessage = `${contactName} (${contactEmail}${contactPhone ? `, ${contactPhone}` : ""}) sent an enquiry about ${title}.\n\n${message}`;
      if ((preferredChannel === "email" || preferredChannel === "both") && target?.email) {
        window.open(getMailtoLink(target.email, `Deal Exchange enquiry: ${title}`, outboundMessage), "_blank", "noopener,noreferrer");
      }
      if ((preferredChannel === "whatsapp" || preferredChannel === "both") && target?.phone) {
        window.open(getWhatsappLink(target.phone, outboundMessage), "_blank", "noopener,noreferrer");
      }

      enqueueSnackbar("Enquiry sent and handoff opened for the selected contact channel.", { variant: "success" });
      onClose();
      setContactName("");
      setContactEmail("");
      setContactPhone("");
      setPreferredChannel("both");
      setMessage("");
    } catch (error) {
      enqueueSnackbar(error instanceof Error ? error.message : "Failed to send enquiry.", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4">
      <div className="panel w-full max-w-2xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-orange">Connect Broker</p>
            <h3 className="mt-2 text-2xl font-semibold text-brand-navy">{title}</h3>
            <p className="mt-2 text-sm text-brand-slate">Lead capture is stored in the admin log, then handed off through email, WhatsApp, or both.</p>
          </div>
          <button onClick={onClose} className="btn-secondary">Close</button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Your name</label>
              <input className="input" value={contactName} onChange={(event) => setContactName(event.target.value)} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} required />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Phone</label>
              <input className="input" value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} />
            </div>
            <div>
              <label className="label">Preferred channel</label>
              <select className="input" value={preferredChannel} onChange={(event) => setPreferredChannel(event.target.value as "both" | "email" | "whatsapp")}>
                <option value="both">Email + WhatsApp</option>
                <option value="email">Email only</option>
                <option value="whatsapp">WhatsApp only</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Message</label>
            <textarea className="input min-h-[140px]" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Share your buyer brief, deal structure, and close timeline." required />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Sending..." : "Send Enquiry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}