import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api, type Medicamento } from '../api';

export default function Medicamentos() {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [nome, setNome] = useState('');
  const [dosagem, setDosagem] = useState('');
  const [instrucoes, setInstrucoes] = useState('');
  const [horarios, setHorarios] = useState<string[]>(['08:00']);
  const [erro, setErro] = useState('');

  useEffect(() => {
    carregar();
  }, []);

  function carregar() {
    api.listarMedicamentos().then(setMedicamentos);
  }

  function adicionarHorario() {
    setHorarios([...horarios, '12:00']);
  }

  function atualizarHorario(i: number, valor: string) {
    const copia = [...horarios];
    copia[i] = valor;
    setHorarios(copia);
  }

  function removerHorario(i: number) {
    setHorarios(horarios.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro('');
    if (horarios.length === 0) {
      setErro('Adicione ao menos um horário');
      return;
    }
    try {
      await api.criarMedicamento(nome, dosagem, instrucoes, horarios);
      setNome('');
      setDosagem('');
      setInstrucoes('');
      setHorarios(['08:00']);
      carregar();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao cadastrar');
    }
  }

  async function inativar(id: number) {
    if (!confirm('Encerrar este tratamento?')) return;
    await api.inativarMedicamento(id);
    carregar();
  }

  async function excluir(id: number) {
    if (!confirm('Excluir este medicamento e seu histórico?')) return;
    await api.excluirMedicamento(id);
    carregar();
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Meus medicamentos</h1>
        <Link to="/dashboard" className="btn btn-outline-secondary">Voltar</Link>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <h2 className="h5 card-title">Novo medicamento</h2>
          {erro && <div className="alert alert-danger">{erro}</div>}
          <form onSubmit={handleSubmit}>
            <div className="row g-2 mb-2">
              <div className="col-md-6">
                <label className="form-label">Nome</label>
                <input className="form-control" value={nome} onChange={(e) => setNome(e.target.value)} required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Dosagem</label>
                <input className="form-control" placeholder="ex: 500mg" value={dosagem}
                  onChange={(e) => setDosagem(e.target.value)} required />
              </div>
            </div>
            <div className="mb-2">
              <label className="form-label">Instruções (opcional)</label>
              <input className="form-control" placeholder="ex: tomar após refeição" value={instrucoes}
                onChange={(e) => setInstrucoes(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label">Horários diários</label>
              {horarios.map((h, i) => (
                <div className="d-flex gap-2 mb-1" key={i}>
                  <input type="time" className="form-control" style={{ maxWidth: 150 }} value={h}
                    onChange={(e) => atualizarHorario(i, e.target.value)} required />
                  {horarios.length > 1 && (
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removerHorario(i)}>
                      Remover
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="btn btn-sm btn-outline-primary mt-1" onClick={adicionarHorario}>
                + Adicionar horário
              </button>
            </div>
            <button type="submit" className="btn btn-primary">Cadastrar medicamento</button>
          </form>
        </div>
      </div>

      <h2 className="h5">Tratamentos ativos</h2>
      {medicamentos.filter((m) => m.ativo).length === 0 ? (
        <p className="text-muted">Nenhum medicamento ativo.</p>
      ) : (
        medicamentos.filter((m) => m.ativo).map((m) => (
          <div className="card mb-2" key={m.id}>
            <div className="card-body d-flex justify-content-between align-items-start">
              <div>
                <strong>{m.nome}</strong> — {m.dosagem}
                {m.instrucoes && <div className="text-muted small">{m.instrucoes}</div>}
                <div className="mt-1">
                  {m.horarios.map((h) => (
                    <span key={h.id} className="badge bg-light text-dark border me-1">{h.horario}</span>
                  ))}
                </div>
              </div>
              <div>
                <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => inativar(m.id)}>
                  Encerrar
                </button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => excluir(m.id)}>
                  Excluir
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
