# Paper intake and figure workflow (EN)

Use this when the user provides paper URLs, DOI links, arXiv links, or local PDFs.

## Research workspace
Inside `decks/<deck-slug>/research/`, keep enough context for later revisions:
- original URLs in a short notes file if needed,
- downloaded or copied PDFs,
- extracted text files,
- extracted figure/table image files that are useful.

The skill's public contract only guarantees `research/`; use lightweight subfiles or subfolders as needed.

## Intake flow
1. Resolve each user source to a local PDF when possible.
2. Save or copy the PDF into `decks/<deck-slug>/research/`.
3. Run these utilities when available:
   - `pdfinfo <paper>.pdf`
   - `pdftotext <paper>.pdf <paper>.txt`
   - `pdfimages -all <paper>.pdf <paper>-img`
4. Read the title, abstract, section headers, and result-heavy passages first.
5. Identify candidate visuals by caption relevance and by the slide story:
   - method overview,
   - main result table,
   - ablation chart,
   - qualitative comparison,
   - limitation or failure case.

## Asset selection rules
- Prefer real figures or tables only when the caption and nearby text clearly support the intended slide message.
- Copy selected assets into `decks/<deck-slug>/assets/` and reference them as `./assets/<file>`.
- Never leave remote `http(s)://` image URLs in final slide HTML.
- If extracted assets are low quality, ambiguous, duplicated, or obviously decorative, do not force them into the slide.

## Placeholder fallback
When a trustworthy visual is unavailable, use `data-image-placeholder` and a source-aware caption such as:

```text
Insert Figure 3 from Smith et al. (2024): model overview diagram.
Use the paper PDF in research/ as the source of truth.
```

The caption should name:
- the paper,
- the intended figure/table/equation,
- why it belongs on the slide.

## Failure handling
- If `pdfinfo`, `pdftotext`, or `pdfimages` are unavailable, continue with text-only analysis and placeholders.
- If the paper is inaccessible, ask the user for a PDF or continue from the text already available.
- Do not invent metrics, figure contents, or table values that are not supported by the source.
