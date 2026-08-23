const API_BASE =
    (import.meta.env.VITE_API_URL || "http://localhost:8000/api").replace(/\/$/, "");

async function request(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, options);

    let body = null;
    try {
        body = await response.json();
    } catch {
        body = null;
    }

    if (!response.ok) {
        const detail =
            body?.detail ||
            body?.message ||
            `Request failed with status ${response.status}`;
        throw new Error(detail);
    }

    return body;
}

export const api = {
    base: API_BASE,
    health: () => request("/health"),
    dashboard: () => request("/dashboard"),
    analyses: () => request("/analyses"),
    analysis: (id) => request(`/analyses/${id}`),
    candidates: () => request("/candidates"),

    analyze: async (file) => {
        const form = new FormData();
        form.append("file", file);
        return request("/analyze", {
            method: "POST",
            body: form,
        });
    },
};

export function confidencePercent(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return n <= 1 ? n * 100 : n;
}

export function depthPercent(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    // Backend stores transit depth as a relative fraction.
    return n <= 1 ? n * 100 : n;
}

export function asArray(value) {
    return Array.isArray(value) ? value : [];
}

export function transitRecords(item) {
    return asArray(
        item?.detected_transits ??
        item?.transit_times ??
        item?.transit_data
    );
}

export function curvePoint(point) {
    if (Array.isArray(point) && point.length >= 2) {
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
            point?.x
        ),
        flux: Number(
            point?.flux ??
            point?.f ??
            point?.normalized_flux ??
            point?.value ??
            point?.y
        ),
    };
}

export function normalizeCurve(raw) {
    return asArray(raw)
        .map(curvePoint)
        .filter(
            (p) =>
                Number.isFinite(p.time) &&
                Number.isFinite(p.flux)
        );
}

export function normalizePhase(raw) {
    return asArray(raw)
        .map((point) => {
            if (Array.isArray(point) && point.length >= 2) {
                return {
                    phase: Number(point[0]),
                    flux: Number(point[1]),
                };
            }

            return {
                phase: Number(point?.phase ?? point?.x),
                flux: Number(
                    point?.flux ??
                    point?.normalized_flux ??
                    point?.value ??
                    point?.y
                ),
            };
        })
        .filter(
            (p) =>
                Number.isFinite(p.phase) &&
                Number.isFinite(p.flux)
        );
}

export function normalizeAnalysis(item) {
    const candidate = item?.candidate_analysis || {};
    const ml = item?.ml_prediction || {};

    return {
        ...item,
        id: item?.id ?? item?.analysis_id,
        filename: item?.filename || "Unknown Target",
        candidate_analysis: candidate,
        ml_prediction: ml,
        confidence: confidencePercent(ml.confidence),
        candidateProbability: confidencePercent(
            ml.candidate_probability
        ),
        nonCandidateProbability: confidencePercent(
            ml.non_candidate_probability
        ),
        depthPercent: depthPercent(
            candidate.transit_depth
        ),
        lightCurve: normalizeCurve(
            item?.light_curve
        ),
        phaseFoldedCurve: normalizePhase(
            item?.phase_folded_curve
        ),
        transits: transitRecords(item),
    };
}
