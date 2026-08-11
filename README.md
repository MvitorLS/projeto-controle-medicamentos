# MediControl — Sistema de Controle de Medicamentos & Medições de Saúde

Aplicação web completa com **front-end e back-end** para acompanhamento de medicamentos diários e métricas vitais de saúde.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| **Front-end** | HTML5, CSS3 (Vanilla), JavaScript (ES Modules + Fetch API) |
| **Back-end** | Node.js v22 + Express.js (framework REST) |
| **Banco de Dados** | SQLite (via `better-sqlite3`) |
| **Persistência** | Arquivo `data/medicontrol.db` (gerado automaticamente) |

---

## 🌟 Funcionalidades

- **Dashboard Principal**: Indicadores estatísticos, doses pendentes do dia e últimas medições.
- **Gestão de Medicamentos**: Cadastro de remédios, dosagem, horários, frequência e controle de estoque.
- **Registro de Medições de Saúde**: Pressão arterial, glicemia, frequência cardíaca, peso e temperatura.
- **Relatório Médico Exportável**: Gerador de relatório impresso/PDF para consultas médicas.
- **API REST**: Back-end completo com endpoints para todas as operações CRUD.

---

## 📂 Estrutura do Projeto

```text
projeto-controle-medicamentos/
├── server/
│   ├── server.js          # Servidor Express principal
│   ├── database.js        # Conexão SQLite e criação das tabelas
│   └── routes/
│       ├── medicamentos.js  # API: /api/medicamentos
│       └── medicoes.js      # API: /api/medicoes
├── css/
│   └── style.css          # Estilos CSS responsivos
├── js/
│   └── app.js             # Lógica do front-end (fetch API)
├── img/
│   └── favicon.svg        # Ícone do sistema
├── index.html             # Dashboard principal
├── medicamentos.html      # Gestão de medicamentos
├── medicoes.html          # Registro de medições vitais
├── relatorio.html         # Relatório para consultas
├── package.json
└── .gitignore
```

---

## 🚀 Como Executar

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar o servidor
npm start

# 3. Acessar no navegador
# http://localhost:3000
```

---

## 🔌 API REST — Endpoints

### Medicamentos
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/medicamentos` | Lista todos os medicamentos |
| `POST` | `/api/medicamentos` | Cadastra novo medicamento |
| `PUT` | `/api/medicamentos/:id/dose` | Marca/desmarca dose do dia |
| `DELETE` | `/api/medicamentos/:id` | Remove medicamento |

### Medições de Saúde
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/medicoes` | Lista todas as medições |
| `POST` | `/api/medicoes` | Registra nova medição |
| `DELETE` | `/api/medicoes/:id` | Remove medição |
