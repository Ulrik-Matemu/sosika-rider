import type { PropsWithChildren, ReactNode } from 'react';
import { APP_NAME } from '../../constants/app';

interface AppShellProps extends PropsWithChildren {
  title: string;
  subtitle?: string;
  headerAction?: ReactNode;
}

export function AppShell({ title, subtitle, headerAction, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(247,148,29,0.12),_transparent_35%),linear-gradient(180deg,_#fffdf8_0%,_#f5f7fb_100%)] text-slate-950">
      <header className="sticky top-0 z-20 border-b border-white/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-600">{APP_NAME}</p>
            <h1 className="text-xl font-semibold tracking-tight text-slate-950">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
          </div>
          {headerAction}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-col px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
