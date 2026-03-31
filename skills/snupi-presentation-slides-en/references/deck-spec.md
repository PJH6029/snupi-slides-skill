# Deck Spec

Normalize every request into a `deck_spec.json` before building slides.

## Top-Level Shape

```json
{
  "metadata": {},
  "sources": [],
  "defaults": {},
  "slides": []
}
```

## `metadata`

- `title`, `subtitle`, `presenter`, `date`
- `presentation_type`: `literature-review`, `paper-review`, or `research-meeting`
- `audience`, `duration_minutes`, `target_slides`, `language`

## `sources`

Each source object should include:

- `id`: Stable local identifier such as `paper_1`
- `title`
- `citation`: Short inline citation for slides
- `url`: Optional canonical paper URL
- `pdf_path`: Optional local PDF path

## `defaults`

Use this for cross-slide defaults such as theme overrides or recurring footer text. Omit keys you do not need.

## `slides`

Every slide object must include:

- `layout`: `title`, `tldr`, `bullets`, `figure_focus`, `equation_focus`, `meeting_log`, or `closing`
- `title`
- `bullets`: zero to five concise points
- `speaker_notes`: optional array of strings
- `assets`: optional array of asset objects
- `citations`: optional array of source ids

## Asset Shape

```json
{
  "kind": "image",
  "path": "paper_bundle/assets/figure_01.png",
  "caption": "Figure 2. Model overview.",
  "source_id": "paper_1",
  "citation": "Smith et al., NeurIPS 2025",
  "fit": "contain"
}
```

Allowed `kind` values:

- `image`: Use for figures or rendered tables.
- `equation`: Use `latex` instead of `path` when the equation is known.
- `table`: Use when the extracted asset is a table image or when the agent wants table-specific phrasing.
- `placeholder`: Use `placeholder` text instead of `path`.

For placeholders, use direct operator guidance such as `Insert ablation table from Section 4.2 after figure extraction.` rather than vague notes.
