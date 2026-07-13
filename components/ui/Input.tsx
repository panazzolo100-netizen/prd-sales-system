import { InputHTMLAttributes } from "react";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="
        w-full
        rounded-xl
        border
        border-zinc-700
        bg-zinc-800
        px-4
        py-3
        outline-none
        transition
        focus:border-orange-500
      "
    />
  );
}