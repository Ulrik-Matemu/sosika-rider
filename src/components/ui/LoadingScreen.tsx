export function LoadingScreen({ label = 'Loading rider workspace...' }: { label?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4 text-white">
      <div className="w-full max-w-sm rounded-[28px] border border-white/10 bg-white/5 px-6 py-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-white" />
          <p className="text-sm text-white/85">{label}</p>
        </div>
      </div>
    </div>
  );
}
