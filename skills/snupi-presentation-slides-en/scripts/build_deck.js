#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const PptxGenJS = require("pptxgenjs");
const helpers = require(path.join(
  __dirname,
  "..",
  "assets",
  "pptxgenjs_helpers"
));
const { METRICS, THEME, SLIDE } = require("./layout_metrics");

const {
  autoFontSize,
  imageSizingContain,
  imageSizingCrop,
  latexToSvgDataUri,
  warnIfSlideElementsOutOfBounds,
  warnIfSlideHasOverlaps,
} = helpers;

const SUPPORTED_LAYOUTS = new Set([
  "title",
  "tldr",
  "bullets",
  "figure_focus",
  "equation_focus",
  "meeting_log",
  "closing",
]);

function parseArgs(argv) {
  const args = { emitSource: true };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--spec") {
      args.spec = argv[++i];
    } else if (arg === "--out") {
      args.out = argv[++i];
    } else if (arg === "--dir") {
      args.dir = argv[++i];
    } else if (arg === "--no-source") {
      args.emitSource = false;
    } else if (arg === "--help" || arg === "-h") {
      args.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return args;
}

function printHelp() {
  console.log(`Usage: node scripts/build_deck.js --spec <deck_spec.json> [--dir <output-dir>] [--out <deck.pptx>] [--no-source]`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function slugify(value) {
  return String(value || "deck")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "deck";
}

function compactText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeBullets(value) {
  if (!Array.isArray(value)) return [];
  return value.map(compactText).filter(Boolean).slice(0, 5);
}

function normalizeNotes(value) {
  if (!Array.isArray(value)) return [];
  return value.map(compactText).filter(Boolean);
}

function resolveAssetPath(specDir, assetPath) {
  if (!assetPath) return null;
  if (path.isAbsolute(assetPath)) return assetPath;
  const relativeToSpec = path.resolve(specDir, assetPath);
  if (fs.existsSync(relativeToSpec)) return relativeToSpec;
  const relativeToCwd = path.resolve(process.cwd(), assetPath);
  if (fs.existsSync(relativeToCwd)) return relativeToCwd;
  return relativeToSpec;
}

function splitIntoColumns(items) {
  const midpoint = Math.ceil(items.length / 2);
  return [items.slice(0, midpoint), items.slice(midpoint)];
}

function buildSourceMap(sources) {
  const map = new Map();
  for (const source of Array.isArray(sources) ? sources : []) {
    if (source && source.id) {
      map.set(source.id, source);
    }
  }
  return map;
}

function gatherCitationText(slideSpec, sourceMap) {
  const labels = [];
  const seen = new Set();
  const add = (label) => {
    const clean = compactText(label);
    if (!clean || seen.has(clean)) return;
    seen.add(clean);
    labels.push(clean);
  };

  for (const citationId of Array.isArray(slideSpec.citations)
    ? slideSpec.citations
    : []) {
    const source = sourceMap.get(citationId);
    add(source ? source.citation || source.title || citationId : citationId);
  }

  for (const asset of Array.isArray(slideSpec.assets) ? slideSpec.assets : []) {
    if (asset.citation) {
      add(asset.citation);
    } else if (asset.source_id && sourceMap.has(asset.source_id)) {
      const source = sourceMap.get(asset.source_id);
      add(source.citation || source.title || asset.source_id);
    }
  }

  return labels.join("; ");
}

function validateSpec(spec) {
  if (!spec || typeof spec !== "object") {
    throw new Error("Deck spec must be a JSON object.");
  }
  if (!spec.metadata || typeof spec.metadata !== "object") {
    throw new Error("Deck spec must include metadata.");
  }
  if (!Array.isArray(spec.slides) || spec.slides.length === 0) {
    throw new Error("Deck spec must include at least one slide.");
  }
  for (const [index, slide] of spec.slides.entries()) {
    if (!SUPPORTED_LAYOUTS.has(slide.layout)) {
      throw new Error(
        `Slide ${index + 1} has unsupported layout "${slide.layout}".`
      );
    }
    if (!compactText(slide.title)) {
      throw new Error(`Slide ${index + 1} is missing a title.`);
    }
  }
}

function addText(slide, text, options) {
  slide.addText(String(text || ""), {
    margin: 0,
    color: THEME.text,
    fontFace: THEME.bodyFont,
    ...options,
  });
}

function addTitle(slide, title) {
  const opts = autoFontSize(title, THEME.titleFont, {
    x: METRICS.title.x,
    y: METRICS.title.y,
    w: METRICS.title.w,
    h: METRICS.title.h,
    minFontSize: METRICS.title.minPt,
    maxFontSize: METRICS.title.maxPt,
    fontSize: METRICS.title.maxPt,
    mode: "shrink",
    padding: 0.02,
    margin: 0,
  });
  addText(slide, title, {
    ...opts,
    fontFace: THEME.titleFont,
    color: THEME.accent,
    bold: true,
  });
}

function addFooter(slide, pptx, metadata, index, total, footerLabel) {
  slide.addShape(pptx.ShapeType.line, {
    x: METRICS.footer.lineX,
    y: METRICS.footer.lineY,
    w: METRICS.footer.lineW,
    h: 0,
    line: { color: THEME.line, width: 1 },
  });
  addText(slide, metadata.date || "", {
    x: METRICS.footer.dateX,
    y: METRICS.footer.dateY,
    w: METRICS.footer.dateW,
    h: 0.2,
    fontSize: 10.5,
    color: THEME.muted,
  });
  if (footerLabel) {
    addText(slide, footerLabel, {
      x: 5.35,
      y: METRICS.footer.dateY,
      w: 2.6,
      h: 0.2,
      fontSize: 10.5,
      color: THEME.muted,
      align: "center",
    });
  }
  addText(slide, `${index}`, {
    x: METRICS.footer.numX,
    y: METRICS.footer.numY,
    w: METRICS.footer.numW,
    h: 0.2,
    fontSize: 10.5,
    color: THEME.muted,
    align: "right",
  });
  if (total) {
    slide._snupiSlideCount = total;
  }
}

function addCitation(slide, citationText) {
  if (!citationText) return;
  addText(slide, `Source: ${citationText}`, {
    x: 8.2,
    y: 6.52,
    w: 4.15,
    h: 0.18,
    fontSize: 9.5,
    color: THEME.muted,
    align: "right",
  });
}

function addBulletList(slide, bullets, box, minPt, maxPt) {
  const items = normalizeBullets(bullets);
  if (items.length === 0) return;
  const joined = items.join("\n");
  const fit = autoFontSize(joined, THEME.bodyFont, {
    x: box.x,
    y: box.y,
    w: box.w,
    h: box.h,
    minFontSize: minPt,
    maxFontSize: maxPt,
    fontSize: maxPt,
    mode: "shrink",
    padding: 0.05,
    margin: 0,
    paraSpaceAfter: 10,
  });
  const runs = [];
  items.forEach((bullet, idx) => {
    runs.push({
      text: bullet,
      options: {
        bullet: { indent: 18 },
        breakLine: idx !== items.length - 1,
      },
    });
  });
  slide.addText(runs, {
    ...fit,
    margin: 0,
    fontFace: THEME.bodyFont,
    fontSize: fit.fontSize,
    color: THEME.text,
    paraSpaceAfterPt: 8,
    valign: "top",
  });
}

function addPanel(slide, pptx, box, fillColor, lineColor = THEME.line) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x: box.x,
    y: box.y,
    w: box.w,
    h: box.h,
    rectRadius: 0.08,
    line: { color: lineColor, width: 1.2 },
    fill: { color: fillColor },
  });
}

function addPlaceholder(slide, pptx, box, text, caption) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x: box.x,
    y: box.y,
    w: box.w,
    h: box.h,
    rectRadius: 0.08,
    line: { color: THEME.accent, width: 1.2, dash: "dash" },
    fill: { color: THEME.panel, transparency: 8 },
  });
  const body = [compactText(text), compactText(caption)].filter(Boolean).join("\n\n");
  const fit = autoFontSize(body, THEME.bodyFont, {
    x: box.x + 0.25,
    y: box.y + 0.22,
    w: box.w - 0.5,
    h: box.h - 0.44,
    minFontSize: 18,
    maxFontSize: 24,
    fontSize: 24,
    mode: "shrink",
    padding: 0.01,
    margin: 0,
  });
  addText(slide, body, {
    ...fit,
    color: THEME.muted,
    align: "center",
    valign: "mid",
  });
}

function pickPrimaryAsset(slideSpec) {
  const assets = Array.isArray(slideSpec.assets) ? slideSpec.assets : [];
  return assets.length > 0 ? assets[0] : null;
}

function addImageOrPlaceholder(slide, pptx, specDir, asset, box) {
  if (!asset || asset.kind === "placeholder") {
    addPlaceholder(
      slide,
      pptx,
      box,
      asset?.placeholder || "Insert a representative figure, table, or screenshot.",
      asset?.caption || ""
    );
    return;
  }

  if (asset.kind === "equation" && asset.latex) {
    const dataUri = latexToSvgDataUri(asset.latex, true);
    slide.addImage({
      data: dataUri,
      ...imageSizingContain(dataUri, box.x, box.y, box.w, box.h),
    });
    return;
  }

  const assetPath = resolveAssetPath(specDir, asset.path);
  if (!assetPath || !fs.existsSync(assetPath)) {
    addPlaceholder(
      slide,
      pptx,
      box,
      asset.placeholder || `Missing asset: ${asset.path || "unknown path"}`,
      asset.caption || ""
    );
    return;
  }

  const placement =
    asset.fit === "crop"
      ? imageSizingCrop(assetPath, box.x, box.y, box.w, box.h)
      : imageSizingContain(assetPath, box.x, box.y, box.w, box.h);
  slide.addImage({
    path: assetPath,
    ...placement,
  });
}

function addCaptionBox(slide, text, box) {
  if (!text) return;
  const fit = autoFontSize(text, THEME.bodyFont, {
    x: box.x,
    y: box.y,
    w: box.w,
    h: box.h,
    minFontSize: 14,
    maxFontSize: 18,
    fontSize: 18,
    mode: "shrink",
    padding: 0.01,
    margin: 0,
  });
  addText(slide, text, {
    ...fit,
    italic: true,
    color: THEME.muted,
  });
}

function attachSpeakerNotes(slide, notes) {
  const cleanNotes = normalizeNotes(notes);
  if (cleanNotes.length === 0) return;
  if (typeof slide.addNotes === "function") {
    slide.addNotes(cleanNotes.join("\n"));
  }
}

function renderTitleSlide(slide, pptx, slideSpec, metadata) {
  slide.background = { color: THEME.white };
  slide.addShape(pptx.ShapeType.rect, {
    x: METRICS.titleSlide.accentX,
    y: METRICS.titleSlide.accentY,
    w: METRICS.titleSlide.accentW,
    h: METRICS.titleSlide.accentH,
    line: { color: THEME.accent, transparency: 100 },
    fill: { color: THEME.accent },
  });

  const titleText = compactText(slideSpec.title || metadata.title);
  const titleOpts = autoFontSize(titleText, THEME.titleFont, {
    x: METRICS.titleSlide.titleX,
    y: METRICS.titleSlide.titleY,
    w: METRICS.titleSlide.titleW,
    h: METRICS.titleSlide.titleH,
    minFontSize: 32,
    maxFontSize: 42,
    fontSize: 42,
    mode: "shrink",
    padding: 0.02,
    margin: 0,
  });
  addText(slide, titleText, {
    ...titleOpts,
    fontFace: THEME.titleFont,
    fontSize: titleOpts.fontSize,
    color: THEME.accent,
    bold: true,
  });

  addText(slide, slideSpec.subtitle || metadata.subtitle || "", {
    x: METRICS.titleSlide.subtitleX,
    y: METRICS.titleSlide.subtitleY,
    w: METRICS.titleSlide.subtitleW,
    h: METRICS.titleSlide.subtitleH,
    fontSize: 22,
    color: THEME.text,
  });
  addText(slide, `Presenter: ${metadata.presenter || "TBD"}`, {
    x: METRICS.titleSlide.presenterX,
    y: METRICS.titleSlide.presenterY,
    w: METRICS.titleSlide.presenterW,
    h: METRICS.titleSlide.presenterH,
    fontSize: 18,
    color: THEME.muted,
  });
  addText(slide, metadata.date || "", {
    x: METRICS.titleSlide.dateX,
    y: METRICS.titleSlide.dateY,
    w: METRICS.titleSlide.dateW,
    h: METRICS.titleSlide.dateH,
    fontSize: 18,
    color: THEME.muted,
  });
}

function renderTldrSlide(slide, pptx, slideSpec) {
  addTitle(slide, slideSpec.title);
  slide.addShape(pptx.ShapeType.roundRect, {
    x: METRICS.tldr.labelX,
    y: METRICS.tldr.labelY,
    w: METRICS.tldr.labelW,
    h: METRICS.tldr.labelH,
    rectRadius: 0.06,
    line: { color: THEME.accent, width: 1.2 },
    fill: { color: THEME.accentSoft },
  });
  addText(slide, "TL;DR", {
    x: METRICS.tldr.labelX,
    y: METRICS.tldr.labelY + 0.06,
    w: METRICS.tldr.labelW,
    h: 0.26,
    fontFace: THEME.titleFont,
    fontSize: 21,
    color: THEME.accent,
    bold: true,
    align: "center",
  });
  addBulletList(slide, slideSpec.bullets, {
    x: METRICS.tldr.bodyX,
    y: METRICS.tldr.bodyY,
    w: METRICS.tldr.bodyW,
    h: METRICS.tldr.bodyH,
  }, 25, 29);
}

function renderBulletSlide(slide, pptx, slideSpec) {
  addTitle(slide, slideSpec.title);
  addBulletList(slide, slideSpec.bullets, METRICS.body, 25, 29);
}

function renderFigureSlide(slide, pptx, specDir, slideSpec) {
  addTitle(slide, slideSpec.title);
  const asset = pickPrimaryAsset(slideSpec);
  addImageOrPlaceholder(slide, pptx, specDir, asset, {
    x: METRICS.figure.imageX,
    y: METRICS.figure.imageY,
    w: METRICS.figure.imageW,
    h: METRICS.figure.imageH,
  });

  const supporting = [];
  if (asset?.caption) supporting.push(asset.caption);
  const bullets = normalizeBullets(slideSpec.bullets);
  if (bullets.length > 0) supporting.push(`Key point: ${bullets[0]}`);
  if (bullets.length > 1) supporting.push(`Context: ${bullets[1]}`);
  addCaptionBox(
    slide,
    supporting.join("  "),
    {
      x: METRICS.figure.noteX,
      y: METRICS.figure.noteY,
      w: METRICS.figure.noteW,
      h: METRICS.figure.noteH,
    }
  );
}

function renderEquationSlide(slide, pptx, specDir, slideSpec) {
  addTitle(slide, slideSpec.title);
  const asset = pickPrimaryAsset(slideSpec);
  addImageOrPlaceholder(slide, pptx, specDir, asset, {
    x: METRICS.equation.equationX,
    y: METRICS.equation.equationY,
    w: METRICS.equation.equationW,
    h: METRICS.equation.equationH,
  });
  const caption = asset?.caption ? `${asset.caption}` : "";
  if (caption) {
    addCaptionBox(slide, caption, {
      x: METRICS.equation.equationX,
      y: 3.95,
      w: METRICS.equation.equationW,
      h: 0.25,
    });
  }
  addBulletList(slide, slideSpec.bullets, {
    x: METRICS.equation.bodyX,
    y: METRICS.equation.bodyY,
    w: METRICS.equation.bodyW,
    h: METRICS.equation.bodyH,
  }, 24, 27);
}

function renderMeetingLogSlide(slide, pptx, slideSpec) {
  addTitle(slide, slideSpec.title);
  const bullets = normalizeBullets(slideSpec.bullets);
  const [left, right] = splitIntoColumns(
    bullets.length > 0 ? bullets : ["Add decisions, blockers, and next actions."]
  );

  addPanel(slide, pptx, {
    x: METRICS.meeting.leftX,
    y: METRICS.meeting.leftY,
    w: METRICS.meeting.leftW,
    h: METRICS.meeting.leftH,
  }, THEME.panel);
  addPanel(slide, pptx, {
    x: METRICS.meeting.rightX,
    y: METRICS.meeting.rightY,
    w: METRICS.meeting.rightW,
    h: METRICS.meeting.rightH,
  }, THEME.accentSoft);

  addText(slide, "Updates", {
    x: METRICS.meeting.leftX + 0.22,
    y: METRICS.meeting.leftY + 0.18,
    w: 1.8,
    h: 0.3,
    fontFace: THEME.titleFont,
    fontSize: 18,
    bold: true,
    color: THEME.accent,
  });
  addText(slide, "Next Steps", {
    x: METRICS.meeting.rightX + 0.22,
    y: METRICS.meeting.rightY + 0.18,
    w: 2.1,
    h: 0.3,
    fontFace: THEME.titleFont,
    fontSize: 18,
    bold: true,
    color: THEME.accent,
  });
  addBulletList(slide, left, {
    x: METRICS.meeting.leftX + 0.22,
    y: METRICS.meeting.leftY + 0.62,
    w: METRICS.meeting.leftW - 0.42,
    h: METRICS.meeting.leftH - 0.82,
  }, 22, 26);
  addBulletList(slide, right, {
    x: METRICS.meeting.rightX + 0.22,
    y: METRICS.meeting.rightY + 0.62,
    w: METRICS.meeting.rightW - 0.42,
    h: METRICS.meeting.rightH - 0.82,
  }, 22, 26);
}

function renderClosingSlide(slide, pptx, specDir, slideSpec) {
  addTitle(slide, slideSpec.title);
  addBulletList(slide, slideSpec.bullets, {
    x: METRICS.closing.bodyX,
    y: METRICS.closing.bodyY,
    w: METRICS.closing.bodyW,
    h: METRICS.closing.bodyH,
  }, 24, 28);

  const asset = pickPrimaryAsset(slideSpec);
  if (asset) {
    addPanel(slide, pptx, {
      x: METRICS.closing.calloutX,
      y: METRICS.closing.calloutY,
      w: METRICS.closing.calloutW,
      h: METRICS.closing.calloutH,
    }, asset.kind === "placeholder" ? THEME.warmSoft : THEME.panel);
    addImageOrPlaceholder(slide, pptx, specDir, asset, {
      x: METRICS.closing.calloutX + 0.18,
      y: METRICS.closing.calloutY + 0.2,
      w: METRICS.closing.calloutW - 0.36,
      h: METRICS.closing.calloutH - 0.4,
    });
  }
}

function renderSlide(slide, pptx, specDir, slideSpec, metadata) {
  slide.background = { color: THEME.white };
  switch (slideSpec.layout) {
    case "title":
      renderTitleSlide(slide, pptx, slideSpec, metadata);
      break;
    case "tldr":
      renderTldrSlide(slide, pptx, slideSpec, metadata);
      break;
    case "bullets":
      renderBulletSlide(slide, pptx, slideSpec, metadata);
      break;
    case "figure_focus":
      renderFigureSlide(slide, pptx, specDir, slideSpec, metadata);
      break;
    case "equation_focus":
      renderEquationSlide(slide, pptx, specDir, slideSpec, metadata);
      break;
    case "meeting_log":
      renderMeetingLogSlide(slide, pptx, slideSpec, metadata);
      break;
    case "closing":
      renderClosingSlide(slide, pptx, specDir, slideSpec, metadata);
      break;
    default:
      throw new Error(`Unsupported layout: ${slideSpec.layout}`);
  }
}

function buildDeckWrapper(wrapperPath, specPath) {
  const relBuild = path.relative(
    path.dirname(wrapperPath),
    path.resolve(__dirname, "build_deck.js")
  );
  const relSpec = path.relative(path.dirname(wrapperPath), specPath);
  const wrapper = `#!/usr/bin/env node
"use strict";

const path = require("path");
const { buildDeckFromSpecFile } = require(path.resolve(__dirname, ${JSON.stringify(
    relBuild
  )}));

buildDeckFromSpecFile(path.resolve(__dirname, ${JSON.stringify(relSpec)}), {
  outputDir: __dirname,
  outputFile: path.resolve(__dirname, "deck.pptx"),
  emitSource: false,
}).catch((error) => {
  console.error(error.stack || String(error));
  process.exit(1);
});
`;
  fs.writeFileSync(wrapperPath, wrapper, "utf8");
  fs.chmodSync(wrapperPath, 0o755);
}

async function buildDeckFromSpecFile(specFile, options = {}) {
  const resolvedSpec = path.resolve(specFile);
  const spec = readJson(resolvedSpec);
  validateSpec(spec);

  const metadata = spec.metadata || {};
  const specDir = path.dirname(resolvedSpec);
  const outputDir =
    options.outputDir ||
    (options.dir ? path.resolve(options.dir) : path.join(specDir, slugify(metadata.title)));
  const outputFile =
    options.outputFile ||
    (options.out ? path.resolve(options.out) : path.join(outputDir, "deck.pptx"));
  const wrapperFile = path.join(outputDir, "deck.js");

  ensureDir(outputDir);
  const sourceMap = buildSourceMap(spec.sources);

  const pptx = new PptxGenJS();
  pptx.defineLayout({
    name: "SNUPI_WIDE",
    width: SLIDE.width,
    height: SLIDE.height,
  });
  pptx.layout = "SNUPI_WIDE";
  pptx.author = "Codex SNUPI slide skill";
  pptx.company = "SNUPI Lab";
  pptx.subject = metadata.presentation_type || "research slides";
  pptx.title = metadata.title || "SNUPI slides";
  pptx.lang = metadata.language || "en-US";
  pptx.theme = {
    headFontFace: THEME.titleFont,
    bodyFontFace: THEME.bodyFont,
    lang: metadata.language || "en-US",
  };

  const footerLabel = compactText(spec.defaults?.footer_label || "");
  spec.slides.forEach((slideSpec, index) => {
    const slide = pptx.addSlide();
    renderSlide(slide, pptx, specDir, slideSpec, metadata);
    addCitation(slide, gatherCitationText(slideSpec, sourceMap));
    addFooter(slide, pptx, metadata, index + 1, spec.slides.length, footerLabel);
    attachSpeakerNotes(slide, slideSpec.speaker_notes);
    warnIfSlideHasOverlaps(slide, pptx);
    warnIfSlideElementsOutOfBounds(slide, pptx);
  });

  await pptx.writeFile({ fileName: outputFile });
  if (options.emitSource !== false) {
    buildDeckWrapper(wrapperFile, resolvedSpec);
  }

  return {
    outputDir,
    outputFile,
    wrapperFile,
  };
}

async function main() {
  try {
    const args = parseArgs(process.argv.slice(2));
    if (args.help || !args.spec) {
      printHelp();
      process.exit(args.help ? 0 : 1);
    }
    const result = await buildDeckFromSpecFile(args.spec, {
      outputDir: args.dir ? path.resolve(args.dir) : undefined,
      outputFile: args.out ? path.resolve(args.out) : undefined,
      emitSource: args.emitSource,
    });
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(error.stack || String(error));
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  buildDeckFromSpecFile,
  parseArgs,
};
