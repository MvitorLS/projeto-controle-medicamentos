import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const { registrar } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro('');
    try {
      await registrar(nome, email, senha);
      navigate('/dashboard');
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao cadastrar');
    }
  }

  return (
    <div className="container" style={{ maxWidth: 400, marginTop: '5rem' }}>
      <h1 className="mb-4 text-center">Criar conta</h1>
      {erro && <div className="alert alert-danger">{erro}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Nome</label>
          <input className="form-control" value={nome} onChange={(e) => setNome(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">E-mail</label>
          <input type="email" className="form-control" value={email}
            onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Senha</label>
          <input type="password" className="form-control" value={senha}
            onChange={(e) => setSenha(e.target.value)} required minLength={6} />
        </div>
        <button type="submit" className="btn btn-primary w-100">Cadastrar</button>
      </form>
      <p className="text-center mt-3">
        Já tem conta? <Link to="/">Entrar</Link>
      </p>
    </div>
  );
}
