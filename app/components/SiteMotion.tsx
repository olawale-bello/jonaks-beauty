"use client";

import { useEffect, useRef } from "react";

// Content that fades up into place as it scrolls into view. Hero blocks are left out: they have their own entrance.
const REVEAL_SELECTOR = [
  ".intro > *",
  ".section-head",
  ".service",
  ".feature-image",
  ".feature-copy > *",
  ".portrait",
  ".story-copy > *",
  ".cta > *",
  ".policy aside",
  ".policy-body > *",
  ".footer-grid > div",
].join(",");

export function SiteMotion() {
  const progressBar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sections = Array.from(document.querySelectorAll<HTMLElement>("main > section"));
    let frame = 0;
    let revealer: IntersectionObserver | undefined;

    const update = () => {
      frame = 0;
      const height = window.innerHeight;
      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.bottom < -100 || rect.top > height + 100) continue;
        const progress = Math.max(-1, Math.min(1, (height / 2 - rect.top - rect.height / 2) / (height / 2 + rect.height / 2)));
        section.style.setProperty("--scroll-shift", `${(progress * 22).toFixed(2)}px`);
      }
      const scrollable = document.documentElement.scrollHeight - height;
      progressBar.current?.style.setProperty("--page-progress", scrollable > 0 ? (window.scrollY / scrollable).toFixed(4) : "0");
    };
    const schedule = () => { if (!preference.matches && !frame) frame = requestAnimationFrame(update); };

    const revealAll = () => {
      revealer?.disconnect();
      revealer = undefined;
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach(element => element.removeAttribute("data-reveal"));
    };
    const startReveals = () => {
      // Only hide what is still below the fold, so nothing visible on first paint flickers.
      const targets = Array.from(document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR))
        .filter(element => element.getBoundingClientRect().top > window.innerHeight * 0.92);
      revealer = new IntersectionObserver(entries => {
        entries.filter(entry => entry.isIntersecting).forEach((entry, index) => {
          const element = entry.target as HTMLElement;
          revealer?.unobserve(element);
          element.style.setProperty("--reveal-delay", `${index * 90}ms`);
          element.dataset.reveal = "in";
          // Hand transitions back to the element's own styles once it has settled.
          window.setTimeout(() => {
            element.removeAttribute("data-reveal");
            element.style.removeProperty("--reveal-delay");
          }, 1300 + index * 90);
        });
      }, { rootMargin: "0px 0px -8% 0px" });
      for (const element of targets) {
        element.dataset.reveal = "";
        revealer.observe(element);
      }
    };

    const syncPreference = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      document.documentElement.classList.toggle("scroll-motion", !preference.matches);
      if (preference.matches) {
        sections.forEach(section => section.style.removeProperty("--scroll-shift"));
        revealAll();
      } else schedule();
    };
    syncPreference();
    if (!preference.matches) startReveals();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    preference.addEventListener("change", syncPreference);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      preference.removeEventListener("change", syncPreference);
      document.documentElement.classList.remove("scroll-motion");
      sections.forEach(section => section.style.removeProperty("--scroll-shift"));
      revealAll();
    };
  }, []);

  return <div ref={progressBar} className="scroll-progress" aria-hidden="true" />;
}
