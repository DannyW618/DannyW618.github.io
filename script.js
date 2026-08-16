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
const typedText = document.querySelector("#typed-text");
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

function animatePhrase() {
  const phrase = phrases[phraseIndex];
  const unresolved = [];
  const resolved = new Set();
  const glyphs = "abcdefghijklmnopqrstuvwxyz";

  for (let index = 0; index < phrase.length; index += 1) {
    if (phrase[index] !== " ") unresolved.push(index);
  }
  for (let index = unresolved.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [unresolved[index], unresolved[swapIndex]] = [unresolved[swapIndex], unresolved[index]];
  }

  function tick() {
    const steps = Math.random() < 0.35 ? 2 : 1;
    for (let step = 0; step < steps && unresolved.length; step += 1) {
      resolved.add(unresolved.pop());
    }

    typedText.textContent = [...phrase]
      .map((character, index) => {
        if (character === " " || resolved.has(index)) return character;
        return glyphs[Math.floor(Math.random() * glyphs.length)];
      })
      .join("");

    if (unresolved.length) {
      window.setTimeout(tick, 58);
    } else {
      phraseIndex = (phraseIndex + 1) % phrases.length;
      window.setTimeout(animatePhrase, 2400);
    }
  }

  tick();
}

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) animatePhrase();

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
