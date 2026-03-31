# SNUPI Research Slides Skills

Installable Codex skills for generating **SNUPI Lab presentation slide drafts**.

The main deliverable in this repo is `skills/snupi-presentation-slides-en`, a self-contained skill for building editable SNUPI-style PPTX decks from:

- a structured markdown brief
- a short interview when the user only has rough notes
- public paper URLs or local PDFs that need summarization and figure/table extraction

The skill vendors its own PowerPoint template, PptxGenJS helpers, validation scripts, and paper-asset extraction utilities.

## Install

```bash
cd skills/snupi-presentation-slides-en
npm install
uv lock
uv sync
```

## Example

```bash
cd skills/snupi-presentation-slides-en
npm run build:example
python3 scripts/render_slides.py ../../decks/snupi-example/deck.pptx --output_dir ../../decks/snupi-example/rendered
python3 scripts/create_montage.py --input_dir ../../decks/snupi-example/rendered --output_file ../../decks/snupi-example/montage.png
python3 scripts/slides_test.py ../../decks/snupi-example/deck.pptx
```

## Repo Notes

- Generated working decks live under `decks/` and remain gitignored.
- The skill is designed to be invoked by Codex, so the main behavioral contract lives in the skill files and references rather than in a separate CLI app.
