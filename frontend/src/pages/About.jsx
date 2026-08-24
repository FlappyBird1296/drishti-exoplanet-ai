import {Sparkles,FlaskConical,Code2,Activity,Brain,Crosshair,Rocket,Star,Database,Orbit} from "lucide-react";

const steps=[
 [Activity,"Light Curve","Stellar brightness data","from missions like TESS"],
 [Database,"Signal Processing","Noise removal, detrending","and normalization"],
 [Crosshair,"BLS Detection","Box Least Squares","periodic transit search"],
 [Brain,"AI Classification","Random Forest model","predicts planetary nature"],
 [Star,"Candidate Ranking","Scoring and prioritization","for follow-up studies"],
];
const team=[["M","Manoranjan","CSE AIML (2025-29)"],["J","Jagannath","CSE AIML (2025-29)"],["T","Tanushree","CSE AIML (2025-29)"],["A","Amitanshu","CSE AIML (2025-29)"],["S","Soumya","CSE AIML (2025-29)"],];

export default function About(){
 return <div className="mx-auto max-w-[1280px] px-5 py-6 xl:px-7">
  <header className="mb-5 flex items-start justify-between"><div><h1 className="text-[28px] font-semibold text-white">About Drishti</h1><p className="mt-1 text-[14px] text-slate-400">The science, the mission, and the AI behind the search for new worlds.</p></div><button className="rounded-lg border border-white/[.08] bg-[#07101f] px-3.5 py-2.5 text-[11px] text-slate-300">▣ &nbsp; Last 30 Days &nbsp;⌄</button></header>
  <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_430px]">
   <div className="space-y-3">
    <section className="dr-card rounded-xl p-7">
      <div className="flex items-center gap-3 text-[17px] font-semibold text-violet-400"><Sparkles size={19}/>Our Mission</div>
      <h2 className="mt-4 text-[26px] font-semibold text-white">See Beyond. Discover More.</h2>
      <p className="mt-2 max-w-[760px] text-[14px] leading-6 text-slate-300">Drishti is an AI-powered platform that analyzes stellar light curves to detect potential exoplanet candidates. By combining advanced signal processing with machine learning, we aim to accelerate the discovery of new worlds and deepen humanity’s understanding of the universe.</p>
      <div className="mt-5 grid grid-cols-4 overflow-hidden rounded-xl border border-white/[.07] bg-[#050c19]">
       <Mission icon={Activity} title="Detect" color="violet">Identify periodic dips in stellar brightness using BLS algorithm.</Mission>
       <Mission icon={Brain} title="Learn" color="blue">ML model classifies signals as planetary or non-planetary.</Mission>
       <Mission icon={Crosshair} title="Prioritize" color="green">Score and rank candidates for further investigation.</Mission>
       <Mission icon={Rocket} title="Discover" color="amber">Help astronomers focus on the most promising signals.</Mission>
      </div>
    </section>

    <section className="dr-card rounded-xl p-5">
      <div className="flex items-center gap-3 text-[16px] font-semibold text-violet-400"><FlaskConical size={18}/>The Science Behind Drishti</div>
      <div className="mt-5 grid grid-cols-5">
       {steps.map(([Icon,title,a,b],i)=><div key={title} className="relative px-2 text-center"><div className="mx-auto flex h-[66px] w-[66px] items-center justify-center rounded-full border border-violet-400/20 bg-[#071020] text-violet-300"><Icon size={25}/></div>{i<4&&<span className="absolute right-[-2px] top-[33px] hidden w-[28px] border-t border-slate-500/50 lg:block">›</span>}<p className="mt-3 text-[13px] font-medium text-slate-200">{title}</p><p className="mt-2 text-[11px] leading-5 text-slate-500">{a}<br/>{b}</p></div>)}
      </div>
    </section>

    <section className="dr-card rounded-xl p-5">
      <div className="flex items-center gap-3 text-[16px] font-semibold text-violet-400"><Code2 size={18}/>Technology Stack</div>
      <div className="mt-5 grid grid-cols-5 gap-2">
       {[
        ["⚡","FastAPI","High-performance Python web framework"],
        ["🟠","Scikit-learn","Machine learning made simple"],
        ["◉","Astropy","Astronomical computations"],
        ["◌","Lightkurve","Work with Kepler & TESS data"],
        ["◉","PostgreSQL","Reliable storage for analyses"],
       ].map(([i,t,d])=><div key={t} className="rounded-xl border border-white/[.07] bg-[#050c19] p-4"><div className="flex items-center gap-2"><span className="text-[19px]">{i}</span><span className="text-[13px] text-slate-300">{t}</span></div><p className="mt-4 text-[11px] leading-5 text-slate-500">{d}</p></div>)}
      </div>
    </section>
   </div>

   <aside className="space-y-3">
    <div className="dr-card overflow-hidden rounded-xl">
      <div className="relative h-[330px] bg-[#050916]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_44%,rgba(251,191,36,.26),transparent_23%),radial-gradient(circle_at_70%_25%,rgba(168,85,247,.13),transparent_35%)]"/>
        <div className="absolute left-1/2 top-[42%] h-[112px] w-[112px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-yellow-50 via-amber-200 to-yellow-400 shadow-[0_0_70px_rgba(251,191,36,.45)]"/>
        <div className="absolute left-[63%] top-[43%] h-[34px] w-[34px] rounded-full bg-[#020712] shadow-[0_0_15px_rgba(0,0,0,.9)]"/>
        <svg className="absolute bottom-9 left-5 right-5 h-24 w-[calc(100%-40px)]" viewBox="0 0 420 100" preserveAspectRatio="none"><polyline fill="none" stroke="#ad7cff" strokeWidth="3" points="0,45 45,45 80,46 115,44 145,48 168,75 195,82 220,81 250,80 270,48 310,45 350,46 390,44 420,46"/>{[0,20,40,60,80,100,120,140,160,180,200,220,240,260,280,300,320,340,360,380,400].map(x=><circle key={x} cx={x+5} cy={x>150&&x<275?80:45} r="2.8" fill="#c59bff"/>)}</svg>
        <p className="absolute bottom-3 left-0 right-0 text-center text-[11px] text-slate-400">Light Curve with Detected Transit</p>
      </div>
    </div>
    <div className="dr-card rounded-xl p-5">
      <div className="flex items-center gap-3 text-[16px] font-semibold text-violet-400"><span className="text-lg">♣</span>Built by Dreamers, For Explorers</div>
      <p className="mt-3 text-[13px] leading-6 text-slate-400">Drishti was built for explorers, researchers, and dreamers who look up and wonder what lies beyond. Together, let’s uncover new worlds.</p>
      <div className="mt-5 space-y-4">{team.map(([initial,name,role],i)=><div key={name} className="flex items-center gap-3"><div className={`flex h-10 w-10 items-center justify-center rounded-full ${["bg-violet-500/25 text-violet-300","bg-blue-500/25 text-blue-300","bg-emerald-500/25 text-emerald-300","bg-amber-500/25 text-amber-300"][i]}`}>{initial}</div><div><p className="text-[13px] font-medium text-slate-200">{name}</p><p className="text-[11px] text-slate-500">{role}</p></div></div>)}</div>
      <div className="mt-5 rounded-xl border border-violet-400/15 bg-violet-500/[.05] p-5"><div className="flex items-start gap-4"><Sparkles className="mt-1 text-violet-400"/><div><p className="text-[15px] font-semibold text-violet-300">The Universe is Full of Possibilities</p><p className="mt-2 text-[12px] leading-5 text-slate-500">Every light curve holds a story.<br/>Drishti helps us read it.</p><p className="mt-4 text-[14px] font-medium text-violet-300">Let’s find the next Earth.</p></div></div></div>
    </div>
   </aside>
  </div>
  <footer className="mt-4 border-t border-white/[.06] py-4 text-center text-[11px] text-slate-600">✦ &nbsp; Made with curiosity, code, and coffee. &nbsp;&nbsp;|&nbsp;&nbsp; Drishti Exoplanet AI © 2026</footer>
 </div>
}
function Mission({icon:Icon,title,color,children}){const c={violet:"text-violet-400",blue:"text-sky-400",green:"text-emerald-400",amber:"text-amber-400"}[color];return <div className="border-r border-white/[.07] p-5 last:border-0"><div className={`flex h-11 w-11 items-center justify-center rounded-full bg-white/[.025] ${c}`}><Icon size={22}/></div><p className={`mt-4 text-[14px] font-medium ${c}`}>{title}</p><p className="mt-2 text-[11px] leading-5 text-slate-400">{children}</p></div>}
