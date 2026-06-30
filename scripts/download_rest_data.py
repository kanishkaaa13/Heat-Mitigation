from __future__ import annotations

import os
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
LANDSAT_DIR = DATA_DIR / "landsat"
ERA5_DIR = DATA_DIR / "era5"
ECOSTRESS_DIR = DATA_DIR / "ecostress"

AOI = {
    "north": 13.1,
    "south": 12.8,
    "west": 77.4,
    "east": 77.8,
}


def ensure_dir(path: Path) -> Path:
    path.mkdir(parents=True, exist_ok=True)
    return path


def download_sample_landsat(url: str, output_path: Path) -> None:
    ensure_dir(output_path.parent)
    print(f"Downloading Landsat sample from {url}")
    response = requests.get(url, stream=True, timeout=600)
    response.raise_for_status()
    with output_path.open("wb") as fh:
        for chunk in response.iter_content(chunk_size=1024 * 1024):
            if chunk:
                fh.write(chunk)


def download_era5_sample(output_path: Path) -> None:
    ensure_dir(output_path.parent)
    print(f"Creating placeholder ERA5 sample at {output_path}")
    output_path.write_text("placeholder era5 data\n", encoding="utf-8")


def download_ecostress_sample(output_path: Path) -> None:
    ensure_dir(output_path.parent)
    print(f"Creating placeholder ECOSTRESS sample at {output_path}")
    output_path.write_text("placeholder ecostress data\n", encoding="utf-8")


if __name__ == "__main__":
    # Replace the sample URL below with a real public Landsat download URL
    sample_landsat_url = os.getenv(
        "LANDSAT_URL",
        "https://example.com/landsat_sample.tif",
    )
    download_sample_landsat(sample_landsat_url, LANDSAT_DIR / "landsat_lst_2016.tif")
    download_era5_sample(ERA5_DIR / "era5_2016_03.nc")
    download_ecostress_sample(ECOSTRESS_DIR / "ecostress_2016.h5")
    print("Sample data placeholders created. Replace URLs with real downloads for production use.")
