import argparse
from dataclasses import dataclass
import json
from pathlib import Path
import re
from typing import Dict, List, Optional, Set
import csv


def in_file_to_path(parser: argparse.ArgumentParser, x):
    p = Path(x).resolve()
    if not p.is_file():
        parser.error(f"The file {p} does not exist")
    return p


@dataclass
class Args:
    in_file: Path
    out_file: Optional[Path]
    min_length: int
    max_length: int
    characters: str


parser = argparse.ArgumentParser()
parser.add_argument(
    "-i",
    "--in-file",
    dest="in_file",
    required=True,
    type=lambda x: in_file_to_path(parser, x),
)
parser.add_argument(
    "-o",
    "--out-file",
    dest="out_file",
    required=False,
    default=None,
    type=lambda x: Path(x).resolve(),
)
parser.add_argument(
    "-ll",  # Length Lower
    "--min-length",
    dest="min_length",
    required=False,
    default=3,
    type=int,
)
parser.add_argument(
    "-lu",  # Length Upper
    "--max-length",
    dest="max_length",
    required=False,
    default=16,
    type=int,
)
parser.add_argument(
    "-c",
    "--characters",
    dest="characters",
    required=False,
    default="abcdefghijklmnopqrstuvwxyz",
    type=str,
)

args = Args(**vars(parser.parse_args()))

with args.in_file.open("r") as f:
    character_set = set(c.upper() for c in args.characters)
    seen_words: Set[str] = set()
    out: Dict[str, Dict[str, List[str]]] = {}

    for index, row in enumerate(csv.DictReader(f)):
        print(f"Processing line #{index}")
        word = row["Word"].upper()
        cefr = row["CEFR"]

        if len(word) not in range(args.min_length, args.max_length):
            continue
        if not set(c for c in word).issubset(character_set):
            continue
        if word in seen_words:
            continue

        seen_words.add(word)
        out.setdefault(cefr, {}).setdefault(str(len(word)), []).append(word)
    if args.out_file is not None:
        with args.out_file.open("w") as o:
            json.dump(out, o)
    else:
        print(json.dumps(out, indent=2))
