# Layout Catalog

The sample SNUPI template is a style guide with repeated slide patterns. Match content to one of these layouts instead of improvising a new structure.

## `title`

- Use for the opening slide only.
- Requires: `title`, `subtitle`, `presenter`, `date`.

## `tldr`

- Use for agenda, one-slide takeaway summaries, or contribution overviews.
- Limit to three or four bullets.

## `bullets`

- Use for background, methods summaries, limitations, discussion, and future work.
- Keep bullets short; avoid paragraphs.

## `figure_focus`

- Use when one figure, chart, rendered table, or screenshot should dominate the slide.
- Prefer one primary asset. If extraction fails, insert a placeholder asset with a clear caption.

## `equation_focus`

- Use for one or two equations plus a short verbal interpretation.
- Prefer `assets[].latex` when the equation is already known, otherwise use a rendered image.

## `meeting_log`

- Reserve this for internal research meetings.
- Bullets should summarize decisions, blockers, and next steps.

## `closing`

- Use for takeaways, open questions, references to notes, or final discussion prompts.
- End literature reviews and paper reviews with explicit takeaways and open questions.
