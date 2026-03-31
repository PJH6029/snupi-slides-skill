const scene = document.querySelector(".scene");
const stage = document.querySelector(".stage");
const slides = [...document.querySelectorAll(".slide")];
const navZones = [...document.querySelectorAll("[data-nav]")];
const slideWidth = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--slide-width"));
const slideHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--slide-height"));
const viewportPadding = 24;

let currentIndex = 0;

function parseHash() {
  const match = window.location.hash.match(/^#slide-(\d+)$/);
  if (!match) {
    return 0;
  }

  const index = Number.parseInt(match[1], 10) - 1;
  return Number.isNaN(index) ? 0 : Math.min(Math.max(index, 0), slides.length - 1);
}

function syncSlides() {
  slides.forEach((slide, index) => {
    const isActive = index === currentIndex;
    slide.classList.toggle("is-active", isActive);
    slide.setAttribute("aria-hidden", String(!isActive));
  });

  const activeTitle = slides[currentIndex].querySelector("h1")?.textContent?.trim() || "SNU PI Lab Slide Template";
  document.title = `${activeTitle} · SNU PI Lab Slide Template`;

  const targetHash = `#slide-${currentIndex + 1}`;
  if (window.location.hash !== targetHash) {
    history.replaceState(null, "", targetHash);
  }
}

function goTo(index) {
  currentIndex = Math.min(Math.max(index, 0), slides.length - 1);
  syncSlides();
}

function moveBy(delta) {
  goTo(currentIndex + delta);
}

function fitStage() {
  const availableWidth = window.innerWidth - viewportPadding * 2;
  const availableHeight = window.innerHeight - viewportPadding * 2;
  const scale = Math.min(availableWidth / slideWidth, availableHeight / slideHeight);

  scene.style.width = `${slideWidth * scale}px`;
  scene.style.height = `${slideHeight * scale}px`;
  stage.style.transform = `scale(${scale})`;
}

window.addEventListener("resize", fitStage);
window.addEventListener("hashchange", () => {
  currentIndex = parseHash();
  syncSlides();
});

window.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "ArrowRight":
    case "ArrowDown":
    case "PageDown":
    case " ":
      event.preventDefault();
      moveBy(1);
      break;
    case "ArrowLeft":
    case "ArrowUp":
    case "PageUp":
      event.preventDefault();
      moveBy(-1);
      break;
    case "Home":
      event.preventDefault();
      goTo(0);
      break;
    case "End":
      event.preventDefault();
      goTo(slides.length - 1);
      break;
    default:
      break;
  }
});

navZones.forEach((zone) => {
  zone.addEventListener("click", () => {
    moveBy(Number(zone.dataset.nav));
  });
});

currentIndex = parseHash();
syncSlides();
fitStage();
