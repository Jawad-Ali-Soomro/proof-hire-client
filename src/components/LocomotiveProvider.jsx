import { useEffect, useRef } from "react";
import LocomotiveScroll from "locomotive-scroll";
import "locomotive-scroll/dist/locomotive-scroll.css";

/**
 * Smooth scroll (Lenis via Locomotive v5).
 * Keeps measurements fresh on resize / layout changes so long scroll sections stay accurate.
 */
export default function LocomotiveProvider({ children }) {
  const locoRef = useRef(null);

  useEffect(() => {
    const loco = new LocomotiveScroll({
      lenisOptions: {
        lerp: 0.085,
        smoothWheel: true,
        wheelMultiplier: 0.92,
        touchMultiplier: 1.05,
        syncTouch: true,
        syncTouchLerp: 0.075,
      },
    });
    locoRef.current = loco;

    const onResize = () => {
      loco.resize();
    };

    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(() => {
      loco.resize();
    });
    ro.observe(document.documentElement);

    const id = requestAnimationFrame(() => {
      loco.resize();
    });

    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
      loco.destroy();
      locoRef.current = null;
    };
  }, []);

  return children;
}
