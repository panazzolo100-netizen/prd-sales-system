export default function ProtectedLoading() {
  return (
    <div className="animate-pulse space-y-6" aria-label="Carregando página">
      <div className="h-20 max-w-xl rounded-2xl bg-zinc-900" />
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="h-28 rounded-2xl bg-zinc-900" />
        ))}
      </div>
      <div className="h-80 rounded-2xl bg-zinc-900" />
    </div>
  );
}
