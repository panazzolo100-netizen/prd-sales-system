"use client";

import {
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useState,
} from "react";

import { CompanyLogo } from "@/components/layout/CompanyLogo";
import { createClient } from "@/lib/supabase/client";

type PasswordStatusResponse = {
  forcePasswordChange?: boolean;
  error?: string;
};

export default function FirstAccessPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] =
    useState("");
  const [
    passwordConfirmation,
    setPasswordConfirmation,
  ] = useState("");
  const [showPassword, setShowPassword] =
    useState(false);
  const [
    showPasswordConfirmation,
    setShowPasswordConfirmation,
  ] = useState(false);
  const [checking, setChecking] =
    useState(true);
  const [loading, setLoading] =
    useState(false);
  const [error, setError] =
    useState("");

  useEffect(() => {
    let active = true;

    async function checkAccess() {
      try {
        const response = await fetch(
          "/api/users/password",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data =
          (await response.json()) as PasswordStatusResponse;

        if (!response.ok) {
          throw new Error(
            data.error ??
              "Não foi possível verificar o primeiro acesso."
          );
        }

        if (
          active &&
          !data.forcePasswordChange
        ) {
          router.replace("/");
          router.refresh();
          return;
        }

        if (active) {
          setChecking(false);
        }
      } catch (requestError) {
        if (!active) {
          return;
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Não foi possível verificar o primeiro acesso."
        );
        setChecking(false);
      }
    }

    void checkAccess();

    return () => {
      active = false;
    };
  }, [router]);

  async function submit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (password.length < 8) {
      setError(
        "A nova senha deve ter pelo menos 8 caracteres."
      );
      return;
    }

    if (
      password !== passwordConfirmation
    ) {
      setError(
        "A confirmação da senha não confere."
      );
      return;
    }

    setLoading(true);

    const { error: passwordError } =
      await supabase.auth.updateUser({
        password,
      });

    if (passwordError) {
      setLoading(false);
      setError(
        passwordError.message
      );
      return;
    }

    try {
      const response = await fetch(
        "/api/users/password",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
        }
      );

      const data =
        (await response.json()) as {
          error?: string;
        };

      if (!response.ok) {
        throw new Error(
          data.error ??
            "Não foi possível concluir o primeiro acesso."
        );
      }

      router.replace("/");
      router.refresh();
    } catch (requestError) {
      setLoading(false);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "A senha foi alterada, mas não foi possível concluir o primeiro acesso. Entre novamente e tente de novo."
      );
    }
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#070708] text-white">
        <div className="flex items-center gap-3 text-zinc-400">
          <LoaderCircle
            size={22}
            className="animate-spin text-orange-500"
          />
          Verificando primeiro acesso...
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070708] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-orange-500/10 blur-[120px]" />

        <div className="absolute -bottom-48 right-0 h-[520px] w-[520px] rounded-full bg-orange-600/5 blur-[140px]" />

        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:44px_44px]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-[1500px] items-center justify-center p-5 sm:p-10">
        <div className="w-full max-w-[500px]">
          <div className="mb-8 flex justify-center">
            <CompanyLogo collapsed={false} />
          </div>

          <form
            onSubmit={submit}
            className="rounded-[28px] border border-white/10 bg-zinc-900/70 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-9"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10 text-orange-500">
              <ShieldCheck size={28} />
            </div>

            <p className="mt-7 text-sm font-bold uppercase tracking-[0.22em] text-orange-500">
              Primeiro acesso
            </p>

            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Crie sua senha definitiva
            </h1>

            <p className="mt-3 leading-6 text-zinc-400">
              Por segurança, substitua a senha
              temporária antes de acessar o sistema.
            </p>

            <div className="mt-8 rounded-xl border border-white/5 bg-black/20 p-4">
              <div className="flex items-start gap-3 text-sm text-zinc-400">
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0 text-orange-500"
                />
                Use pelo menos 8 caracteres e não
                compartilhe sua senha.
              </div>
            </div>

            <div className="mt-7 space-y-5">
              <div>
                <label
                  htmlFor="new-password"
                  className="mb-2 block text-sm font-semibold text-zinc-300"
                >
                  Nova senha
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={19}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
                  />

                  <input
                    id="new-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(event) => {
                      setPassword(
                        event.target.value
                      );
                      setError("");
                    }}
                    placeholder="Digite a nova senha"
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

              <div>
                <label
                  htmlFor="password-confirmation"
                  className="mb-2 block text-sm font-semibold text-zinc-300"
                >
                  Confirmar nova senha
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={19}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
                  />

                  <input
                    id="password-confirmation"
                    type={
                      showPasswordConfirmation
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={
                      passwordConfirmation
                    }
                    onChange={(event) => {
                      setPasswordConfirmation(
                        event.target.value
                      );
                      setError("");
                    }}
                    placeholder="Repita a nova senha"
                    className="h-14 w-full rounded-xl border border-zinc-800 bg-black/30 pl-12 pr-12 text-white outline-none transition placeholder:text-zinc-700 hover:border-zinc-700 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswordConfirmation(
                        (current) => !current
                      )
                    }
                    aria-label={
                      showPasswordConfirmation
                        ? "Ocultar confirmação"
                        : "Mostrar confirmação"
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-white"
                  >
                    {showPasswordConfirmation ? (
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
                  Salvando...
                </>
              ) : (
                "Salvar nova senha"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-zinc-700">
            © {new Date().getFullYear()} PRD
            Soluções em Engenharia
          </p>
        </div>
      </div>
    </main>
  );
}