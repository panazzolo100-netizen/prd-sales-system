import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "success" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "bg-orange-500 hover:bg-orange-600 text-white",

    secondary:
      "bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white",

    success:
      "bg-emerald-600 hover:bg-emerald-700 text-white",

    danger:
      "bg-red-600 hover:bg-red-700 text-white",
  };

  return (
    <button
      {...props}
      className={`
        rounded-xl
        px-5
        py-3
        font-semibold
        transition-all
        duration-200
        shadow-lg
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </button>
  );
}