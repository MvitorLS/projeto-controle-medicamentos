// ===== 1. GERENCIADOR DE TEMAS DINÂMICOS =====

function aplicarTema(tema) {
    if (!tema) tema = 'light';
    document.documentElement.setAttribute('data-theme', tema);
    localStorage.setItem('appTheme', tema);

    // Atualiza opções ativas no menu
    const opcoes = document.querySelectorAll('.theme-option');
    opcoes.forEach(op => {
        if (op.getAttribute('data-theme-val') === tema) {
            op.classList.add('active');
        } else {
            op.classList.remove('active');
        }
    });

    // Atualiza ícone do botão
    const iconEl = document.getElementById('themeIconCurrent');
    if (iconEl) {
        const iconesTema = {
            light: 'sun',
            dark: 'moon',
            midnight: 'sparkles',
            wellness: 'leaf'
        };
        iconEl.setAttribute('data-lucide', iconesTema[tema] || 'palette');
        if (window.lucide) lucide.createIcons();
    }

    // Se houver gráficos na tela, atualiza cores dos eixos
    if (typeof reloadCharts === 'function') {
        setTimeout(reloadCharts, 50);
    }
}

function alternarMenuTema() {
    const dropdown = document.getElementById('themeDropdownMenu');
    if (dropdown) {
        dropdown.classList.toggle('open');
    }
}

// Fecha o menu de tema ao clicar fora
document.addEventListener('click', function (e) {
    const container = document.getElementById('themeContainer');
    const dropdown = document.getElementById('themeDropdownMenu');
    if (container && dropdown && !container.contains(e.target)) {
        dropdown.classList.remove('open');
    }
});

function restaurarTema() {
    const temaSalvo = localStorage.getItem('appTheme') || 'light';
    aplicarTema(temaSalvo);
}

// Aplicação instantânea ao carregar
restaurarTema();


// ===== 2. SALVAR E BUSCAR DADOS NO NAVEGADOR =====

function salvarDados(chave, valor) {
    localStorage.setItem(chave, JSON.stringify(valor));
}

function buscarDados(chave, valorPadrao) {
    let dados = localStorage.getItem(chave);
    if (dados === null) {
        return valorPadrao !== undefined ? valorPadrao : [];
    }
    try {
        return JSON.parse(dados);
    } catch (e) {
        return valorPadrao !== undefined ? valorPadrao : [];
    }
}


// ===== 3. MENSAGEM TEMPORÁRIA (TOAST COM ANIMAÇÃO) =====

function mostrarMensagem(texto, tipo = 'success') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    let mensagem = document.createElement('div');
    mensagem.className = 'toast ' + tipo;

    let icones = {
        success: '<i data-lucide="check-circle-2" class="w-5 h-5 text-emerald-500"></i>',
        error: '<i data-lucide="alert-circle" class="w-5 h-5 text-rose-500"></i>',
        warning: '<i data-lucide="alert-triangle" class="w-5 h-5 text-amber-500"></i>'
    };

    mensagem.innerHTML = `
        <div class="flex items-center gap-3 w-full">
            <span>${icones[tipo] || '<i data-lucide="info" class="w-5 h-5 text-sky-500"></i>'}</span>
            <span class="flex-1 text-sm font-semibold">${texto}</span>
            <button onclick="this.closest('.toast').remove()" class="text-slate-400 hover:text-slate-700 p-1 text-xs">✕</button>
        </div>
    `;

    container.appendChild(mensagem);
    if (window.lucide) lucide.createIcons();

    if (window.gsap) {
        gsap.from(mensagem, {
            y: 20,
            opacity: 0,
            duration: 0.35,
            ease: 'back.out(1.5)'
        });
    }

    setTimeout(function () {
        if (window.gsap) {
            gsap.to(mensagem, {
                opacity: 0,
                y: 15,
                duration: 0.25,
                ease: 'power2.in',
                onComplete: () => mensagem.remove()
            });
        } else {
            mensagem.remove();
        }
    }, 3800);
}


// ===== 4. MODAL =====

function abrirModal(id) {
    let modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('open');
        const modalBox = modal.querySelector('.modal');
        if (modalBox && window.gsap) {
            gsap.fromTo(modalBox,
                { scale: 0.94, y: 20, opacity: 0 },
                { scale: 1, y: 0, opacity: 1, duration: 0.3, ease: 'back.out(1.4)' }
            );
        }
    }
}

function fecharModal(id) {
    let modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('open');
    }
}

document.addEventListener('click', function (evento) {
    if (evento.target.classList.contains('modal-overlay')) {
        evento.target.classList.remove('open');
    }
});


// ===== 5. ABAS =====

function iniciarAbas() {
    let botoes = document.querySelectorAll('.tab-btn');

    botoes.forEach(function (botao) {
        botao.addEventListener('click', function () {
            let grupo = botao.closest('[data-tabs]');
            if (!grupo) return;
            let alvo = botao.dataset.tab;

            grupo.querySelectorAll('.tab-btn').forEach(function (b) {
                b.classList.remove('active');
            });

            grupo.querySelectorAll('.tab-content').forEach(function (c) {
                c.classList.remove('active');
            });

            botao.classList.add('active');

            let conteudo = grupo.querySelector('#' + alvo);
            if (conteudo) {
                conteudo.classList.add('active');
            }
        });
    });
}


// ===== 6. DATA E HORA =====

function dataDeHoje() {
    let data = new Date();
    return data.toISOString().split('T')[0];
}

function formatarData(data) {
    if (!data) return '-';
    let partes = data.split('-');
    if (partes.length < 3) return data;
    return partes[2] + '/' + partes[1] + '/' + partes[0];
}

function formatarDataHora(data) {
    if (!data) return '-';
    let d = new Date(data);
    if (isNaN(d.getTime())) return data;
    return d.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}


// ===== 7. FREQUÊNCIA DOS MEDICAMENTOS =====

function traduzirFrequencia(frequencia) {
    if (frequencia === 'daily') return 'Diário (1x)';
    if (frequencia === 'twice') return '2x ao dia';
    if (frequencia === 'three') return '3x ao dia';
    if (frequencia === 'four') return '4x ao dia';
    if (frequencia === 'weekly') return 'Semanal';
    if (frequencia === 'biweekly') return 'Quinzenal';
    if (frequencia === 'monthly') return 'Mensal';
    if (frequencia === 'sos') return 'S.O.S. (quando necessário)';
    return frequencia;
}


// ===== 8. ID ALEATÓRIO =====

function gerarId() {
    return Math.random().toString(36).slice(2, 10);
}


// ===== 9. MENU DE NAVEGAÇÃO =====

function destacarMenuAtivo() {
    let paginaAtual = location.pathname.split('/').pop() || 'index.html';

    let links = document.querySelectorAll('.nav-item');
    links.forEach(function (link) {
        let href = link.getAttribute('href');
        if (href === paginaAtual) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}


// ===== 10. DOSES DO DIA =====

function medicamentosDeHoje() {
    let remedios = buscarDados('medications', []);
    let hoje = dataDeHoje();
    let tomados = buscarDados('doses_' + hoje, {});

    let lista = [];

    for (let i = 0; i < remedios.length; i++) {
        let remedio = { ...remedios[i] };
        remedio.done = !!tomados[remedio.id];
        lista.push(remedio);
    }

    return lista;
}

function marcarDose(idRemedio) {
    let hoje = dataDeHoje();
    let chave = 'doses_' + hoje;
    let tomados = buscarDados(chave, {});

    tomados[idRemedio] = !tomados[idRemedio];
    salvarDados(chave, tomados);

    return tomados[idRemedio];
}


// ===== 11. SESSÃO / LOGIN =====

function sairDaConta() {
    sessionStorage.removeItem('usuarioLogado');
    window.location.href = 'login.html';
}

function pegarUsuarioLogado() {
    let dados = sessionStorage.getItem('usuarioLogado');
    if (!dados) return null;
    return JSON.parse(dados);
}


// ===== 12. SIDEBAR TOGGLE =====

function alternarSidebar() {
    document.body.classList.toggle('sidebar-fechada');

    let estado = document.body.classList.contains('sidebar-fechada') ? 'fechada' : 'aberta';
    localStorage.setItem('sidebar', estado);
}

function restaurarEstadoSidebar() {
    let estadoSalvo = localStorage.getItem('sidebar');
    if (estadoSalvo === 'fechada') {
        document.body.classList.add('sidebar-fechada');
    }
}


// ===== 13. INICIALIZAÇÃO NO DOM =====

document.addEventListener('DOMContentLoaded', function () {
    restaurarTema();
    iniciarAbas();
    destacarMenuAtivo();
    restaurarEstadoSidebar();

    if (window.lucide) {
        lucide.createIcons();
    }

    const user = pegarUsuarioLogado();
    const nameEl = document.getElementById('sidebarName');
    if (nameEl) {
        nameEl.textContent = user?.nome || localStorage.getItem('userName') || 'Usuário';
    }
    const avatarEl = document.getElementById('userAvatar');
    if (avatarEl && (user?.nome || localStorage.getItem('userName'))) {
        const n = user?.nome || localStorage.getItem('userName');
        avatarEl.textContent = n.charAt(0).toUpperCase();
    }
});
