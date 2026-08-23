import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceArea,
} from "recharts";

export default function LightCurveChart({
    data = [],
    detectedTransits = [],
}) {

    if (!data.length) {
        

        return (
            <div className="
                flex
                h-full
                min-h-[320px]
                items-center
                justify-center
                text-sm
                text-slate-400
            ">
                Upload a light curve to visualize
                the stellar flux.
            </div>
        );
    }
    const times = data.map(
            (point) => Number(point.time)
        );

        const timeSpan =
            Math.max(...times) -
            Math.min(...times);

        const markerWidth =
            timeSpan * 0.003;

        const transitMarkers =
            detectedTransits
                .map((transit) => ({
                    time: Number(transit.time),
                    depth: Number(transit.depth),
                }))
                .filter(
                    (transit) =>
                        Number.isFinite(transit.time)
                );

    return (
        <ResponsiveContainer
            width="100%"
            height="100%"
        >

            <LineChart
                data={data}
                margin={{
                    top: 15,
                    right: 20,
                    left: 0,
                    bottom: 5,
                }}
            >

                <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    vertical={false}
                />

                <XAxis
                    dataKey="time"
                    tick={{
                        fontSize: 10,
                        fill: "#94a3b8",
                    }}
                    tickLine={false}
                    axisLine={false}
                />

                <YAxis
                    tick={{
                        fontSize: 10,
                        fill: "#94a3b8",
                    }}
                    tickLine={false}
                    axisLine={false}
                    width={55}
                />

                <Tooltip
                    contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        boxShadow:
                            "0 10px 30px rgba(15,23,42,0.08)",
                    }}
                    labelStyle={{
                        color: "#475569",
                    }}
                />

                {transitMarkers.map(
                    (transit, index) => (
                        <ReferenceArea
                            key={`transit-${index}`}
                            x1={
                                transit.time -
                                markerWidth
                            }
                            x2={
                                transit.time +
                                markerWidth
                            }
                            fill="#8b5cf6"
                            fillOpacity={0.12}
                            stroke="#8b5cf6"
                            strokeOpacity={0.45}
                        />
                    )
                )}

                <Line
                    type="monotone"
                    dataKey="flux"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{
                        r: 4,
                    }}
                />
               
            </LineChart>

        </ResponsiveContainer>
    );
}