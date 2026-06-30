from __future__ import annotations

import argparse
import os
from datetime import datetime
from pathlib import Path
from typing import Iterable, List, Optional, Sequence, Tuple

try:
    import ee
except ImportError:  # pragma: no cover - optional dependency
    ee = None

try:
    import cdsapi
except ImportError:  # pragma: no cover - optional dependency
    cdsapi = None

try:
    import earthaccess
except ImportError:  # pragma: no cover - optional dependency
    earthaccess = None

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

SUMMER_MONTHS = [3, 4, 5]


def ensure_dir(path: Path) -> Path:
    path.mkdir(parents=True, exist_ok=True)
    return path


def build_region(aoi: dict) -> list[float]:
    return [aoi["west"], aoi["south"], aoi["east"], aoi["north"]]


def download_landsat(output_dir: Path, years: Sequence[int], aoi: dict, cloud_max: float = 20.0) -> List[Path]:
    """Download Landsat LST composites for each year using Google Earth Engine."""
    if ee is None:
        raise RuntimeError("earthengine-api is required. Install it with 'pip install earthengine-api'.")

    ensure_dir(output_dir)

    try:
        ee.Initialize(project=os.getenv("GOOGLE_CLOUD_PROJECT"))
    except Exception as exc:  # pragma: no cover - runtime-only
        raise RuntimeError(
            "Earth Engine is not initialized. Run 'earthengine authenticate' and initialize with a Google Cloud project."
        ) from exc

    region = build_region(aoi)
    geometry = ee.Geometry.Rectangle(region)
    collection = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2")

    outputs: List[Path] = []
    for year in years:
        start = f"{year}-03-01"
        end = f"{year + 1}-01-01"
        image = (
            collection.filterBounds(geometry)
            .filterDate(start, end)
            .filter(ee.Filter.lt("CLOUD_COVER", cloud_max))
            .median()
            .select("ST_B10")
        )

        output_path = output_dir / f"landsat_lst_{year}.tif"
        if output_path.exists():
            outputs.append(output_path)
            continue

        task = ee.batch.Export.image.toDrive(
            image=image,
            description=f"landsat_lst_{year}",
            folder="heat_mitigation",
            region=region,
            scale=30,
            crs="EPSG:32643",
            fileFormat="GeoTIFF",
            maxPixels=1e13,
        )
        task.start()
        print(f"Started Landsat export task for {year}: {task.id}")
        outputs.append(output_path)

    return outputs


def download_era5(output_dir: Path, years: Sequence[int], aoi: dict) -> List[Path]:
    """Download monthly ERA5 reanalysis variables using CDS API."""
    if cdsapi is None:
        raise RuntimeError("cdsapi is required. Install it with 'pip install cdsapi'.")

    ensure_dir(output_dir)
    try:
        client = cdsapi.Client()
    except Exception as exc:  # pragma: no cover - runtime-only
        raise RuntimeError(
            "CDS API credentials are missing. Create a ~/.cdsapirc file with your CDS API key."
        ) from exc
    outputs: List[Path] = []

    for year in years:
        for month in SUMMER_MONTHS:
            output_path = output_dir / f"era5_{year}_{month:02d}.nc"
            if output_path.exists():
                outputs.append(output_path)
                continue

            request = {
                "variable": [
                    "2m_temperature",
                    "surface_pressure",
                    "total_precipitation",
                    "10m_u_component_of_wind",
                    "10m_v_component_of_wind",
                    "2m_dewpoint_temperature",
                ],
                "year": [str(year)],
                "month": [f"{month:02d}"],
                "day": [f"{day:02d}" for day in range(1, 32)],
                "time": [f"{hour:02d}:00" for hour in [0, 6, 12, 18]],
                "area": [aoi["north"], aoi["west"], aoi["south"], aoi["east"]],
                "format": "netcdf",
                "product_type": "reanalysis",
            }

            client.retrieve(
                "reanalysis-era5-single-levels",
                request,
                str(output_path),
            )
            print(f"Downloaded ERA5 file for {year}-{month:02d}")
            outputs.append(output_path)

    return outputs


def download_ecostress(output_dir: Path, years: Sequence[int], aoi: dict) -> List[Path]:
    """Download ECOSTRESS ECO2LSTE products using earthaccess."""
    if earthaccess is None:
        raise RuntimeError("earthaccess is required. Install it with 'pip install earthaccess'.")

    ensure_dir(output_dir)
    try:
        if not earthaccess.login(strategy="interactive"):
            raise RuntimeError("Earthaccess login failed. Please authenticate with NASA Earthdata.")
    except Exception as exc:  # pragma: no cover - runtime-only
        raise RuntimeError("Earthaccess login failed. Please authenticate with NASA Earthdata.") from exc

    outputs: List[Path] = []
    for year in years:
        start = f"{year}-03-01"
        end = f"{year + 1}-01-01"
        results = earthaccess.search_data(
            short_name="ECO2LSTE.001",
            cloud_hosted=False,
            bounding_box=(aoi["west"], aoi["south"], aoi["east"], aoi["north"]),
            temporal=(start, end),
            count=10,
        )
        if not results:
            print(f"No ECOSTRESS results found for {year}")
            continue

        downloaded = earthaccess.download(results, str(output_dir))
        for item in downloaded or []:
            outputs.append(Path(item))
        print(f"Downloaded {len(downloaded or [])} ECOSTRESS file(s) for {year}")

    return outputs


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Download remote geospatial datasets for the heat-mitigation pipeline")
    parser.add_argument("--years", nargs="+", type=int, default=[2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026])
    parser.add_argument("--landsat-out", type=Path, default=LANDSAT_DIR)
    parser.add_argument("--era5-out", type=Path, default=ERA5_DIR)
    parser.add_argument("--ecostress-out", type=Path, default=ECOSTRESS_DIR)
    parser.add_argument("--cloud-max", type=float, default=20.0)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    years = sorted(args.years)

    print(f"Starting download run for years {years}")
    try:
        landsat_files = download_landsat(args.landsat_out, years, AOI, cloud_max=args.cloud_max)
    except Exception as exc:
        print(f"Landsat step skipped: {exc}")
        landsat_files = []

    try:
        era5_files = download_era5(args.era5_out, years, AOI)
    except Exception as exc:
        print(f"ERA5 step skipped: {exc}")
        era5_files = []

    try:
        ecostress_files = download_ecostress(args.ecostress_out, years, AOI)
    except Exception as exc:
        print(f"ECOSTRESS step skipped: {exc}")
        ecostress_files = []

    print("Download workflow finished")
    print(f"Landsat files: {len(landsat_files)}")
    print(f"ERA5 files: {len(era5_files)}")
    print(f"ECOSTRESS files: {len(ecostress_files)}")


if __name__ == "__main__":
    main()
