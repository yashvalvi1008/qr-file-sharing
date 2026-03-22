const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

function revealImmediately() {
  document.querySelectorAll("[data-reveal]").forEach((el) => {
    el.classList.add("is-revealed");
  });
}

function setupObserver() {
  const els = Array.from(document.querySelectorAll("[data-reveal]"));
  if (!els.length) return;

  // Small stagger for nicer “drop-in” feel
  els.forEach((el, i) => {
    el.style.setProperty("--reveal-delay", `${Math.min(i * 70, 420)}ms`);
  });

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-revealed");
        io.unobserve(entry.target);
      }
    },
    { root: null, threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  els.forEach((el) => io.observe(el));
}

if (reduceMotion) revealImmediately();
else setupObserver();

