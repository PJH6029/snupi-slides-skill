---
name: snupi-presentation-slides-en
description: Create English SNUPI Lab research slide drafts in PPTX format for literature reviews, paper reviews, seminars, and research meetings. Use when a user wants a deck from a markdown brief, sparse notes that require a short interview, paper URLs, or local PDFs that need summaries, figures, tables, placeholders, and citations.
metadata:
  short-description: English SNUPI Lab research slides workflow
---

# SNUPI Research Slides (English)

Use this skill when the user wants an English academic presentation deck in SNUPI Lab style.

## What This Skill Produces

- An editable PowerPoint draft in `decks/<slug>/deck.pptx`
- A normalized `decks/<slug>/deck_spec.json`
- A rebuild wrapper `decks/<slug>/deck.js`
- Rendered validation outputs such as `rendered/` and `montage.png`
- Optional `paper_bundle/` artifacts when the request includes papers

## Workflow

1. Determine the intake mode.
   - If the user provides a structured markdown brief, use it directly.
   - If the user gives sparse notes, ask only for missing essentials: presentation type, audience, duration, presenter, and must-include sources or results.
   - If the user provides paper URLs or PDFs, resolve the canonical source and build a paper bundle before drafting slides.
2. Normalize the request into `deck_spec.json`.
   - Read [references/brief-format.md](references/brief-format.md) when you need the markdown brief contract.
   - Read [references/deck-spec.md](references/deck-spec.md) when you need the normalized schema.
3. Choose only from the supported layout tokens.
   - Read [references/layout-catalog.md](references/layout-catalog.md) when mapping content to slide patterns.
4. For paper-driven decks, create `paper_bundle/` first.
   - Read [references/paper-ingestion.md](references/paper-ingestion.md) before using `scripts/extract_paper_assets.py`.
   - Prefer parser mode `auto`. It will use `marker` when available and fall back to a lightweight parser otherwise.
5. Build the deck with `scripts/build_deck.js`.
6. Validate the output with the bundled render, overflow, and font scripts before delivery.

## Authoring Rules

- Treat `assets/snupi_slide_template.pptx` and `assets/snupi_slide_template.pdf` as style guides. Do not edit them in place.
- Keep slide titles at or above 35 pt whenever possible.
- Keep body text at or above 25 pt on standard bullet slides.
- Prefer one dominant figure, table, or equation per content-dense slide.
- Use explicit placeholders when extraction confidence is low. Never invent unreadable numbers from paper figures or tables.
- Add short source citations on slides that use paper-derived assets.
- Default to autonomous draft generation. Do not stop for outline approval unless the user explicitly asks for it.

## Commands

From this skill directory:

```bash
# Build a deck from a prepared spec
node scripts/build_deck.js --spec ../../decks/<slug>/deck_spec.json --dir ../../decks/<slug>

# Extract text and candidate paper assets
uv run python scripts/extract_paper_assets.py --url <paper-url> --output-dir ../../decks/<slug>/paper_bundle

# Render and validate the produced PPTX
python3 scripts/render_slides.py ../../decks/<slug>/deck.pptx --output_dir ../../decks/<slug>/rendered
python3 scripts/create_montage.py --input_dir ../../decks/<slug>/rendered --output_file ../../decks/<slug>/montage.png
python3 scripts/slides_test.py ../../decks/<slug>/deck.pptx
python3 scripts/detect_font.py ../../decks/<slug>/deck.pptx --json
```

## Notes

- `examples/` contains a sample request, sample deck spec, and a local figure asset for smoke testing.
- The vendored `assets/pptxgenjs_helpers/` and validation scripts make this skill self-contained; do not depend on the global `slides` skill at runtime.
