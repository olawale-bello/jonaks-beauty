"use client";

import { useEffect } from "react";

export function SiteMotion() {
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sections = Array.from(document.querySelectorAll<HTMLElement>("main > section"));
    let frame = 0;

    const update = () => {
      frame = 0;
      const height = window.innerHeight;
      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.bottom < -100 || rect.top > height + 100) continue;
        const progress = Math.max(-1, Math.min(1, (height / 2 - rect.top - rect.height / 2) / (height / 2 + rect.height / 2)));
        section.style.setProperty("--scroll-shift", `${(progress * 22).toFixed(2)}px`);
      }
    };
    const schedule = () => { if (!preference.matches && !frame) frame = requestAnimationFrame(update); };
    const syncPreference = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      document.documentElement.classList.toggle("scroll-motion", !preference.matches);
      if (preference.matches) {
        sections.forEach(section => section.style.removeProperty("--scroll-shift"));
      } else schedule();
    };
    syncPreference();
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
    };
  }, []);

  return null;
}
