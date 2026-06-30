from __future__ import annotations

import argparse
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LANDSAT_DIR = ROOT / "data" / "landsat"


def main() -> None:
    parser = argparse.ArgumentParser(description="Copy a Landsat file into the expected data/landsat folder")
    parser.add_argument("source", type=Path, help="Path to the downloaded Landsat file")
    parser.add_argument("--name", type=str, default=None, help="Optional destination filename")
    args = parser.parse_args()

    if not args.source.exists():
        raise FileNotFoundError(f"Source file not found: {args.source}")

    LANDSAT_DIR.mkdir(parents=True, exist_ok=True)
    dest_name = args.name or args.source.name
    destination = LANDSAT_DIR / dest_name
    shutil.copy2(args.source, destination)
    print(f"Copied {args.source} -> {destination}")


if __name__ == "__main__":
    main()
