"use client";
import { Check, Copy, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useState } from "react";

export function ContactActions({ phone, email, address, compact = false }: { phone?: string | null; email?: string | null; address?: string | null; compact?: boolean }) {
  const [copied, setCopied] = useState(false);
  const digits = phone?.replace(/\D/g, "") ?? "";
  async function copyPhone() { if (!phone) return; await navigator.clipboard.writeText(phone); setCopied(true); window.setTimeout(() => setCopied(false), 1500); }
  const actions = [phone && { label: "WhatsApp", href: `https://wa.me/55${digits}`, icon: MessageCircle }, phone && { label: "Ligar", href: `tel:${digits}`, icon: Phone }, email && { label: "E-mail", href: `mailto:${email}`, icon: Mail }, address && { label: "Maps", href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, icon: MapPin }].filter(Boolean) as { label: string; href: string; icon: typeof Phone }[];
  return <div className="flex flex-wrap gap-2">{actions.map(({ label, href, icon: Icon }) => <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" aria-label={label} className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-xs font-semibold text-zinc-300 transition hover:border-orange-500/30 hover:text-orange-400"><Icon size={14} />{!compact && label}</a>)}{phone && <button type="button" onClick={copyPhone} aria-label="Copiar telefone" className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-xs font-semibold text-zinc-300 transition hover:text-white">{copied ? <Check size={14} /> : <Copy size={14} />}{!compact && (copied ? "Copiado" : "Copiar")}</button>}</div>;
}
