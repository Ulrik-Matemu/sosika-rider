export function LoadingScreen({ label = 'Loading rider workspace...' }: { label?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5 shadow-2xl shadow-black/30">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 animate-pulse rounded-full bg-orange-400" />
          <p className="text-sm text-slate-100">{label}</p>
        </div>
      </div>
    </div>
  );
}
