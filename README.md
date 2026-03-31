# SNUPI Research Slides Skills

Installable Codex skills for generating **SNUPI Lab presentation slide drafts** with [`slides-grab`](https://github.com/vkehfdl1/slides-grab) as the backend.

These skills are aimed at academic workflows:
- literature review decks,
- single-paper deep-dives,
- seminar presentations,
- research meeting updates.

The skills can start from:
- a Markdown brief,
- paper URLs or local PDFs,
- or an interview when the user has no draft yet.

## Included skills

- `snupi-presentation-slides-en`
- `snupi-presentation-slides-ko`

Both skills require the agent to:
1. verify `slides-grab` is installed,
2. verify the installable `slides-grab` skills are available,
3. normalize the run into `decks/<deck-slug>/`,
4. create `presentation-brief.md`,
5. create and get approval for `slide-outline.md`,
6. generate `slide-XX.html`,
7. run `slides-grab validate`,
8. run `slides-grab build-viewer`,
9. run `slides-grab edit`.

The workflow stops at draft HTML slides plus viewer/editor. Export remains a later handoff to `slides-grab-export`.

## slides-grab prerequisite

Install `slides-grab` first using its official Codex flow:

```bash
npm install slides-grab
npx playwright install chromium
npx skills add ./node_modules/slides-grab -g -a codex --yes --copy
npx slides-grab --help
```

Then restart Codex.

Reference:
- [slides-grab Codex install guide](https://raw.githubusercontent.com/vkehfdl1/slides-grab/main/docs/installation/codex.md)

## Install these skills

From GitHub:

```bash
npx skills add PJH6029/snupi-slides-skill --skill snupi-presentation-slides-en -a codex
npx skills add PJH6029/snupi-slides-skill --skill snupi-presentation-slides-ko -a codex
```

## Optional paper-extraction utilities

Paper-aware mode works best when Poppler utilities are available:

```bash
brew install poppler
```

The skills try to use:
- `pdfinfo`
- `pdftotext`
- `pdfimages -all`

If those tools are unavailable, the workflow should continue with text-only analysis and source-aware placeholders instead of failing.

## Workspace contract

Each deck should live in:

```text
decks/<deck-slug>/
├── presentation-brief.md
├── slide-outline.md
├── research/
├── assets/
└── slide-XX.html
```

This makes later revisions easier because the outline, extracted paper material, and slide assets stay together.

## Prompt examples

English:

```text
Use $snupi-presentation-slides-en. I have two paper URLs and rough Markdown notes. Build an outline first, then draft the HTML slides and launch the slides-grab editor.
```

Korean:

```text
$snupi-presentation-slides-ko 를 사용해서 내 논문 PDF와 발표 메모를 바탕으로 outline을 먼저 만들고, 승인 후 HTML 슬라이드와 slides-grab editor까지 진행해줘.
```

## SNUPI style stance

The local template files in [`template/snupi_slide_template.pdf`](template/snupi_slide_template.pdf) and [`template/snupi_slide_template.pptx`](template/snupi_slide_template.pptx) are **style references**, not the literal output canvas.

The skills keep `slides-grab`'s native `720pt x 405pt` 16:9 frame and borrow the SNUPI presentation discipline:
- large titles,
- body text that stays readable,
- one dominant figure, table, or equation per slide,
- minimal dense prose,
- optional meeting-log slide only when useful.

## References and inspirations

- [slides-grab](https://github.com/vkehfdl1/slides-grab)
- [Ralphton-Seoul-Presentaion-Skill](https://github.com/NomaDamas/Ralphton-Seoul-Presentaion-Skill)
- [Auto-Slides](https://github.com/Westlake-AGI-Lab/Auto-Slides)
