import Link from "next/link";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/50 bg-white/80 backdrop-blur">
      <div className="shell flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-navy font-bold text-white">
            DX
          </div>
          <div>
            <p className="text-lg font-bold text-brand-navy">Deal Exchange Platform</p>
            <p className="text-xs uppercase tracking-[0.24em] text-brand-slate">Invite-only broker network</p>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/signin" className="btn-secondary">
            Login
          </Link>
          <Link href="/apply" className="btn-accent">
            Apply
          </Link>
        </div>
      </div>
    </header>
  );
}

