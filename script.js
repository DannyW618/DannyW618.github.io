"use strict";

const citations = {
  tide: `@inproceedings{wang2026tide,
  title     = {What Information Matters? Graph Out-of-Distribution Detection via Tri-Component Information Decomposition},
  author    = {Wang, Danny and Qiu, Ruihong and Huang, Zi},
  booktitle = {International Conference on Machine Learning (ICML)},
  year      = {2026}
}`,
  vsb: `@article{wang2026vsb,
  title   = {When to Commit? Towards Variable-Size Self-Contained Blocks for Discrete Diffusion Language Models},
  author  = {Wang, Danny and Qiu, Ruihong and Huang, Zi},
  journal = {arXiv preprint arXiv:2604.23994},
  year    = {2026}
}`,
  tnt: `@inproceedings{wang2025tnt,
  title     = {Text Meets Topology: Rethinking Out-of-Distribution Detection in Text-Rich Networks},
  author    = {Wang, Danny and Qiu, Ruihong and Bai, Guangdong and Huang, Zi},
  booktitle = {Conference on Empirical Methods in Natural Language Processing (EMNLP)},
  year      = {2025}
}`,
  gold: `@inproceedings{wang2025gold,
  title     = {GOLD: Graph Out-of-Distribution Detection via Implicit Adversarial Latent Generation},
  author    = {Wang, Danny and Qiu, Ruihong and Bai, Guangdong and Huang, Zi},
  booktitle = {International Conference on Learning Representations (ICLR)},
  year      = {2025}
}`,
  getfair: `@inproceedings{chen2024getfair,
  title     = {Hate Speech Detection with Generalizable Target-Aware Fairness},
  author    = {Chen, Tong and Wang, Danny and Liang, Xurong and Risius, Marten and Demartini, Gianluca and Yin, Hongzhi},
  booktitle = {ACM SIGKDD Conference on Knowledge Discovery and Data Mining (KDD)},
  year      = {2024}
}`,
};

const page = document.querySelector("#page");
const themeToggle = document.querySelector("#theme-toggle");
const maskedHeadline = document.querySelector("#masked-headline");
const scrollbar = document.querySelector("#scrollbar");
const zoomDialog = document.querySelector("#zoom-dialog");
const zoomImage = document.querySelector("#zoom-image");
const citationDialog = document.querySelector("#citation-dialog");
const citationText = document.querySelector("#citation-text");
const citationClose = document.querySelector("#citation-close");

function setTheme(theme) {
  page.dataset.theme = theme;
  themeToggle.textContent = theme === "dark" ? "Light" : "Dark";
  try {
    localStorage.setItem("dw-theme", theme);
  } catch {
    // The page still works when browser storage is disabled.
  }
}

let savedTheme = null;
try {
  savedTheme = localStorage.getItem("dw-theme");
} catch {
  // Use the default light theme.
}
if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme);

themeToggle.addEventListener("click", () => {
  setTheme(page.dataset.theme === "dark" ? "light" : "dark");
});

const phrases = ["CS PhD candidate", "Research assistant", "Teaching staff"];
let phraseIndex = 0;
let currentTokens;
let shownTokens;
let tokenQueue;
let headlinePhase;

function tokenise(phrase) {
  const tokens = [];
  const words = phrase.split(" ");

  words.forEach((word, wordIndex) => {
    const tokenCount = word.length <= 5 ? 1 : Math.ceil(word.length / 4);
    const tokenSize = Math.ceil(word.length / tokenCount);
    const pieces = [];

    for (let index = 0; index < word.length; index += tokenSize) {
      pieces.push(word.slice(index, index + tokenSize));
    }
    if (pieces.length > 1 && pieces[pieces.length - 1].length < 2) {
      pieces[pieces.length - 2] += pieces.pop();
    }
    pieces.forEach((text) => tokens.push({ text, gap: false }));
    if (wordIndex < words.length - 1) tokens[tokens.length - 1].gap = true;
  });

  return tokens;
}

function shuffledIndexes(length) {
  const indexes = Array.from({ length }, (_, index) => index);
  for (let index = length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [indexes[index], indexes[swapIndex]] = [indexes[swapIndex], indexes[index]];
  }
  return indexes;
}

function loadPhrase() {
  currentTokens = tokenise(phrases[phraseIndex]);
  shownTokens = currentTokens.map(() => false);
  tokenQueue = shuffledIndexes(currentTokens.length);
  headlinePhase = "reveal";
}

function createHeadlineToken(token, isShown) {
  const element = document.createElement("span");
  element.className = `headline-token${isShown ? "" : " is-mask"}${token.gap ? " has-gap" : ""}`;
  element.dataset.shown = String(isShown);
  element.textContent = isShown ? token.text : "[MASK]";
  return element;
}

function renderHeadline() {
  const elements = Array.from(maskedHeadline.children);

  if (elements.length !== currentTokens.length) {
    maskedHeadline.replaceChildren(
      ...currentTokens.map((token, index) => createHeadlineToken(token, shownTokens[index])),
    );
    return;
  }

  currentTokens.forEach((token, index) => {
    const isShown = shownTokens[index];
    const element = elements[index];
    if (element.dataset.shown !== String(isShown)) {
      element.replaceWith(createHeadlineToken(token, isShown));
      return;
    }
    element.classList.toggle("has-gap", token.gap);
  });
}

function tickHeadline() {
  if (!currentTokens) loadPhrase();
  let delay = 360;

  if (headlinePhase === "reveal") {
    if (tokenQueue.length) shownTokens[tokenQueue.pop()] = true;
    if (!tokenQueue.length) {
      headlinePhase = "hold";
      delay = 2600;
    }
  } else if (headlinePhase === "hold") {
    headlinePhase = "mask";
    tokenQueue = shuffledIndexes(currentTokens.length);
    delay = 320;
  } else {
    if (tokenQueue.length) shownTokens[tokenQueue.pop()] = false;
    if (!tokenQueue.length) {
      phraseIndex = (phraseIndex + 1) % phrases.length;
      loadPhrase();
      delay = 560;
    }
  }

  renderHeadline();
  window.setTimeout(tickHeadline, delay);
}

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) tickHeadline();

function updateScrollbar() {
  const documentRoot = document.scrollingElement || document.documentElement;
  const maximum = documentRoot.scrollHeight - documentRoot.clientHeight;
  const progress = maximum > 0 ? Math.min(1, documentRoot.scrollTop / maximum) : 0;
  scrollbar.style.width = `${(progress * 100).toFixed(2)}%`;
}

window.addEventListener("scroll", updateScrollbar, { passive: true });
window.addEventListener("resize", updateScrollbar);
updateScrollbar();

if (
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
  "IntersectionObserver" in window
) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.animate(
          [{ opacity: 0, transform: "translateY(26px)" }, { opacity: 1, transform: "none" }],
          { duration: 720, easing: "cubic-bezier(.22,.61,.36,1)", fill: "both" },
        );
        revealObserver.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.02 },
  );

  document.querySelectorAll("[data-reveal]").forEach((element) => {
    if (element.getBoundingClientRect().top >= window.innerHeight * 0.9) {
      revealObserver.observe(element);
    }
  });
}

function openDialog(dialog) {
  dialog.hidden = false;
  dialog.classList.add("is-open");
}

function closeDialog(dialog) {
  dialog.classList.remove("is-open");
  dialog.hidden = true;
}

document.querySelectorAll(".zoomable").forEach((image) => {
  image.addEventListener("click", () => {
    zoomImage.src = image.currentSrc || image.src;
    zoomImage.alt = `Enlarged view: ${image.alt}`;
    openDialog(zoomDialog);
  });
});

zoomDialog.addEventListener("click", () => closeDialog(zoomDialog));

function showCitation(citation) {
  citationText.value = citation;
  openDialog(citationDialog);
  citationText.focus();
  citationText.select();
}

document.querySelectorAll("[data-bib]").forEach((button) => {
  button.addEventListener("click", async () => {
    const citation = citations[button.dataset.bib];
    if (!citation) return;

    try {
      await navigator.clipboard.writeText(citation);
      button.textContent = "Copied";
      window.setTimeout(() => {
        button.textContent = "Cite";
      }, 1600);
    } catch {
      showCitation(citation);
    }
  });
});

citationClose.addEventListener("click", () => closeDialog(citationDialog));
citationDialog.addEventListener("click", (event) => {
  if (event.target === citationDialog) closeDialog(citationDialog);
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!zoomDialog.hidden) closeDialog(zoomDialog);
  if (!citationDialog.hidden) closeDialog(citationDialog);
});

document.querySelector("#current-year").textContent = new Date().getFullYear();
