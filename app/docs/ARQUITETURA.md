# Arquitetura SaaS - PRD Sales System

## Objetivo

Criar um CRM/ERP SaaS para empresas de engenharia, energia solar, elétrica, obras e manutenção.

## Modelo SaaS

O sistema será multiempresa.

Cada empresa terá seus próprios:

- Usuários
- Leads
- Clientes
- Propostas
- Projetos
- Obras
- Financeiro
- Arquivos
- Configurações

## Módulos

### 1. Dashboard
Indicadores gerais da empresa.

### 2. Comercial
Leads, clientes, funil, propostas e follow-ups.

### 3. Engenharia
Projetos, ARTs, homologações, concessionárias e documentos técnicos.

### 4. Obras
Instalações, cronograma, checklist, fotos e entrega.

### 5. Financeiro
Contas a receber, contas a pagar, comissões e fluxo de caixa.

### 6. Configurações
Usuários, permissões, empresa, logo e módulos ativos.

## Perfis de Usuário

- Admin
- Gestor
- Comercial
- Engenharia
- Financeiro
- Operacional

## Banco de Dados Principal

- empresas
- usuarios
- leads
- clientes
- propostas
- tarefas
- atividades
- projetos
- obras
- financeiro
- arquivos
- comentarios

## Regra Principal

Toda tabela operacional terá `empresa_id`.

Isso garante que cada empresa veja apenas seus próprios dados.

## Stack

- Next.js
- TypeScript
- Tailwind
- Supabase
- PostgreSQL
- GitHub
- Vercel