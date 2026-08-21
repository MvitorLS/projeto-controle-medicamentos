/**
 * SaúdeControl — Módulo de Métricas Vitais
 * Pressão Arterial, Glicemia, Frequência Cardíaca, Peso/IMC e Exportação CSV
 */

let charts = {};

const typeLabels = {
  pressao: 'Pressão Arterial',
  glicemia: 'Glicemia',
  frequencia_cardiaca: 'Freq. Cardíaca',
  peso: 'Peso Corporal',
};

function agoraLocal() {
  const agora = new Date();
  const off = agora.getTimezoneOffset() * 60000;
  return new Date(agora - off).toISOString().slice(0, 16);
}

function inicializarDatas() {
  ['pressaoDate', 'glicemiaDate', 'fcDate', 'pesoDate'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = agoraLocal();
  });
}

function calcularIMC() {
  const p = parseFloat(document.getElementById('pesoVal')?.value);
  const h = parseFloat(document.getElementById('alturaVal')?.value) / 100;
  const imcDisplay = document.getElementById('imcDisplay');
  const imcClass = document.getElementById('imcClass');

  if (!p || !h) {
    if (imcDisplay) imcDisplay.textContent = '--';
    if (imcClass) imcClass.textContent = '';
    return;
  }

  const imc = (p / (h * h)).toFixed(1);
  let cls = '';
  if (imc < 18.5) cls = '🟡 Abaixo do peso';
  else if (imc < 25) cls = '🟢 Normal';
  else if (imc < 30) cls = '🟠 Sobrepeso';
  else cls = '🔴 Obesidade';

  if (imcDisplay) imcDisplay.textContent = imc;
  if (imcClass) imcClass.textContent = cls;
}

function salvarMetrica(tipo) {
  const metricas = buscarDados('metrics', []);
  let registro = { id: gerarId(), type: tipo, date: '', createdAt: new Date().toISOString() };

  if (tipo === 'pressao') {
    const s = parseInt(document.getElementById('pressaoSis').value);
    const d = parseInt(document.getElementById('pressaoDia').value);
    if (!s || !d) { 
      mostrarMensagem('Preencha os valores sistólico e diastólico!', 'error'); 
      return; 
    }
    registro.sistolica = s;
    registro.diastolica = d;
    registro.date = document.getElementById('pressaoDate').value || agoraLocal();
    document.getElementById('pressaoSis').value = '';
    document.getElementById('pressaoDia').value = '';
  } else if (tipo === 'glicemia') {
    const v = parseFloat(document.getElementById('glicemiaVal').value);
    if (!v) { 
      mostrarMensagem('Informe o valor da glicemia!', 'error'); 
      return; 
    }
    registro.valor = v;
    registro.momento = document.getElementById('glicemiaMomento').value;
    registro.date = document.getElementById('glicemiaDate').value || agoraLocal();
    document.getElementById('glicemiaVal').value = '';
  } else if (tipo === 'frequencia_cardiaca') {
    const v = parseInt(document.getElementById('fcVal').value);
    if (!v) { 
      mostrarMensagem('Informe a frequência cardíaca em bpm!', 'error'); 
      return; 
    }
    registro.valor = v;
    registro.estado = document.getElementById('fcEstado').value;
    registro.date = document.getElementById('fcDate').value || agoraLocal();
    document.getElementById('fcVal').value = '';
  } else if (tipo === 'peso') {
    const p = parseFloat(document.getElementById('pesoVal').value);
    if (!p) { 
      mostrarMensagem('Informe o peso em kg!', 'error'); 
      return; 
    }
    const h = parseFloat(document.getElementById('alturaVal').value);
    registro.valor = p;
    registro.altura = h || null;
    registro.imc = h ? parseFloat((p / Math.pow(h / 100, 2)).toFixed(1)) : null;
    registro.date = document.getElementById('pesoDate').value || agoraLocal();
    document.getElementById('pesoVal').value = '';
  }

  metricas.push(registro);
  salvarDados('metrics', metricas);
  mostrarMensagem('Métrica registrada com sucesso!', 'success');
  
  atualizarUltimosValores();
  reloadCharts();
  renderizarHistoricoMetricas();
}

function atualizarUltimosValores() {
  const metricas = buscarDados('metrics', []);
  const ultimo = (tipo) => metricas.filter(m => m.type === tipo).sort((a, b) => b.date.localeCompare(a.date))[0];

  const p = ultimo('pressao');
  if (p) {
    const lastP = document.getElementById('lastPressao');
    if (lastP) lastP.innerHTML = `${p.sistolica}/${p.diastolica} <span class="text-xs font-normal text-slate-400">mmHg</span>`;
    const lastPDate = document.getElementById('lastPressaoDate');
    if (lastPDate) lastPDate.textContent = formatarDataHora(p.date);
  }
  const g = ultimo('glicemia');
  if (g) {
    const lastG = document.getElementById('lastGlicemia');
    if (lastG) lastG.innerHTML = `${g.valor} <span class="text-xs font-normal text-slate-400">mg/dL</span>`;
    const lastGDate = document.getElementById('lastGlicemiaDate');
    if (lastGDate) lastGDate.textContent = formatarDataHora(g.date);
  }
  const f = ultimo('frequencia_cardiaca');
  if (f) {
    const lastF = document.getElementById('lastFC');
    if (lastF) lastF.innerHTML = `${f.valor} <span class="text-xs font-normal text-slate-400">bpm</span>`;
    const lastFDate = document.getElementById('lastFCDate');
    if (lastFDate) lastFDate.textContent = formatarDataHora(f.date);
  }
  const w = ultimo('peso');
  if (w) {
    const lastW = document.getElementById('lastPeso');
    if (lastW) lastW.innerHTML = `${w.valor} <span class="text-xs font-normal text-slate-400">kg</span>`;
    const lastWDate = document.getElementById('lastPesoDate');
    if (lastWDate) lastWDate.textContent = formatarDataHora(w.date);
  }
}

function reloadCharts() {
  const selectPeriodo = document.getElementById('chartPeriod');
  const dias = parseInt(selectPeriodo ? selectPeriodo.value : 7);
  const limite = new Date();
  limite.setDate(limite.getDate() - dias);
  
  const metricas = buscarDados('metrics', []).filter(m => new Date(m.date) >= limite);
  const porTipo = (tipo) => metricas.filter(m => m.type === tipo).sort((a, b) => a.date.localeCompare(b.date));

  const tema = document.documentElement.getAttribute('data-theme');
  const isDark = tema === 'dark' || tema === 'midnight';
  const corGrade = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  const corTexto = isDark ? '#94a3b8' : '#64748b';

  Object.values(charts).forEach(c => c.destroy());
  charts = {};

  const criarGrafico = (id, datasets, labels) => {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    charts[id] = new Chart(canvas, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 800, easing: 'easeOutQuart' },
        plugins: { legend: { labels: { color: corTexto, font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' } } } },
        scales: {
          x: { grid: { color: corGrade }, ticks: { color: corTexto } },
          y: { grid: { color: corGrade }, ticks: { color: corTexto } }
        }
      }
    });
  };

  const pData = porTipo('pressao');
  criarGrafico('chartPressao', [
    { label: 'Sistólica', data: pData.map(d => d.sistolica), borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.15)', tension: 0.35, fill: true, borderWidth: 2.5, pointBackgroundColor: '#ef4444' },
    { label: 'Diastólica', data: pData.map(d => d.diastolica), borderColor: '#0284c7', backgroundColor: 'rgba(2,132,199,0.06)', tension: 0.35, fill: true, borderWidth: 2, borderDash: [4, 4] }
  ], pData.map(d => formatarDataHora(d.date)));

  const gData = porTipo('glicemia');
  criarGrafico('chartGlicemia', [{ label: 'mg/dL', data: gData.map(d => d.valor), borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.15)', tension: 0.35, fill: true, borderWidth: 2.5, pointBackgroundColor: '#f59e0b' }],
    gData.map(d => formatarDataHora(d.date)));

  const fData = porTipo('frequencia_cardiaca');
  criarGrafico('chartFC', [{ label: 'bpm', data: fData.map(d => d.valor), borderColor: '#8b5cf6', backgroundColor: 'rgba(139,92,246,0.15)', tension: 0.35, fill: true, borderWidth: 2.5, pointBackgroundColor: '#8b5cf6' }],
    fData.map(d => formatarDataHora(d.date)));

  const wData = porTipo('peso');
  criarGrafico('chartPeso', [{ label: 'kg', data: wData.map(d => d.valor), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.15)', tension: 0.35, fill: true, borderWidth: 2.5, pointBackgroundColor: '#10b981' }],
    wData.map(d => formatarDataHora(d.date)));
}

function renderizarHistoricoMetricas() {
  const selectTipo = document.getElementById('histType');
  const tipo = selectTipo ? selectTipo.value : 'all';
  let metricas = buscarDados('metrics', []);
  if (tipo !== 'all') metricas = metricas.filter(m => m.type === tipo);
  metricas.sort((a, b) => b.date.localeCompare(a.date));

  const tbody = document.getElementById('historyBody');
  if (!tbody) return;

  if (!metricas.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:24px">Nenhum registro encontrado.</td></tr>`;
    return;
  }

  tbody.innerHTML = metricas.slice(0, 50).map(m => {
    let valor = '';
    let obs = '';
    if (m.type === 'pressao') {
      valor = `${m.sistolica}/${m.diastolica} mmHg`;
    } else if (m.type === 'glicemia') {
      valor = `${m.valor} mg/dL`;
      obs = m.momento ? { jejum: 'Jejum', pos_prandial: 'Pós-prandial', aleatoria: 'Aleatório' }[m.momento] : '';
    } else if (m.type === 'frequencia_cardiaca') {
      valor = `${m.valor} bpm`;
      obs = m.estado ? { repouso: 'Repouso', atividade: 'Após Atividade', estresse: 'Estresse' }[m.estado] : '';
    } else if (m.type === 'peso') {
      valor = `${m.valor} kg`;
      obs = m.imc ? `IMC: ${m.imc}` : '';
    }
    return `<tr>
      <td>${formatarDataHora(m.date)}</td>
      <td><span class="badge badge-blue">${typeLabels[m.type] || m.type}</span></td>
      <td><strong>${valor}</strong></td>
      <td style="color:var(--text-muted)">${obs}</td>
      <td style="text-align:right">
        <button class="btn-icon btn-sm" onclick="deletarMetrica('${m.id}')" title="Excluir">
          <i data-lucide="trash-2" class="w-4 h-4 text-rose-500"></i>
        </button>
      </td>
    </tr>`;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

function deletarMetrica(id) {
  const metricas = buscarDados('metrics', []).filter(m => m.id !== id);
  salvarDados('metrics', metricas);
  atualizarUltimosValores();
  reloadCharts();
  renderizarHistoricoMetricas();
  mostrarMensagem('Registro removido.', 'warning');
}

function exportarCSV() {
  const selectTipo = document.getElementById('histType');
  const tipo = selectTipo ? selectTipo.value : 'all';
  let metricas = buscarDados('metrics', []);
  if (tipo !== 'all') metricas = metricas.filter(m => m.type === tipo);
  metricas.sort((a, b) => b.date.localeCompare(a.date));

  const rows = [['Data', 'Tipo', 'Valor1', 'Valor2', 'Observacoes']];
  metricas.forEach(m => {
    if (m.type === 'pressao') rows.push([m.date, 'Pressao', m.sistolica, m.diastolica, '']);
    else if (m.type === 'glicemia') rows.push([m.date, 'Glicemia', m.valor, '', m.momento || '']);
    else if (m.type === 'frequencia_cardiaca') rows.push([m.date, 'FreqCardiaca', m.valor, '', m.estado || '']);
    else if (m.type === 'peso') rows.push([m.date, 'Peso', m.valor, m.imc || '', '']);
  });

  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `saude_metricas_${dataDeHoje()}.csv`;
  a.click();
}

document.addEventListener('DOMContentLoaded', () => {
  inicializarDatas();
  atualizarUltimosValores();
  reloadCharts();
  renderizarHistoricoMetricas();

  const pesoInput = document.getElementById('pesoVal');
  const alturaInput = document.getElementById('alturaVal');
  if (pesoInput) pesoInput.addEventListener('input', calcularIMC);
  if (alturaInput) alturaInput.addEventListener('input', calcularIMC);
});
