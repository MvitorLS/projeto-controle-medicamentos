/**
 * SaúdeControl — Módulo de Receitas Médicas
 * Upload, Drag & Drop, Extração Automática, Importação de Medicamentos e Armazenamento
 */

let extractedData = [];

function escaparHTML(texto = '') {
  return String(texto).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function inicializarDragAndDrop() {
  const zone = document.getElementById('uploadZone');
  if (!zone) return;

  zone.addEventListener('dragover', e => { 
    e.preventDefault(); 
    zone.classList.add('drag-over'); 
  });
  
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) processarArquivoReceita(file);
  });
}

function selecionarArquivo(input) {
  const file = input.files[0];
  if (file) processarArquivoReceita(file);
}

function processarArquivoReceita(file) {
  const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (!allowed.includes(file.type)) {
    mostrarMensagem('Formato não suportado. Envie um arquivo PDF ou imagem.', 'error');
    return;
  }

  const zone = document.getElementById('uploadZone');
  if (zone) zone.style.display = 'none';
  
  const proc = document.getElementById('processingOverlay');
  if (proc) proc.style.display = 'flex';

  if (!location.protocol.startsWith('http')) {
    resetarUpload();
    mostrarMensagem('A leitura automática precisa do servidor (npm start). Use o cadastro manual abaixo.', 'error');
    return;
  }

  enviarParaScanner(file)
    .then(meds => exibirExtracao(meds, file.name))
    .catch(err => {
      resetarUpload();
      mostrarMensagem(err.message, 'error');
    });
}

async function enviarParaScanner(file) {
  const form = new FormData();
  form.append('receita', file);

  const resp = await fetch('/api/scanner', { method: 'POST', body: form });
  const body = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(body.error || 'Falha ao processar a receita.');
  if (!body.medicamentos?.length) throw new Error('Nenhum medicamento reconhecido. Confira a imagem ou use o cadastro manual.');
  return body.medicamentos;
}

function exibirExtracao(meds, filename) {
  const proc = document.getElementById('processingOverlay');
  if (proc) proc.style.display = 'none';

  extractedData = meds.map(({ name, dosage, frequency, times, notes }) => ({ name, dosage, frequency, times, notes }));

  const dataReceita = document.getElementById('dataReceita');
  if (dataReceita) dataReceita.value = dataDeHoje();

  const summary = document.getElementById('extractedSummary');
  if (summary) summary.textContent = `${extractedData.length} medicamentos extraídos de "${filename}"`;

  renderizarExtraidos();
  
  const results = document.getElementById('extractedResults');
  if (results) results.style.display = 'block';
  
  if (window.lucide) lucide.createIcons();
}

function renderizarExtraidos() {
  const el = document.getElementById('extractedMedsList');
  if (!el) return;

  el.innerHTML = extractedData.map((m, i) => `
    <div class="extracted-med">
      <div class="med-dot"></div>
      <div style="flex:1">
        <strong>${escaparHTML(m.name)}</strong> — <span class="text-primary font-semibold">${escaparHTML(m.dosage)}</span>
        <br><small style="color:var(--text-muted)">${traduzirFrequencia(m.frequency)} • Horários: ${m.times.length ? m.times.join(', ') : 'quando necessário'}</small>
        ${m.notes ? `<br><small style="color:var(--text-muted)">📝 ${escaparHTML(m.notes)}</small>` : ''}
      </div>
      <button class="btn-icon btn-sm" onclick="removerExtraido(${i})" title="Remover">✕</button>
    </div>
  `).join('');
}

function removerExtraido(i) {
  extractedData.splice(i, 1);
  renderizarExtraidos();
  const summary = document.getElementById('extractedSummary');
  if (summary) summary.textContent = `${extractedData.length} medicamentos restantes`;
}

function salvarReceita() {
  const medicoInput = document.getElementById('medico');
  const dataInput = document.getElementById('dataReceita');
  const obsInput = document.getElementById('obsReceita');

  const receita = {
    id: gerarId(),
    medico: medicoInput ? medicoInput.value.trim() : '',
    date: (dataInput && dataInput.value) ? dataInput.value : dataDeHoje(),
    obs: obsInput ? obsInput.value.trim() : '',
    meds: extractedData,
    createdAt: new Date().toISOString(),
  };

  const receitas = buscarDados('receitas', []);
  receitas.unshift(receita);
  salvarDados('receitas', receitas);

  resetarUpload();
  renderizarReceitas();
  mostrarMensagem('Receita médica salva com sucesso!', 'success');
}

function importarMedicamentosParaCronograma() {
  const remedios = buscarDados('medications', []);
  let adicionados = 0;
  
  extractedData.forEach(m => {
    remedios.push({ 
      ...m, 
      id: gerarId(), 
      form: 'comprimido', 
      active: true, 
      start: dataDeHoje(), 
      createdAt: new Date().toISOString() 
    });
    adicionados++;
  });

  salvarDados('medications', remedios);
  mostrarMensagem(`${adicionados} medicamento(s) importado(s) para seu cronograma!`, 'success');
  salvarReceita();
}

function salvarReceitaManual() {
  const raw = document.getElementById('manualMeds')?.value.trim();
  if (!raw) { 
    mostrarMensagem('Adicione pelo menos um medicamento!', 'error'); 
    return; 
  }

  const meds = raw.split('\n').filter(Boolean).map(line => {
    const parts = line.split('-');
    return { 
      name: parts[0]?.trim() || line, 
      dosage: parts[1]?.trim() || '', 
      frequency: 'daily', 
      times: [], 
      notes: '' 
    };
  });

  const receita = {
    id: gerarId(),
    medico: document.getElementById('manualMedico')?.value.trim() || '',
    date: document.getElementById('manualData')?.value || dataDeHoje(),
    obs: document.getElementById('manualObs')?.value.trim() || '',
    meds,
    createdAt: new Date().toISOString(),
  };

  const receitas = buscarDados('receitas', []);
  receitas.unshift(receita);
  salvarDados('receitas', receitas);

  document.getElementById('manualMedico').value = '';
  document.getElementById('manualData').value = '';
  document.getElementById('manualMeds').value = '';
  document.getElementById('manualObs').value = '';

  renderizarReceitas();
  mostrarMensagem('Receita manual adicionada com sucesso!', 'success');
}

function resetarUpload() {
  const zone = document.getElementById('uploadZone');
  if (zone) zone.style.display = 'block';

  const proc = document.getElementById('processingOverlay');
  if (proc) proc.style.display = 'none';

  const results = document.getElementById('extractedResults');
  if (results) results.style.display = 'none';

  const input = document.getElementById('fileInput');
  if (input) input.value = '';

  extractedData = [];
}

function renderizarReceitas() {
  const receitas = buscarDados('receitas', []);
  const countEl = document.getElementById('receitaCount');
  if (countEl) countEl.textContent = receitas.length;

  const el = document.getElementById('receitasList');
  if (!el) return;

  if (!receitas.length) {
    el.innerHTML = `
      <div class="empty-state">
        <div class="icon">📄</div>
        <h3>Nenhuma receita salva</h3>
        <p>Envie sua primeira receita médica ao lado.</p>
      </div>`;
    return;
  }

  el.innerHTML = receitas.map(r => `
    <div class="receita-card mb-3">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center flex-shrink-0">
          <i data-lucide="file-text" class="w-5 h-5"></i>
        </div>
        <div class="flex-1">
          <div class="font-bold text-sm text-slate-800">${r.medico || 'Médico não informado'}</div>
          <div class="text-xs text-slate-500">${formatarData(r.date)} • ${(r.meds || []).length} medicamento(s)</div>
          ${r.obs ? `<div class="text-xs text-slate-400 mt-0.5">${r.obs}</div>` : ''}
        </div>
        <div class="flex items-center gap-2">
          <button class="btn-icon btn-sm" onclick="visualizarReceita('${r.id}')" title="Visualizar Detalhes">
            <i data-lucide="eye" class="w-4 h-4 text-primary"></i>
          </button>
          <button class="btn-icon btn-sm" onclick="deletarReceita('${r.id}')" title="Excluir" style="color:var(--danger)">
            <i data-lucide="trash-2" class="w-4 h-4 text-rose-500"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

function visualizarReceita(id) {
  const r = buscarDados('receitas', []).find(x => x.id === id);
  if (!r) return;

  const bodyEl = document.getElementById('viewReceitaBody');
  if (bodyEl) {
    bodyEl.innerHTML = `
      <div class="space-y-2 mb-4 text-sm">
        <p><strong>Médico Prescritor:</strong> <span>${r.medico || 'Não informado'}</span></p>
        <p><strong>Data de Emissão:</strong> <span>${formatarData(r.date)}</span></p>
        ${r.obs ? `<p><strong>Observações:</strong> <span>${r.obs}</span></p>` : ''}
      </div>
      <hr style="margin:16px 0;border-color:var(--border)" />
      <h4 class="text-sm font-bold mb-3">💊 Medicamentos Prescritos:</h4>
      ${(r.meds || []).map(m => `
        <div class="extracted-med">
          <div class="med-dot"></div>
          <div>
            <strong>${m.name}</strong> — <span class="text-primary font-semibold">${m.dosage}</span>
            <br><small class="text-slate-500">${traduzirFrequencia(m.frequency)}${m.notes ? ' • ' + m.notes : ''}</small>
          </div>
        </div>
      `).join('')}
    `;
  }

  abrirModal('viewReceitaModal');
}

function deletarReceita(id) {
  const receitas = buscarDados('receitas', []).filter(r => r.id !== id);
  salvarDados('receitas', receitas);
  renderizarReceitas();
  mostrarMensagem('Receita excluída.', 'warning');
}

document.addEventListener('DOMContentLoaded', () => {
  inicializarDragAndDrop();
  renderizarReceitas();
});
