from __future__ import annotations

import argparse
import os
from pathlib import Path
from typing import List, Sequence, Tuple

import numpy as np
import xarray as xr
from rasterio.transform import from_origin
from rasterio.warp import reproject, Resampling

try:
    import rasterio
except ImportError as exc:  # pragma: no cover - optional dependency
    raise RuntimeError("rasterio is required. Install it with 'pip install rasterio'.") from exc

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
LANDSAT_DIR = DATA_DIR / "landsat"
ERA5_DIR = DATA_DIR / "era5"
ECOSTRESS_DIR = DATA_DIR / "ecostress"
PROCESSED_DIR = DATA_DIR / "processed"

AOI = {
    "north": 13.1,
    "south": 12.8,
    "west": 77.4,
    "east": 77.8,
}
TARGET_CRS = "EPSG:32643"
TARGET_RESOLUTION = 30.0


def ensure_dir(path: Path) -> Path:
    path.mkdir(parents=True, exist_ok=True)
    return path


def build_template_grid(aoi: dict, resolution: float = TARGET_RESOLUTION) -> Tuple[Tuple[float, float, float, float], Tuple[int, int]]:
    west, south, east, north = aoi["west"], aoi["south"], aoi["east"], aoi["north"]
    width = int(round((east - west) * 111320 / resolution))
    height = int(round((north - south) * 111320 / resolution))
    transform = from_origin(west, north, resolution, resolution)
    return transform, (height, width)


def reproject_to_template(src_path: Path, dst_path: Path, template_transform, template_shape, template_crs: str = TARGET_CRS) -> None:
    with rasterio.open(src_path) as src:
        dst_array = np.empty(template_shape, dtype=np.float32)
        reproject(
            source=rasterio.band(src, 1),
            destination=dst_array,
            src_transform=src.transform,
            src_crs=src.crs or "EPSG:4326",
            dst_transform=template_transform,
            dst_crs=template_crs,
            resampling=Resampling.bilinear,
        )
        with rasterio.open(
            dst_path,
            "w",
            driver="GTiff",
            height=template_shape[0],
            width=template_shape[1],
            count=1,
            dtype="float32",
            crs=template_crs,
            transform=template_transform,
        ) as dst:
            dst.write(dst_array, 1)


def preprocess_landsat(input_path: Path, output_dir: Path, template_transform, template_shape) -> Path:
    with rasterio.open(input_path) as src:
        data = src.read(1, masked=True).astype(np.float32)
        celsius = ((data * 0.00341802) + 149.0 - 273.15).astype(np.float32)

    output_path = output_dir / f"{input_path.stem}_aligned.tif"
    with rasterio.open(
        output_path,
        "w",
        driver="GTiff",
        height=template_shape[0],
        width=template_shape[1],
        count=1,
        dtype="float32",
        crs=TARGET_CRS,
        transform=template_transform,
    ) as dst:
        dst.write(celsius, 1)

    return output_path


def preprocess_era5(input_path: Path, output_dir: Path, template_transform, template_shape) -> List[Path]:
    outputs: List[Path] = []
    if input_path.suffix.lower() != ".nc":
        print(f"Skipping non-NetCDF ERA5 file: {input_path}")
        return outputs

    try:
        ds = xr.open_dataset(input_path)
    except Exception as exc:
        print(f"Skipping ERA5 file {input_path}: {exc}")
        return outputs

    for var in [
        "2m_temperature",
        "surface_pressure",
        "total_precipitation",
        "10m_u_component_of_wind",
        "10m_v_component_of_wind",
        "2m_dewpoint_temperature",
    ]:
        if var not in ds:
            continue

        da = ds[var].mean(dim="time", keep_attrs=True).squeeze(drop=True)
        if "latitude" in da.coords and "longitude" in da.coords:
            lat = da["latitude"].values
            lon = da["longitude"].values
            data = da.values.astype(np.float32)

            if data.ndim == 2:
                transform = from_origin(float(lon.min()), float(lat.max()), abs(float(lon[1]) - float(lon[0])), abs(float(lat[0]) - float(lat[1])))
                temp_path = output_dir / f"{input_path.stem}_{var}_4326.tif"
                with rasterio.open(
                    temp_path,
                    "w",
                    driver="GTiff",
                    height=data.shape[0],
                    width=data.shape[1],
                    count=1,
                    dtype="float32",
                    crs="EPSG:4326",
                    transform=transform,
                ) as dst:
                    dst.write(data, 1)

                aligned_path = output_dir / f"{input_path.stem}_{var}_aligned.tif"
                reproject_to_template(temp_path, aligned_path, template_transform, template_shape)
                outputs.append(aligned_path)

    return outputs


def preprocess_ecostress(input_path: Path, output_dir: Path, template_transform, template_shape) -> Path:
    try:
        import h5py
    except ImportError as exc:  # pragma: no cover - optional dependency
        raise RuntimeError("h5py is required to preprocess ECOSTRESS HDF5 products") from exc

    output_path = output_dir / f"{input_path.stem}_aligned.tif"
    with h5py.File(input_path, "r") as h5:
        candidates = []
        def walk(node, prefix=""):
            if isinstance(node, h5py.Dataset):
                if node.ndim == 2 and node.shape[0] > 1 and node.shape[1] > 1:
                    candidates.append((prefix, node.shape))
            elif isinstance(node, h5py.Group):
                for key, value in node.items():
                    walk(value, f"{prefix}/{key}" if prefix else key)
        walk(h5)

        if not candidates:
            raise ValueError(f"No suitable 2D dataset found in {input_path}")

        dataset_name = candidates[0][0]
        data = h5[dataset_name][...].astype(np.float32)

    with rasterio.open(
        output_path,
        "w",
        driver="GTiff",
        height=template_shape[0],
        width=template_shape[1],
        count=1,
        dtype="float32",
        crs=TARGET_CRS,
        transform=template_transform,
    ) as dst:
        dst.write(data[: template_shape[0], : template_shape[1]], 1)

    return output_path


def stack_rasters(raster_paths: Sequence[Path], output_path: Path) -> None:
    arrays = []
    for raster_path in raster_paths:
        with rasterio.open(raster_path) as src:
            arrays.append(src.read(1).astype(np.float32))

    if not arrays:
        raise ValueError("No rasters available to stack")

    with rasterio.open(
        output_path,
        "w",
        driver="GTiff",
        height=arrays[0].shape[0],
        width=arrays[0].shape[1],
        count=len(raster_paths),
        dtype="float32",
        crs=TARGET_CRS,
        transform=rasterio.open(raster_paths[0]).transform,
    ) as dst:
        for band_idx, array in enumerate(arrays, start=1):
            dst.write(array, band_idx)


def preprocess_year(year: int, landsat_dir: Path, era5_dir: Path, ecostress_dir: Path, output_dir: Path) -> Path | None:
    ensure_dir(output_dir)
    template_transform, template_shape = build_template_grid(AOI)

    landsat_path = next((path for path in landsat_dir.glob(f"landsat_lst_{year}*.tif") if path.is_file()), None)
    era5_paths = sorted([path for path in era5_dir.glob(f"era5_{year}_*.nc") if path.is_file()])
    ecostress_path = next((path for path in ecostress_dir.glob(f"*{year}*.h5") if path.is_file()), None)

    if landsat_path is None:
        print(f"Skipping {year}: no Landsat input found in {landsat_dir}")
        return None

    landsat_aligned = preprocess_landsat(landsat_path, output_dir, template_transform, template_shape)
    era5_aligned = []
    for era5_path in era5_paths:
        era5_aligned.extend(preprocess_era5(era5_path, output_dir, template_transform, template_shape))

    if ecostress_path is not None:
        ecostress_aligned = preprocess_ecostress(ecostress_path, output_dir, template_transform, template_shape)
        stack_inputs = [landsat_aligned, *era5_aligned, ecostress_aligned]
    else:
        stack_inputs = [landsat_aligned, *era5_aligned]

    output_path = output_dir / f"{year}_stacked.tif"
    stack_rasters(stack_inputs, output_path)
    return output_path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Preprocess downloaded heat-mitigation datasets")
    parser.add_argument("--years", nargs="+", type=int, default=[2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026])
    parser.add_argument("--landsat-dir", type=Path, default=LANDSAT_DIR)
    parser.add_argument("--era5-dir", type=Path, default=ERA5_DIR)
    parser.add_argument("--ecostress-dir", type=Path, default=ECOSTRESS_DIR)
    parser.add_argument("--output-dir", type=Path, default=PROCESSED_DIR)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    ensure_dir(args.output_dir)

    for year in sorted(args.years):
        output_path = preprocess_year(year, args.landsat_dir, args.era5_dir, args.ecostress_dir, args.output_dir)
        if output_path is not None:
            print(f"Created processed stack: {output_path}")


if __name__ == "__main__":
    main()
