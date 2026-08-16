# 📋 Changelog / Notas de Lançamento

Todas as alterações notáveis, correções e novas funcionalidades deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/) e este projeto segue o [Versionamento Semântico (SemVer)](https://semver.org/lang/pt-BR/).

---

## [1.0.0] — 2026-08-16

### ✨ Principais Funcionalidades
* **Arquitetura Fullstack Completa:** Estruturação modular dividida em `frontend/` (React 19 + TypeScript + Vite) e `backend/` (Node.js + Express + Sequelize ORM).
* **Autenticação & Autorização:** Implementação de autenticação baseada em tokens JWT (*JSON Web Tokens*) e criptografia de senhas com `bcryptjs`.
* **Gerenciamento de Medicamentos:** Módulos para cadastro, edição, desativação, listagem e controle de dosagens.
* **Agendamento de Horários:** Definição e vínculo de múltiplos horários diários por medicamento.
* **Histórico de Uso:** Registro e rastreabilidade de doses tomadas ou pendentes.

### 🗄️ Infraestrutura e Banco de Dados
* **Integração com Supabase (PostgreSQL 17):** Migração do banco local para PostgreSQL gerenciado em nuvem com conexão segura via SSL.
* **Mapeamento Objeto-Relacional (ORM):** Modelos definidos com Sequelize (`Usuario`, `Medicamento`, `Horario`, `RegistroUso`) com sincronização automática de schema (`sync`).
* **Resiliência:** Suporte a fallback local para SQLite em ambientes de desenvolvimento offline.

### 🛡️ Segurança e Boas Práticas
* **Isolamento de Credenciais:** Configuração de variáveis de ambiente via `.env` com proteção estrita no `.gitignore` para prevenir vazamento de segredos.
* **Exemplos de Configuração:** Disponibilização de `.env.example` para setup padronizado de novos ambientes.

### 📚 Documentação
* **README Executivo:** Adicionado guia completo de arquitetura, fluxo de inicialização e rotas da API.
