/**
 * SaúdeControl — Módulo do Dashboard
 * Gerenciamento de cartões de estatísticas, doses de hoje e gráficos rápidos
 */

let chartPressaoInstance = null;
let chartGlicemiaInstance = null;

function carregarDashboard() {
  const agora = new Date();
  const topbarDate = document.getElementById('topbarDate');
  if (topbarDate) {
    topbarDate.textContent = agora.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  const usuario = pegarUsuarioLogado();
  const nome = usuario?.nome || localStorage.getItem('userName') || 'Usuário';
  
  const sidebarName = document.getElementById('sidebarName');
  if (sidebarName) sidebarName.textContent = nome;
  
  const userAvatar = document.getElementById('userAvatar');
  if (userAvatar) userAvatar.textContent = nome.charAt(0).toUpperCase();

  const remedios = buscarDados('medications', []);
  const remediosAtivos = remedios.filter(m => m.active !== false);
  
  const statMeds = document.getElementById('statMeds');
  if (statMeds) statMeds.textContent = remediosAtivos.length;

  const hoje = dataDeHoje();
  const tomadosHoje = buscarDados(`doses_${hoje}`, {});
  const total = remediosAtivos.length;
  const tomadas = Object.keys(tomadosHoje).filter(k => tomadosHoje[k] && remediosAtivos.some(m => m.id === k)).length;
  const pct = total ? Math.round((tomadas / total) * 100) : 0;

  const statDosesPct = document.getElementById('statDosesPct');
  if (statDosesPct) statDosesPct.textContent = `${pct}%`;

  const statDosesTrend = document.getElementById('statDosesTrend');
  if (statDosesTrend) {
    statDosesTrend.textContent = `${tomadas} de ${total} tomadas`;
    statDosesTrend.className = `trend ${pct >= 80 ? 'up' : pct > 0 ? '' : 'down'}`;
  }

  const metricas = buscarDados('metrics', []);
  const pressoes = metricas.filter(m => m.type === 'pressao').sort((a, b) => b.date.localeCompare(a.date));
  const pesos = metricas.filter(m => m.type === 'peso').sort((a, b) => b.date.localeCompare(a.date));
  const glicemias = metricas.filter(m => m.type === 'glicemia').sort((a, b) => b.date.localeCompare(a.date));

  if (pressoes.length) {
    const statPressao = document.getElementById('statPressao');
    if (statPressao) statPressao.textContent = `${pressoes[0].sistolica}/${pressoes[0].diastolica}`;
    const statPressaoLabel = document.getElementById('statPressaoLabel');
    if (statPressaoLabel) statPressaoLabel.textContent = formatarData(pressoes[0].date.split('T')[0]);
  }
  if (pesos.length) {
    const statPeso = document.getElementById('statPeso');
    if (statPeso) statPeso.textContent = `${pesos[0].valor} kg`;
    const statPesoLabel = document.getElementById('statPesoLabel');
    if (statPesoLabel) statPesoLabel.textContent = formatarData(pesos[0].date.split('T')[0]);
  }
  if (glicemias.length) {
    const statGlicemia = document.getElementById('statGlicemia');
    if (statGlicemia) statGlicemia.textContent = `${glicemias[0].valor} mg/dL`;
    const statGlicemiaLabel = document.getElementById('statGlicemiaLabel');
    if (statGlicemiaLabel) statGlicemiaLabel.textContent = formatarData(glicemias[0].date.split('T')[0]);
  }

  renderizarDosesHoje();
  renderizarReceitasRecentes();
  renderizarGraficosDashboard(metricas);

  if (window.lucide) lucide.createIcons();
}

function renderizarDosesHoje() {
  const doses = medicamentosDeHoje().filter(m => m.active !== false);
  const el = document.getElementById('todayDosesList');
  if (!el) return;

  if (!doses.length) {
    el.innerHTML = `
      <div class="empty-state">
        <div class="icon">💊</div>
        <h3>Nenhum medicamento ativo</h3>
        <p>Cadastre seus remédios para acompanhar suas doses diárias.</p>
      </div>`;
    return;
  }

  el.innerHTML = doses.map(d => `
    <div class="dose-item" id="doseItem_${d.id}">
      <div class="dose-checkbox ${d.done ? 'checked' : ''}" onclick="alternarDose('${d.id}')">
        ${d.done ? '✓' : ''}
      </div>
      <div class="dose-info">
        <div class="dose-name">${d.name}</div>
        <div class="dose-detail">${d.dosage} • ${traduzirFrequencia(d.frequency)}</div>
      </div>
      <div class="dose-time flex items-center gap-1">
        <i data-lucide="clock" class="w-3.5 h-3.5"></i> ${(d.times && d.times[0]) ? d.times[0] : '--:--'}
      </div>
    </div>
  `).join('');
}

function alternarDose(id) {
  const tomou = marcarDose(id);
  const cb = document.querySelector(`#doseItem_${id} .dose-checkbox`);
  if (cb) {
    cb.classList.toggle('checked', tomou);
    cb.textContent = tomou ? '✓' : '';
  }
  mostrarMensagem(tomou ? 'Dose confirmada com sucesso!' : 'Dose desmarcada', tomou ? 'success' : 'warning');
  carregarDashboard();
}

function renderizarReceitasRecentes() {
  const receitas = buscarDados('receitas', []).slice(0, 5);
  const el = document.getElementById('recentReceitas');
  if (!el) return;

  if (!receitas.length) {
    el.innerHTML = `
      <div class="empty-state">
        <div class="icon">📄</div>
        <h3>Nenhuma receita salva</h3>
        <p>Envie sua receita médica na aba Receitas.</p>
      </div>`;
    return;
  }

  el.innerHTML = receitas.map(r => `
    <div class="dose-item">
      <div class="dose-info">
        <div class="dose-name">${r.medico || 'Médico não informado'}</div>
        <div class="dose-detail">${(r.meds || []).length} medicamento(s) registrado(s)</div>
      </div>
      <div class="dose-time">${formatarData(r.date)}</div>
    </div>
  `).join('');
}

function renderizarGraficosDashboard(metricas) {
  const ultimos7 = (tipo) => {
    return metricas
      .filter(m => m.type === tipo)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7);
  };

  const dadosPressao = ultimos7('pressao');
  const dadosGlicemia = ultimos7('glicemia');

  const tema = document.documentElement.getAttribute('data-theme');
  const isDark = tema === 'dark' || tema === 'midnight';
  const corGrade = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  const corTexto = isDark ? '#94a3b8' : '#64748b';

  // Gráfico de Pressão
  const canvasPress = document.getElementById('chartPressao');
  if (canvasPress) {
    if (chartPressaoInstance) chartPressaoInstance.destroy();
    const ctxPress = canvasPress.getContext('2d');
    const redGrad = ctxPress.createLinearGradient(0, 0, 0, 200);
    redGrad.addColorStop(0, 'rgba(239, 68, 68, 0.18)');
    redGrad.addColorStop(1, 'rgba(239, 68, 68, 0.0)');

    chartPressaoInstance = new Chart(ctxPress, {
      type: 'line',
      data: {
        labels: dadosPressao.length ? dadosPressao.map(d => formatarData(d.date.split('T')[0])) : ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Hoje'],
        datasets: [
          {
            label: 'Sistólica',
            data: dadosPressao.length ? dadosPressao.map(d => d.sistolica) : [120, 118, 122, 119, 121, 117, 120],
            borderColor: '#ef4444',
            backgroundColor: redGrad,
            tension: 0.35,
            fill: true,
            pointRadius: 4,
            pointBackgroundColor: '#ef4444',
            borderWidth: 2.5
          },
          {
            label: 'Diastólica',
            data: dadosPressao.length ? dadosPressao.map(d => d.diastolica) : [80, 78, 82, 79, 80, 76, 80],
            borderColor: '#0284c7',
            borderDash: [4, 4],
            tension: 0.35,
            pointRadius: 3,
            borderWidth: 2
          }
        ]
      },
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
  }

  // Gráfico de Glicemia
  const canvasGlic = document.getElementById('chartGlicemia');
  if (canvasGlic) {
    if (chartGlicemiaInstance) chartGlicemiaInstance.destroy();
    const ctxGlic = canvasGlic.getContext('2d');
    const amberGrad = ctxGlic.createLinearGradient(0, 0, 0, 200);
    amberGrad.addColorStop(0, 'rgba(245, 158, 11, 0.18)');
    amberGrad.addColorStop(1, 'rgba(245, 158, 11, 0.0)');

    chartGlicemiaInstance = new Chart(ctxGlic, {
      type: 'line',
      data: {
        labels: dadosGlicemia.length ? dadosGlicemia.map(d => formatarData(d.date.split('T')[0])) : ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Hoje'],
        datasets: [{
          label: 'Glicemia (mg/dL)',
          data: dadosGlicemia.length ? dadosGlicemia.map(d => d.valor) : [95, 92, 98, 91, 94, 89, 93],
          borderColor: '#f59e0b',
          backgroundColor: amberGrad,
          tension: 0.35,
          fill: true,
          pointRadius: 4,
          pointBackgroundColor: '#f59e0b',
          borderWidth: 2.5
        }]
      },
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
  }
}

function reloadCharts() {
  const metricas = buscarDados('metrics', []);
  renderizarGraficosDashboard(metricas);
}

function carregarModalDoseRapida() {
  const remedios = buscarDados('medications', []).filter(m => m.active !== false);
  const hoje = dataDeHoje();
  const tomados = buscarDados(`doses_${hoje}`, {});
  const el = document.getElementById('quickDoseList');
  if (!el) return;

  if (!remedios.length) {
    el.innerHTML = '<p style="color:var(--text-muted);font-size:14px;">Nenhum medicamento ativo cadastrado.</p>';
    return;
  }
  el.innerHTML = remedios.map(m => `
    <div class="dose-item" id="qDose_${m.id}">
      <div class="dose-checkbox ${tomados[m.id] ? 'checked' : ''}" onclick="alternarDose('${m.id}'); carregarModalDoseRapida();">${tomados[m.id] ? '✓' : ''}</div>
      <div class="dose-info">
        <div class="dose-name">${m.name}</div>
        <div class="dose-detail">${m.dosage} • ${traduzirFrequencia(m.frequency)}</div>
      </div>
      <div class="dose-time">${(m.times && m.times[0]) ? m.times[0] : ''}</div>
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  carregarDashboard();
});
