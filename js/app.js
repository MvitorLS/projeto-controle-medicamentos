/**
 * MediControl — Front-end
 * Toda persistência é feita via API REST (back-end Node.js + SQLite).
 * Não há mais localStorage.
 */

(function () {
  'use strict';

  const API = {
    meds:     '/api/medicamentos',
    medicoes: '/api/medicoes',
  };

  // Utilitário de fetch com JSON
  async function api(url, options = {}) {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Erro HTTP ${res.status}`);
    }
    return res.json();
  }

  // ===========================================================================
  // Dashboard
  // ===========================================================================
  async function initDashboard() {
    const [meds, medicoes] = await Promise.all([
      api(API.meds),
      api(API.medicoes),
    ]);

    const totalMedsEl      = document.getElementById('stat-total-meds');
    const pendingDosesEl   = document.getElementById('stat-pending-doses');
    const totalMeasuresEl  = document.getElementById('stat-total-measures');

    if (totalMedsEl)     totalMedsEl.textContent    = meds.length;
    if (pendingDosesEl)  pendingDosesEl.textContent  = meds.filter(m => !m.tomada_hoje).length;
    if (totalMeasuresEl) totalMeasuresEl.textContent = medicoes.length;

    renderTodayDoses(meds);
    renderRecentMeasures(medicoes);
  }

  function renderTodayDoses(meds) {
    const container = document.getElementById('today-doses-list');
    if (!container) return;

    if (meds.length === 0) {
      container.innerHTML = '<p class="text-muted">Nenhum medicamento cadastrado.</p>';
      return;
    }

    container.innerHTML = '';
    meds.forEach(med => {
      const div = document.createElement('div');
      div.className = 'stat-card';
      div.style.justifyContent = 'space-between';
      div.innerHTML = `
        <div>
          <div style="font-weight:800;font-size:16px;">${med.nome}
            <span class="badge ${med.tomada_hoje ? 'badge-success' : 'badge-warning'}">
              ${med.tomada_hoje ? 'Concluída' : 'Pendente'}
            </span>
          </div>
          <div class="stat-label">Dosagem: ${med.dosagem} | Horário: <strong>${med.horario}</strong> (${med.frequencia})</div>
          <div class="stat-label">Estoque restante: ${med.estoque} comprimidos</div>
        </div>
        <div>
          <button class="btn ${med.tomada_hoje ? 'btn-outline' : 'btn-success'}"
                  data-action="toggle-dose" data-id="${med.id}">
            ${med.tomada_hoje ? 'Desfazer' : '✓ Tomar Dose'}
          </button>
        </div>
      `;
      container.appendChild(div);
    });

    container.querySelectorAll('[data-action="toggle-dose"]').forEach(btn => {
      btn.addEventListener('click', async e => {
        const id = e.target.getAttribute('data-id');
        await api(`${API.meds}/${id}/dose`, { method: 'PUT' });
        initDashboard();
        renderMedsTable();
      });
    });
  }

  function renderRecentMeasures(medicoes) {
    const container = document.getElementById('recent-measures-table');
    if (!container) return;

    if (medicoes.length === 0) {
      container.innerHTML = '<tr><td colspan="4">Nenhuma medição registrada.</td></tr>';
      return;
    }

    container.innerHTML = '';
    medicoes.slice(0, 5).forEach(m => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${m.tipo}</strong></td>
        <td>${m.valor}</td>
        <td><span class="badge badge-success">${m.status}</span></td>
        <td>${m.data}</td>
      `;
      container.appendChild(tr);
    });
  }

  // ===========================================================================
  // Medicamentos
  // ===========================================================================
  async function initMedsForm() {
    await renderMedsTable();

    const form = document.getElementById('form-novo-medicamento');
    if (!form) return;

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const payload = {
        nome:      document.getElementById('med-nome').value.trim(),
        dosagem:   document.getElementById('med-dosagem').value.trim(),
        horario:   document.getElementById('med-horario').value,
        frequencia:document.getElementById('med-frequencia').value,
        estoque:   parseInt(document.getElementById('med-estoque').value) || 30,
      };
      if (!payload.nome || !payload.dosagem || !payload.horario) return;

      await api(API.meds, { method: 'POST', body: payload });
      form.reset();
      await renderMedsTable();
      initDashboard();
    });
  }

  async function renderMedsTable() {
    const tableBody = document.getElementById('table-meds-body');
    if (!tableBody) return;

    const meds = await api(API.meds);

    if (meds.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="6">Nenhum medicamento cadastrado.</td></tr>';
      return;
    }

    tableBody.innerHTML = '';
    meds.forEach(med => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${med.nome}</strong></td>
        <td>${med.dosagem}</td>
        <td>${med.horario}</td>
        <td>${med.frequencia}</td>
        <td><span class="badge ${med.estoque < 10 ? 'badge-danger' : 'badge-success'}">${med.estoque} un</span></td>
        <td>
          <button class="btn btn-danger btn-sm" data-delete-med="${med.id}">Excluir</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    tableBody.querySelectorAll('[data-delete-med]').forEach(btn => {
      btn.addEventListener('click', async e => {
        const id = e.target.getAttribute('data-delete-med');
        await api(`${API.meds}/${id}`, { method: 'DELETE' });
        await renderMedsTable();
        initDashboard();
      });
    });
  }

  // ===========================================================================
  // Medições de Saúde
  // ===========================================================================
  async function initMeasuresForm() {
    await renderMeasuresTable();

    const form = document.getElementById('form-nova-medicao');
    if (!form) return;

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const payload = {
        tipo:  document.getElementById('measure-tipo').value,
        valor: document.getElementById('measure-valor').value.trim(),
        data:  document.getElementById('measure-data').value || undefined,
      };
      if (!payload.valor) return;

      await api(API.medicoes, { method: 'POST', body: payload });
      form.reset();
      await renderMeasuresTable();
      initDashboard();
    });
  }

  async function renderMeasuresTable() {
    const tableBody = document.getElementById('table-measures-body');
    if (!tableBody) return;

    const medicoes = await api(API.medicoes);

    if (medicoes.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="5">Nenhuma medição registrada.</td></tr>';
      return;
    }

    tableBody.innerHTML = '';
    medicoes.forEach(m => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${m.tipo}</strong></td>
        <td>${m.valor}</td>
        <td><span class="badge badge-success">${m.status}</span></td>
        <td>${m.data}</td>
        <td>
          <button class="btn btn-danger btn-sm" data-delete-measure="${m.id}">Excluir</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    tableBody.querySelectorAll('[data-delete-measure]').forEach(btn => {
      btn.addEventListener('click', async e => {
        const id = e.target.getAttribute('data-delete-measure');
        await api(`${API.medicoes}/${id}`, { method: 'DELETE' });
        await renderMeasuresTable();
        initDashboard();
      });
    });
  }

  // ===========================================================================
  // Relatório — preenche tabelas com dados da API
  // ===========================================================================
  async function initRelatorio() {
    const medsBody     = document.getElementById('table-meds-body');
    const measuresBody = document.getElementById('table-measures-body');

    if (medsBody) {
      const meds = await api(API.meds);
      medsBody.innerHTML = '';
      meds.forEach(med => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${med.nome}</td>
          <td>${med.dosagem}</td>
          <td>${med.horario}</td>
          <td>${med.frequencia}</td>
          <td>${med.estoque} comprimidos</td>
        `;
        medsBody.appendChild(tr);
      });
    }

    if (measuresBody) {
      const medicoes = await api(API.medicoes);
      measuresBody.innerHTML = '';
      medicoes.forEach(m => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${m.tipo}</td>
          <td>${m.valor}</td>
          <td>${m.status}</td>
          <td>${m.data}</td>
        `;
        measuresBody.appendChild(tr);
      });
    }

    // Atualiza a data de emissão dinamicamente
    const dataEmissaoEl = document.getElementById('data-emissao');
    if (dataEmissaoEl) {
      dataEmissaoEl.textContent = new Date().toLocaleDateString('pt-BR');
    }
  }

  // ===========================================================================
  // Bootstrap — detecta a página atual e inicializa o módulo correto
  // ===========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    const page = window.location.pathname;

    if (page === '/' || page.includes('index')) {
      initDashboard();
    }

    // Medicamentos
    initMedsForm();

    // Medições
    initMeasuresForm();

    // Relatório
    if (page.includes('relatorio')) {
      initRelatorio();
    } else {
      // Fallback: tenta iniciar o relatório se os elementos estiverem presentes
      initRelatorio();
    }
  });

})();
