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

    const render = () => {
      current.x += (target.x - current.x) * 0.2;
      current.y += (target.y - current.y) * 0.2;
      ring.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;
      frame = Math.abs(target.x - current.x) + Math.abs(target.y - current.y) > 0.1 ? requestAnimationFrame(render) : 0;
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
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <div ref={cursor} className="cursor" aria-hidden="true"><span /></div>;
}
