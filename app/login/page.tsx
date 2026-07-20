"use client";

import {
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");
  const [showPassword, setShowPassword] =
    useState(false);
  const [loading, setLoading] =
    useState(false);
  const [error, setError] =
    useState("");

  async function login(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const { error: loginError } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    if (loginError) {
      setLoading(false);

      setError(
        loginError.message ===
          "Invalid login credentials"
          ? "E-mail ou senha incorretos."
          : loginError.message
      );

      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070708] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-orange-500/10 blur-[120px]" />

        <div className="absolute -bottom-48 right-0 h-[520px] w-[520px] rounded-full bg-orange-600/5 blur-[140px]" />

        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:44px_44px]" />
      </div>

      <div className="relative mx-auto grid min-h-screen max-w-[1500px] lg:grid-cols-[1.15fr_0.85fr]">
        <section className="hidden border-r border-white/5 p-14 lg:flex lg:flex-col lg:justify-between xl:p-20">
          <div>
            <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 shadow-lg shadow-orange-500/20">
                <Zap
                  size={23}
                  strokeWidth={2.4}
                />
              </div>

              <div>
                <p className="text-xl font-black tracking-tight">
                  PRD
                </p>

                <p className="text-xs text-zinc-500">
                  Soluções em Engenharia
                </p>
              </div>
            </div>

            <div className="mt-24 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-400">
                <ShieldCheck size={16} />
                Gestão integrada e segura
              </div>

              <h1 className="mt-7 text-5xl font-black leading-[1.05] tracking-[-0.04em] xl:text-7xl">
                Engenharia,
                <br />
                operação e gestão
                <br />
                <span className="text-orange-500">
                  em um só lugar.
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-lg leading-8 text-zinc-400">
                Controle comercial, projetos,
                financeiro, ordens de serviço,
                documentos e execução de campo da PRD
                Engenharia.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-8 text-sm text-zinc-500">
            <span>PRD ERP</span>

            <span className="h-1 w-1 rounded-full bg-zinc-700" />

            <span>Ambiente seguro</span>

            <span className="h-1 w-1 rounded-full bg-zinc-700" />

            <span>Dados centralizados</span>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center p-5 sm:p-10 lg:p-14">
          <div className="w-full max-w-[470px]">
            <div className="mb-10 lg:hidden">
              <div className="inline-flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 shadow-lg shadow-orange-500/20">
                  <Zap
                    size={23}
                    strokeWidth={2.4}
                  />
                </div>

                <div>
                  <p className="text-xl font-black">
                    PRD ERP
                  </p>

                  <p className="text-xs text-zinc-500">
                    Soluções em Engenharia
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={login}
              className="rounded-[28px] border border-white/10 bg-zinc-900/70 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-9"
            >
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-orange-500">
                  Área restrita
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                  Bem-vindo de volta
                </h2>

                <p className="mt-3 leading-6 text-zinc-400">
                  Entre com suas credenciais para
                  acessar o sistema.
                </p>
              </div>

              <div className="mt-9 space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-zinc-300"
                  >
                    E-mail
                  </label>

                  <div className="relative">
                    <Mail
                      size={19}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
                    />

                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        setError("");
                      }}
                      placeholder="seuemail@empresa.com.br"
                      className="h-14 w-full rounded-xl border border-zinc-800 bg-black/30 pl-12 pr-4 text-white outline-none transition placeholder:text-zinc-700 hover:border-zinc-700 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="text-sm font-semibold text-zinc-300"
                    >
                      Senha
                    </label>
                  </div>

                  <div className="relative">
                    <LockKeyhole
                      size={19}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
                    />

                    <input
                      id="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(event) => {
                        setPassword(
                          event.target.value
                        );
                        setError("");
                      }}
                      placeholder="Digite sua senha"
                      className="h-14 w-full rounded-xl border border-zinc-800 bg-black/30 pl-12 pr-12 text-white outline-none transition placeholder:text-zinc-700 hover:border-zinc-700 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (current) => !current
                        )
                      }
                      aria-label={
                        showPassword
                          ? "Ocultar senha"
                          : "Mostrar senha"
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-7 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 hover:shadow-orange-500/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <LoaderCircle
                      size={20}
                      className="animate-spin"
                    />
                    Entrando...
                  </>
                ) : (
                  "Entrar no sistema"
                )}
              </button>

              <div className="mt-7 flex items-center justify-center gap-2 border-t border-white/5 pt-6 text-xs text-zinc-600">
                <ShieldCheck size={15} />
                Acesso protegido pelo Supabase Auth
              </div>
            </form>

            <p className="mt-6 text-center text-xs text-zinc-700">
              © {new Date().getFullYear()} PRD
              Soluções em Engenharia
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}