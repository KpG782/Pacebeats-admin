export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10 sm:px-12 lg:px-20">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500 text-lg font-semibold tracking-[0.3em] text-white">
              PB
            </span>
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-indigo-300">Pacebeats</p>
              <h1 className="text-xl font-semibold text-white">Admin Control Center</h1>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <span className="inline-flex h-3 w-3 animate-pulse rounded-full bg-emerald-400" aria-hidden />
            Systems Operational
          </div>
        </header>

        <main className="flex flex-1 flex-col justify-center gap-16 py-12">
          <section className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-indigo-300">
              Welcome back
            </p>
            <h2 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Everything you need to run releases, teams, and revenue in one view.
            </h2>
            <p className="mt-6 text-lg text-slate-300">
              Review this morning&#39;s highlights, prioritize what needs your attention, and launch
              straight into the dashboard when you&#39;re ready to make decisions.
            </p>
            <div className="mt-10 flex flex-wrap gap-4 sm:gap-6">
              <a
                href="#dashboard"
                className="rounded-full bg-indigo-500 px-8 py-3 text-sm font-medium uppercase tracking-[0.3em] text-white transition hover:bg-indigo-400"
              >
                Enter Dashboard
              </a>
              <a
                href="#reports"
                className="rounded-full border border-white/20 px-8 py-3 text-sm font-medium uppercase tracking-[0.3em] text-white transition hover:border-white/40 hover:bg-white/10"
              >
                View Reports
              </a>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <p className="text-sm text-slate-300">Active Campaigns</p>
              <p className="mt-3 text-3xl font-semibold text-white">12</p>
              <p className="mt-4 text-xs uppercase tracking-[0.4em] text-emerald-400">+3 today</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <p className="text-sm text-slate-300">Pending Approvals</p>
              <p className="mt-3 text-3xl font-semibold text-white">5</p>
              <p className="mt-4 text-xs uppercase tracking-[0.4em] text-amber-300">Review now</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur sm:col-span-2 lg:col-span-1">
              <p className="text-sm text-slate-300">Revenue This Week</p>
              <p className="mt-3 text-3xl font-semibold text-white">$48,920</p>
              <p className="mt-4 text-xs uppercase tracking-[0.4em] text-slate-300">Up 11% vs last week</p>
            </div>
          </section>
        </main>

        <footer className="border-t border-white/10 pt-6 text-xs text-slate-400 sm:flex sm:items-center sm:justify-between">
          <p>Need additional access? Invite teammates directly from the dashboard settings.</p>
          <p className="mt-4 sm:mt-0">Support 24/7 | Pacebeats Media</p>
        </footer>
      </div>
    </div>
  );
}

