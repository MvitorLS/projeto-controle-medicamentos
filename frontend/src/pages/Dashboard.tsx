import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, type DoseHoje, type Adesao } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [doses, setDoses] = useState<DoseHoje[]>([]);
  const [adesao, setAdesao] = useState<Adesao | null>(null);
  const [carregando, setCarregando] = useState(true);
  const { usuario, sair } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    carregar();
  }, []);

  function carregar() {
    setCarregando(true);
    Promise.all([api.dosesHoje(), api.adesao(30)])
      .then(([d, a]) => {
        setDoses(d);
        setAdesao(a);
      })
      .finally(() => setCarregando(false));
  }

  async function marcar(horarioId: number, status: 'tomado' | 'nao_tomado') {
    const hoje = new Date().toISOString().split('T')[0];
    await api.marcarDose(horarioId, hoje, status);
    carregar();
  }

  function handleSair() {
    sair();
    navigate('/');
  }

  function corBadge(status: string) {
    if (status === 'tomado') return 'bg-success';
    if (status === 'nao_tomado') return 'bg-danger';
    return 'bg-secondary';
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Olá, {usuario?.nome}</h1>
        <div>
          <Link to="/medicamentos" className="btn btn-outline-primary me-2">Meus medicamentos</Link>
          <Link to="/historico" className="btn btn-outline-secondary me-2">Histórico</Link>
          <button className="btn btn-outline-danger" onClick={handleSair}>Sair</button>
        </div>
      </div>

      {adesao && adesao.total > 0 && (
        <div className="alert alert-info d-flex justify-content-between align-items-center">
          <span>Adesão ao tratamento (últimos 30 dias)</span>
          <strong>{adesao.percentual}% ({adesao.tomados}/{adesao.total} doses)</strong>
        </div>
      )}

      <h2 className="h5 mb-3">Doses de hoje</h2>
      {carregando ? (
        <p>Carregando...</p>
      ) : doses.length === 0 ? (
        <p className="text-muted">
          Nenhum medicamento cadastrado ainda. <Link to="/medicamentos">Cadastre um</Link>.
        </p>
      ) : (
        <table className="table table-striped align-middle">
          <thead>
            <tr>
              <th>Horário</th>
              <th>Medicamento</th>
              <th>Dosagem</th>
              <th>Status</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {doses.map((d) => (
              <tr key={d.horarioId}>
                <td>{d.horario}</td>
                <td>{d.medicamento}</td>
                <td>{d.dosagem}</td>
                <td><span className={`badge ${corBadge(d.status)}`}>{d.status.replace('_', ' ')}</span></td>
                <td>
                  <button className="btn btn-sm btn-success me-1"
                    disabled={d.status === 'tomado'}
                    onClick={() => marcar(d.horarioId, 'tomado')}>
                    Tomei
                  </button>
                  <button className="btn btn-sm btn-outline-danger"
                    disabled={d.status === 'nao_tomado'}
                    onClick={() => marcar(d.horarioId, 'nao_tomado')}>
                    Não tomei
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
