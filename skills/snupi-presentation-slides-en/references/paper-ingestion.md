# Paper Ingestion

Use public paper URLs and local PDFs as source material for slide drafts.

## Resolution Order

1. Resolve a canonical paper URL and PDF.
2. Build a short source record with `title`, `citation`, `url`, and `pdf_path`.
3. Run `scripts/extract_paper_assets.py`.
4. Convert the extraction result into `deck_spec.json` slide assets and citations.

## Parser Modes

- `auto`: Prefer `marker` when installed, otherwise fall back to `basic`.
- `basic`: Use `pypdf`, `pdfplumber`, and page-image cropping heuristics. This is the default expected path for ordinary lab members.
- `marker`: Use `marker_single` when available to get cleaner markdown and extracted images.

## Fallback Policy

- If figures or tables cannot be extracted confidently, insert a placeholder asset with a specific caption and the source citation.
- Never invent numeric values from unreadable figures or tables.
- Keep inline citations short, for example `Source: Smith et al., NeurIPS 2025`.
