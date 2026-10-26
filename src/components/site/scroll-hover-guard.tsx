"use client";
import { useEffect } from "react";

/**
 * Pendant le défilement, les cartes qui passent sous le curseur déclenchaient leurs effets de survol
 * (ombre, zoom photo) : autant de redessins coûteux à chaque image (×2,7 mesuré sans accélération GPU).
 * On suspend donc les interactions pointeur pendant le défilement, et on les rétablit 150 ms après.
 */
export function ScrollHoverGuard() {
  useEffect(() => {
    const root = document.documentElement;
    let timer: number | undefined;
    const onScroll = () => {
      if (!root.hasAttribute("data-scrolling")) root.setAttribute("data-scrolling", "");
      window.clearTimeout(timer);
      timer = window.setTimeout(() => root.removeAttribute("data-scrolling"), 150);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer);
      root.removeAttribute("data-scrolling");
    };
  }, []);
  return null;
}
