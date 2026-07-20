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
        border-white/[0.06]
        bg-gradient-to-b
        from-zinc-900
        to-zinc-950
        p-6
        shadow-2xl
        shadow-black/20
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-orange-500/20
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