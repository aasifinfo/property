export function LoadingScreen({ label = "Loading workspace..." }: { label?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="panel flex w-full max-w-md flex-col items-center gap-4 p-8 text-center">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-brand-line border-t-brand-orange" />
        <div>
          <p className="text-lg font-semibold text-brand-navy">Deal Exchange Platform</p>
          <p className="mt-1 text-sm text-brand-slate">{label}</p>
        </div>
      </div>
    </div>
  );
}

