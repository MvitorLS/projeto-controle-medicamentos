/**
 * SaúdeControl — Módulo de Autenticação (Login e Cadastro)
 * Criptografia básica, persistência de usuários e validação de sessão
 */

function inicializarAuth() {
  // Redireciona se já estiver autenticado
  const sessao = sessionStorage.getItem('usuarioLogado');
  if (sessao) {
    window.location.href = 'index.html';
    return;
  }

  // Animação do card de autenticação
  if (window.gsap) {
    gsap.from('.caixa-login', {
      y: 30,
      opacity: 0,
      duration: 0.7,
      ease: 'power3.out'
    });
  }

  // Form de Login
  const formLogin = document.getElementById('formLogin');
  if (formLogin) {
    formLogin.addEventListener('submit', tratarLogin);

    const inputId = document.getElementById('identificacao');
    const inputSenha = document.getElementById('senha');
    if (inputId) inputId.addEventListener('input', esconderErroAuth);
    if (inputSenha) inputSenha.addEventListener('input', esconderErroAuth);
  }

  // Form de Cadastro
  const formCadastro = document.getElementById('formCadastro');
  if (formCadastro) {
    formCadastro.addEventListener('submit', tratarCadastro);
  }
}

function tratarLogin(evento) {
  evento.preventDefault();

  const identificacao = document.getElementById('identificacao')?.value.trim();
  const senha = document.getElementById('senha')?.value;

  const usuario = buscarUsuario(identificacao, senha);

  if (usuario) {
    sessionStorage.setItem('usuarioLogado', JSON.stringify(usuario));
    window.location.href = 'index.html';
  } else {
    const erroEl = document.getElementById('msgErro');
    if (erroEl) {
      erroEl.textContent = 'Identificação ou senha incorretos. Verifique seus dados.';
      erroEl.classList.add('visivel');
    }
  }
}

function tratarCadastro(evento) {
  evento.preventDefault();

  const nome = document.getElementById('nome')?.value.trim();
  const identificacao = document.getElementById('identificacao')?.value.trim();
  const senha = document.getElementById('senha')?.value;
  const confirmarSenha = document.getElementById('confirmarSenha')?.value;

  if (senha.length < 6) {
    mostrarErroAuth('A senha deve conter no mínimo 6 caracteres.');
    return;
  }

  if (senha !== confirmarSenha) {
    mostrarErroAuth('As senhas não coincidem. Digite novamente.');
    return;
  }

  const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');

  for (let i = 0; i < usuarios.length; i++) {
    if (usuarios[i].identificacao === identificacao) {
      mostrarErroAuth('Este e-mail/CPF/telefone já está em uso.');
      return;
    }
  }

  const novoUsuario = {
    id: Math.random().toString(36).slice(2, 10),
    nome: nome,
    identificacao: identificacao,
    senha: criptografarSenha(senha)
  };

  usuarios.push(novoUsuario);
  localStorage.setItem('usuarios', JSON.stringify(usuarios));

  sessionStorage.setItem('usuarioLogado', JSON.stringify(novoUsuario));
  localStorage.setItem('userName', nome);
  window.location.href = 'index.html';
}

function mostrarErroAuth(texto) {
  const msgErro = document.getElementById('msgErro');
  if (msgErro) {
    msgErro.textContent = texto;
    msgErro.classList.add('visivel');
  }
}

function esconderErroAuth() {
  const msgErro = document.getElementById('msgErro');
  if (msgErro) {
    msgErro.classList.remove('visivel');
  }
}

function buscarUsuario(identificacao, senha) {
  const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
  const senhaCriptografada = criptografarSenha(senha);

  for (let i = 0; i < usuarios.length; i++) {
    let u = usuarios[i];
    if (u.identificacao === identificacao && u.senha === senhaCriptografada) {
      return u;
    }
  }
  return null;
}

function criptografarSenha(senha) {
  let resultado = 0;
  for (let i = 0; i < senha.length; i++) {
    let codigo = senha.charCodeAt(i);
    resultado = ((resultado << 5) - resultado) + codigo;
    resultado = resultado & resultado;
  }
  return resultado.toString(16);
}

document.addEventListener('DOMContentLoaded', inicializarAuth);
