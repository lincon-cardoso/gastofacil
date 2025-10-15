"use client";
import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import styles from "../Modal.module.scss";

type BaseModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
};
// 
export default function BaseModal({
  open,
  onClose,
  title,
  children,
  ariaLabelledBy,
  ariaDescribedBy,
}: BaseModalProps) {
  const [mounted, setMounted] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const lastFocused = useRef<Element | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    lastFocused.current = document.activeElement;
    document.body.style.overflow = "hidden";
    const el = contentRef.current;
    const toFocus = el?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    toFocus?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "Tab") {
        const focusables = el?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const isShift = e.shiftKey;
        if (!isShift && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        } else if (isShift && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      if (lastFocused.current instanceof HTMLElement) {
        lastFocused.current.focus();
      }
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  const modalNode = (
    <div className={styles.modalOverlay} onClick={onClose} aria-hidden>
      <div
        ref={contentRef}
        className={styles.modalContent}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        onClick={(e) => e.stopPropagation()}
      >
        {title ? (
          <header className={styles.modalHeader}>
            <h2 id={ariaLabelledBy}>{title}</h2>
          </header>
        ) : null}
        {children}
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalNode, document.body);
}
