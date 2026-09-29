"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE = "a, button, label, [data-cursor]";
const MAGNETIC = ".pill:not(.disabled), .nav-book";

// A trailing cursor ring and magnetic buttons, for mouse and trackpad users who allow motion.
export function PointerEffects() {
  const cursor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ring = cursor.current;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!ring || !finePointer.matches || reduced.matches) return;

    const label = ring.querySelector("span")!;
    const target = { x: -100, y: -100 };
    const current = { x: -100, y: -100 };
    let frame = 0;
    let magnet: HTMLElement | null = null;
    // The homepage hero leans away from the pointer; -1..1 across each axis, eased more slowly than the ring.
    const hero = document.querySelector<HTMLElement>(".hero");
    const heroTarget = { x: 0, y: 0 };
    const heroCurrent = { x: 0, y: 0 };

    const render = () => {
      current.x += (target.x - current.x) * 0.2;
      current.y += (target.y - current.y) * 0.2;
      ring.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;
      let moving = Math.abs(target.x - current.x) + Math.abs(target.y - current.y) > 0.1;
      if (hero) {
        heroCurrent.x += (heroTarget.x - heroCurrent.x) * 0.07;
        heroCurrent.y += (heroTarget.y - heroCurrent.y) * 0.07;
        hero.style.setProperty("--hero-x", heroCurrent.x.toFixed(4));
        hero.style.setProperty("--hero-y", heroCurrent.y.toFixed(4));
        moving ||= Math.abs(heroTarget.x - heroCurrent.x) + Math.abs(heroTarget.y - heroCurrent.y) > 0.001;
      }
      frame = moving ? requestAnimationFrame(render) : 0;
    };
    const aimHero = (x: number, y: number) => {
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      const inside = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
      heroTarget.x = inside ? ((x - rect.left) / rect.width) * 2 - 1 : 0;
      heroTarget.y = inside ? ((y - rect.top) / rect.height) * 2 - 1 : 0;
      hero.classList.toggle("is-pointer", inside);
    };
    const releaseMagnet = () => {
      magnet?.style.removeProperty("translate");
      magnet = null;
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      if (!ring.classList.contains("is-visible")) {
        current.x = event.clientX;
        current.y = event.clientY;
        ring.classList.add("is-visible");
      }
      target.x = event.clientX;
      target.y = event.clientY;
      aimHero(event.clientX, event.clientY);
      if (!frame) frame = requestAnimationFrame(render);

      const element = event.target instanceof Element ? event.target : null;
      const hovered = element?.closest<HTMLElement>(INTERACTIVE);
      const text = element?.closest<HTMLElement>("[data-cursor]")?.dataset.cursor ?? "";
      ring.classList.toggle("is-link", Boolean(hovered) && !text);
      ring.classList.toggle("is-label", Boolean(text));
      if (label.textContent !== text) label.textContent = text;

      const magnetic = element?.closest<HTMLElement>(MAGNETIC) ?? null;
      if (magnetic !== magnet) releaseMagnet();
      if (magnetic) {
        const rect = magnetic.getBoundingClientRect();
        const dx = event.clientX - (rect.left + rect.width / 2);
        const dy = event.clientY - (rect.top + rect.height / 2);
        magnetic.style.translate = `${(dx * 0.18).toFixed(1)}px ${(dy * 0.3).toFixed(1)}px`;
        magnet = magnetic;
      }
    };
    const onLeave = () => {
      ring.classList.remove("is-visible");
      releaseMagnet();
      aimHero(-1, -1);
      if (!frame) frame = requestAnimationFrame(render);
    };
    const onDown = () => ring.classList.add("is-pressed");
    const onUp = () => ring.classList.remove("is-pressed");

    document.documentElement.classList.add("has-cursor");
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      releaseMagnet();
      hero?.classList.remove("is-pointer");
      hero?.style.removeProperty("--hero-x");
      hero?.style.removeProperty("--hero-y");
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <div ref={cursor} className="cursor" aria-hidden="true"><span /></div>;
}
