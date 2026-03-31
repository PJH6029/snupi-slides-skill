#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
from pathlib import Path
from typing import Iterable
from urllib.parse import urljoin, urlparse

import pdfplumber
import requests
from bs4 import BeautifulSoup
from pdf2image import convert_from_path
from PIL import Image
from pypdf import PdfReader

FIGURE_RE = re.compile(r"^(fig(?:ure)?\.?)\s*([A-Za-z0-9.\-]+)\b[:.\-]?\s*(.*)$", re.IGNORECASE)
TABLE_RE = re.compile(r"^(table)\s*([A-Za-z0-9.\-]+)\b[:.\-]?\s*(.*)$", re.IGNORECASE)
USER_AGENT = "snupi-slides-skill/0.1"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Extract markdown and candidate paper assets for the SNUPI slide skill."
    )
    parser.add_argument("--pdf", help="Local PDF path")
    parser.add_argument("--url", help="Paper URL or direct PDF URL")
    parser.add_argument(
        "--parser",
        choices=["auto", "basic", "marker"],
        default="auto",
        help="Extraction backend",
    )
    parser.add_argument("--output-dir", required=True, help="Output directory for bundle files")
    parser.add_argument("--title", help="Override detected paper title")
    parser.add_argument("--citation", help="Short citation string")
    parser.add_argument("--source-id", default="paper_1", help="Stable source id")
    parser.add_argument("--max-assets", type=int, default=6, help="Maximum number of figure/table assets")
    return parser.parse_args()


def compact_text(text: str | None) -> str:
    return " ".join((text or "").split())


def normalize_caption_text(text: str | None) -> str:
    compact = compact_text(text)
    return re.sub(r"\b(Figure|Fig\.|Table)(\d)", r"\1 \2", compact)


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def is_arxiv_abs(url: str) -> bool:
    parsed = urlparse(url)
    return parsed.netloc.endswith("arxiv.org") and parsed.path.startswith("/abs/")


def arxiv_pdf_url(url: str) -> str:
    parsed = urlparse(url)
    paper_id = parsed.path.split("/abs/", 1)[1]
    return f"{parsed.scheme}://{parsed.netloc}/pdf/{paper_id}.pdf"


def fetch_html(url: str) -> tuple[str, requests.Response]:
    response = requests.get(url, timeout=30, headers={"User-Agent": USER_AGENT})
    response.raise_for_status()
    return response.text, response


def infer_title_from_html(html: str) -> str | None:
    soup = BeautifulSoup(html, "html.parser")
    title_tag = soup.find("meta", attrs={"name": "citation_title"})
    if title_tag and title_tag.get("content"):
        return compact_text(title_tag["content"])
    if soup.title and soup.title.string:
        return compact_text(soup.title.string)
    return None


def resolve_pdf_url(url: str) -> tuple[str, str | None]:
    if url.lower().endswith(".pdf"):
        return url, None
    if is_arxiv_abs(url):
        html, _ = fetch_html(url)
        return arxiv_pdf_url(url), infer_title_from_html(html)

    html, response = fetch_html(url)
    soup = BeautifulSoup(html, "html.parser")
    inferred_title = infer_title_from_html(html)

    for attr_name, attr_value in (
        ("name", "citation_pdf_url"),
        ("name", "pdf_url"),
        ("property", "citation_pdf_url"),
        ("property", "og:pdf"),
    ):
        tag = soup.find("meta", attrs={attr_name: attr_value})
        if tag and tag.get("content"):
            return urljoin(str(response.url), tag["content"]), inferred_title

    link_tag = soup.find("a", href=re.compile(r"\.pdf($|\?)", re.IGNORECASE))
    if link_tag and link_tag.get("href"):
        return urljoin(str(response.url), link_tag["href"]), inferred_title

    raise RuntimeError(f"Could not resolve a PDF URL from {url!r}. HTML title: {inferred_title!r}")


def download_pdf(url: str, destination: Path) -> None:
    with requests.get(url, timeout=60, stream=True, headers={"User-Agent": USER_AGENT}) as response:
        response.raise_for_status()
        with destination.open("wb") as handle:
            for chunk in response.iter_content(chunk_size=65536):
                if chunk:
                    handle.write(chunk)


def load_pdf_text(pdf_path: Path) -> str:
    reader = PdfReader(str(pdf_path))
    parts = []
    for index, page in enumerate(reader.pages, start=1):
        text = compact_text(page.extract_text() or "")
        if text:
            parts.append(f"## Page {index}\n\n{text}")
    return "\n\n".join(parts)


def detect_pdf_title(pdf_path: Path, fallback: str | None = None) -> str:
    try:
        reader = PdfReader(str(pdf_path))
        metadata = reader.metadata or {}
        if metadata.title:
            return compact_text(str(metadata.title))
    except Exception:
        pass
    return compact_text(fallback) or pdf_path.stem.replace("_", " ")


def group_words_to_lines(words: list[dict], tolerance: float = 3.0) -> list[dict]:
    groups: list[dict] = []
    for word in sorted(words, key=lambda item: (item["top"], item["x0"])):
        target = None
        for group in groups:
            if abs(group["top"] - word["top"]) <= tolerance:
                target = group
                break
        if target is None:
            target = {"top": word["top"], "words": []}
            groups.append(target)
        target["words"].append(word)

    lines = []
    for group in groups:
        items = sorted(group["words"], key=lambda item: item["x0"])
        text = compact_text(" ".join(item["text"] for item in items))
        if not text:
            continue
        lines.append(
            {
                "text": text,
                "x0": min(item["x0"] for item in items),
                "x1": max(item["x1"] for item in items),
                "top": min(item["top"] for item in items),
                "bottom": max(item["bottom"] for item in items),
            }
        )
    return sorted(lines, key=lambda item: (item["top"], item["x0"]))


def classify_caption(text: str) -> str | None:
    if FIGURE_RE.match(text):
        return "figure"
    if TABLE_RE.match(text):
        return "table"
    return None


def column_side(page_width: float, line: dict) -> str:
    line_width = line["x1"] - line["x0"]
    center = (line["x0"] + line["x1"]) / 2
    if line_width >= page_width * 0.65:
        return "full"
    return "left" if center < page_width / 2 else "right"


def extend_caption(lines: list[dict], start_index: int) -> tuple[str, int]:
    text_parts = [lines[start_index]["text"]]
    current = lines[start_index]
    consumed = start_index
    for index in range(start_index + 1, min(len(lines), start_index + 3)):
        nxt = lines[index]
        if classify_caption(nxt["text"]):
            break
        if nxt["top"] - current["bottom"] > 18:
            break
        if abs(nxt["x0"] - current["x0"]) > 36:
            break
        text_parts.append(nxt["text"])
        current = nxt
        consumed = index
        if len(" ".join(text_parts)) > 220:
            break
    return compact_text(" ".join(text_parts)), consumed


def find_caption_candidates(pdf_path: Path) -> list[dict]:
    candidates: list[dict] = []
    with pdfplumber.open(str(pdf_path)) as pdf:
        for page_index, page in enumerate(pdf.pages, start=1):
            words = page.extract_words(keep_blank_chars=False, use_text_flow=False)
            lines = group_words_to_lines(words)
            idx = 0
            while idx < len(lines):
                line = lines[idx]
                kind = classify_caption(line["text"])
                if not kind:
                    idx += 1
                    continue
                caption_text, end_idx = extend_caption(lines, idx)
                candidates.append(
                    {
                        "page": page_index,
                        "page_width": float(page.width),
                        "page_height": float(page.height),
                        "kind": kind,
                        "caption": normalize_caption_text(caption_text),
                        "x0": float(line["x0"]),
                        "x1": float(line["x1"]),
                        "top": float(line["top"]),
                        "bottom": float(lines[end_idx]["bottom"]),
                        "side": column_side(float(page.width), line),
                    }
                )
                idx = end_idx + 1
    return candidates


def render_needed_pages(pdf_path: Path, page_numbers: Iterable[int], debug_dir: Path) -> dict[int, Image.Image]:
    pages = sorted(set(page_numbers))
    if not pages:
        return {}
    images = convert_from_path(
        str(pdf_path),
        dpi=180,
        first_page=min(pages),
        last_page=max(pages),
    )
    rendered = {}
    for idx, image in enumerate(images, start=min(pages)):
        if idx not in pages:
            continue
        rendered[idx] = image
        image.save(debug_dir / f"page_{idx:02d}.png")
    return rendered


def crop_box(candidate: dict, next_candidate: dict | None) -> tuple[float, float, float, float] | None:
    page_width = candidate["page_width"]
    page_height = candidate["page_height"]
    margin = 18.0

    if candidate["side"] == "full":
        x0, x1 = margin, page_width - margin
    elif candidate["side"] == "left":
        x0, x1 = margin, page_width / 2 + margin
    else:
        x0, x1 = page_width / 2 - margin, page_width - margin

    if candidate["kind"] == "figure":
        y1 = candidate["top"] - 8
        y0 = max(margin, y1 - page_height * 0.42)
    else:
        y0 = candidate["bottom"] + 8
        y1 = min(page_height - margin, y0 + page_height * 0.34)

    if next_candidate and next_candidate["side"] == candidate["side"] and next_candidate["page"] == candidate["page"]:
        y1 = min(y1, next_candidate["top"] - 8)

    if y1 - y0 < 40 or x1 - x0 < 80:
        return None
    return (max(0, x0), max(0, y0), min(page_width, x1), min(page_height, y1))


def copy_marker_assets(markdown: str, markdown_path: Path, assets_dir: Path, citation: str, source_id: str, max_assets: int) -> list[dict]:
    asset_entries = []
    pattern = re.compile(r"!\[(?P<alt>[^\]]*)\]\((?P<path>[^)]+)\)")
    for idx, match in enumerate(pattern.finditer(markdown), start=1):
        if idx > max_assets:
            break
        raw_path = markdown_path.parent / match.group("path")
        if not raw_path.exists():
            continue
        suffix = raw_path.suffix.lower() or ".png"
        output_name = f"asset_{idx:02d}{suffix}"
        destination = assets_dir / output_name
        shutil.copy2(raw_path, destination)
        asset_entries.append(
            {
                "kind": "image",
                "path": f"assets/{output_name}",
                "caption": compact_text(match.group("alt")) or f"Extracted asset {idx}",
                "source_id": source_id,
                "citation": citation,
                "fit": "contain",
            }
        )
    return asset_entries


def run_marker(pdf_path: Path, output_dir: Path, title: str, citation: str, source_id: str, max_assets: int) -> dict:
    if shutil.which("marker_single") is None:
        raise RuntimeError("marker_single is not available in PATH")

    raw_dir = output_dir / "marker_raw"
    ensure_dir(raw_dir)
    command = ["marker_single", str(pdf_path), "--output_dir", str(raw_dir)]
    subprocess.run(command, check=True, capture_output=True, text=True)

    markdown_files = sorted(raw_dir.rglob("*.md"))
    if not markdown_files:
        raise FileNotFoundError("marker did not produce a markdown file")

    markdown_path = markdown_files[0]
    markdown_text = markdown_path.read_text(encoding="utf-8")
    (output_dir / "paper.md").write_text(markdown_text, encoding="utf-8")

    assets_dir = output_dir / "assets"
    ensure_dir(assets_dir)
    assets = copy_marker_assets(markdown_text, markdown_path, assets_dir, citation, source_id, max_assets)

    if not assets:
        assets = [
            {
                "kind": "placeholder",
                "placeholder": "Marker produced text but no reusable image assets. Insert a representative figure manually.",
                "caption": "No extracted figure or table was available.",
                "citation": citation,
                "source_id": source_id,
            }
        ]

    return {
        "metadata": {
            "title": title,
            "citation": citation,
            "parser": "marker",
            "source_id": source_id,
            "pdf_path": str(pdf_path),
        },
        "markdown_path": "paper.md",
        "assets": assets,
    }


def run_basic(pdf_path: Path, output_dir: Path, title: str, citation: str, source_id: str, max_assets: int) -> dict:
    markdown_text = load_pdf_text(pdf_path)
    (output_dir / "paper.md").write_text(markdown_text, encoding="utf-8")

    candidates = find_caption_candidates(pdf_path)
    assets_dir = output_dir / "assets"
    debug_dir = output_dir / "debug"
    ensure_dir(assets_dir)
    ensure_dir(debug_dir)

    page_images = render_needed_pages(pdf_path, (candidate["page"] for candidate in candidates), debug_dir)
    assets = []
    for index, candidate in enumerate(candidates[:max_assets], start=1):
        next_candidate = candidates[index] if index < len(candidates) else None
        box = crop_box(candidate, next_candidate)
        image = page_images.get(candidate["page"])
        if box is None or image is None:
            continue
        page_w = candidate["page_width"]
        page_h = candidate["page_height"]
        scale_x = image.width / page_w
        scale_y = image.height / page_h
        crop = (
            int(box[0] * scale_x),
            int(box[1] * scale_y),
            int(box[2] * scale_x),
            int(box[3] * scale_y),
        )
        if crop[2] - crop[0] < 80 or crop[3] - crop[1] < 80:
            continue
        cropped = image.crop(crop)
        output_name = f"{candidate['kind']}_{index:02d}.png"
        cropped.save(assets_dir / output_name)
        assets.append(
            {
                "kind": "table" if candidate["kind"] == "table" else "image",
                "path": f"assets/{output_name}",
                "caption": candidate["caption"],
                "source_id": source_id,
                "citation": citation,
                "page": candidate["page"],
                "fit": "contain",
            }
        )

    if not assets:
        assets = [
            {
                "kind": "placeholder",
                "placeholder": "Extract one representative figure or table manually if the slide needs a visual.",
                "caption": "No figure or table caption was detected confidently by the lightweight parser.",
                "citation": citation,
                "source_id": source_id,
            }
        ]

    return {
        "metadata": {
            "title": title,
            "citation": citation,
            "parser": "basic",
            "source_id": source_id,
            "pdf_path": str(pdf_path),
        },
        "markdown_path": "paper.md",
        "assets": assets,
    }


def write_bundle(bundle: dict, output_dir: Path) -> Path:
    bundle_path = output_dir / "bundle.json"
    bundle_path.write_text(json.dumps(bundle, indent=2, ensure_ascii=True), encoding="utf-8")
    return bundle_path


def main() -> int:
    args = parse_args()
    if not args.pdf and not args.url:
        raise SystemExit("Provide either --pdf or --url")

    output_dir = Path(args.output_dir).resolve()
    ensure_dir(output_dir)

    pdf_path: Path
    if args.pdf:
        pdf_path = Path(args.pdf).resolve()
        if not pdf_path.exists():
            raise FileNotFoundError(f"PDF not found: {pdf_path}")
        resolved_title = None
    else:
        resolved_pdf_url, resolved_title = resolve_pdf_url(args.url)
        pdf_path = output_dir / "source.pdf"
        download_pdf(resolved_pdf_url, pdf_path)

    title = compact_text(args.title) or detect_pdf_title(pdf_path, resolved_title or args.url)
    citation = compact_text(args.citation) or title

    bundle = None
    if args.parser in {"auto", "marker"}:
        try:
            bundle = run_marker(pdf_path, output_dir, title, citation, args.source_id, args.max_assets)
        except Exception:
            if args.parser == "marker":
                raise

    if bundle is None:
        bundle = run_basic(pdf_path, output_dir, title, citation, args.source_id, args.max_assets)

    if args.url:
        bundle["metadata"]["source_url"] = args.url

    bundle_path = write_bundle(bundle, output_dir)
    print(str(bundle_path))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except KeyboardInterrupt:
        raise SystemExit(130)
