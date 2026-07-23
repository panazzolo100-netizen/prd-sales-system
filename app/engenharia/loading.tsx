import { AppLayout } from "@/components/layout/AppLayout";
export default function Loading() { return <AppLayout><div className="animate-pulse space-y-6"><div className="h-24 rounded-2xl bg-zinc-900" /><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{[1,2,3,4,5,6].map((item) => <div key={item} className="h-72 rounded-2xl bg-zinc-900" />)}</div></div></AppLayout>; }
