import type { PropsWithChildren, ReactNode } from 'react';
import { APP_NAME } from '../../constants/app';

interface AppShellProps extends PropsWithChildren {
  title: string;
  subtitle?: string;
  headerAction?: ReactNode;
}

export function AppShell({ title, subtitle, headerAction, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_26%),linear-gradient(180deg,_#111111_0%,_#0a0a0a_40%,_#f5f5f2_40%,_#f5f5f2_100%)]" />
      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/65 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-start justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/55">{APP_NAME}</p>
            <h1 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-white sm:text-2xl">{title}</h1>
            {subtitle ? <p className="mt-1 max-w-xl text-sm leading-6 text-white/60">{subtitle}</p> : null}
          </div>
          {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-col px-4 py-5 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
