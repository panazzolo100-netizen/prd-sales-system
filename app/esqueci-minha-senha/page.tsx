"use client";

import { ArrowLeft, CheckCircle2, LoaderCircle, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { CompanyLogo } from "@/components/layout/CompanyLogo";
import { createClient } from "@/lib/supabase/client";

const GENERIC_SUCCESS_MESSAGE =
  "Se houver uma conta vinculada a este e-mail, você receberá as instruções para redefinir sua senha.";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function requestPasswordReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/redefinir-senha`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo }
      );

      if (resetError) {
        setError("Não foi possível enviar as instruções agora. Tente novamente mais tarde.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Não foi possível enviar as instruções agora. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070708] p-5 text-white sm:p-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-orange-500/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:44px_44px]" />
      </div>

      <div className="relative w-full max-w-[470px]">
        <div className="mb-8 flex justify-center">
          <CompanyLogo collapsed={false} />
        </div>

        <section className="rounded-[28px] border border-white/10 bg-zinc-900/70 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-9">
          {success ? (
            <div className="text-center" role="status">
              <CheckCircle2 className="mx-auto text-emerald-400" size={48} />
              <h1 className="mt-5 text-3xl font-black tracking-tight">Confira seu e-mail</h1>
              <p className="mt-4 leading-7 text-zinc-400">{GENERIC_SUCCESS_MESSAGE}</p>
              <button
                type="button"
                onClick={() => setSuccess(false)}
                className="mt-7 h-12 w-full rounded-xl border border-zinc-700 font-semibold text-zinc-200 transition hover:border-zinc-600 hover:bg-white/5"
              >
                Enviar novamente
              </button>
            </div>
          ) : (
            <form onSubmit={requestPasswordReset}>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-orange-500">Recuperação de acesso</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight">Esqueceu sua senha?</h1>
              <p className="mt-3 leading-6 text-zinc-400">Informe seu e-mail para receber as instruções de redefinição.</p>

              <label htmlFor="email" className="mb-2 mt-8 block text-sm font-semibold text-zinc-300">E-mail</label>
              <div className="relative">
                <Mail size={19} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => { setEmail(event.target.value); setError(""); }}
                  placeholder="seuemail@empresa.com.br"
                  className="h-14 w-full rounded-xl border border-zinc-800 bg-black/30 pl-12 pr-4 text-white outline-none transition placeholder:text-zinc-700 hover:border-zinc-700 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                />
              </div>

              {error && <div role="alert" className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400">{error}</div>}

              <button type="submit" disabled={loading} className="mt-7 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? <><LoaderCircle size={20} className="animate-spin" />Enviando...</> : "Enviar instruções"}
              </button>
            </form>
          )}

          <Link href="/login" className="mt-7 flex items-center justify-center gap-2 border-t border-white/5 pt-6 text-sm font-semibold text-zinc-400 transition hover:text-white">
            <ArrowLeft size={16} /> Voltar para o login
          </Link>
          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-zinc-600"><ShieldCheck size={15} />Acesso protegido pelo Supabase Auth</div>
        </section>
      </div>
    </main>
  );
}
