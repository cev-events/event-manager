// Created by Shibili Aman TK | GitHub: https://github.com/LordSA
"use client";
import { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const isMobile = window.innerWidth < 768 || window.matchMedia("(max-width: 767px)").matches;
    if (isMobile) return;

    const lenis = new Lenis();

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return null;
}