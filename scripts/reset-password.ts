import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";

loadEnvConfig(process.cwd());

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl) {
  throw new Error(
    "A variável NEXT_PUBLIC_SUPABASE_URL não foi encontrada no .env.local."
  );
}

if (!supabaseSecretKey) {
  throw new Error(
    "A variável SUPABASE_SECRET_KEY não foi encontrada no .env.local."
  );
}

const supabase = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  const email = "murillopivotto03@gmail.com";
  const novaSenha = "12345678";

  const { data, error } = await supabase.auth.admin.listUsers();

  if (error) {
    throw new Error(`Erro ao listar usuários: ${error.message}`);
  }

  const user = data.users.find(
    (item) => item.email?.toLowerCase() === email.toLowerCase()
  );

  if (!user) {
    throw new Error(`Usuário não encontrado: ${email}`);
  }

  const { error: updateError } =
    await supabase.auth.admin.updateUserById(user.id, {
      password: novaSenha,
    });

  if (updateError) {
    throw new Error(`Erro ao alterar a senha: ${updateError.message}`);
  }

  console.log("Senha alterada com sucesso!");
  console.log(`E-mail: ${email}`);
  console.log(`Senha temporária: ${novaSenha}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});