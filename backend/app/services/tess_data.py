from pathlib import Path

import lightkurve as lk
import pandas as pd


DATA_DIR = (
    Path(__file__).resolve().parent.parent.parent
    / "ml_data"
    / "tess"
)


def download_tess_lightcurve(
    tic_id,
    sector=None
):
    """
    Search MAST for a TESS light curve
    and download the first suitable result.
    """

    DATA_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    target = f"TIC {tic_id}"

    print(
        f"Searching TESS data for {target}..."
    )

    search_result = lk.search_lightcurve(
        target,
        mission="TESS"
    )

    if len(search_result) == 0:
        raise ValueError(
            f"No TESS light curve found for {target}"
        )

    if sector is not None:

        filtered = search_result[
            search_result.table["sequence_number"]
            == int(sector)
        ]

        if len(filtered) > 0:
            search_result = filtered

    print(
        f"Found {len(search_result)} observations."
    )

    # Prefer SPOC products when available.
    try:

        spoc = search_result[
            search_result.table[
                "author"
            ] == "SPOC"
        ]

        if len(spoc) > 0:
            search_result = spoc

    except Exception:
        pass

    print("Downloading light curve...")

    lightcurve = (
        search_result[0]
        .download()
    )

    if lightcurve is None:
        raise RuntimeError(
            "Failed to download TESS light curve."
        )

    return lightcurve


def save_lightcurve_csv(
    lightcurve,
    tic_id,
    sector=None
):
    """
    Convert TESS light curve to our
    standardized time/flux CSV format.
    """

    time = lightcurve.time.value

    # Prefer PDCSAP flux.
    flux = lightcurve.flux.value

    df = pd.DataFrame({
        "time": time,
        "flux": flux
    })

    df = df.dropna()

    filename = (
        f"TIC_{tic_id}"
    )

    if sector is not None:
        filename += (
            f"_sector_{sector}"
        )

    filename += ".csv"

    output_path = (
        DATA_DIR / filename
    )

    df.to_csv(
        output_path,
        index=False
    )

    return output_path


def download_and_save(
    tic_id,
    sector=None
):
    """
    Download a TESS light curve and
    convert it into our standard CSV.
    """

    lightcurve = download_tess_lightcurve(
        tic_id,
        sector
    )

    path = save_lightcurve_csv(
        lightcurve,
        tic_id,
        sector
    )

    return path