# SNUPI style guide (EN)

Apply this on top of the installed `slides-grab` design workflow, using the bundled HTML template in `assets/template-html/` as the canonical visual source.

## Frame and typography
- Keep the native `slides-grab` frame: `720pt x 405pt` (16:9).
- Use Pretendard or the standard `slides-grab` typography stack.
- Title text should usually be at least `35pt`.
- Main body text should usually be at least `25pt`.
- If the slide becomes unreadable at those sizes, reduce content instead of shrinking text aggressively.

## Template fidelity rules
- Start from the bundled HTML template before inventing any new layout.
- Preserve the blue top and bottom bars, footer logo/date/page rhythm, and serif-forward title treatment unless the user explicitly asks for a deviation.
- Reuse the template's slide archetypes for title, list, figure, equation, and meeting-log slides.
- Treat the PPTX and PDF in the repo as legacy visual reference only.

## SNUPI presentation rules
- One dominant figure, table, or equation per slide whenever possible.
- Explain the visual verbally; do not replace narration with dense paragraphs.
- Avoid walls of text and long bullet lists.
- Avoid placing multiple unrelated images on one slide.
- When using equations, show one or two large equations, not a dense derivation block.
- A meeting-log slide is optional and should appear only when it genuinely helps the audience.

## Visual direction
- Prefer bright, clean, academic layouts over decorative business-deck styling.
- Use whitespace, alignment, and scale before adding cards or chrome.
- Treat cover slides and section dividers like posters with one strong message.
- Use modest accent color and strong contrast; keep charts and figures readable at presentation distance.
- Avoid CSS gradients when the deck may later be exported to PPTX.

## Content rhythm
- Lead with why the paper or update matters.
- Follow with method, evidence, critique, and takeaways.
- Keep each slide scannable in a few seconds.
- When in doubt, cut text and enlarge the most important figure.
