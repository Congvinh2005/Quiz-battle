"use client";

import React, { useEffect, useMemo, useState } from "react";

export interface GuidedTourStep {
  selector: string;
  title: string;
  body: string;
  actionLabel?: string;
}

interface GuidedTourProps {
  steps: GuidedTourStep[];
  isOpen: boolean;
  onClose: () => void;
  storageKey?: string;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export default function GuidedTour({ steps, isOpen, onClose, storageKey }: GuidedTourProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const step = steps[stepIndex];

  const cardPosition = useMemo(() => {
    if (!targetRect) {
      return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    }

    const cardWidth = Math.min(360, window.innerWidth - 28);
    const spaceBelow = window.innerHeight - targetRect.top - targetRect.height;
    const top = spaceBelow > 250 ? targetRect.top + targetRect.height + 18 : Math.max(14, targetRect.top - 230);
    const left = Math.min(Math.max(14, targetRect.left), window.innerWidth - cardWidth - 14);

    return { top, left, width: cardWidth, transform: "none" };
  }, [targetRect]);

  useEffect(() => {
    if (!isOpen) {
      setStepIndex(0);
      setTargetRect(null);
      return;
    }

    const measureTarget = () => {
      const element = document.querySelector(step?.selector || "") as HTMLElement | null;
      if (!element) {
        setTargetRect(null);
        return;
      }

      const rect = element.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    };

    const element = document.querySelector(step?.selector || "") as HTMLElement | null;
    element?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    const timeout = window.setTimeout(measureTarget, 260);

    window.addEventListener("resize", measureTarget);
    window.addEventListener("scroll", measureTarget, true);

    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("resize", measureTarget);
      window.removeEventListener("scroll", measureTarget, true);
    };
  }, [isOpen, step?.selector]);

  if (!isOpen || !step) return null;

  const isLastStep = stepIndex === steps.length - 1;

  const closeTour = () => {
    if (storageKey) {
      localStorage.setItem(storageKey, "true");
    }
    onClose();
  };

  const nextStep = () => {
    if (isLastStep) {
      closeTour();
      return;
    }
    setStepIndex((current) => current + 1);
  };

  return (
    <div className="guided-tour-layer" role="dialog" aria-modal="true" aria-labelledby="guided-tour-title">
      <div className="guided-tour-scrim" />
      {targetRect && (
        <div
          className="guided-tour-spot"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
        />
      )}
      <div className="guided-tour-card" style={cardPosition}>
        <div className="guided-tour-kicker">
          Bước {stepIndex + 1}/{steps.length}
        </div>
        <h2 id="guided-tour-title">{step.title}</h2>
        <p>{step.body}</p>
        <div className="guided-tour-actions">
          <button type="button" className="guided-tour-skip" onClick={closeTour}>
            Bỏ qua
          </button>
          <button type="button" className="guided-tour-next" onClick={nextStep}>
            {step.actionLabel || (isLastStep ? "Xong" : "Tiếp")}
          </button>
        </div>
      </div>
    </div>
  );
}
