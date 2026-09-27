# SaúdeControl (MediControl)

Aplicação web para quem toma remédio todo dia: agenda de doses, histórico de adesão, registro de pressão, glicemia, frequência cardíaca e peso, e leitura de receita médica para pré-preencher o cadastro do medicamento.

![Dashboard](docs/dashboard.png)

## Funcionalidades

- **Medicamentos**: dosagem, forma, frequência, horários, período e estoque; o dashboard monta as doses do dia a partir disso.
- **Histórico de adesão**: doses tomadas × previstas por semana e por mês (Chart.js).
- **Métricas vitais**: pressão arterial, glicemia (com momento da medição), frequência cardíaca e peso/IMC, com gráficos e exportação CSV.
- **Leitura de receitas**: o backend recebe PDF ou imagem em `POST /api/scanner`, extrai o texto (`pdf-parse` para PDF, Tesseract.js em português para imagem) e o `server/parser.js` identifica nome, dosagem, frequência, horário e quantidade com expressões regulares.
- **4 temas** (claro, escuro, OLED, menta) e animações com GSAP.

<details>
<summary>Tela de métricas</summary>

![Métricas](docs/metricas.png)
</details>

## Arquitetura

```
*.html + js/<página>.js   front em JavaScript puro, um módulo por página; js/app.js tem storage, tema, toasts e modal
server/
├── server.js             Express: serve o front e expõe /api/medicamentos, /api/medicoes, /api/scanner
├── routes/               rotas REST
├── parser.js             regex para receitas em português
├── upload.js             multer (limite de tamanho e tipos aceitos)
└── database.js           SQLite (better-sqlite3)
```

O front funciona sozinho (dados em `localStorage`) ou servido pelo Express, que adiciona a API e o banco SQLite.

## Rodando

```bash
npm install
npm start          # http://localhost:3000
```

Sem Node: abra `login.html` no navegador (modo só front).

## Limitações e próximos passos

- [ ] A tela de receitas ainda usa uma extração simulada; falta chamar `/api/scanner` a partir do front.
- [ ] O login é só local (usuários no `localStorage`) — serve para demonstração, não para dados reais de saúde.
- [ ] Em `parser.js`, "de 6 em 6h" e "4x ao dia" caem em "Uso contínuo" em vez de uma frequência própria.
- [ ] Testes para o parser de receitas.
