"use client";

import { useEffect, useMemo, useState } from "react";

import { tourStorageKey } from "./constants";
import { getPrefersReducedMotion } from "./fileCollection";
import type { TourStep, TourTarget } from "./types";

const scrollTourTargetIntoView = (target: TourTarget) => {
  const element = document.querySelector<HTMLElement>(`[data-tour-target="${target}"]`);

  if (!element) {
    return;
  }

  const headerHeight = document.querySelector("header")?.getBoundingClientRect().height ?? 80;
  const comfortOffset = headerHeight + 24;
  const rect = element.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const isComfortablyVisible = rect.top >= comfortOffset && rect.bottom <= viewportHeight - 120;

  if (isComfortablyVisible) {
    return;
  }

  const targetY = window.scrollY + rect.top - Math.max(comfortOffset, (viewportHeight - rect.height) / 2);

  window.scrollTo({
    top: Math.max(0, targetY),
    behavior: getPrefersReducedMotion() ? "auto" : "smooth",
  });
};

export const useGuidedTour = (steps: TourStep[]) => {
  const [tourOpen, setTourOpen] = useState(false);
  const [tourIndex, setTourIndex] = useState(0);

  const currentStep = steps[tourIndex] ?? steps[0];
  const progressLabel = useMemo(() => `${tourIndex + 1} of ${steps.length}`, [tourIndex, steps.length]);

  useEffect(() => {
    try {
      if (localStorage.getItem(tourStorageKey) !== "true") {
        setTourOpen(true);
      }
    } catch {
      setTourOpen(false);
    }
  }, []);

  useEffect(() => {
    if (!tourOpen || !currentStep) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      scrollTourTargetIntoView(currentStep.target);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [currentStep, tourOpen]);

  const dismissTour = () => {
    try {
      localStorage.setItem(tourStorageKey, "true");
    } catch {
      // localStorage can be unavailable in strict privacy contexts.
    }

    setTourOpen(false);
  };

  const restartTour = () => {
    setTourIndex(0);
    setTourOpen(true);
  };

  const goNext = () => {
    if (tourIndex >= steps.length - 1) {
      dismissTour();
      return;
    }

    setTourIndex((current) => current + 1);
  };

  const goBack = () => {
    setTourIndex((current) => Math.max(0, current - 1));
  };

  const isTargetActive = (target: TourTarget) => Boolean(tourOpen && currentStep?.target === target);

  return {
    tourOpen,
    tourIndex,
    currentStep,
    progressLabel,
    dismissTour,
    restartTour,
    goNext,
    goBack,
    isTargetActive,
  };
};
