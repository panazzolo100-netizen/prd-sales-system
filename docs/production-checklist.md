# Checklist de produção — PRD ERP

## Antes da publicação

- Configurar `DATABASE_URL`, Supabase URL e chave pública por ambiente.
- Aplicar migrations aprovadas em staging antes da produção; nunca usar `db push` em produção.
- Executar `prisma generate`, lint, TypeScript e build.
- Confirmar políticas de backup e restauração do PostgreSQL/Supabase.
- Confirmar HTTPS, domínio, URLs de callback e cookies de autenticação.
- Testar isolamento com dois usuários pertencentes a empresas diferentes.
- Testar o fluxo Lead → Cliente → Projeto → Financeiro → OS → PDF.
- Validar `/api/health` no ambiente publicado.

## Armazenamento

Os arquivos existentes continuam em `public/uploads` por compatibilidade. Esse diretório não é persistente em várias plataformas serverless. Antes de produção distribuída, provisionar Supabase Storage, criar buckets privados por domínio e migrar apenas novos uploads por uma camada de storage. Preservar URLs legadas durante a transição e não apagar arquivos locais até a migração ser verificada.

## Pós-publicação

- Acompanhar erros 5xx e latência do banco.
- Verificar diariamente backups e espaço do Storage.
- Não registrar tokens, assinaturas, documentos pessoais ou conteúdo de arquivos em logs.
- Revalidar geração de PDF e downloads após cada alteração de domínio.
