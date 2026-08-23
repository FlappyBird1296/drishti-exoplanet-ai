import { useEffect, useMemo, useState } from "react";
import {
    Activity,
    Database,
    Sparkles,
    TrendingUp,
    RefreshCw,
    ArrowUpRight,
} from "lucide-react";

const API_BASE =
    import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export default function Dashboard() {
    const [analyses, setAnalyses] = useState([]);
    const [dashboardStats, setDashboardStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedCandidateId, setSelectedCandidateId] = useState(null);

    const fetchAnalyses = async () => {
        try {
            setLoading(true);
            setError("");

            const [dashboardResponse, analysesResponse] =
                await Promise.all([
                    fetch(`${API_BASE}/dashboard`),
                    fetch(`${API_BASE}/analyses`),
                ]);

            if (!dashboardResponse.ok) {
                throw new Error(
                    `Dashboard API failed: ${dashboardResponse.status}`
                );
            }

            if (!analysesResponse.ok) {
                throw new Error(
                    `Analyses API failed: ${analysesResponse.status}`
                );
            }

            const dashboardData = await dashboardResponse.json();
            const analysesData = await analysesResponse.json();

            console.log("Dashboard stats:", dashboardData);
            console.log("Analyses:", analysesData);

            setDashboardStats(dashboardData);

            setAnalyses(
                Array.isArray(analysesData)
                    ? analysesData
                    : analysesData.analyses || []
            );

        } catch (err) {
            console.error("Dashboard API error:", err);
            setError(
                err.message || "Unable to load dashboard data."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalyses();
    }, []);

    /*
     * Normalize backend objects so the UI can tolerate
     * slightly different response structures.
     */
    const normalized = useMemo(() => {
        return analyses.map((item) => {
            const candidate = item.candidate_analysis || {};
            const ml = item.ml_prediction || {};

            const filename = item.filename || "Unknown Target";

            const ticName =
                filename
                    .replace(".csv", "")
                    .replace(/^TIC[_-]?/, "TIC ");

            const confidence =
                Number(ml.confidence ?? ml.candidate_probability ?? 0);

            return {
                id: item.id ?? item.analysis_id,
                name: ticName,
                filename,
                prediction: ml.prediction || "unknown",
                confidence,
                period: Number(candidate.period_days ?? 0),
                transitDepth: Number(candidate.transit_depth ?? 0),
                transitCount: Number(candidate.number_of_transits ?? 0),
                dataPoints: Number(
                    item.data?.original_points ??
                    item.data?.cleaned_points ??
                    0
                ),
                createdAt: item.created_at,
            };
        });
    }, [analyses]);

    /*
 * Unique targets
 *
 * Multiple analyses can exist for the same TIC target.
 * For dashboard candidate metrics, count each target once.
 */
    const uniqueTargets = useMemo(() => {
        const unique = new Map();

        for (const candidate of normalized) {
            const key = candidate.filename
                .toLowerCase()
                .replace(/\.csv$/, "");

            const existing = unique.get(key);

            // Keep the strongest result for this target
            if (
                !existing ||
                candidate.confidence > existing.confidence
            ) {
                unique.set(key, candidate);
            }
        }

        return Array.from(unique.values());
    }, [normalized]);


    /*
     * Dashboard metrics
     */
    const stats = useMemo(() => {
        const candidates = uniqueTargets.filter(
            (item) =>
                item.prediction === "planetary_candidate" ||
                item.prediction === "candidate"
        );

        const highConfidence = candidates.filter(
            (item) => item.confidence >= 0.75
        );

        const transitSignals = normalized.reduce(
            (sum, item) => sum + item.transitCount,
            0
        );

        const dataPoints = normalized.reduce(
            (sum, item) => sum + item.dataPoints,
            0
        );

        return [
            {
                label: "Analyses",
                value: normalized.length.toLocaleString(),
                icon: Activity,
            },
            {
                label: "Candidates",
                value: candidates.length.toLocaleString(),
                icon: Sparkles,
            },
            {
                label: "High Confidence",
                value: highConfidence.length.toLocaleString(),
                icon: TrendingUp,
            },
            {
                label: "Transit Events",
                value: transitSignals.toLocaleString(),
                icon: Database,
            },
        ];
    }, [normalized, uniqueTargets]);

    /*
     * Highest-confidence recent candidates
     */
    const recentCandidates = useMemo(() => {
        return [...uniqueTargets]
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, 5);
    }, [uniqueTargets]);

    /*
     * Best current candidate
     */
    const topCandidate =
        recentCandidates.find(
            (candidate) => candidate.id === selectedCandidateId
        ) || recentCandidates[0];

    const orbitDuration = topCandidate
        ? Math.max(
            12,
            Math.min(
                28,
                28 - Math.log10(Math.max(topCandidate.period, 0.01)) * 5
            )
        )
        : 18;

    const planetSize = topCandidate
        ? Math.max(
            18,
            Math.min(
                34,
                18 + topCandidate.transitDepth * 10000
            )
        )
        : 22;

    const confidenceGlow = topCandidate
        ? Math.min(
            0.9,
            Math.max(
                0.35,
                topCandidate.confidence
            )
        )
        : 0.5;

    return (
        <div className="mx-auto max-w-[1500px] p-5 md:p-8">

            {/* Header */}
            <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">

                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
                        Observatory
                    </p>

                    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
                        Exoplanet Intelligence
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                        Monitor stellar observations, evaluate transit signals,
                        and prioritize promising planetary candidates.
                    </p>
                </div>

                <button
                    onClick={fetchAnalyses}
                    className="
                        inline-flex
                        items-center
                        gap-2
                        self-start
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        px-4
                        py-2.5
                        text-sm
                        font-medium
                        text-slate-700
                        shadow-sm
                        transition
                        hover:border-violet-200
                        hover:text-violet-600
                        md:self-auto
                    "
                >
                    <RefreshCw
                        size={16}
                        className={loading ? "animate-spin" : ""}
                    />
                    Refresh
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                    <strong>Dashboard API error:</strong> {error}
                </div>
            )}

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                {stats.map((stat) => {
                    const Icon = stat.icon;

                    return (
                        <div
                            key={stat.label}
                            className="
                                rounded-2xl
                                border
                                border-slate-200
                                bg-white
                                p-5
                                shadow-sm
                            "
                        >
                            <div className="flex items-start justify-between">

                                <div>
                                    <p className="text-xs font-medium text-slate-400">
                                        {stat.label}
                                    </p>

                                    <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                                        {loading ? "—" : stat.value}
                                    </p>
                                </div>

                                <div
                                    className="
                                        flex
                                        h-10
                                        w-10
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-violet-50
                                        text-violet-600
                                    "
                                >
                                    <Icon size={19} />
                                </div>
                            </div>

                            <p className="mt-4 text-xs font-medium text-slate-400">
                                Live backend data
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Main Observatory */}
            <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_0.8fr]">

                {/* 3D Observatory */}
                <div
                    className="
                        relative
                        min-h-[420px]
                        overflow-hidden
                        rounded-3xl
                        bg-[#080b18]
                        shadow-xl
                    "
                >

                    {/* Header */}
                    <div className="absolute left-6 top-6 z-10">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
                            Stellar Observatory
                        </p>

                        <h2 className="mt-2 text-xl font-semibold text-white">
                            Active observation field
                        </h2>
                    </div>

                    {/* Data-driven Observatory */}
                    <div className="absolute inset-0 overflow-hidden">

                        {/* Ambient nebula */}
                        <div
                            className="
            absolute
            left-1/2
            top-1/2
            h-[420px]
            w-[420px]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-violet-500/10
            blur-3xl
        "
                        />

                        {/* Star system */}
                        <div
                            className="
            absolute
            left-1/2
            top-1/2
            h-[230px]
            w-[230px]
            -translate-x-1/2
            -translate-y-1/2
        "
                        >

                            {/* Outer stellar glow */}
                            <div
                                className="
                absolute
                inset-[-35px]
                rounded-full
                bg-yellow-300/10
                blur-2xl
            "
                            />

                            {/* Star */}
                            <div
                                className="
                absolute
                left-1/2
                top-1/2
                h-[150px]
                w-[150px]
                -translate-x-1/2
                -translate-y-1/2
                rounded-full
                bg-gradient-to-br
                from-yellow-100
                via-amber-100
                to-yellow-200
                shadow-[0_0_70px_rgba(255,220,120,0.45)]
            "
                            />

                            {/* Inner star glow */}
                            <div
                                className="
                absolute
                left-1/2
                top-1/2
                h-[175px]
                w-[175px]
                -translate-x-1/2
                -translate-y-1/2
                rounded-full
                border
                border-yellow-100/10
            "
                            />
                        </div>

                        {/* Orbit 1 */}
                        <div
                            className="
            absolute
            left-1/2
            top-1/2
            h-[180px]
            w-[420px]
            -translate-x-1/2
            -translate-y-1/2
            rounded-[50%]
            border
            border-violet-400/30
        "
                            style={{
                                transform: "translate(-50%, -50%) rotate(-8deg)",
                            }}
                        />

                        {/* Orbit 2 */}
                        <div
                            className="
            absolute
            left-1/2
            top-1/2
            h-[300px]
            w-[610px]
            -translate-x-1/2
            -translate-y-1/2
            rounded-[50%]
            border
            border-violet-400/15
        "
                            style={{
                                transform: "translate(-50%, -50%) rotate(8deg)",
                            }}
                        />

                        {/* Animated planet */}
                        {topCandidate && (
                            <div
                                className="
        absolute
        left-1/2
        top-1/2
        h-[180px]
        w-[420px]
        -translate-x-1/2
        -translate-y-1/2
    "
                            >
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        animation: `drishtiOrbit ${orbitDuration}s linear infinite`,
                                    }}
                                >
                                    <div
                                        className="
                absolute
                right-[-10px]
                top-1/2
                -translate-y-1/2
                rounded-full
                bg-gradient-to-br
                from-violet-200
                via-violet-400
                to-indigo-900
            "
                                        style={{
                                            width: `${planetSize}px`,
                                            height: `${planetSize}px`,
                                            boxShadow: `
                    0 0 ${25 * confidenceGlow}px
                    rgba(167,139,250,${confidenceGlow})
                `,
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Candidate information */}
                        {topCandidate && (
                            <div
                                className="
                absolute
                bottom-20
                left-1/2
                -translate-x-1/2
                rounded-full
                border
                border-white/10
                bg-black/20
                px-4
                py-2
                text-center
                backdrop-blur-md
            "
                            >
                                <p className="text-xs font-semibold text-white">
                                    {topCandidate.name}
                                </p>

                                <p className="mt-0.5 text-[10px] text-slate-400">
                                    {topCandidate.period.toFixed(3)} day orbit
                                    <span className="mx-2">•</span>
                                    {topCandidate.transitCount} transits
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Bottom status */}
                    <div
                        className="
                            absolute
                            bottom-5
                            left-6
                            right-6
                            flex
                            items-center
                            justify-between
                            rounded-2xl
                            border
                            border-white/10
                            bg-white/5
                            px-4
                            py-3
                            backdrop-blur
                        "
                    >
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-slate-500">
                                Observation status
                            </p>

                            <p className="mt-1 text-sm font-medium text-white">
                                {loading
                                    ? "Synchronizing..."
                                    : "Observatory synchronized"}
                            </p>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-emerald-300">
                            <span className="h-2 w-2 rounded-full bg-emerald-400" />
                            System Ready
                        </div>
                    </div>
                </div>

                {/* AI Assessment */}
                <div
                    className="
                        rounded-3xl
                        border
                        border-slate-200
                        bg-white
                        p-6
                        shadow-sm
                    "
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
                                AI Assessment
                            </p>

                            <h2 className="mt-2 text-lg font-semibold text-slate-900">
                                Top Candidate
                            </h2>
                        </div>

                        <Sparkles
                            size={20}
                            className="text-violet-500"
                        />
                    </div>

                    {topCandidate ? (
                        <div className="mt-8">

                            <p className="text-xs text-slate-400">
                                Target
                            </p>

                            <p className="mt-1 text-2xl font-semibold text-slate-900">
                                {topCandidate.name}
                            </p>

                            <p className="mt-1 text-sm capitalize text-slate-500">
                                {topCandidate.prediction.replaceAll("_", " ")}
                            </p>

                            <div className="mt-8">

                                <div className="flex items-end justify-between">
                                    <p className="text-sm text-slate-400">
                                        AI Confidence
                                    </p>

                                    <p className="text-3xl font-semibold text-violet-600">
                                        {(topCandidate.confidence * 100).toFixed(1)}%
                                    </p>
                                </div>

                                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                        className="h-full rounded-full bg-violet-500 transition-all"
                                        style={{
                                            width: `${Math.min(
                                                topCandidate.confidence * 100,
                                                100
                                            )}%`,
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="mt-8 grid grid-cols-2 gap-3">

                                <div className="rounded-xl bg-slate-50 p-4">
                                    <p className="text-[10px] uppercase tracking-wider text-slate-400">
                                        Period
                                    </p>

                                    <p className="mt-1 font-semibold text-slate-900">
                                        {topCandidate.period
                                            ? `${topCandidate.period.toFixed(3)} d`
                                            : "—"}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-slate-50 p-4">
                                    <p className="text-[10px] uppercase tracking-wider text-slate-400">
                                        Transits
                                    </p>

                                    <p className="mt-1 font-semibold text-slate-900">
                                        {topCandidate.transitCount || "—"}
                                    </p>
                                </div>

                            </div>

                        </div>
                    ) : (
                        <div className="flex min-h-[280px] items-center justify-center text-sm text-slate-400">
                            {loading
                                ? "Loading observations..."
                                : "No analysis data available."}
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Candidates */}
            <div
                className="
                    mt-6
                    rounded-3xl
                    border
                    border-slate-200
                    bg-white
                    shadow-sm
                "
            >

                <div className="flex items-center justify-between border-b border-slate-100 p-6">

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
                            Discovery Feed
                        </p>

                        <h2 className="mt-1 text-lg font-semibold text-slate-900">
                            Recent candidates
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                            Highest-confidence signals from the analysis pipeline.
                        </p>
                    </div>

                    <span
                        className="
                            rounded-full
                            bg-violet-50
                            px-3
                            py-1.5
                            text-[10px]
                            font-semibold
                            uppercase
                            tracking-wider
                            text-violet-600
                        "
                    >
                        Live
                    </span>
                </div>

                <div className="divide-y divide-slate-100">

                    {loading ? (
                        <div className="p-8 text-center text-sm text-slate-400">
                            Loading candidates...
                        </div>
                    ) : recentCandidates.length === 0 ? (
                        <div className="p-8 text-center text-sm text-slate-400">
                            No candidates found.
                        </div>
                    ) : (
                        recentCandidates.map((candidate, index) => (
                            <button
                                type="button"
                                key={candidate.filename}
                                onClick={() => setSelectedCandidateId(candidate.id)}
                                className={`
        flex
        w-full
        items-center
        justify-between
        gap-4
        px-6
        py-4
        text-left
        transition
        ${topCandidate?.id === candidate.id
                                        ? "bg-violet-50/60"
                                        : "hover:bg-slate-50"
                                    }
    `}
                            >

                                <div className="flex items-center gap-4">

                                    <div
                                        className="
                                            flex
                                            h-10
                                            w-10
                                            items-center
                                            justify-center
                                            rounded-xl
                                            bg-violet-50
                                            text-violet-600
                                        "
                                    >
                                        <Sparkles size={17} />
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">
                                            {candidate.name}
                                        </p>

                                        <p className="mt-0.5 text-xs capitalize text-slate-400">
                                            {candidate.prediction.replaceAll("_", " ")}
                                        </p>
                                    </div>

                                </div>

                                <div className="hidden items-center gap-8 sm:flex">

                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-slate-400">
                                            Period
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-slate-700">
                                            {candidate.period
                                                ? `${candidate.period.toFixed(3)} d`
                                                : "—"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-slate-400">
                                            Confidence
                                        </p>

                                        <p
                                            className={`mt-1 text-sm font-semibold ${candidate.confidence >= 0.75
                                                ? "text-emerald-600"
                                                : "text-violet-600"
                                                }`}
                                        >
                                            {(candidate.confidence * 100).toFixed(1)}%
                                        </p>
                                    </div>

                                </div>

                                <ArrowUpRight
                                    size={18}
                                    className={`
        transition-transform
        ${topCandidate?.id === candidate.id
                                            ? "text-violet-500"
                                            : "text-slate-300"
                                        }
    `}
                                />
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}