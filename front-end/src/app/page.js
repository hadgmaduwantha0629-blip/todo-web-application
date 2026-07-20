export default function Home() {
  return (
    <main className="page-shell">
      <div className="page-container flex min-h-[calc(100vh-3rem)] items-center">
        <section className="panel grid w-full gap-10 overflow-hidden p-8 lg:grid-cols-[1.15fr_0.85fr] lg:p-12">
          <div className="space-y-8">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Modern todo management
            </div>

            <div className="space-y-5">
              <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Organize your day with a calm, modern workspace.
              </h1>
              <p className="max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                Track tasks, update progress, and keep everything clean with a white, rounded interface built for focus.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a href="/dashboard" className="ui-button-primary">
                Open Dashboard
              </a>
              <a href="/login" className="ui-button-secondary">
                Sign In
              </a>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["Fast", "Quick task creation and updates."],
                ["Clean", "White cards and soft shadows."],
                ["Smooth", "Hover and active motion on every control."],
              ].map(([title, text]) => (
                <div key={title} className="panel-soft p-4">
                  <p className="text-sm font-semibold text-slate-950">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="panel-soft flex h-full flex-col justify-between p-6 sm:p-8">
            <div className="space-y-4">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
                Today
              </p>
              <div className="space-y-3">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 transition duration-200 hover:-translate-y-1 hover:shadow-lg">
                  <p className="text-sm font-medium text-slate-500">Plan</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">Build a focused todo flow</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-4 transition duration-200 hover:-translate-y-1 hover:shadow-lg">
                  <p className="text-sm font-medium text-slate-500">Design</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">Rounded controls and softer surfaces</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 transition duration-200 hover:-translate-y-1 hover:shadow-lg">
                  <p className="text-sm font-medium text-slate-500">Ship</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">A more polished experience across the app</p>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-3xl bg-slate-900 p-5 text-white shadow-xl shadow-slate-900/10">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Ready</p>
              <p className="mt-3 text-2xl font-semibold">Everything feels lighter, cleaner, and easier to scan.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}