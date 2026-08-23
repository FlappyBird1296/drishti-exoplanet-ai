import {
    useEffect,
    useMemo,
    useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
    Upload,
    FileSpreadsheet,
    Sparkles,
    Activity,
    Clock3,
    Gauge,
    CheckCircle2,
    AlertCircle,
    Loader2,
} from "lucide-react";

import {
    analyzeLightCurve,
} from "../services/api";

import LightCurveChart
    from "../components/analysis/LightCurveChart";

import PhaseFoldedChart
    from "../components/analysis/PhaseFoldedChart";

import AnalysisScene
    from "../components/analysis/AnalysisScene";



function parseCSV(text) {

    const lines =
        text
            .trim()
            .split(/\r?\n/);


    if (lines.length < 2) {
        throw new Error(
            "The CSV file does not contain enough data."
        );
    }


    const headers =
        lines[0]
            .split(",")
            .map((header) =>
                header.trim().toLowerCase()
            );


    const timeIndex =
        headers.indexOf("time");

    const fluxIndex =
        headers.indexOf("flux");


    if (
        timeIndex === -1 ||
        fluxIndex === -1
    ) {
        throw new Error(
            "CSV must contain 'time' and 'flux' columns."
        );
    }


    return lines
        .slice(1)
        .map((line) => {

            const values =
                line.split(",");

            return {
                time: Number(
                    values[timeIndex]
                ),

                flux: Number(
                    values[fluxIndex]
                ),
            };
        })
        .filter(
            (point) =>
                Number.isFinite(point.time) &&
                Number.isFinite(point.flux)
        );
}


function formatNumber(
    value,
    digits = 3
) {

    if (
        value === null ||
        value === undefined ||
        Number.isNaN(Number(value))
    ) {
        return "—";
    }

    return Number(value).toFixed(digits);
}

function normalizeFlux(data) {

    if (!data.length) {
        return [];
    }

    const values =
        data.map(
            (point) => point.flux
        );

    const median =
        [...values]
            .sort((a, b) => a - b)
        [Math.floor(values.length / 2)];


    if (!median) {
        return data;
    }


    return data.map((point) => ({
        time: point.time,
        flux:
            point.flux / median,
    }));
}

export default function Analyze({
    analysisId,
}) {

    const API_BASE_URL =
        import.meta.env.VITE_API_URL ||
        "http://localhost:8000/api";

    const [file, setFile] =
        useState(null);

    const [chartData, setChartData] =
        useState([]);

    const [result, setResult] =
        useState(null);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    useEffect(() => {
        if (!analysisId) {
            return;
        }

        async function loadExistingAnalysis() {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `${API_BASE_URL}/analyses/${analysisId}`
                );

                if (!response.ok) {
                    throw new Error(
                        `Unable to load analysis (${response.status})`
                    );
                }

                const data = await response.json();

                console.log(
                    "LOADED STORED ANALYSIS:",
                    data
                );

                setResult(data);

                /*
                 * Restore backend light-curve data
                 * for the existing candidate.
                 */
                if (Array.isArray(data?.light_curve)) {
                    const backendData =
                        data.light_curve
                            .map((point) => {
                                if (
                                    Array.isArray(point) &&
                                    point.length >= 2
                                ) {
                                    return {
                                        time: Number(point[0]),
                                        flux: Number(point[1]),
                                    };
                                }

                                return {
                                    time: Number(
                                        point?.time ??
                                        point?.t ??
                                        point?.time_days ??
                                        0
                                    ),

                                    flux: Number(
                                        point?.flux ??
                                        point?.f ??
                                        point?.normalized_flux ??
                                        point?.value ??
                                        0
                                    ),
                                };
                            })
                            .filter(
                                (point) =>
                                    Number.isFinite(
                                        point.time
                                    ) &&
                                    Number.isFinite(
                                        point.flux
                                    )
                            );

                    if (backendData.length) {
                        setChartData(
                            normalizeFlux(
                                backendData
                            )
                        );
                    }
                }

            } catch (err) {
                console.error(
                    "Failed to load stored analysis:",
                    err
                );

                setError(
                    err.message ||
                    "Unable to load this candidate analysis."
                );

            } finally {
                setLoading(false);
            }
        }

        loadExistingAnalysis();

    }, [analysisId]);

    const period =
        result?.candidate_analysis?.period_days ||
        0;

    const numberOfTransits =
        result?.candidate_analysis?.number_of_transits ?? 0;

    const confidence =
        result?.ml_prediction?.confidence;


    const confidencePercent =
        confidence == null
            ? null
            : confidence <= 1
                ? confidence * 100
                : confidence;


    const prediction =
        result?.ml_prediction?.prediction;


    const candidateDetected =
        prediction ===
        "planetary_candidate";


    const displayedConfidence =
        confidencePercent == null
            ? "—"
            : `${confidencePercent.toFixed(1)}%`;

    const phaseFoldedData =
        (result?.phase_folded_curve || [])
            .map((point) => {

                if (
                    Array.isArray(point) &&
                    point.length >= 2
                ) {
                    return {
                        phase: Number(point[0]),
                        flux: Number(point[1]),
                    };
                }

                return {
                    phase: Number(
                        point.phase ??
                        point.x ??
                        0
                    ),

                    flux: Number(
                        point.flux ??
                        point.normalized_flux ??
                        point.y ??
                        0
                    ),
                };
            })
            .filter(
                (point) =>
                    Number.isFinite(point.phase) &&
                    Number.isFinite(point.flux)
            );

    const handleFile = async (
        selectedFile
    ) => {

        if (!selectedFile) return;


        setError("");
        setResult(null);
        setFile(selectedFile);


        try {

            const text =
                await selectedFile.text();


            const parsed =
                parseCSV(text);


            /*
             * Avoid rendering thousands of points
             * in the browser while preserving the
             * shape of the curve.
             */

            const maxPoints = 1200;

            let displayData =
                parsed;


            if (
                parsed.length >
                maxPoints
            ) {

                const step =
                    parsed.length /
                    maxPoints;


                displayData =
                    Array.from(
                        {
                            length:
                                maxPoints,
                        },
                        (_, index) =>
                            parsed[
                            Math.floor(
                                index * step
                            )
                            ]
                    );
            }


            setChartData(
                normalizeFlux(displayData)
            );

        } catch (err) {

            setError(
                err.message ||
                "Could not read this CSV file."
            );

            setFile(null);
            setChartData([]);
        }
    };


    const runAnalysis =
        async () => {

            if (!file) {

                setError(
                    "Please upload a CSV file first."
                );

                return;
            }


            setLoading(true);
            setError("");


            try {

                const data =
                    await analyzeLightCurve(
                        file
                    );


                console.log(
                    "DRISHTI ANALYSIS RESPONSE:",
                    data
                );

                setResult(data);

                if (Array.isArray(data?.light_curve)) {

                    const backendData =
                        data.light_curve
                            .map((point) => {

                                if (
                                    Array.isArray(point) &&
                                    point.length >= 2
                                ) {
                                    return {
                                        time: Number(point[0]),
                                        flux: Number(point[1]),
                                    };
                                }

                                return {
                                    time: Number(
                                        point.time ??
                                        point.t ??
                                        point.time_days ??
                                        0
                                    ),

                                    flux: Number(
                                        point.flux ??
                                        point.f ??
                                        point.normalized_flux ??
                                        point.value ??
                                        0
                                    ),
                                };
                            })
                            .filter(
                                (point) =>
                                    Number.isFinite(point.time) &&
                                    Number.isFinite(point.flux)
                            );


                    if (backendData.length) {

                        setChartData(
                            normalizeFlux(backendData)
                        );

                    }
                }

            } catch (err) {

                setError(
                    err.message ||
                    "The backend analysis failed."
                );

            } finally {

                setLoading(false);
            }
        };


    const clearAnalysis =
        () => {

            setFile(null);
            setChartData([]);
            setResult(null);
            setError("");
        };


    return (
        <div className="
            mx-auto
            max-w-[1600px]
            p-5
            md:p-8
        ">

            {/* ==========================================
                HEADER
            =========================================== */}

            <div className="
                mb-7
                flex
                flex-col
                gap-4
                md:flex-row
                md:items-end
                md:justify-between
            ">

                <div>

                    <p className="
                        text-xs
                        font-semibold
                        uppercase
                        tracking-[0.18em]
                        text-violet-600
                    ">
                        Scientific Analysis
                    </p>

                    <h1 className="
                        mt-2
                        text-3xl
                        font-semibold
                        tracking-tight
                        text-slate-900
                        md:text-4xl
                    ">
                        Analyze Light Curve
                    </h1>

                    <p className="
                        mt-2
                        max-w-2xl
                        text-sm
                        leading-6
                        text-slate-500
                    ">
                        Upload stellar flux data and
                        let Drishti search for periodic
                        transit signals.
                    </p>

                </div>


                {result && (
                    <button
                        onClick={() => {
                            if (analysisId) {
                                navigate("/analyze");
                            } else {
                                clearAnalysis();
                            }
                        }}
                        className="
            w-fit
            rounded-xl
            border
            border-slate-200
            bg-white
            px-4
            py-2.5
            text-sm
            font-medium
            text-slate-600
            transition
            hover:bg-slate-50
        "
                    >
                        New Analysis
                    </button>
                )}

            </div>


            {/* ==========================================
                ERROR
            =========================================== */}

            {error && (

                <div className="
                    mb-6
                    flex
                    items-start
                    gap-3
                    rounded-2xl
                    border
                    border-red-200
                    bg-red-50
                    p-4
                    text-sm
                    text-red-700
                ">

                    <AlertCircle
                        size={18}
                        className="mt-0.5"
                    />

                    <span>
                        {error}
                    </span>

                </div>

            )}


            {/* ==========================================
                UPLOAD
            =========================================== */}

            {!result && !analysisId && (

                <div className="
                    mb-6
                    rounded-3xl
                    border
                    border-slate-200
                    bg-white
                    p-6
                    shadow-sm
                ">

                    <div className="
                        flex
                        flex-col
                        gap-5
                        lg:flex-row
                        lg:items-center
                        lg:justify-between
                    ">

                        <label className="
                            group
                            flex
                            min-h-[130px]
                            flex-1
                            cursor-pointer
                            items-center
                            justify-center
                            rounded-2xl
                            border-2
                            border-dashed
                            border-slate-200
                            bg-slate-50
                            px-6
                            py-5
                            transition
                            hover:border-violet-300
                            hover:bg-violet-50/30
                        ">

                            <input
                                type="file"
                                accept=".csv"
                                className="hidden"
                                onChange={(event) =>
                                    handleFile(
                                        event.target.files?.[0]
                                    )
                                }
                            />


                            <div className="
                                flex
                                flex-col
                                items-center
                                text-center
                            ">

                                <div className="
                                    flex
                                    h-12
                                    w-12
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    bg-violet-100
                                    text-violet-600
                                    transition
                                    group-hover:scale-105
                                ">

                                    {file ? (
                                        <FileSpreadsheet
                                            size={22}
                                        />
                                    ) : (
                                        <Upload
                                            size={22}
                                        />
                                    )}

                                </div>


                                <p className="
                                    mt-3
                                    text-sm
                                    font-semibold
                                    text-slate-800
                                ">

                                    {file
                                        ? file.name
                                        : "Upload light curve CSV"
                                    }

                                </p>


                                <p className="
                                    mt-1
                                    text-xs
                                    text-slate-400
                                ">

                                    {file
                                        ? `${(
                                            file.size /
                                            1024
                                        ).toFixed(1)} KB`
                                        : "Required columns: time, flux"
                                    }

                                </p>

                            </div>

                        </label>


                        <button
                            onClick={runAnalysis}
                            disabled={
                                !file ||
                                loading
                            }
                            className="
                                flex
                                min-h-[54px]
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                bg-gradient-to-r
                                from-violet-600
                                to-indigo-600
                                px-7
                                text-sm
                                font-semibold
                                text-white
                                shadow-lg
                                shadow-violet-500/20
                                transition
                                hover:-translate-y-0.5
                                disabled:cursor-not-allowed
                                disabled:opacity-40
                            "
                        >

                            {loading ? (
                                <>
                                    <Loader2
                                        size={17}
                                        className="
                                            animate-spin
                                        "
                                    />

                                    Analyzing...

                                </>
                            ) : (
                                <>
                                    <Sparkles
                                        size={17}
                                    />

                                    Analyze Light Curve

                                </>
                            )}

                        </button>

                    </div>

                </div>

            )}


            {/* ==========================================
                PREVIEW CHART
            =========================================== */}

            {!result && chartData.length > 0 && (

                <div className="
                    mb-6
                    rounded-3xl
                    border
                    border-slate-200
                    bg-white
                    p-6
                    shadow-sm
                ">

                    <div className="
                        mb-5
                    ">

                        <p className="
                            text-xs
                            font-semibold
                            uppercase
                            tracking-[0.16em]
                            text-slate-400
                        ">
                            Input signal
                        </p>

                        <h2 className="
                            mt-1
                            text-lg
                            font-semibold
                        ">
                            Stellar Light Curve
                        </h2>

                    </div>


                    <div className="
                        h-[350px]
                        w-full
                    ">

                        <LightCurveChart
                            data={chartData}
                            detectedTransits={
                                result?.detected_transits || []
                            }
                        />

                    </div>

                </div>

            )}



            {/* ==========================================
                RESULTS
            =========================================== */}

            {result && (

                <>

                    {/* Top result */}

                    <div className="
                        mb-6
                        grid
                        gap-6
                        xl:grid-cols-[1.35fr_0.65fr]
                    ">

                        {/* 3D Observatory */}

                        <div className="
                            relative
                            min-h-[430px]
                            overflow-hidden
                            rounded-3xl
                            bg-[#070a16]
                            shadow-xl
                        ">

                            <div className="
                                absolute
                                left-6
                                top-6
                                z-10
                            ">

                                <p className="
                                    text-[10px]
                                    font-semibold
                                    uppercase
                                    tracking-[0.2em]
                                    text-violet-300
                                ">
                                    Transit Observatory
                                </p>

                                <h2 className="
                                    mt-2
                                    text-xl
                                    font-semibold
                                    text-white
                                ">
                                    Candidate system
                                </h2>

                            </div>


                            <AnalysisScene
                                period={period}
                            />


                            <div className="
                                absolute
                                bottom-5
                                left-6
                                right-6
                                z-10
                                flex
                                items-center
                                justify-between
                                rounded-2xl
                                border
                                border-white/10
                                bg-black/25
                                px-4
                                py-3
                                backdrop-blur-md
                            ">

                                <div>

                                    <p className="
                                        text-[10px]
                                        uppercase
                                        tracking-wider
                                        text-white/40
                                    ">
                                        Estimated period
                                    </p>

                                    <p className="
                                        mt-1
                                        text-sm
                                        font-semibold
                                        text-white
                                    ">
                                        {formatNumber(
                                            period,
                                            3
                                        )} days
                                    </p>

                                </div>


                                <div className="
                                    h-8
                                    w-px
                                    bg-white/10
                                " />


                                <div className="
                                    text-right
                                ">

                                    <p className="
                                        text-[10px]
                                        uppercase
                                        tracking-wider
                                        text-white/40
                                    ">
                                        Transit events
                                    </p>

                                    <p className="
                                        mt-1
                                        text-sm
                                        font-semibold
                                        text-white
                                    ">
                                        {numberOfTransits}

                                    </p>

                                </div>

                            </div>

                        </div>


                        {/* Prediction card */}

                        <div className="
                            rounded-3xl
                            border
                            border-slate-200
                            bg-white
                            p-6
                            shadow-sm
                        ">

                            <div className="
                                flex
                                items-center
                                gap-2
                                text-xs
                                font-semibold
                                uppercase
                                tracking-[0.16em]
                                text-violet-600
                            ">

                                <Sparkles
                                    size={15}
                                />

                                AI Assessment

                            </div>


                            <div className="
                                mt-8
                            ">

                                <p className="
                                    text-sm
                                    text-slate-400
                                ">
                                    Classification
                                </p>

                                <h2 className="
                                    mt-2
                                    text-2xl
                                    font-semibold
                                    text-slate-900
                                ">

                                    {prediction === "planetary_candidate"
                                        ? "Planetary Candidate"
                                        : prediction === "non_candidate"
                                            ? "Non-Candidate"
                                            : "Awaiting AI Classification"
                                    }

                                </h2>


                                <div className="
                                    mt-8
                                ">

                                    <div className="
                                        flex
                                        items-end
                                        justify-between
                                    ">

                                        <span className="
                                            text-sm
                                            text-slate-400
                                        ">
                                            Confidence
                                        </span>

                                        <span className="
                                            text-3xl
                                            font-bold
                                            tracking-tight
                                            text-violet-600
                                        ">
                                            {confidencePercent == null
                                                ? "N/A"
                                                : `${confidencePercent.toFixed(1)}%`
                                            }
                                        </span>

                                    </div>


                                    <div className="
                                        mt-3
                                        h-3
                                        overflow-hidden
                                        rounded-full
                                        bg-slate-100
                                    ">

                                        <div
                                            className="
                                                h-full
                                                rounded-full
                                                bg-gradient-to-r
                                                from-violet-500
                                                to-indigo-500
                                                transition-all
                                                duration-1000
                                            "
                                            style={{
                                                width:
                                                    confidencePercent == null
                                                        ? "0%"
                                                        : `${Math.min(
                                                            confidencePercent,
                                                            100
                                                        )}%`,
                                            }}
                                        />

                                    </div>

                                </div>


                                <div className="
                                    mt-8
                                    rounded-2xl
                                    bg-slate-50
                                    p-4
                                ">

                                    <div className="
                                        flex
                                        items-center
                                        gap-2
                                    ">

                                        {candidateDetected ? (
                                            <CheckCircle2
                                                size={18}
                                                className="
                                                    text-emerald-500
                                                "
                                            />
                                        ) : (
                                            <Activity
                                                size={18}
                                                className="
                                                    text-violet-500
                                                "
                                            />
                                        )}

                                        <span className="
                                            text-sm
                                            font-semibold
                                            text-slate-800
                                        ">

                                            {candidateDetected
                                                ? "Promising planetary candidate detected"
                                                : prediction
                                                    ? "Signal requires further investigation"
                                                    : "Transit detected — AI classification unavailable"
                                            }

                                        </span>

                                    </div>

                                    <p className="
                                        mt-2
                                        text-xs
                                        leading-5
                                        text-slate-500
                                    ">
                                        Drishti combines transit
                                        features, periodicity,
                                        signal-to-noise and the
                                        trained classifier to
                                        prioritize this signal.
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* Light curve */}

                    <div className="
                        mb-6
                        rounded-3xl
                        border
                        border-slate-200
                        bg-white
                        p-6
                        shadow-sm
                    ">

                        <div className="
                            mb-5
                            flex
                            items-center
                            justify-between
                        ">

                            <div>

                                <p className="
                                    text-xs
                                    font-semibold
                                    uppercase
                                    tracking-[0.16em]
                                    text-slate-400
                                ">
                                    Signal analysis
                                </p>

                                <h2 className="
                                    mt-1
                                    text-xl
                                    font-semibold
                                    text-slate-900
                                ">
                                    Stellar Light Curve
                                </h2>

                            </div>


                            <div className="
                                hidden
                                items-center
                                gap-2
                                rounded-full
                                bg-indigo-50
                                px-3
                                py-1.5
                                text-xs
                                font-medium
                                text-indigo-600
                                sm:flex
                            ">

                                <Activity
                                    size={14}
                                />

                                Normalised flux

                            </div>

                        </div>


                        <div className="
                            h-[380px]
                        ">

                            <LightCurveChart
                                data={chartData}
                            />

                        </div>

                    </div>

                    <div className="
                    mb-6
                    rounded-3xl
                    border
                    border-slate-200
                    bg-white
                    p-6
                    shadow-sm
                ">

                        <div className="
                        mb-5
                        flex
                        items-start
                        justify-between
                    ">

                            <div>

                                <p className="
                                text-xs
                                font-semibold
                                uppercase
                                tracking-[0.16em]
                                text-violet-600
                            ">
                                    Periodic Signal
                                </p>

                                <h2 className="
                                mt-1
                                text-xl
                                font-semibold
                                text-slate-900
                            ">
                                    Phase-Folded Transit
                                </h2>

                                <p className="
                                mt-1
                                text-sm
                                text-slate-400
                            ">
                                    Observations aligned to the detected
                                    orbital period.
                                </p>

                            </div>

                            <div className="
                            rounded-full
                            bg-violet-50
                            px-3
                            py-1.5
                            text-xs
                            font-medium
                            text-violet-600
                        ">
                                Period: {
                                    result?.candidate_analysis
                                        ?.period_days
                                        ? `${Number(
                                            result.candidate_analysis
                                                .period_days
                                        ).toFixed(3)} days`
                                        : "—"
                                }
                            </div>

                        </div>


                        <div className="h-[320px]">

                            <PhaseFoldedChart
                                data={phaseFoldedData}
                                periodDays={
                                    result?.candidate_analysis?.period_days
                                }
                                transitDurationDays={
                                    result?.candidate_analysis
                                        ?.transit_duration_days
                                }
                            />

                        </div>

                    </div>


                    {/* Metrics */}

                    <div className="
                        grid
                        gap-4
                        sm:grid-cols-2
                        lg:grid-cols-4
                    ">

                        <MetricCard
                            icon={Clock3}
                            label="Estimated Period"
                            value={
                                `${formatNumber(
                                    result?.candidate_analysis?.period_days,
                                    3
                                )} days`
                            }
                        />

                        <MetricCard
                            icon={Gauge}
                            label="Transit Depth"
                            value={
                                formatNumber(
                                    result?.candidate_analysis?.transit_depth,
                                    6
                                )
                            }
                        />

                        <MetricCard
                            icon={Clock3}
                            label="Transit Duration"
                            value={
                                `${formatNumber(
                                    result?.candidate_analysis
                                        ?.transit_duration_days,
                                    3
                                )} days`
                            }
                        />

                        <MetricCard
                            icon={Activity}
                            label="BLS Power"
                            value={
                                formatNumber(
                                    result?.candidate_analysis
                                        ?.bls_power,
                                    5
                                )
                            }
                        />

                        <MetricCard
                            icon={Sparkles}
                            label="Signal-to-Noise"
                            value={
                                formatNumber(
                                    result.detection
                                        ?.signal_to_noise,
                                    3
                                )
                            }
                        />

                    </div>

                </>
            )}

        </div>
    );
}


function MetricCard({
    icon: Icon,
    label,
    value,
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

                <p className="
                    text-xs
                    font-medium
                    text-slate-400
                ">
                    {label}
                </p>

                <div className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    bg-violet-50
                    text-violet-600
                ">

                    <Icon size={17} />

                </div>

            </div>

            <p className="
                mt-4
                text-xl
                font-semibold
                tracking-tight
                text-slate-900
            ">
                {value}
            </p>

        </div>
    );
}