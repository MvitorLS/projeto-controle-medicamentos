<div align="center">

  <!-- ANIMATED TYPING HEADER -->
  <a href="https://github.com/MvitorLS/projeto-controle-medicamentos">
    <img src="https://readme-typing-svg.demolab.com?font=Poppins&weight=600&size=24&pause=1000&color=0D9488&center=true&vCenter=true&width=700&height=65&lines=%F0%9F%8F%A5+MediControl+%E2%80%94+Sistema+de+Gest%C3%A3o+de+Sa%C3%BAde;UI%2FUX+Premium+%7C+Multi-Theme+%7C+GSAP+Motion;Controle+de+Doses%2C+M%C3%A9tricas+Vitais+%26+OCR+Scanner" alt="Typing SVG" />
  </a>

  <p align="center">
    <b>Plataforma web avançada para acompanhamento de rotina médica, cálculo de adesão a dosagens, métricas vitais e leitor de receitas via OCR.</b>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/JavaScript_ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"/>
    <img src="https://img.shields.io/badge/TailwindCSS_3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white"/>
    <img src="https://img.shields.io/badge/GSAP_3-GreenSock-88CE02?style=for-the-badge&logo=greensock&logoColor=white"/>
    <img src="https://img.shields.io/badge/Chart.js_4-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white"/>
    <img src="https://img.shields.io/badge/Node.js_v22-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white"/>
    <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge"/>
  </p>

</div>

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%" />

---

## 🌟 Destaques e Funcionalidades

- 💊 **Gestão Inteligente de Medicamentos**: Cadastro detalhado (nome, dosagem, frequência, horários, estoque e alertas de reposição).
- 🎨 **Multi-Theme Engine (4 Temas Dinâmicos)**:
  - ☀️ **Claro (Apple Health)** — Interface limpa com contraste suave e cartões brancos.
  - 🌙 **Escuro (Linear / Apple Dark)** — Design dark elegante com acentos celestes `#0f172a`.
  - 🌌 **Meia-Noite (OLED Obsidian)** — Preto puro `#000000` para telas OLED e alto contraste.
  - 🌿 **Menta (Wellness Calm)** — Tons esmeralda e menta `#f0fdf4` para foco e relaxamento.
- 🩸 **Painel de Métricas Vitais**: Registro e gráficos dinâmicos de Pressão Arterial, Glicemia, Frequência Cardíaca e Peso/IMC com exportação para CSV.
- 📊 **Histórico e Taxa de Adesão**: Análise mensal e semanal com gráficos de aderência ao tratamento em tempo real.
- 📄 **Leitor Inteligente de Receitas (OCR)**: Processamento e pré-preenchimento automático a partir de receitas médicas em PDF ou imagens.
- ⚡ **Arquitetura Modular**: JavaScript desacoplado por página (`dashboard.js`, `medicamentos.js`, `metricas.js`, `receitas.js`, `historico.js`, `auth.js`, `app.js`).

---

## 🏗️ Estrutura do Projeto

```
projeto-controle-medicamentos/
├── css/
│   └── style.css            # Sistema de temas CSS e animações personalizadas
├── js/
│   ├── app.js               # Biblioteca central (storage, tema, toasts, modal)
│   ├── auth.js              # Autenticação e controle de sessão
│   ├── dashboard.js         # Lógica do dashboard e doses do dia
│   ├── historico.js         # Gráficos de adesão e histórico mensal
│   ├── medicamentos.js      # CRUD e controle de estoque de medicamentos
│   ├── metricas.js          # Gráficos de pressão, glicemia e IMC
│   └── receitas.js          # Simulação OCR e leitura de receitas médicas
├── server/
│   ├── database.js          # Banco de dados SQLite persistente
│   ├── parser.js            # Parser de texto e extração OCR
│   ├── routes/              # Rotas da API REST
│   └── server.js            # Servidor Express (opcional para modo fullstack)
├── index.html               # Dashboard Principal
├── medicamentos.html        # Catálogo de Medicamentos
├── metricas.html            # Monitor de Saúde e Gráficos
├── receitas.html            # Scanner de Receitas
├── historico.html           # Histórico de Adesão
├── login.html               # Tela de Login
└── cadastro.html            # Tela de Cadastro
```

---

## 🚀 Como Executar Localmente

### Opção 1: Execução Direta no Navegador (Client-Side)
Abra qualquer arquivo `.html` (ex: `index.html` ou `login.html`) diretamente no navegador ou utilizando a extensão **Live Server** do VS Code.

### Opção 2: Modo Fullstack com Backend Node.js
```bash
# 1. Instalar dependências
npm install

# 2. Iniciar o servidor Express
npm start

# 3. Acesse no navegador:
# http://localhost:3000
```

---

## 🔌 API REST (Modo Backend)

| Método | Rota | Descrição |
| :---: | :--- | :--- |
| `GET` | `/api/medicamentos` | Lista todos os medicamentos cadastrados |
| `POST` | `/api/medicamentos` | Cadastra novo medicamento |
| `PUT` | `/api/medicamentos/:id/dose` | Registra dose tomada |
| `DELETE` | `/api/medicamentos/:id` | Remove medicamento |
| `GET` | `/api/medicoes` | Lista histórico de medições de saúde |
| `POST` | `/api/medicoes` | Registra nova medição com classificação automática |
| `POST` | `/api/scanner/upload` | Processa PDF ou Imagem da receita via OCR |

---

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%" />

<div align="center">
  <sub>Desenvolvido com excelência técnica por <b>Matheus Vitor Lourenço Schionato</b></sub>
</div>
