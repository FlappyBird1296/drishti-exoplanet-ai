import {ResponsiveContainer,ScatterChart,Scatter,XAxis,YAxis,CartesianGrid,Tooltip,ReferenceLine,ReferenceArea,Line} from "recharts";

function median(a){const s=[...a].sort((x,y)=>x-y),m=Math.floor(s.length/2);return s.length%2?s[m]:(s[m-1]+s[m])/2}
function bin(data,bins=90){
  const out=[],w=1/bins;
  for(let i=0;i<bins;i++){
    const a=-.5+i*w,b=a+w,p=data.filter(x=>x.phase>=a&&x.phase<b);
    if(p.length)out.push({phase:(a+b)/2,relativeFlux:median(p.map(x=>x.relativeFlux))});
  }
  return out;
}
export default function PhaseFoldedChart({data=[],periodDays,transitDurationDays}){
  if(!data.length)return <div className="flex h-full items-center justify-center text-xs text-slate-600">Phase-folded signal unavailable.</div>;
  const mf=median(data.map(x=>Number(x.flux)).filter(Number.isFinite));
  const rel=data.map(x=>({phase:Number(x.phase),relativeFlux:(Number(x.flux)/mf-1)*100})).filter(x=>Number.isFinite(x.phase)&&Number.isFinite(x.relativeFlux));
  const vals=rel.map(x=>x.relativeFlux),lo=Math.min(...vals),hi=Math.max(...vals),pad=Math.max((hi-lo)*.15,.01);
  const tw=periodDays&&transitDurationDays?transitDurationDays/periodDays:.06;
  return <ResponsiveContainer width="100%" height="100%">
    <ScatterChart margin={{top:10,right:10,left:2,bottom:20}}>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,.12)" vertical={false}/>
      <XAxis type="number" dataKey="phase" domain={[-.5,.5]} tick={{fontSize:10,fill:"#64748b"}} tickLine={false} axisLine={{stroke:"rgba(148,163,184,.16)"}} label={{value:"Phase",position:"insideBottom",offset:-8,fill:"#64748b",fontSize:10}}/>
      <YAxis type="number" dataKey="relativeFlux" domain={[lo-pad,hi+pad]} tick={{fontSize:10,fill:"#64748b"}} tickLine={false} axisLine={false} width={48} tickFormatter={v=>Number(v).toFixed(3)}/>
      <Tooltip contentStyle={{background:"#071020",border:"1px solid rgba(148,163,184,.15)",borderRadius:8,color:"#e5e7eb",fontSize:11}}/>
      <ReferenceArea x1={-tw/2} x2={tw/2} fill="#a855f7" fillOpacity={.08}/>
      <ReferenceLine x={0} stroke="#a855f7" strokeDasharray="4 4" strokeOpacity={.75}/>
      <Scatter data={rel} fill="#1677ff" opacity={.38} r={1.7}/>
      <Line data={bin(rel)} type="monotone" dataKey="relativeFlux" stroke="#ff496c" strokeWidth={2.2} dot={false} isAnimationActive={false}/>
    </ScatterChart>
  </ResponsiveContainer>
}
