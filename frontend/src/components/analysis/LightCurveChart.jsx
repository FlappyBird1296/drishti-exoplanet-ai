import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";

function finiteNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function normalizeData(data) {
  return (Array.isArray(data) ? data : [])
    .map((d) => ({
      time: finiteNumber(d?.time ?? d?.t ?? d?.time_days),
      flux: finiteNumber(
        d?.flux ??
        d?.relativeFlux ??
        d?.normalized_flux ??
        d?.value ??
        d?.f
      ),
    }))
    .filter(
      (d) =>
        Number.isFinite(d.time) &&
        Number.isFinite(d.flux)
    );
}

export default function LightCurveChart({
  data = [],
  detectedTransits = [],
}) {
  const points = normalizeData(data);

  if (!points.length) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-slate-500">
        Upload a light curve to visualize the stellar flux.
      </div>
    );
  }

  const fluxValues = points.map((p) => p.flux);

  const minFlux = Math.min(...fluxValues);
  const maxFlux = Math.max(...fluxValues);

  const range = Math.max(maxFlux - minFlux, 0.001);

  // Tight scientific Y-axis.
  const padding = Math.max(range * 0.18, 0.001);

  const yMin = minFlux - padding;
  const yMax = maxFlux + padding;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={points}
        margin={{
          top: 10,
          right: 16,
          left: 4,
          bottom: 30,
        }}
      >
        <CartesianGrid
          strokeDasharray="3 4"
          stroke="rgba(100,116,139,0.13)"
          vertical={false}
        />

        <XAxis
          dataKey="time"
          type="number"
          domain={["dataMin", "dataMax"]}
          tick={{
            fontSize: 10,
            fill: "#64748b",
          }}
          tickLine={false}
          axisLine={{
            stroke: "rgba(148,163,184,0.16)",
          }}
          tickFormatter={(value) =>
            Number(value).toFixed(1)
          }
          label={{
            value: "Time (BJD - 2457000)",
            position: "insideBottom",
            offset: -18,
            fill: "#64748b",
            fontSize: 10,
          }}
        />

        <YAxis
          type="number"
          domain={[yMin, yMax]}
          tick={{
            fontSize: 10,
            fill: "#64748b",
          }}
          tickLine={false}
          axisLine={false}
          width={48}
          tickFormatter={(value) =>
            Number(value).toFixed(3)
          }
          label={{
            value: "Relative Flux",
            angle: -90,
            position: "insideLeft",
            fill: "#64748b",
            fontSize: 10,
          }}
        />

        <Tooltip
          cursor={{
            stroke: "rgba(148,163,184,0.2)",
          }}
          contentStyle={{
            background: "#071020",
            border: "1px solid rgba(148,163,184,0.18)",
            borderRadius: 8,
            color: "#e5e7eb",
            fontSize: 11,
          }}
          formatter={(value) => [
            Number(value).toFixed(6),
            "Relative Flux",
          ]}
          labelFormatter={(value) =>
            `BJD ${Number(value).toFixed(5)}`
          }
        />

        {(Array.isArray(detectedTransits)
          ? detectedTransits
          : []
        ).map((transit, index) => {
          const time = finiteNumber(
            transit?.time ??
            transit?.transit_time ??
            transit?.center_time ??
            transit?.epoch ??
            transit
          );

          if (!Number.isFinite(time)) {
            return null;
          }

          return (
            <ReferenceLine
              key={`transit-${index}`}
              x={time}
              stroke="#ff496c"
              strokeDasharray="4 4"
              strokeWidth={1}
              strokeOpacity={0.9}
            />
          );
        })}

        <Line
          type="monotone"
          dataKey="flux"
          stroke="#2386ff"
          strokeWidth={1.25}
          dot={false}
          activeDot={{
            r: 3,
            fill: "#2386ff",
            stroke: "#071020",
            strokeWidth: 1,
          }}
          isAnimationActive={false}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
}