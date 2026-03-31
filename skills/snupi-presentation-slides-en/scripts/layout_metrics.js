"use strict";

const SLIDE = {
  width: 13.333,
  height: 7.5,
};

const THEME = {
  accent: "0F4577",
  accentWarm: "C38700",
  accentSoft: "EAF2FB",
  warmSoft: "FFF3DF",
  text: "1F2933",
  muted: "5B6573",
  line: "C9D3DD",
  panel: "F5F7FA",
  white: "FFFFFF",
  titleFont: "Arimo",
  bodyFont: "Arimo",
};

const METRICS = {
  canvas: SLIDE,
  title: { x: 0.8, y: 0.48, w: 11.8, h: 0.62, minPt: 35, maxPt: 40 },
  footer: {
    lineX: 0.8,
    lineY: 6.88,
    lineW: 11.75,
    dateX: 0.82,
    dateY: 6.95,
    dateW: 2.6,
    numX: 12.1,
    numY: 6.95,
    numW: 0.4
  },
  titleSlide: {
    accentX: 0.8,
    accentY: 1.2,
    accentW: 0.14,
    accentH: 3.7,
    titleX: 1.12,
    titleY: 1.22,
    titleW: 10.7,
    titleH: 1.5,
    subtitleX: 1.15,
    subtitleY: 2.9,
    subtitleW: 7.0,
    subtitleH: 0.55,
    presenterX: 1.15,
    presenterY: 5.55,
    presenterW: 4.6,
    presenterH: 0.32,
    dateX: 1.15,
    dateY: 5.96,
    dateW: 3.0,
    dateH: 0.32
  },
  body: {
    x: 1.0,
    y: 1.35,
    w: 11.1,
    h: 4.95,
    minPt: 25,
    maxPt: 29
  },
  tldr: {
    labelX: 0.98,
    labelY: 1.45,
    labelW: 1.55,
    labelH: 0.62,
    bodyX: 2.85,
    bodyY: 1.52,
    bodyW: 9.4,
    bodyH: 4.6
  },
  figure: {
    imageX: 0.95,
    imageY: 1.38,
    imageW: 11.45,
    imageH: 4.55,
    noteX: 0.98,
    noteY: 6.02,
    noteW: 11.0,
    noteH: 0.42
  },
  equation: {
    equationX: 0.95,
    equationY: 1.65,
    equationW: 11.45,
    equationH: 2.1,
    bodyX: 1.0,
    bodyY: 4.35,
    bodyW: 10.9,
    bodyH: 1.7
  },
  closing: {
    bodyX: 1.0,
    bodyY: 1.55,
    bodyW: 6.5,
    bodyH: 4.8,
    calloutX: 8.1,
    calloutY: 1.8,
    calloutW: 4.2,
    calloutH: 3.4
  },
  meeting: {
    leftX: 0.98,
    leftY: 1.5,
    leftW: 5.35,
    leftH: 4.8,
    rightX: 6.95,
    rightY: 1.5,
    rightW: 5.35,
    rightH: 4.8
  }
};

module.exports = {
  METRICS,
  SLIDE,
  THEME,
};
