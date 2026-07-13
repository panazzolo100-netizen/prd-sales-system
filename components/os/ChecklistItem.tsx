"use client";

type ChecklistItemProps = {
  name: string;
  label: string;
  checked: boolean;
};

export function ChecklistItem({
  name,
  label,
  checked,
}: ChecklistItemProps) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
        checked
          ? "border-emerald-500 bg-emerald-500/10"
          : "border-zinc-800 bg-zinc-950 hover:border-orange-500"
      }`}
    >
      <input
        type="checkbox"
        name={name}
        defaultChecked={checked}
        onChange={(event) => {
          event.currentTarget.form?.requestSubmit();
        }}
        className="h-5 w-5 accent-orange-500"
      />

      <div className="flex flex-1 items-center justify-between">
        <span
          className={`font-medium ${
            checked
              ? "text-emerald-300"
              : "text-zinc-200"
          }`}
        >
          {label}
        </span>

        {checked && (
          <span className="text-lg font-bold text-emerald-400">
            ✓
          </span>
        )}
      </div>
    </label>
  );
}