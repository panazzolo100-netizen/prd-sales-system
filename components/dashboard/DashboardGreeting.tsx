"use client";

import { useEffect, useState } from "react";

import { getGreetingForHour } from "@/lib/auth/user-presentation";

export function DashboardGreeting({ firstName }: { firstName: string }) {
  const [greeting, setGreeting] = useState<string | null>(null);

  useEffect(() => {
    setGreeting(getGreetingForHour(new Date().getHours()));
  }, []);

  return <>{greeting ?? "Olá"}, {firstName}</>;
}
