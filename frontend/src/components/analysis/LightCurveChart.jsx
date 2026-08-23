import {ResponsiveContainer,LineChart,Line,XAxis,YAxis,CartesianGrid,Tooltip,ReferenceLine} from "recharts";

export default function LightCurveChart({data=[],detectedTransits=[]}){
  if(!data.length) return <div className="flex h-full items-center justify-center text-xs text-slate-600">Upload a light curve to visualize the stellar flux.</div>;
  const xs=data.map(d=>Number(d.time)).filter(Number.isFinite);
  const min=Math.min(...xs),max=Math.max(...xs),span=Math.max(max-min,1);
  return <ResponsiveContainer width="100%" height="100%">
    <LineChart data={data} margin={{top:10,right:10,left:2,bottom:20}}>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,.12)" vertical={false}/>
      <XAxis dataKey="time" tick={{fontSize:10,fill:"#64748b"}} tickLine={false} axisLine={{stroke:"rgba(148,163,184,.16)"}} label={{value:"Time (BJD - 2457000)",position:"insideBottom",offset:-8,fill:"#64748b",fontSize:10}}/>
      <YAxis tick={{fontSize:10,fill:"#64748b"}} tickLine={false} axisLine={false} width={48} tickFormatter={v=>Number(v).toFixed(3)} label={{value:"Relative Flux",angle:-90,position:"insideLeft",fill:"#64748b",fontSize:10}}/>
      <Tooltip contentStyle={{background:"#071020",border:"1px solid rgba(148,163,184,.15)",borderRadius:8,color:"#e5e7eb",fontSize:11}}/>
      {(detectedTransits||[]).map((t,i)=>{
        const x=Number(t.time);
        return Number.isFinite(x)?<ReferenceLine key={i} x={x} stroke="#fb4b68" strokeDasharray="4 4" strokeOpacity={.8}/>:null
      })}
      <Line type="monotone" dataKey="flux" stroke="#2386ff" strokeWidth={1.4} dot={false} isAnimationActive={false}/>
    </LineChart>
  </ResponsiveContainer>
}
