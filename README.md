<div align="center">

  <!-- ANIMATED TYPING HEADER -->
  <a href="https://github.com/MvitorLS/projeto-controle-medicamentos">
    <img src="https://readme-typing-svg.demolab.com?font=Poppins&weight=600&size=24&pause=1000&color=0D9488&center=true&vCenter=true&width=650&height=65&lines=%F0%9F%8F%A5+MediControl+%E2%80%94+Controle+de+Medicamentos;Node.js+%7C+Express+%7C+SQLite+%7C+OCR+Scanner;Gest%C3%A3o+de+Doses%2C+M%C3%A9tricas+Vitais+%26+PDFs" alt="Typing SVG" />
  </a>

  <p align="center">
    <b>Aplicação web completa para acompanhamento de dosagens diárias, métricas de saúde e leitor automático de receitas médicas (OCR/PDF).</b>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/Node.js_v22-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white"/>
    <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white"/>
    <img src="https://img.shields.io/badge/SQLite_3-003B57?style=for-the-badge&logo=sqlite&logoColor=white"/>
    <img src="https://img.shields.io/badge/Tesseract_OCR-Scanner_PDF-0D9488?style=for-the-badge&logo=googledocs&logoColor=white"/>
  </p>

</div>

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%" />

---

## 🌟 Funcionalidades Principais

- 💊 **Gestão de Medicamentos**: Cadastro de nome, dosagem, horário, frequência e controle de estoque de remédios.
- 🩸 **Métricas Vitais de Saúde**: Monitoramento de pressão arterial, glicemia, frequência cardíaca, peso e temperatura.
- 📄 **Scanner de Receita Médica (OCR & PDF)**: Leitura automática de PDFs e imagens de receitas para cadastro inteligente.
- 📊 **Dashboard & Relatório Médico**: Painel com estatísticas e emissão de relatórios formatados para consultas.

---

## 🔌 API REST — Endpoints

<div align="center">

| Método | Rota API | Descrição |
| :---: | :--- | :--- |
| `GET` | `/api/medicamentos` | Lista todos os medicamentos cadastrados |
| `POST` | `/api/medicamentos` | Cadastra novo medicamento |
| `PUT` | `/api/medicamentos/:id/dose` | Marca ou desmarca dose diária tomada |
| `DELETE` | `/api/medicamentos/:id` | Remove medicamento do cadastro |
| `GET` | `/api/medicoes` | Lista o histórico de medições vitais |
| `POST` | `/api/medicoes` | Registra nova medição com classificação automática |
| `POST` | `/api/scanner/upload` | Processa PDF ou Imagem da receita via OCR |

</div>

---

## 🚀 Como Executar Localmente

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar o servidor Express
npm start

# 3. Acesse no navegador:
# http://localhost:3000
```

---

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%" />

<div align="center">
  <sub>Desenvolvido com dedicação por <b>Matheus Vitor Lourenço Schionato</b></sub>
</div>
