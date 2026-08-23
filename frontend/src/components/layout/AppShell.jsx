import { useEffect, useState } from "react";
import { BarChart3, Telescope, ScanSearch, Orbit, Info, Sparkles } from "lucide-react";
import { api } from "../../services/api";
import SpaceScene from "../three/SpaceScene";

const nav=[
  {id:"dashboard",label:"Dashboard",icon:BarChart3},
  {id:"analyze",label:"Analyze",icon:ScanSearch},
  {id:"candidates",label:"Candidates",icon:Orbit},
  {id:"about",label:"About",icon:Info},
];

export default function AppShell({page,setPage,children}){
  const [healthy,setHealthy]=useState(null);
  useEffect(()=>{let alive=true;api.health().then(()=>alive&&setHealthy(true)).catch(()=>alive&&setHealthy(false));return()=>{alive=false}},[]);
  return <div className="min-h-screen bg-[#020712] text-slate-100">
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-[244px] overflow-hidden border-r border-[#20283b] bg-[#030816] lg:block">
      <div className="absolute inset-x-0 bottom-0 h-[56%] opacity-75">
        <SpaceScene/>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-[#030816] via-[#030816]/25 to-transparent"/>
      <div className="relative z-10 flex h-full flex-col px-[14px] py-6">
        <button onClick={()=>setPage("dashboard")} className="flex items-center gap-3 px-2 text-left">
          <div className="flex h-[56px] w-[56px] items-center justify-center rounded-full border border-violet-400/50 bg-violet-500/[.05] text-violet-300 shadow-[0_0_22px_rgba(124,92,255,.12)]">
            <Telescope size={27} strokeWidth={1.55}/>
          </div>
          <div>
            <div className="text-[20px] font-medium tracking-[.12em] text-white">DRISHTI</div>
            <div className="text-[13px] text-slate-400">Exoplanet AI</div>
          </div>
        </button>

        <nav className="mt-8 space-y-1">
          {nav.map(({id,label,icon:Icon})=>{
            const active=page===id;
            return <button key={id} onClick={()=>setPage(id)}
              className={`flex h-[48px] w-full items-center gap-4 rounded-lg px-3 text-[15px] transition ${
                active
                ? "bg-violet-500/[.13] text-violet-300 shadow-[inset_0_0_20px_rgba(124,92,255,.04)]"
                : "text-slate-300 hover:bg-white/[.035] hover:text-white"
              }`}>
              <Icon size={20} strokeWidth={active?2:1.7}/>
              <span>{label}</span>
            </button>
          })}
        </nav>

        <div className="mt-4 flex items-center justify-between border-t border-white/[.07] pt-4 px-2"><span className="text-[11px] text-slate-500">Backend</span><span className={healthy===true?"text-[10px] text-emerald-400":"text-[10px] text-slate-500"}>● {healthy===true?"Connected":healthy===false?"Offline":"Checking"}</span></div>
        <div className="mt-6 px-2">
          <p className="text-[12px] uppercase tracking-[.05em] text-slate-500">AI MODEL</p>
          <p className="mt-3 text-[14px] text-slate-200">Random Forest</p>
          <div className="mt-4 h-[7px] overflow-hidden rounded-full bg-slate-800">
            <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-violet-600 to-violet-400"/>
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-slate-500"><span>Model Confidence</span><span>82%</span></div>
        </div>

        <div className="mt-auto rounded-xl border border-violet-400/15 bg-[#080f20]/90 p-4 backdrop-blur-sm">
          <p className="text-[14px] font-medium text-slate-200">Built for the Stars</p>
          <p className="mt-2 flex gap-2 text-[11px] leading-5 text-slate-400"><Sparkles size={14} className="mt-0.5 shrink-0 text-violet-400"/>AI-powered exoplanet detection from light curves.</p>
        </div>
      </div>
    </aside>

    <main className="min-h-screen lg:pl-[244px]">{children}</main>
  </div>
}
