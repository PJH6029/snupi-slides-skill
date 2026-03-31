# Brief Format

Use this format when the user can supply a draft request in markdown instead of answering an interview.

## Frontmatter

```yaml
title: "Talk title"
presenter: "Name"
date: "2026-04-07"
presentation_type: "literature-review" # literature-review | paper-review | research-meeting
audience: "SNUPI weekly meeting"
duration_minutes: 20
target_slides: 8
language: "en"
paper_urls:
  - "https://arxiv.org/abs/2501.01234"
pdf_paths:
  - "/abs/path/paper.pdf"
must_include:
  - "Key result from Section 4"
  - "Comparison table vs baseline"
```

## Body Sections

- `Objective`: One paragraph on the deck goal.
- `Key Messages`: Three to five bullets that must survive into the deck.
- `Outline`: Optional target slide sequence or section headings.
- `Notes`: Free-form context, caveats, and desired tone.

## Defaults

- If `presentation_type` is omitted, assume `paper-review` when a single paper source dominates the request.
- If `target_slides` is omitted, choose `max(6, min(10, duration_minutes / 2))`.
- If the user omits `paper_urls` and `pdf_paths`, treat the brief as source-free and prefer placeholders over fabricated visuals.
