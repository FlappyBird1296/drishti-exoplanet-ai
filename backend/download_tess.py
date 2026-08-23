from app.services.tess_data import (
    download_and_save
)


if __name__ == "__main__":

    tic_id = input(
        "Enter TIC ID: "
    ).strip()

    sector_input = input(
        "Enter sector (optional): "
    ).strip()

    if sector_input:
        sector = int(sector_input)
    else:
        sector = None

    try:

        path = download_and_save(
            tic_id,
            sector
        )

        print(
            "\nLight curve saved:"
        )

        print(path)

    except Exception as e:

        print(
            f"\nDownload failed: {e}"
        )