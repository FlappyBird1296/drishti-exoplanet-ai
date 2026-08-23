import {
    ResponsiveContainer,
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceLine,
    ReferenceArea,
    Line,
} from "recharts";


function buildBinnedCurve(data, bins = 80) {

    if (!data.length) {
        return [];
    }

    const sorted = [...data].sort(
        (a, b) => a.phase - b.phase
    );

    const minPhase = -0.5;
    const maxPhase = 0.5;

    const binWidth =
        (maxPhase - minPhase) / bins;

    const result = [];

    for (let i = 0; i < bins; i++) {

        const start =
            minPhase + i * binWidth;

        const end =
            start + binWidth;

        const points = sorted.filter(
            (point) =>
                point.phase >= start &&
                point.phase < end
        );

        if (!points.length) {
            continue;
        }

       const values = points
            .map((point) => point.relativeFlux)
            .sort((a, b) => a - b);

        const middle =
            Math.floor(values.length / 2);

        const median =
            values.length % 2 === 0
                ? (
                    values[middle - 1] +
                    values[middle]
                ) / 2
                : values[middle];

        result.push({
            phase: (start + end) / 2,
            relativeFlux: median,
        });

    }

    return result;
}


export default function PhaseFoldedChart({
    data = [],
    periodDays,
    transitDurationDays,
}) {

    if (!data.length) {

        return (
            <div className="
                flex
                h-full
                items-center
                justify-center
                text-sm
                text-slate-400
            ">
                Phase-folded signal unavailable.
            </div>
        );
    }


    // ----------------------------------------
    // Calculate median flux
    // ----------------------------------------

    const fluxValues = data
        .map(
            (point) =>
                Number(point.flux)
        )
        .filter(Number.isFinite);


    const sortedFlux = [
        ...fluxValues
    ].sort(
        (a, b) => a - b
    );


    const middle =
        Math.floor(
            sortedFlux.length / 2
        );


    const medianFlux =
        sortedFlux.length % 2 === 0
            ? (
                sortedFlux[middle - 1] +
                sortedFlux[middle]
            ) / 2
            : sortedFlux[middle];


    // ----------------------------------------
    // Convert flux to percentage deviation
    //
    // Example:
    // 1.0000 -> 0%
    // 0.9980 -> -0.2%
    // ----------------------------------------

    const relativeData = data
        .map((point) => {

            const flux =
                Number(point.flux);

            const phase =
                Number(point.phase);

            if (
                !Number.isFinite(flux) ||
                !Number.isFinite(phase)
            ) {
                return null;
            }

            return {
                phase,
                flux,
                relativeFlux:
                    (
                        (flux / medianFlux) -
                        1
                    ) * 100,
            };
        })
        .filter(Boolean);


    const binnedData =
        buildBinnedCurve(
            relativeData,
            200
        );


    // ----------------------------------------
    // Determine Y-axis range
    // ----------------------------------------

    const values =
        relativeData.map(
            (point) =>
                point.relativeFlux
        );


    const minValue =
        Math.min(...values);

    const maxValue =
        Math.max(...values);

    const range =
        Math.max(
            maxValue - minValue,
            0.01
        );

    const padding =
        range * 0.15;

    const transitPhaseWidth =
        periodDays &&
        transitDurationDays
            ? transitDurationDays / periodDays
            : 0.005;

    const transitHalfWidth =
        transitPhaseWidth / 2;

    return (
        <ResponsiveContainer
            width="100%"
            height="100%"
        >

            <ScatterChart
                margin={{
                    top: 15,
                    right: 25,
                    left: 10,
                    bottom: 20,
                }}
            >

                <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    vertical={false}
                />


                <XAxis
                    type="number"
                    dataKey="phase"
                    domain={[-0.5, 0.5]}
                    tick={{
                        fontSize: 10,
                        fill: "#64748b",
                    }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) =>
                        Number(value).toFixed(2)
                    }
                    label={{
                        value: "Orbital Phase",
                        position: "insideBottom",
                        offset: -10,
                        fill: "#64748b",
                        fontSize: 11,
                    }}
                />


                <YAxis
                    type="number"
                    dataKey="relativeFlux"
                    domain={[
                        minValue - padding,
                        maxValue + padding,
                    ]}
                    tick={{
                        fontSize: 10,
                        fill: "#64748b",
                    }}
                    tickLine={false}
                    axisLine={false}
                    width={70}
                    tickFormatter={(value) =>
                        `${Number(value).toFixed(3)}%`
                    }
                    label={{
                        value: "Relative Flux",
                        angle: -90,
                        position: "insideLeft",
                        fill: "#64748b",
                        fontSize: 11,
                    }}
                />


                <Tooltip
                    formatter={(value) =>
                        [
                            `${Number(value).toFixed(4)}%`,
                            "Relative flux",
                        ]
                    }
                    labelFormatter={(value) =>
                        `Phase: ${Number(value).toFixed(3)}`
                    }
                />


                {/* Expected transit region */}

               <ReferenceArea
                    x1={-transitHalfWidth}
                    x2={transitHalfWidth}
                    fill="#8b5cf6"
                    fillOpacity={0.12}
                />


                {/* Transit center */}

                <ReferenceLine
                    x={0}
                    stroke="#8b5cf6"
                    strokeDasharray="5 5"
                    strokeOpacity={0.8}
                />


                {/* Raw observations */}

                <Scatter
                    data={relativeData}
                    fill="#6366f1"
                    opacity={0.18}
                    r={2}
                />


                {/* Binned signal */}

                <Line
                    data={binnedData}
                    type="monotone"
                    dataKey="relativeFlux"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{
                        r: 5,
                    }}
                />

            </ScatterChart>

        </ResponsiveContainer>
    );
}