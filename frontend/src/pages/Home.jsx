import { Activity, ArrowRight, Telescope } from "lucide-react";

export default function Home({ onExplore }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020712] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(124,92,255,.16),transparent_32%),radial-gradient(circle_at_80%_80%,rgba(37,99,235,.10),transparent_30%)]" />
      <header className="relative z-10 flex items-center justify-between px-7 py-6 md:px-12">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-violet-500/50 bg-violet-500/[.08]"><Telescope size={23} className="text-violet-300" /></div>
          <div><div className="text-xl font-semibold tracking-[.22em]">DRISHTI</div><div className="text-[9px] uppercase tracking-[.3em] text-violet-300/55">Exoplanet Intelligence</div></div>
        </div>
        <div className="rounded-full border border-emerald-400/20 bg-emerald-400/[.05] px-4 py-2 text-xs text-emerald-300">● AI × Astronomy</div>
      </header>
      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-100px)] max-w-6xl items-center px-7 py-16 md:px-12">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[.24em] text-violet-300">Exoplanet Intelligence</p>
          <h1 className="mt-5 text-5xl font-semibold tracking-tight md:text-7xl">See Beyond.<br/><span className="text-violet-300">Discover More.</span></h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-400">Analyze stellar light curves, detect periodic transit signals, and use machine learning to prioritize the most promising planetary candidates.</p>
          <button onClick={onExplore} className="mt-9 flex items-center gap-3 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold shadow-[0_0_35px_rgba(124,92,255,.22)] hover:bg-violet-500">Open Observatory <ArrowRight size={16}/></button>
          <div className="mt-12 grid max-w-xl grid-cols-3 gap-3">
            {[['TESS Data','Real observations'],['BLS Detection','Periodic signals'],['AI Ranking','Candidate priority']].map(([a,b])=><div key={a} className="rounded-xl border border-white/[.07] bg-white/[.025] p-4"><Activity size={17} className="text-violet-300"/><p className="mt-3 text-sm font-medium">{a}</p><p className="mt-1 text-xs text-slate-500">{b}</p></div>)}
          </div>
        </div>
      </main>
    </div>
  );
}
