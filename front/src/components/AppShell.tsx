"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import { ReactNode } from "react";
import { useAuth } from "@/auth/useAuth";
import { authOperations } from "@/auth/authOperations";
import { cn, getFullName, initials, statusClasses } from "@/lib/deal-utils";

const brokerNav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/listings", label: "Browse Listings" },
  { href: "/requirements", label: "Buyer Board" },
  { href: "/post-listing", label: "Post Listing" },
];

export function AppShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();

  const navItems = user?.role === "admin" ? [...brokerNav, { href: "/admin", label: "Admin Panel" }] : brokerNav;

  const handleSignOut = async () => {
    await authOperations.signOut();
    enqueueSnackbar("Signed out.", { variant: "success" });
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-transparent pb-12">
      <header className="sticky top-0 z-20 border-b border-white/60 bg-white/85 backdrop-blur">
        <div className="shell flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-navy text-sm font-bold text-white">
              DX
            </div>
            <div>
              <p className="text-lg font-bold text-brand-navy">Deal Exchange Platform</p>
              <p className="text-sm text-brand-slate">Private broker marketplace</p>
            </div>
          </div>
          <nav className="flex flex-wrap items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition",
                  pathname === item.href ? "bg-brand-navy text-white" : "text-brand-slate hover:bg-white"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-brand-ink">
                {getFullName(user?.firstName, user?.lastName)}
              </p>
              <div className="mt-1 flex items-center justify-end gap-2">
                <span className={statusClasses(user?.status || "pending")}>{user?.status || "pending"}</span>
                <span className="text-xs uppercase tracking-[0.2em] text-brand-slate">{user?.role || "broker"}</span>
              </div>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-orange text-sm font-bold text-white">
              {initials(getFullName(user?.firstName, user?.lastName))}
            </div>
            <button onClick={handleSignOut} className="btn-secondary">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="shell pt-8">
        <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-orange">Broker Workspace</p>
            <h1 className="mt-2 text-3xl font-bold text-brand-navy">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm text-brand-slate">{subtitle}</p>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}

