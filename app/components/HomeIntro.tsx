"use client";

import { useEffect, useState } from "react";

export function HomeIntro() {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (document.documentElement.dataset.homeIntro !== "show") return;
    let disposed = false;
    let minimumElapsed = false;
    let assetsReady = false;
    const reveal = () => {
      if (!disposed && minimumElapsed && assetsReady) setRevealed(true);
    };
    const minimum = window.setTimeout(() => { minimumElapsed = true; reveal(); }, 850);
    const maximum = window.setTimeout(() => setRevealed(true), 2400);
    const hero = document.querySelector<HTMLImageElement>(".hero > img");
    Promise.allSettled([document.fonts.ready, hero?.decode() ?? Promise.resolve()]).then(() => {
      assetsReady = true;
      reveal();
    });
    return () => {
      disposed = true;
      clearTimeout(minimum);
      clearTimeout(maximum);
    };
  }, []);

  return <div className={`site-loader${revealed ? " is-revealed" : ""}`} aria-hidden="true">
    <div className="loader-signature">Jonaks <em>Beauty</em></div>
    <span className="loader-line" />
  </div>;
}
