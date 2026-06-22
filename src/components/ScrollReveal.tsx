"use client";
import { useEffect, useRef, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export default function ScrollReveal({ children, delay = 0, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add("sr-visible"), delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.07, rootMargin: "0px 0px -32px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={`sr-hidden ${className}`}>
      {children}
    </div>
  );
}
