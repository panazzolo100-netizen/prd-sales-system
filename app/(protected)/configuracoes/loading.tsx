import { AppLayout } from "@/components/layout/AppLayout";
export default function Loading() { return <AppLayout><div className="animate-pulse space-y-6"><div className="h-20 w-80 rounded-2xl bg-zinc-900" /><div className="grid gap-6 xl:grid-cols-3"><div className="h-80 rounded-2xl bg-zinc-900 xl:col-span-2" /><div className="h-80 rounded-2xl bg-zinc-900" /></div></div></AppLayout>; }
