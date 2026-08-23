import {
    useEffect,
    useMemo,
    useState,
} from "react";


import {
    Search,
    SlidersHorizontal,
    ChevronRight,
    Sparkles,
    Activity,
    Orbit,
    Target,
} from "lucide-react";

const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:8000/api";

function confidenceStyle(value) {

    if (value >= 75) {
        return {
            text: "text-emerald-600",
            bg: "bg-emerald-50",
            bar: "bg-emerald-500",
        };
    }

    if (value >= 50) {
        return {
            text: "text-violet-600",
            bg: "bg-violet-50",
            bar: "bg-violet-500",
        };
    }

    return {
        text: "text-amber-600",
        bg: "bg-amber-50",
        bar: "bg-amber-500",
    };
}


export default function Candidates({
    setPage,
    setSelectedAnalysisId,
}) {

    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchCandidates();
    }, []);

    async function fetchCandidates() {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_BASE_URL}/candidates`
            );

            if (!response.ok) {
                throw new Error(
                    `Server returned ${response.status}`
                );
            }

            const data = await response.json();

            const uniqueCandidates = Array.from(
                new Map(
                    (data.candidates || []).map((item) => {
                        const filename = item.filename || "";

                        const target = filename
                            .replace(/\.[^/.]+$/, "")
                            .replace(/_/g, " ");

                        return [target, item];
                    })
                ).values()
            );

            const formattedCandidates =
                uniqueCandidates.map((item, index) => {
                    const analysis =
                        item.candidate_analysis || {};

                    const prediction =
                        item.ml_prediction || {};

                    const filename =
                        item.filename || "";

                    const target = filename
                        .replace(/\.[^/.]+$/, "")
                        .replace(/_/g, " ");

                    return {
                        id: item.id,
                        rank: index + 1,
                        target,

                        period:
                            Number(analysis.period_days) || 0,

                        depth:
                            Number(analysis.transit_depth) || 0,

                        duration:
                            Number(
                                analysis.transit_duration_days
                            ) || 0,

                        blsPower:
                            Number(analysis.bls_power) || 0,

                        confidence:
                            Number(prediction.confidence) * 100 || 0,

                        candidateProbability:
                            Number(
                                prediction.candidate_probability
                            ) || 0,

                        transitCount:
                            Number(
                                analysis.number_of_transits
                            ) || 0,

                        classification:
                            prediction.prediction ===
                                "planetary_candidate"
                                ? "Planetary Candidate"
                                : "Needs Review",
                    };
                });

            setCandidates(formattedCandidates);
        } catch (err) {
            console.error(
                "Failed to load candidates:",
                err
            );

            setError(
                "Unable to load candidate data from the analysis server."
            );
        } finally {
            setLoading(false);
        }
    }

    const filteredCandidates = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return candidates;
        }

        return candidates.filter((candidate) =>
            candidate.target
                .toLowerCase()
                .includes(query)
        );
    }, [candidates, search]);

    const highConfidenceCount =
        candidates.filter(
            (candidate) => candidate.confidence >= 75
        ).length;

    const transitSignalCount =
        candidates.reduce(
            (total, candidate) =>
                total + candidate.transitCount,
            0
        );

    return (
        <div className="min-h-full bg-slate-50">

            {/* Header */}

            <div className="
                border-b
                border-slate-200
                bg-white
                px-8
                py-7
            ">

                <div className="
                    flex
                    items-start
                    justify-between
                ">

                    <div>

                        <p className="
                            text-xs
                            font-semibold
                            uppercase
                            tracking-[0.18em]
                            text-violet-600
                        ">
                            Discovery Observatory
                        </p>

                        <h1 className="
                            mt-2
                            text-3xl
                            font-semibold
                            tracking-tight
                            text-slate-900
                        ">
                            Exoplanet Candidates
                        </h1>

                        <p className="
                            mt-2
                            max-w-2xl
                            text-sm
                            leading-6
                            text-slate-500
                        ">
                            Review transit signals ranked by
                            Drishti's signal-processing and
                            machine-learning pipeline.
                        </p>

                    </div>


                    <div className="
                        flex
                        items-center
                        gap-3
                    ">

                        <button className="
                            flex
                            items-center
                            gap-2
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            px-4
                            py-2.5
                            text-sm
                            font-medium
                            text-slate-600
                            shadow-sm
                            transition
                            hover:border-violet-200
                            hover:text-violet-600
                        ">
                            <SlidersHorizontal size={16} />
                            Filter
                        </button>

                    </div>

                </div>

            </div>


            {/* Main */}

            <div className="
                space-y-6
                p-8
            ">


                {/* Summary cards */}

                <div className="
                    grid
                    grid-cols-1
                    gap-4
                    md:grid-cols-3
                ">

                    <SummaryCard
                        icon={<Target size={19} />}
                        label="Candidates Detected"
                        value={loading ? "—" : candidates.length}
                        description="Signals passed initial screening"
                    />

                    <SummaryCard
                        icon={<Sparkles size={19} />}
                        label="High Confidence"
                        value={loading ? "—" : highConfidenceCount}
                        description="AI confidence above 75%"
                    />

                    <SummaryCard
                        icon={<Activity size={19} />}
                        label="Transit Signals"
                        value={loading ? "—" : transitSignalCount}
                        description="Periodic events identified"
                    />

                </div>


                {/* Candidate table */}

                <div className="
                    overflow-hidden
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    shadow-sm
                ">

                    {/* Toolbar */}

                    <div className="
                        flex
                        items-center
                        justify-between
                        border-b
                        border-slate-200
                        px-6
                        py-4
                    ">

                        <div>

                            <h2 className="
                                text-base
                                font-semibold
                                text-slate-900
                            ">
                                Ranked Candidates
                            </h2>

                            <p className="
                                mt-1
                                text-xs
                                text-slate-400
                            ">
                                Ordered by AI assessment confidence
                            </p>

                        </div>


                        <div className="
                            flex
                            items-center
                            gap-2
                            rounded-lg
                            border
                            border-slate-200
                            px-3
                            py-2
                        ">

                            <Search
                                size={15}
                                className="text-slate-400"
                            />

                            <input
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                                placeholder="Search target..."
                                className="
                                    w-40
                                    bg-transparent
                                    text-sm
                                    outline-none
                                    placeholder:text-slate-400
                                "
                            />

                        </div>

                    </div>

                    {error && (
                        <div className="
                                mx-6
                                my-5
                                rounded-xl
                                border
                                border-red-100
                                bg-red-50
                                px-4
                                py-4
                            ">
                            <div className="
                                    flex
                                    items-center
                                    justify-between
                                    gap-4
                                ">
                                <div>
                                    <p className="
                                            text-sm
                                            font-semibold
                                            text-red-700
                                        ">
                                        Candidate service unavailable
                                    </p>

                                    <p className="
                                            mt-1
                                            text-xs
                                            text-red-500
                                        ">
                                        {error}
                                    </p>
                                </div>

                                <button
                                    onClick={fetchCandidates}
                                    className="
                                            rounded-lg
                                            bg-red-600
                                            px-3
                                            py-2
                                            text-xs
                                            font-semibold
                                            text-white
                                            transition
                                            hover:bg-red-700
                                        "
                                >
                                    Retry
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Table */}

                    <div className="overflow-x-auto">

                        <table className="
                            w-full
                            min-w-[850px]
                        ">

                            <thead className="
                                bg-slate-50
                            ">

                                <tr>

                                    <th className="table-head">
                                        Rank
                                    </th>

                                    <th className="table-head">
                                        Target
                                    </th>

                                    <th className="table-head">
                                        Period
                                    </th>

                                    <th className="table-head">
                                        Transit Depth
                                    </th>

                                    <th className="table-head">
                                        BLS Power
                                    </th>

                                    <th className="table-head">
                                        AI Confidence
                                    </th>

                                    <th className="table-head">
                                    </th>

                                </tr>

                            </thead>


                            <tbody>
                                {loading && (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-6 py-16 text-center"
                                        >
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="
                                                    h-8
                                                    w-8
                                                    animate-spin
                                                    rounded-full
                                                    border-2
                                                    border-violet-200
                                                    border-t-violet-600
                                                "/>

                                                <p className="
                                                    text-sm
                                                    font-medium
                                                    text-slate-500
                                                ">
                                                    Loading candidate observations...
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}

                                {!loading &&
                                    !error &&
                                    filteredCandidates.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-6 py-16 text-center"
                                            >
                                                <div className="flex flex-col items-center gap-2">
                                                    <Orbit
                                                        size={28}
                                                        className="text-violet-400"
                                                    />

                                                    <p className="
                                                        text-sm
                                                        font-semibold
                                                        text-slate-700
                                                    ">
                                                        No candidates found
                                                    </p>

                                                    <p className="
                                                        text-xs
                                                        text-slate-400
                                                    ">
                                                        Run an analysis to discover
                                                        potential exoplanets.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}

                                {!loading &&
                                    !error &&
                                    filteredCandidates.map(
                                        (candidate) => {

                                            const style =
                                                confidenceStyle(
                                                    candidate.confidence
                                                );

                                            return (
                                                <tr
                                                    key={
                                                        candidate.id
                                                    }
                                                    className="
                                                    border-t
                                                    border-slate-100
                                                    transition
                                                    hover:bg-violet-50/40
                                                "
                                                >

                                                    <td className="
                                                    px-6
                                                    py-5
                                                    text-sm
                                                    font-semibold
                                                    text-slate-400
                                                ">
                                                        #{String(
                                                            candidate.rank
                                                        ).padStart(2, "0")}
                                                    </td>


                                                    <td className="px-6 py-5">

                                                        <div className="
                                                        flex
                                                        items-center
                                                        gap-3
                                                    ">

                                                            <div className="
                                                            flex
                                                            h-9
                                                            w-9
                                                            items-center
                                                            justify-center
                                                            rounded-lg
                                                            bg-violet-50
                                                            text-violet-600
                                                        ">
                                                                <Orbit
                                                                    size={17}
                                                                />
                                                            </div>

                                                            <div>

                                                                <p className="
                                                                text-sm
                                                                font-semibold
                                                                text-slate-900
                                                            ">
                                                                    {
                                                                        candidate.target
                                                                    }
                                                                </p>

                                                                <p className="
                                                                mt-0.5
                                                                text-xs
                                                                text-slate-400
                                                            ">
                                                                    {
                                                                        candidate.classification
                                                                    }
                                                                </p>

                                                            </div>

                                                        </div>

                                                    </td>


                                                    <td className="
                                                    px-6
                                                    py-5
                                                    text-sm
                                                    font-medium
                                                    text-slate-700
                                                ">
                                                        {
                                                            candidate.period.toFixed(
                                                                3
                                                            )
                                                        } days
                                                    </td>


                                                    <td className="
                                                    px-6
                                                    py-5
                                                    text-sm
                                                    text-slate-600
                                                ">
                                                        {
                                                            (
                                                                candidate.depth *
                                                                100
                                                            ).toFixed(3)
                                                        }%
                                                    </td>


                                                    <td className="
                                                    px-6
                                                    py-5
                                                    text-sm
                                                    text-slate-600
                                                ">
                                                        {
                                                            candidate.blsPower.toFixed(
                                                                5
                                                            )
                                                        }
                                                    </td>


                                                    <td className="
                                                    px-6
                                                    py-5
                                                ">

                                                        <div className="
                                                        w-40
                                                    ">

                                                            <div className="
                                                            mb-1.5
                                                            flex
                                                            items-center
                                                            justify-between
                                                        ">

                                                                <span className={`
                                                                text-sm
                                                                font-semibold
                                                                ${style.text}
                                                            `}>
                                                                    {
                                                                        candidate.confidence.toFixed(
                                                                            1
                                                                        )
                                                                    }%
                                                                </span>

                                                            </div>


                                                            <div className="
                                                            h-1.5
                                                            overflow-hidden
                                                            rounded-full
                                                            bg-slate-100
                                                        ">

                                                                <div
                                                                    className={`
                                                                    h-full
                                                                    rounded-full
                                                                    ${style.bar}
                                                                `}
                                                                    style={{
                                                                        width:
                                                                            `${candidate.confidence}%`,
                                                                    }}
                                                                />

                                                            </div>

                                                        </div>

                                                    </td>


                                                    <td className="
                                                    px-6
                                                    py-5
                                                ">

                                                        <button
                                                            onClick={() => {
                                                                setSelectedAnalysisId(candidate.id);
                                                                setPage("analyze");
                                                            }}
                                                            title="Open candidate analysis"
                                                            className="
        flex
        h-9
        w-9
        items-center
        justify-center
        rounded-lg
        border
        border-slate-200
        text-slate-400
        transition
        hover:border-violet-200
        hover:bg-violet-50
        hover:text-violet-600
    "
                                                        >
                                                            <ChevronRight size={17} />
                                                        </button>

                                                    </td>

                                                </tr>
                                            );
                                        }
                                    )}

                            </tbody>

                        </table>

                    </div>

                </div>


                {/* Evidence explanation */}

                <div className="
                    rounded-2xl
                    border
                    border-violet-100
                    bg-violet-50/50
                    p-6
                ">

                    <div className="
                        flex
                        gap-4
                    ">

                        <div className="
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            bg-violet-100
                            text-violet-600
                        ">
                            <Sparkles size={19} />
                        </div>


                        <div>

                            <h3 className="
                                text-sm
                                font-semibold
                                text-slate-900
                            ">
                                How Drishti ranks candidates
                            </h3>

                            <p className="
                                mt-1
                                max-w-3xl
                                text-sm
                                leading-6
                                text-slate-500
                            ">
                                Candidates are prioritized using
                                transit depth, periodicity,
                                signal-to-noise characteristics,
                                BLS detection power and the
                                machine-learning classification.
                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}


function SummaryCard({
    icon,
    label,
    value,
    description,
}) {

    return (
        <div className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-5
            shadow-sm
        ">

            <div className="
                flex
                items-center
                justify-between
            ">

                <div className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-lg
                    bg-violet-50
                    text-violet-600
                ">
                    {icon}
                </div>

            </div>


            <p className="
                mt-5
                text-xs
                font-medium
                uppercase
                tracking-wider
                text-slate-400
            ">
                {label}
            </p>


            <p className="
                mt-1
                text-2xl
                font-semibold
                tracking-tight
                text-slate-900
            ">
                {value}
            </p>


            <p className="
                mt-1
                text-xs
                text-slate-400
            ">
                {description}
            </p>

        </div>
    );
}