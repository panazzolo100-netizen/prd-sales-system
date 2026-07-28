import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({
  children,
  className = "",
}: CardProps) {
  return (
    <div
      className={`
        group
        relative
        overflow-hidden
        rounded-3xl
        border
        border-[var(--border)]
        bg-[var(--surface)]
        p-6
        text-[var(--foreground)]
        shadow-2xl
        shadow-black/10
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-orange-500/25
        hover:shadow-orange-500/10
        ${className}
      `}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-orange-500/5 blur-3xl transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative">
        {children}
      </div>
    </div>
  );
}