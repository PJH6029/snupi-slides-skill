---
name: snupi-presentation-slides-en
description: Research-aware slides-grab wrapper for English SNUPI Lab presentation decks. Use when the user wants academic slides from a Markdown brief, paper URLs or PDFs, or an interview, then needs outline approval, HTML slide generation, validation, viewer build, and editor launch.
metadata:
  short-description: English SNUPI Lab research slides workflow
---

# SNUPI Research Slides (English)

Use this skill when the user wants an English academic presentation deck for a literature review, paper deep-dive, seminar, or research meeting using `slides-grab`.

## Goal
Finish the full draft-deck workflow:
1. verify `slides-grab` and the installed `slides-grab` skills are available,
2. normalize user material into a deck workspace,
3. create `presentation-brief.md`,
4. create and get approval for `slide-outline.md`,
5. generate `slide-XX.html`,
6. validate and build the viewer,
7. launch the `slides-grab` editor.

Do not skip outline approval. Do not stop at generated HTML. Do not export in this skill.

## Backend requirement
This is a SNUPI-specific wrapper on top of the installed `slides-grab` workflow.

Before doing content work:
1. Check `slides-grab --help` or `npm exec -- slides-grab --help`.
2. If the CLI is missing, follow `references/slides-grab-setup.md`.
3. If the Codex `slides-grab` skills are missing, tell the user to install them and restart Codex.
4. After setup succeeds, explicitly invoke the installed `$slides-grab` skill and use it as the backend baseline for plan, design, validation, viewer build, and editor launch.

## Intake priority
Use the first available source of truth in this order:
1. Existing Markdown brief or notes from the user.
2. Paper URLs or local PDFs supplied by the user.
3. Structured interview for missing information.

Always convert the gathered input into `decks/<deck-slug>/presentation-brief.md` before writing the outline.

## Deck workspace contract
Use `decks/<deck-slug>/` and keep the run state there:
- `presentation-brief.md`
- `slide-outline.md`
- `research/`
- `assets/`
- `slide-XX.html`

Keep later revisions in the same workspace instead of scattering notes elsewhere.

## Workflow
1. Verify `slides-grab` availability and invoke `$slides-grab`.
2. Create or reuse `decks/<deck-slug>/`.
3. Build `presentation-brief.md`:
   - If the user supplied Markdown, preserve the original structure and fill only the missing gaps.
   - If the user supplied paper URLs or PDFs, follow `references/paper-intake-and-figure-workflow.md`.
   - If critical information is still missing, ask the interview questions from `references/interview-checklist.md`.
4. Choose the closest default structure from `references/deck-recipes.md`.
5. Create `slide-outline.md` with ordered slides, core message per slide, and intended figure/table/equation slots.
6. Show the outline briefly and wait for explicit user approval.
7. After approval, use the installed `slides-grab` workflow to generate `slide-XX.html`.
8. Apply `references/snupi-style-guide.md` while designing:
   - keep the native 16:9 `slides-grab` frame,
   - prefer one dominant visual anchor per slide,
   - keep text sparse and presentation-first.
9. For paper-driven decks, prefer real figures or tables stored in `./assets/`. If extraction is weak or unsafe, use `data-image-placeholder` and a caption naming the source paper plus the missing asset.
10. Run `slides-grab validate --slides-dir <path>`.
11. Fix HTML/CSS until validation passes.
12. Run `slides-grab build-viewer --slides-dir <path>`.
13. Report the viewer path.
14. Run `slides-grab edit --slides-dir <path>` after the draft deck is ready.

## Rules
- Default to English output unless the user explicitly wants another language.
- Preserve `slides-grab`'s native `720pt x 405pt` frame. Do not force the local A4 template literally.
- Treat the SNUPI template as style guidance: large titles, large body text, one major figure/equation/table per slide, minimal dense prose.
- Prefer downloaded local assets in `./assets/`. Do not leave remote image URLs in saved slide HTML.
- Keep figures, tables, and equations academically faithful. If confidence is low, say so in the caption instead of inventing details.
- Use a meeting-log slide only when it genuinely helps the presentation.
- End this skill after validation, viewer build, and editor launch. If the user wants PDF or PPTX, hand off to `slides-grab-export`.

## References
- `references/slides-grab-setup.md`
- `references/interview-checklist.md`
- `references/paper-intake-and-figure-workflow.md`
- `references/snupi-style-guide.md`
- `references/deck-recipes.md`
