export function downloadText(filename, text, type = "text/plain") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function downloadAnalysisReport(result) {
  if (!result) return;
  const ca = result.candidate_analysis || {};
  const ml = result.ml_prediction || {};
  const confidence = Number(ml.confidence) <= 1 ? Number(ml.confidence) * 100 : Number(ml.confidence);
  const rows = [
    ["Target / File", result.filename],
    ["Analysis ID", result.id],
    ["Classification", ml.prediction || "—"],
    ["Confidence", `${Number(confidence || 0).toFixed(2)}%`],
    ["Candidate Score", Number(ca.candidate_score || 0).toFixed(2)],
    ["Period", `${Number(ca.period_days || 0).toFixed(5)} days`],
    ["Transit Depth", `${Number(ca.transit_depth || 0) * 100 > 1 ? Number(ca.transit_depth).toFixed(5) : (Number(ca.transit_depth || 0) * 100).toFixed(5)}%`],
    ["Transit Duration", `${Number(ca.transit_duration_days || 0).toFixed(5)} days`],
    ["BLS Power", Number(ca.bls_power || 0).toFixed(5)],
    ["BLS SNR", Number(ca.bls_snr || 0).toFixed(5)],
    ["Number of Transits", ca.number_of_transits ?? "—"],
    ["Odd-Even Difference", Number(ca.odd_even_difference || 0).toFixed(5)],
    ["Periodicity Score", Number(ca.periodicity_score || 0).toFixed(5)],
  ];

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Drishti Analysis Report</title>
<style>body{font-family:Inter,Arial,sans-serif;background:#020712;color:#e5e7eb;padding:40px}main{max-width:900px;margin:auto}.card{background:#071020;border:1px solid #26314a;border-radius:16px;padding:24px;margin:16px 0}h1{margin:0 0 6px}h2{color:#a78bfa;font-size:16px}table{width:100%;border-collapse:collapse}td{padding:10px;border-bottom:1px solid #1d2940}td:first-child{color:#94a3b8;width:38%}.ok{color:#34d399}.muted{color:#94a3b8}</style></head>
<body><main><div class="card"><h1>DRISHTI — Exoplanet Analysis Report</h1><p class="muted">Backend-generated analysis summary</p></div>
<div class="card"><h2>AI Assessment</h2><table>${rows.map(([k,v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join("")}</table></div>
<div class="card"><h2>Visualization Data</h2><p>Light curve points: ${result.light_curve?.length || 0}</p><p>Phase-folded points: ${result.phase_folded_curve?.length || 0}</p><p>Detected transits: ${result.transits?.length || 0}</p></div>
</main></body></html>`;
  const base = String(result.filename || "analysis").replace(/[^a-z0-9._-]+/gi, "_").replace(/\.csv$/i, "");
  downloadText(`drishti-${base}-report.html`, html, "text/html;charset=utf-8");
}
