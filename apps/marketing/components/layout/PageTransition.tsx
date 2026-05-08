"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const ENTER_MS = 300;
const EXIT_MS = 400;
const INITIAL_HOLD_MS = 400;
const NEW_PAGE_HOLD_MS = 300;
const IMAGE_TIMEOUT_MS = 3000;
const LOADER_BG = "#F6F1F2";

function waitForVisibleMainImages(timeoutMs: number) {
  const main = document.querySelector("main");
  if (!main) return Promise.resolve();

  const pending = Array.from(main.querySelectorAll("img")).filter((img) => {
    const rect = img.getBoundingClientRect();
    const inView = rect.bottom > 0 && rect.right > 0 && rect.top < window.innerHeight && rect.left < window.innerWidth;
    return inView && !(img.complete && img.naturalWidth > 0);
  });

  if (!pending.length) return Promise.resolve();

  return new Promise<void>((resolve) => {
    let done = 0;
    let settled = false;
    const settle = () => { if (!settled) { settled = true; clearTimeout(tid); resolve(); } };
    const onReady = () => { done++; if (done >= pending.length) settle(); };
    const tid = setTimeout(settle, timeoutMs);
    pending.forEach((img) => {
      img.addEventListener("load", onReady, { once: true });
      img.addEventListener("error", onReady, { once: true });
    });
  });
}

export function PageTransitionLoader() {
  const pathname = usePathname();
  const router = useRouter();
  const [show, setShow] = useState(true);
  const [phase, setPhase] = useState<"enter" | "cover" | "exit">("cover");
  const [key, setKey] = useState(0);

  const isInitial = useRef(true);
  const isNavigating = useRef(false);
  const timers = useRef<number[]>([]);

  const isHomePage = pathname === "/" || /^\/(en|ar)\/?$/.test(pathname);
  const exitAnim = useMemo(
    () => (isHomePage ? { y: "-100%", x: "0%" } : { x: "-100%", y: "0%" }),
    [isHomePage],
  );

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const addTimer = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
    return id;
  }, []);

  // Initial load
  useEffect(() => {
    if (!isInitial.current) return;
    isInitial.current = false;

    addTimer(async () => {
      await waitForVisibleMainImages(IMAGE_TIMEOUT_MS);
      setPhase("exit");
      addTimer(() => setShow(false), EXIT_MS);
    }, INITIAL_HOLD_MS);
  }, [addTimer]);

  // Click interception
  const handleClick = useCallback((event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (isNavigating.current) return;

    const anchor = (event.target as Element | null)?.closest("a[href]") as HTMLAnchorElement | null;
    if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;

    const href = anchor.getAttribute("href");
    if (!href || href.startsWith("#")) return;

    try {
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      const next = `${url.pathname}${url.search}`;
      if (next === `${window.location.pathname}${window.location.search}`) return;

      event.preventDefault();
      clearTimers();

      isNavigating.current = true;
      setKey((k) => k + 1);
      setShow(true);
      setPhase("enter");

      addTimer(() => {
        setPhase("cover");
        router.push(next, { scroll: false });
      }, ENTER_MS);
    } catch { }
  }, [router, clearTimers, addTimer]);

  useEffect(() => {
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [handleClick]);

  // Route change → exit overlay
  const prevPath = useRef(pathname);

  useEffect(() => {
    if (prevPath.current === pathname) return;
    prevPath.current = pathname;
    window.scrollTo(0, 0);

    if (!isNavigating.current) return;

    clearTimers();

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        addTimer(async () => {
          await waitForVisibleMainImages(IMAGE_TIMEOUT_MS);
          setPhase("exit");
          addTimer(() => {
            setShow(false);
            isNavigating.current = false;
          }, EXIT_MS);
        }, NEW_PAGE_HOLD_MS);
      });
    });

    const safety = window.setTimeout(() => {
      cancelAnimationFrame(frame);
      setPhase("exit");
      addTimer(() => {
        setShow(false);
        isNavigating.current = false;
      }, EXIT_MS);
    }, 6000);

    timers.current.push(safety);
  }, [pathname, clearTimers, addTimer]);

  if (!show) return null;

  return (
    <motion.div
      key={key}
      className="fixed inset-0 z-100 flex items-center justify-center"
      style={{ backgroundColor: LOADER_BG }}
      initial={phase === "enter" ? { x: "100%", y: "0%" } : false}
      animate={
        phase === "enter" || phase === "cover"
          ? { x: "0%", y: "0%" }
          : exitAnim
      }
      transition={{
        duration: phase === "exit" ? EXIT_MS / 1000 : ENTER_MS / 1000,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      <motion.div
        initial={{ opacity: 0.9, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        className="text-center space-y-4"
      >
        <Image
          src="/logo.jpeg"
          alt="Design by Shoug"
          width={500}
          height={500}
          priority
          fetchPriority="high"
          className="rounded-lg w-[200px] h-[200px] object-cover"
        />
        <span className="font-serif text-sm md:text-base sm:text-xl tracking-wide text-[#1A1A1A] mx-auto underline underline-offset-8">
          Design By Shoug
        </span>
      </motion.div>
    </motion.div>
  );
}
