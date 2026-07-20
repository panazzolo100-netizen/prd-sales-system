"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { X } from "lucide-react";

type DrawerProps = {
  open: boolean;
  onClose: () => void;

  title: string;
  description?: string;
  eyebrow?: string;

  children: ReactNode;

  maxWidthClassName?: string;
};

const DRAWER_ANIMATION_MS = 300;

export function Drawer({
  open,
  onClose,
  title,
  description,
  eyebrow,
  children,
  maxWidthClassName = "max-w-5xl",
}: DrawerProps) {
  const [isRendered, setIsRendered] =
    useState(open);

  const [isVisible, setIsVisible] =
    useState(false);

  const closeTimeoutRef =
    useRef<number | null>(null);

  const closeButtonRef =
    useRef<HTMLButtonElement | null>(
      null
    );

  const requestClose =
    useCallback(() => {
      setIsVisible(false);

      if (closeTimeoutRef.current) {
        window.clearTimeout(
          closeTimeoutRef.current
        );
      }

      closeTimeoutRef.current =
        window.setTimeout(() => {
          setIsRendered(false);
          onClose();
        }, DRAWER_ANIMATION_MS);
    }, [onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setIsRendered(true);

    const animationFrame =
      window.requestAnimationFrame(() => {
        setIsVisible(true);
      });

    const focusTimeout =
      window.setTimeout(() => {
        closeButtonRef.current?.focus();
      }, DRAWER_ANIMATION_MS);

    return () => {
      window.cancelAnimationFrame(
        animationFrame
      );

      window.clearTimeout(
        focusTimeout
      );
    };
  }, [open]);

  useEffect(() => {
    if (!isRendered) {
      return;
    }

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        requestClose();
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    document.body.style.overflow =
      "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow = "";
    };
  }, [isRendered, requestClose]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        window.clearTimeout(
          closeTimeoutRef.current
        );
      }

      document.body.style.overflow = "";
    };
  }, []);

  if (!isRendered) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[80] flex justify-end transition-colors duration-300 ${
        isVisible
          ? "bg-black/70 backdrop-blur-sm"
          : "bg-black/0 backdrop-blur-none"
      }`}
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          requestClose();
        }
      }}
      aria-hidden={!isVisible}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`h-full w-full ${maxWidthClassName} overflow-y-auto border-l border-white/[0.08] bg-zinc-950 shadow-[-25px_0_80px_rgba(0,0,0,0.55)] transition-all duration-300 ease-out ${
          isVisible
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0"
        }`}
      >
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/[0.07] bg-zinc-950/95 px-8 py-6 backdrop-blur-xl">
          <div className="min-w-0">
            {eyebrow && (
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">
                {eyebrow}
              </p>
            )}

            <h1
              className={`truncate text-3xl font-black text-white ${
                eyebrow ? "mt-2" : ""
              }`}
            >
              {title}
            </h1>

            {description && (
              <p className="mt-1 truncate text-zinc-400">
                {description}
              </p>
            )}
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={requestClose}
            className="ml-6 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-zinc-900 text-zinc-400 outline-none transition hover:border-orange-500/30 hover:bg-orange-500/10 hover:text-orange-400 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10"
            aria-label="Fechar painel"
          >
            <X size={20} />
          </button>
        </header>

        {children}
      </aside>
    </div>
  );
}