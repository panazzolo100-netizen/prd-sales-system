import { ReactNode } from "react";

export function Badge({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white">
      {children}
    </span>
  );
}