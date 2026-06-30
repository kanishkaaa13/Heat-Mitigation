from __future__ import annotations

import os
from pathlib import Path

import numpy as np
import rasterio
from rasterio.transform import from_origin

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


def download_sample_landsat(output_path: Path) -> None:
    ensure_dir(output_path.parent)
    print(f"Creating synthetic Landsat sample at {output_path}")
    height = width = 64
    x = np.linspace(0, 1, width)
    y = np.linspace(0, 1, height)
    xx, yy = np.meshgrid(x, y)
    data = (35 + 8 * np.exp(-((xx - 0.35) ** 2 + (yy - 0.6) ** 2) / 0.04) + 2 * np.sin(xx * 6)).astype(np.float32)

    with rasterio.open(
        output_path,
        "w",
        driver="GTiff",
        height=height,
        width=width,
        count=1,
        dtype="float32",
        crs="EPSG:32643",
        transform=from_origin(77.4, 13.1, 0.00025, 0.00025),
    ) as dst:
        dst.write(data, 1)


def download_era5_sample(output_path: Path) -> None:
    ensure_dir(output_path.parent)
    print(f"Creating placeholder ERA5 sample at {output_path}")
    output_path.write_text("placeholder era5 data\n", encoding="utf-8")


def download_ecostress_sample(output_path: Path) -> None:
    ensure_dir(output_path.parent)
    print(f"Creating placeholder ECOSTRESS sample at {output_path}")
    output_path.write_text("placeholder ecostress data\n", encoding="utf-8")


if __name__ == "__main__":
    download_sample_landsat(LANDSAT_DIR / "landsat_lst_2016.tif")
    download_era5_sample(ERA5_DIR / "era5_2016_03.nc")
    download_ecostress_sample(ECOSTRESS_DIR / "ecostress_2016.h5")
    print("Synthetic sample data created. Replace with real downloads for production use.")
