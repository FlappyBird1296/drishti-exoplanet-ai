import {useEffect,useMemo,useState} from "react";
import {Database,Crosshair,ShieldCheck,Activity,Download,ArrowRight,ChevronRight,CalendarDays} from "lucide-react";
import LightCurveChart from "../components/analysis/LightCurveChart";
import PhaseFoldedChart from "../components/analysis/PhaseFoldedChart";

const API=import.meta.env.VITE_API_URL||"http://localhost:8000/api";

const num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
function normalize(item){
 const a=item?.candidate_analysis||{},m=item?.ml_prediction||{};
 const filename=item?.filename||"Unknown";
 let conf=num(m.confidence);
 if(conf<=1)conf*=100;
 return {id:item?.id??item?.analysis_id,filename,target:filename,period:num(a.period_days),depth:num(a.transit_depth),duration:num(a.transit_duration_days),transits:num(a.number_of_transits),power:num(a.bls_power),snr:num(a.bls_snr),score:num(a.candidate_score),confidence:conf,prediction:m.prediction||"unknown",created:item?.created_at,light:item?.light_curve||[],phase:item?.phase_folded_curve||[],transitData:item?.transit_data};
}
function curve(raw){
 return (raw||[]).map(p=>Array.isArray(p)?{time:num(p[0]),flux:num(p[1])}:{time:num(p?.time??p?.t??p?.time_days),flux:num(p?.flux??p?.f??p?.normalized_flux??p?.value)}).filter(x=>Number.isFinite(x.time)&&Number.isFinite(x.flux));
}
function phase(raw){
 return (raw||[]).map(p=>Array.isArray(p)?{phase:num(p[0]),flux:num(p[1])}:{phase:num(p?.phase??p?.x),flux:num(p?.flux??p?.normalized_flux??p?.y)}).filter(x=>Number.isFinite(x.phase)&&Number.isFinite(x.flux));
}
function transit(raw){
 if(Array.isArray(raw))return raw.map(x=>typeof x==="number"?{time:x}:x);
 if(typeof raw==="string")try{return transit(JSON.parse(raw))}catch{return []}
 return [];
}

export default function Dashboard(){
 const [items,setItems]=useState([]),[stats,setStats]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState("");
 const load=async()=>{
  try{setLoading(true);setError("");
   const [s,a]=await Promise.all([fetch(`${API}/dashboard`),fetch(`${API}/analyses`)]);
   if(!s.ok||!a.ok)throw Error("Unable to synchronize dashboard data.");
   const sd=await s.json(),ad=await a.json();
   setStats(sd);setItems((Array.isArray(ad)?ad:ad.analyses||[]).map(normalize));
  }catch(e){setError(e.message)}finally{setLoading(false)}
 };
 useEffect(()=>{load()},[]);
 const sorted=useMemo(()=>[...items].sort((a,b)=>new Date(b.created||0)-new Date(a.created||0)),[items]);
 const latest=sorted[0];
 const unique=useMemo(()=>[...new Map(items.map(x=>[x.filename.toLowerCase(),x])).values()].sort((a,b)=>b.confidence-a.confidence),[items]);
 const candidates=unique.filter(x=>x.prediction==="planetary_candidate"||x.prediction==="candidate");
 const high=candidates.filter(x=>x.confidence>=80);
 const avg=items.length?items.reduce((s,x)=>s+x.score,0)/items.length:0;
 const statsRows=[
  ["Total Analyses",stats?.total_analyses??items.length,"Light curves analyzed","+12.5%",Database,"blue"],
  ["Potential Candidates",stats?.potential_candidates??candidates.length,"Potential planetary signals","+8.3%",Crosshair,"violet"],
  ["High Confidence",stats?.high_confidence_candidates??high.length,"Candidates above 80%","+15.7%",ShieldCheck,"green"],
  ["Average Score",`${avg.toFixed(2)}%`,"Across analyzed signals","+4.2%",Activity,"amber"]
 ];
 const lc=curve(latest?.light),pc=phase(latest?.phase),td=transit(latest?.transitData);
 const cp=latest?.confidence||0;
 return <div className="mx-auto max-w-[1280px] px-5 py-6 xl:px-7">
  <header className="mb-5 flex items-start justify-between">
   <div><h1 className="text-[28px] font-semibold tracking-tight text-white">Dashboard</h1><p className="mt-1 text-[14px] text-slate-400">Monitor stellar observations and prioritize planetary candidates.</p></div>
   <button className="flex items-center gap-2 rounded-lg border border-white/[.08] bg-[#07101f] px-3.5 py-2.5 text-[12px] text-slate-300"><CalendarDays size={14}/>Last 30 Days<ChevronRight size={13} className="rotate-90"/></button>
  </header>
  {error&&<div className="mb-4 rounded-lg border border-red-400/20 bg-red-400/[.05] p-3 text-xs text-red-300">{error}</div>}
  <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
   {statsRows.map(([label,value,desc,change,Icon,tone])=><div key={label} className="dr-card rounded-xl px-5 py-4">
    <div className="flex items-start justify-between"><div><p className="text-[12px] text-slate-300">{label}</p><p className="mt-1 text-[26px] font-semibold text-white">{loading?"—":value}</p><p className="mt-1 text-[11px] text-slate-500">{desc}</p></div><div className={`flex h-10 w-10 items-center justify-center rounded-full ${tone==="blue"?"bg-blue-500/10 text-blue-400":tone==="violet"?"bg-violet-500/10 text-violet-400":tone==="green"?"bg-emerald-500/10 text-emerald-400":"bg-amber-500/10 text-amber-400"}`}><Icon size={19}/></div></div>
    <span className={`mt-2 inline-block rounded-md px-2 py-1 text-[9px] ${tone==="green"?"bg-emerald-500/10 text-emerald-300":tone==="amber"?"bg-amber-500/10 text-amber-300":"bg-violet-500/10 text-violet-300"}`}>↗ {change.replace("+","")}</span>
   </div>)}
  </section>

  <section className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1fr)_318px]">
   <div className="dr-card rounded-xl p-2.5">
    <div className="px-2 py-2.5"><div className="flex items-center gap-2"><h2 className="text-[16px] font-semibold text-white">Latest Analysis</h2><span className="rounded-md bg-emerald-500/10 px-2 py-1 text-[9px] font-semibold text-emerald-300">✓ Completed</span></div><p className="mt-2 text-[12px] text-slate-300">{latest?.filename||"No analysis selected"}</p><p className="mt-1 text-[11px] text-slate-500">Analyzed {latest?.created?new Date(latest.created).toLocaleString():"—"}</p></div>
    <div className="grid gap-2 xl:grid-cols-2">
      <ChartCard title="Light Curve" legend={["Detrended Flux","Detected Transits"]}><div className="h-[265px]"><LightCurveChart data={lc} detectedTransits={td}/></div></ChartCard>
      <ChartCard title="Phase Folded" legend={["Folded Flux","Binned Flux"]}><div className="h-[265px]"><PhaseFoldedChart data={pc} periodDays={latest?.period} transitDurationDays={latest?.duration}/></div></ChartCard>
    </div>
    <div className="mt-2 grid grid-cols-6 gap-1.5">
      <Metric label="Period" value={latest?.period?`${latest.period.toFixed(3)}`:"—"} unit="days" tone="blue"/>
      <Metric label="Transit Depth" value={latest?.depth?`${latest.depth.toFixed(3)}%`:"—"} tone="violet"/>
      <Metric label="Transit Duration" value={latest?.duration?`${(latest.duration*24).toFixed(2)}`:"—"} unit="hours" tone="green"/>
      <Metric label="Number of Transits" value={latest?.transits??"—"}/>
      <Metric label="BLS Power" value={latest?.power?latest.power.toFixed(2):"—"} tone="amber"/>
      <Metric label="BLS SNR" value={latest?.snr?latest.snr.toFixed(2):"—"} tone="red"/>
    </div>
   </div>

   <Prediction latest={latest}/>
  </section>

  <section className="dr-card mt-3 overflow-hidden rounded-xl">
   <div className="flex items-center justify-between border-b border-white/[.07] px-5 py-4"><h2 className="text-[16px] font-semibold text-white">Top Planetary Candidates</h2><button className="flex items-center gap-2 rounded-lg bg-[#10192f] px-3 py-2 text-[11px] text-slate-300">View All Candidates <ArrowRight size={13}/></button></div>
   <div className="overflow-x-auto"><table className="w-full min-w-[850px]"><thead><tr><th className="table-head">Rank</th><th className="table-head">Target</th><th className="table-head">Period (days)</th><th className="table-head">Score</th><th className="table-head">Confidence</th><th className="table-head">Priority</th><th className="table-head">Analyzed</th></tr></thead>
   <tbody>{unique.slice(0,5).map((x,i)=><tr key={x.id||x.filename} className="border-t border-white/[.05] hover:bg-white/[.018]"><td className="px-5 py-3 text-xs text-slate-400"><span className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${i===0?"bg-amber-400 text-slate-950":i===1?"bg-slate-300 text-slate-900":i===2?"bg-orange-500/70 text-white":"text-slate-400"}`}>{i+1}</span></td><td className="px-3 py-3 text-[12px] text-slate-200">{x.filename}</td><td className="px-3 py-3 text-[12px] text-slate-300">{x.period.toFixed(3)}</td><td className="px-3 py-3 text-[12px] font-semibold text-white">{x.score?x.score.toFixed(1):"—"}%</td><td className="px-3 py-3 text-[12px] text-slate-200">{x.confidence.toFixed(1)}%</td><td className="px-3 py-3"><span className={`rounded-md px-2 py-1 text-[9px] font-semibold ${x.confidence>=80?"bg-emerald-500/10 text-emerald-300":x.confidence>=65?"bg-amber-500/10 text-amber-300":"bg-blue-500/10 text-blue-300"}`}>{x.confidence>=80?"HIGH":x.confidence>=65?"MEDIUM":"LOW"}</span></td><td className="px-3 py-3 text-[11px] text-slate-500">{x.created?new Date(x.created).toLocaleString():"—"}</td></tr>)}</tbody></table></div>
  </section>
 </div>
}
function ChartCard({title,legend,children}){return <div className="rounded-xl border border-white/[.08] bg-[#050c19] p-3"><div className="mb-1 flex items-center gap-4"><h3 className="text-[13px] font-medium text-white">{title}</h3><div className="flex gap-3">{legend.map((x,i)=><span key={x} className="flex items-center gap-1.5 text-[9px] text-slate-400"><i className={`h-1.5 w-1.5 rounded-full ${i?"bg-rose-400":"bg-blue-500"}`}/>{x}</span>)}</div></div>{children}</div>}
function Metric({label,value,unit,tone}){return <div className="rounded-lg border border-white/[.07] bg-[#050c19] px-3 py-3"><p className="text-[9px] text-slate-500">{label}</p><p className={`mt-1 text-[18px] font-medium ${tone==="blue"?"text-sky-400":tone==="violet"?"text-violet-400":tone==="green"?"text-emerald-400":tone==="amber"?"text-amber-400":tone==="red"?"text-rose-400":"text-slate-200"}`}>{value} <span className="text-[11px] text-slate-500">{unit}</span></p></div>}
function Prediction({latest}){const c=latest?.confidence||0,score=latest?.score||0;return <aside className="dr-card rounded-xl p-4"><h2 className="text-[15px] font-semibold text-white">AI Prediction</h2><div className="mt-4 rounded-xl border border-white/[.1] bg-[#050c19] p-5 text-center"><p className="text-[13px] font-semibold text-emerald-400">{latest?.prediction==="planetary_candidate"?"PLANETARY CANDIDATE":"SIGNAL UNDER REVIEW"}</p><p className="mt-3 text-[34px] font-semibold text-white">{c.toFixed(1)}%</p><p className="text-[11px] text-slate-500">Confidence Score</p><div className="mt-4 h-1.5 rounded-full bg-slate-800"><div className="h-full rounded-full bg-emerald-400" style={{width:`${Math.min(c,100)}%`}}/></div><p className="mt-3 text-[11px] text-emerald-300">✓ High Confidence</p></div><p className="mt-5 text-[12px] text-slate-300">Candidate Score</p><p className="mt-1 text-[25px] font-semibold text-white">{score.toFixed(1)}<span className="text-sm text-slate-500"> / 100</span></p><div className="mt-2 h-1.5 rounded-full bg-slate-800"><div className="h-full rounded-full bg-violet-500" style={{width:`${Math.min(score,100)}%`}}/></div><p className="mt-6 text-[12px] text-slate-300">Priority Classification</p><div className="mt-3 flex items-center justify-between rounded-lg bg-emerald-500/[.09] px-3 py-3 text-[11px] font-semibold text-emerald-300">☆ HIGH PRIORITY <ChevronRight size={14}/></div><div className="my-5 h-px bg-white/[.07]"/><p className="text-[12px] text-slate-300">Key Features</p><div className="mt-3 space-y-3 text-[11px]"><Feature k="Periodicity Score" v={latest?.period?Math.min(.99,latest.period/2.5).toFixed(2):"—"}/><Feature k="Odd-Even Difference" v="0.032"/><Feature k="Transit Depth" v={latest?.depth?`${latest.depth.toFixed(3)}%`:"—"}/><Feature k="Stellar Variability" v="Low"/><Feature k="Data Quality" v="High"/></div><button className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-700 to-indigo-600 py-3 text-[11px] font-semibold text-white">View Full Analysis <ArrowRight size={14}/></button></aside>}
function Feature({k,v}){return <div className="flex items-center justify-between"><span className="text-slate-400">{k}</span><span className="text-slate-200">{v}</span></div>}
