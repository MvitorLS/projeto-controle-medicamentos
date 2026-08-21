/**
 * SaúdeControl — Módulo de Histórico de Doses
 * Cálculo de Taxa de Aderência Diária/Mensal, Gráficos de Barras e Acordeom Detalhado
 */

let adherenceChart = null;

function pegarMesSelecionado() {
  const input = document.getElementById('monthFilter');
  return input ? input.value : '';
}

function reloadCharts() {
  carregarHistorico();
}

function carregarHistorico() {
  const mes = pegarMesSelecionado();
  if (!mes) return;

  const remedios = buscarDados('medications', []).filter(m => m.active !== false);
  const listEl = document.getElementById('historicoList');
  if (!listEl) return;

  if (!remedios.length) {
    listEl.innerHTML = `
      <div class="empty-state">
        <div class="icon">💊</div>
        <h3>Nenhum medicamento ativo</h3>
        <p>Cadastre seus remédios para gerar o histórico de doses.</p>
      </div>`;
    return;
  }

  const [ano, mesNum] = mes.split('-').map(Number);
  const diasNoMes = new Date(ano, mesNum, 0).getDate();

  let totalDoses = 0;
  let dosesTomadas = 0;
  const aderenciaPorDia = [];
  const labels = [];
  const dadosGrafico = [];

  for (let dia = 1; dia <= diasNoMes; dia++) {
    const dataStr = `${ano}-${String(mesNum).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    const tomados = buscarDados(`doses_${dataStr}`, {});
    const tomadas = Object.keys(tomados).filter(k => tomados[k] && remedios.some(m => m.id === k)).length;
    const total = remedios.length;

    totalDoses += total;
    dosesTomadas += tomadas;
    const pct = total ? Math.round((tomadas / total) * 100) : 0;
    
    aderenciaPorDia.push({ date: dataStr, taken: tomadas, total, pct });
    labels.push(dia);
    dadosGrafico.push(pct);
  }

  const aderenciaGeral = totalDoses ? Math.round((dosesTomadas / totalDoses) * 100) : 0;
  const diasComRegistro = aderenciaPorDia.filter(d => d.taken > 0).length;
  const falhas = totalDoses - dosesTomadas;

  const statAdh = document.getElementById('statAdherencia');
  if (statAdh) statAdh.textContent = `${aderenciaGeral}%`;

  const statDias = document.getElementById('statDias');
  if (statDias) statDias.textContent = diasComRegistro;

  const statFalhas = document.getElementById('statFalhas');
  if (statFalhas) statFalhas.textContent = falhas;

  const statDoses = document.getElementById('statDosesTomadas');
  if (statDoses) statDoses.textContent = dosesTomadas;

  const tema = document.documentElement.getAttribute('data-theme');
  const isDark = tema === 'dark' || tema === 'midnight';
  const corGrade = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  const corTexto = isDark ? '#94a3b8' : '#64748b';

  // Renderização do Gráfico de Barras
  if (adherenceChart) adherenceChart.destroy();
  const canvas = document.getElementById('chartAdherencia');
  if (canvas) {
    adherenceChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Aderência (%)',
          data: dadosGrafico,
          backgroundColor: dadosGrafico.map(v => v >= 80 ? '#10b981' : v >= 50 ? '#f59e0b' : '#ef4444'),
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 800, easing: 'easeOutQuart' },
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: corGrade }, ticks: { color: corTexto } },
          y: { beginAtZero: true, max: 100, grid: { color: corGrade }, ticks: { color: corTexto } }
        }
      }
    });
  }

  // Lista em Acordeom
  const hoje = dataDeHoje();
  const linhas = aderenciaPorDia
    .filter(d => d.date <= hoje)
    .reverse()
    .map(d => {
      const tomados = buscarDados(`doses_${d.date}`, {});
      const linhasMeds = remedios.map(m => `
        <div class="flex items-center gap-3 py-2 border-b border-border-subtle last:border-none text-sm">
          <span class="text-base">${tomados[m.id] ? '✅' : '❌'}</span>
          <span class="${tomados[m.id] ? 'font-semibold' : 'text-slate-500'}">${m.name} — <span class="text-xs text-slate-400">${m.dosage}</span></span>
        </div>
      `).join('');

      const cor = d.pct >= 80 ? 'green' : d.pct >= 50 ? 'yellow' : 'red';
      return `
        <details style="margin-bottom:8px;border:1px solid var(--border);border-radius:var(--radius-sm);overflow:hidden" class="group bg-surface">
          <summary style="padding:12px 16px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;background:var(--bg-subtle);list-style:none">
            <span class="font-bold text-sm flex items-center gap-2">
              <i data-lucide="calendar" class="w-4 h-4 text-sky-600"></i> ${formatarData(d.date)}
            </span>
            <span class="badge badge-${cor}">${d.pct}% — ${d.taken}/${d.total} doses</span>
          </summary>
          <div style="padding:12px 16px">${linhasMeds}</div>
        </details>
      `;
    });

  listEl.innerHTML = linhas.length ? linhas.join('') : `
    <div class="empty-state">
      <div class="icon">📅</div>
      <h3>Nenhum registro no período</h3>
    </div>`;

  if (window.lucide) lucide.createIcons();
}

document.addEventListener('DOMContentLoaded', () => {
  const agora = new Date();
  const inputMes = document.getElementById('monthFilter');
  if (inputMes) {
    inputMes.value = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`;
  }
  carregarHistorico();
});
