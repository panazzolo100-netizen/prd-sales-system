"use client";

import { AlertTriangle, Eye, EyeOff, LoaderCircle, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { CompanyLogo } from "@/components/layout/CompanyLogo";
import { createClient } from "@/lib/supabase/client";

const MIN_PASSWORD_LENGTH = 6;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [checkingLink, setCheckingLink] = useState(true);
  const [canReset, setCanReset] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function checkRecoverySession() {
      const urlError = searchParams.get("error_description");
      if (urlError) {
        if (active) {
          setError("Este link de recuperação é inválido ou expirou. Solicite um novo link.");
          setCheckingLink(false);
        }
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (active) {
        setCanReset(Boolean(session));
        if (!session) setError("Este link de recuperação é inválido ou expirou. Solicite um novo link.");
        setCheckingLink(false);
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "PASSWORD_RECOVERY" || (event === "INITIAL_SESSION" && session)) {
        setCanReset(true);
        setError("");
        setCheckingLink(false);
      }
    });

    void checkRecoverySession();
    return () => { active = false; subscription.unsubscribe(); };
  }, [searchParams]);

  async function updatePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      return;
    }
    if (password !== confirmation) {
      setError("A confirmação de senha não confere.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError("Não foi possível redefinir a senha. Solicite um novo link e tente novamente.");
        return;
      }

      setSuccess(true);
      await supabase.auth.signOut();
      window.setTimeout(() => { router.replace("/login"); router.refresh(); }, 1800);
    } catch {
      setError("Não foi possível redefinir a senha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (checkingLink) {
    return <div className="flex min-h-48 items-center justify-center gap-3 text-zinc-400" role="status"><LoaderCircle className="animate-spin" />Validando link...</div>;
  }

  if (!canReset) {
    return (
      <div className="text-center">
        <AlertTriangle className="mx-auto text-amber-400" size={48} />
        <h1 className="mt-5 text-3xl font-black">Link indisponível</h1>
        <p role="alert" className="mt-4 leading-7 text-zinc-400">{error}</p>
        <Link href="/esqueci-minha-senha" className="mt-7 flex h-12 items-center justify-center rounded-xl bg-orange-500 font-bold transition hover:bg-orange-600">Solicitar novo link</Link>
      </div>
    );
  }

  return (
    <form onSubmit={updatePassword}>
      <p className="text-sm font-bold uppercase tracking-[0.22em] text-orange-500">Novo acesso</p>
      <h1 className="mt-3 text-3xl font-black tracking-tight">Redefina sua senha</h1>
      <p className="mt-3 leading-6 text-zinc-400">Use pelo menos {MIN_PASSWORD_LENGTH} caracteres e confirme a nova senha.</p>

      <div className="mt-8 space-y-5">
        {[{ id: "password", label: "Nova senha", value: password, setValue: setPassword, autoComplete: "new-password" }, { id: "confirmation", label: "Confirmar nova senha", value: confirmation, setValue: setConfirmation, autoComplete: "new-password" }].map((field) => (
          <div key={field.id}>
            <label htmlFor={field.id} className="mb-2 block text-sm font-semibold text-zinc-300">{field.label}</label>
            <div className="relative">
              <LockKeyhole size={19} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
              <input id={field.id} type={showPassword ? "text" : "password"} autoComplete={field.autoComplete} required minLength={MIN_PASSWORD_LENGTH} value={field.value} onChange={(event) => { field.setValue(event.target.value); setError(""); }} className="h-14 w-full rounded-xl border border-zinc-800 bg-black/30 pl-12 pr-12 text-white outline-none transition hover:border-zinc-700 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10" />
              {field.id === "password" && <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-white">{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button>}
            </div>
          </div>
        ))}
      </div>

      {error && <div role="alert" className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400">{error}</div>}
      {success && <div role="status" className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-400">Senha redefinida com sucesso. Redirecionando para o login...</div>}

      <button type="submit" disabled={loading || success} className="mt-7 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 font-bold shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60">
        {loading ? <><LoaderCircle size={20} className="animate-spin" />Salvando...</> : "Salvar nova senha"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070708] p-5 text-white sm:p-10">
      <div className="pointer-events-none absolute inset-0"><div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-orange-500/10 blur-[120px]" /><div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:44px_44px]" /></div>
      <div className="relative w-full max-w-[470px]">
        <div className="mb-8 flex justify-center"><CompanyLogo collapsed={false} /></div>
        <section className="rounded-[28px] border border-white/10 bg-zinc-900/70 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-9">
          <Suspense fallback={<div className="flex min-h-48 items-center justify-center"><LoaderCircle className="animate-spin text-orange-500" /></div>}><ResetPasswordForm /></Suspense>
        </section>
      </div>
    </main>
  );
}
