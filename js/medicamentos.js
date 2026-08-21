/**
 * SaúdeControl — Módulo de Gestão de Medicamentos
 * Adição, Edição, Filtros, Cronogramas e Exclusão
 */

const formIcons = {
  comprimido: 'pill',
  capsula: 'sparkles',
  xarope: 'cup-soda',
  injecao: 'syringe',
  gotas: 'droplet',
  pomada: 'sparkle',
  outro: 'box'
};

const formColors = {
  comprimido: 'blue',
  capsula: 'yellow',
  xarope: 'green',
  injecao: 'red',
  gotas: 'purple',
  pomada: 'green',
  outro: 'gray'
};

let filtroAtual = 'all';
let idParaExcluir = null;

function definirFiltro(filtro, elementoBotao) {
  filtroAtual = filtro;
  document.querySelectorAll('.filter-btn').forEach(b => {
    b.classList.remove('active');
  });
  if (elementoBotao) {
    elementoBotao.classList.add('active');
  }
  renderizarMedicamentos();
}

function renderizarMedicamentos() {
  const remedios = buscarDados('medications', []);
  const searchInput = document.getElementById('searchMed');
  const busca = searchInput ? searchInput.value.toLowerCase() : '';
  const grid = document.getElementById('medsGrid');
  if (!grid) return;

  let filtrados = remedios.filter(m => {
    const matchBusca = m.name.toLowerCase().includes(busca) || (m.notes || '').toLowerCase().includes(busca);
    if (!matchBusca) return false;
    if (filtroAtual === 'all') return true;
    if (filtroAtual === 'active') return m.active !== false;
    if (filtroAtual === 'inactive') return m.active === false;
    return m.frequency === filtroAtual;
  });

  if (!filtrados.length) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="icon">💊</div>
        <h3>Nenhum medicamento encontrado</h3>
        <p>Adicione um novo medicamento usando o botão acima.</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtrados.map(m => `
    <div class="med-card">
      <div class="med-icon ${formColors[m.form] || 'blue'}">
        <i data-lucide="${formIcons[m.form] || 'pill'}" class="w-6 h-6"></i>
      </div>
      <div class="med-info">
        <div class="med-name flex items-center justify-between gap-2">
          <span>${m.name}</span>
          <span class="badge ${m.active !== false ? 'badge-green' : 'badge-gray'}" style="font-size:11px;">
            ${m.active !== false ? 'Ativo' : 'Inativo'}
          </span>
        </div>
        <div class="med-detail">${m.dosage} • ${traduzirFrequencia(m.frequency)}</div>
        ${m.notes ? `<div style="font-size:12px;color:var(--text-muted);margin-top:4px" class="flex items-center gap-1"><i data-lucide="file-text" class="w-3.5 h-3.5"></i> ${m.notes}</div>` : ''}
        <div class="med-times" style="margin-top:10px">
          ${(m.times || []).map(t => `<span class="time-pill flex items-center gap-1"><i data-lucide="clock" class="w-3 h-3"></i> ${t}</span>`).join('')}
        </div>
        ${m.start ? `<div style="font-size:12px;color:var(--text-muted);margin-top:8px" class="flex items-center gap-1"><i data-lucide="calendar" class="w-3.5 h-3.5"></i> ${formatarData(m.start)}${m.end ? ' → ' + formatarData(m.end) : ''}</div>` : ''}
      </div>
      <div class="med-actions">
        <button class="btn-icon" onclick="editarMedicamento('${m.id}')" title="Editar">
          <i data-lucide="edit-3" class="w-4 h-4 text-primary"></i>
        </button>
        <button class="btn-icon" onclick="abrirModalExclusao('${m.id}', '${m.name}')" title="Excluir">
          <i data-lucide="trash-2" class="w-4 h-4 text-rose-500"></i>
        </button>
      </div>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

function atualizarCamposHorarios() {
  const freq = document.getElementById('medFreq').value;
  const contagens = { daily: 1, twice: 2, three: 3, four: 4, weekly: 1, biweekly: 1, monthly: 1, sos: 0 };
  const qtd = contagens[freq] ?? 1;
  const container = document.getElementById('timesFields');
  if (!container) return;

  container.innerHTML = '';
  for (let i = 0; i < qtd; i++) {
    const input = document.createElement('input');
    input.type = 'time';
    input.className = 'form-control time-input';
    input.style.width = '130px';
    container.appendChild(input);
  }
}

function abrirModalAdicao() {
  document.getElementById('medId').value = '';
  document.getElementById('medName').value = '';
  document.getElementById('medDosage').value = '';
  document.getElementById('medForm').value = 'comprimido';
  document.getElementById('medFreq').value = 'daily';
  document.getElementById('medStart').value = dataDeHoje();
  document.getElementById('medEnd').value = '';
  document.getElementById('medNotes').value = '';
  document.getElementById('medActive').checked = true;
  document.getElementById('medModalTitle').innerHTML = '<i data-lucide="pill" class="w-5 h-5 text-primary"></i> Novo Medicamento';
  
  atualizarCamposHorarios();
  abrirModal('medModal');
  if (window.lucide) lucide.createIcons();
}

function editarMedicamento(id) {
  const remedios = buscarDados('medications', []);
  const m = remedios.find(x => x.id === id);
  if (!m) return;

  document.getElementById('medId').value = m.id;
  document.getElementById('medName').value = m.name;
  document.getElementById('medDosage').value = m.dosage;
  document.getElementById('medForm').value = m.form || 'comprimido';
  document.getElementById('medFreq').value = m.frequency;
  document.getElementById('medStart').value = m.start || '';
  document.getElementById('medEnd').value = m.end || '';
  document.getElementById('medNotes').value = m.notes || '';
  document.getElementById('medActive').checked = m.active !== false;
  document.getElementById('medModalTitle').innerHTML = '<i data-lucide="edit-3" class="w-5 h-5 text-primary"></i> Editar Medicamento';
  
  atualizarCamposHorarios();
  const inputs = document.querySelectorAll('.time-input');
  (m.times || []).forEach((t, i) => { if (inputs[i]) inputs[i].value = t; });
  
  abrirModal('medModal');
  if (window.lucide) lucide.createIcons();
}

function salvarMedicamento() {
  const name = document.getElementById('medName').value.trim();
  const dosage = document.getElementById('medDosage').value.trim();
  if (!name || !dosage) { 
    mostrarMensagem('Preencha o nome e a dosagem!', 'error'); 
    return; 
  }

  const times = [...document.querySelectorAll('.time-input')].map(i => i.value).filter(Boolean);
  const med = {
    id: document.getElementById('medId').value || gerarId(),
    name,
    dosage,
    form: document.getElementById('medForm').value,
    frequency: document.getElementById('medFreq').value,
    times,
    start: document.getElementById('medStart').value,
    end: document.getElementById('medEnd').value,
    notes: document.getElementById('medNotes').value.trim(),
    active: document.getElementById('medActive').checked,
    createdAt: new Date().toISOString(),
  };

  const remedios = buscarDados('medications', []);
  const idx = remedios.findIndex(x => x.id === med.id);
  if (idx >= 0) remedios[idx] = med;
  else remedios.push(med);
  
  salvarDados('medications', remedios);

  fecharModal('medModal');
  renderizarMedicamentos();
  mostrarMensagem('Medicamento salvo com sucesso!', 'success');
}

function abrirModalExclusao(id, nome) {
  idParaExcluir = id;
  const delNameEl = document.getElementById('deletemedName');
  if (delNameEl) delNameEl.textContent = nome;
  abrirModal('deleteModal');
}

function confirmarExclusao() {
  const remedios = buscarDados('medications', []).filter(m => m.id !== idParaExcluir);
  salvarDados('medications', remedios);
  fecharModal('deleteModal');
  renderizarMedicamentos();
  mostrarMensagem('Medicamento excluído do sistema.', 'warning');
  idParaExcluir = null;
}

document.addEventListener('DOMContentLoaded', () => {
  renderizarMedicamentos();
});
