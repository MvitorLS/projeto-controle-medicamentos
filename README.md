# 💊 Controle de Medicação (MediControl)

Sistema completo para gerenciamento de medicamentos, horários e histórico de tomadas, com arquitetura moderna e banco de dados em nuvem via **Supabase (PostgreSQL)**.

---

## 🛠️ Tecnologias Utilizadas

* **Frontend:** React 19, TypeScript, Vite, React Router, Tailwind/CSS Customizado.
* **Backend:** Node.js, Express, Sequelize ORM.
* **Banco de Dados:** PostgreSQL na nuvem (Supabase) com fallback para SQLite.
* **Autenticação:** JWT (JSON Web Tokens) e Bcrypt para hash de senhas.

---

## 📂 Estrutura do Projeto

```text
controle-medicacao/
├── backend/                  # API REST em Node.js
│   ├── src/
│   │   ├── config/           # Configuração de conexão do Sequelize (PostgreSQL/Supabase)
│   │   ├── middleware/       # Autenticação e validação JWT
│   │   ├── models/           # Modelos: Usuario, Medicamento, Horario, RegistroUso
│   │   ├── routes/           # Rotas: auth, medicamentos, registros
│   │   └── server.js         # Ponto de entrada da API
│   ├── .env.example          # Exemplo das variáveis de ambiente
│   └── package.json
│
├── frontend/                 # Interface em React + Vite + TypeScript
│   ├── src/
│   │   ├── pages/            # Telas: Login, Cadastro, Dashboard, Medicamentos
│   │   ├── context/          # Context API para autenticação
│   │   └── api.ts            # Cliente Axios/Fetch para comunicação com o backend
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
└── .gitignore                # Proteção de credenciais e dependências
```

---

## 🚀 Como Executar o Projeto

### 1. Pré-requisitos
* Node.js v18+ instalado
* Conta no Supabase (ou banco PostgreSQL)

### 2. Configurar o Backend
```bash
cd backend
npm install

# Crie o arquivo .env baseado no .env.example
# Preencha a DATABASE_URL com a string de conexão do seu Supabase
npm start
```

### 3. Iniciar o Frontend
```bash
cd ../frontend
npm install
npm run dev
```

Acesse no navegador: `http://localhost:5173`

---

## 🔒 Segurança
As credenciais de banco e chaves secretas estão protegidas via variáveis de ambiente (`.env`) e ignoradas pelo `.gitignore`.
