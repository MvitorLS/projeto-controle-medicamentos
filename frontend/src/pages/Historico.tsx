import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type RegistroHistorico, type Adesao } from '../api';

export default function Historico() {
  const [registros, setRegistros] = useState<RegistroHistorico[]>([]);
  const [adesao, setAdesao] = useState<Adesao | null>(null);
  const [dias, setDias] = useState(14);

  useEffect(() => {
    api.historico(dias).then(setRegistros);
    api.adesao(dias).then(setAdesao);
  }, [dias]);

  function formatarData(iso: string) {
    return new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR');
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Histórico</h1>
        <Link to="/dashboard" className="btn btn-outline-secondary">Voltar</Link>
      </div>

      <div className="mb-3">
        <label className="form-label">Período</label>
        <select className="form-select" style={{ maxWidth: 200 }} value={dias}
          onChange={(e) => setDias(Number(e.target.value))}>
          <option value={7}>Últimos 7 dias</option>
          <option value={14}>Últimos 14 dias</option>
          <option value={30}>Últimos 30 dias</option>
        </select>
      </div>

      {adesao && (
        <div className="alert alert-info">
          Adesão no período: <strong>{adesao.percentual ?? '—'}%</strong> ({adesao.tomados} tomadas / {adesao.naoTomados} perdidas de {adesao.total} registradas)
        </div>
      )}

      {registros.length === 0 ? (
        <p className="text-muted">Nenhum registro no período selecionado.</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Data</th>
              <th>Horário</th>
              <th>Medicamento</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {registros.map((r) => (
              <tr key={r.id}>
                <td>{formatarData(r.data)}</td>
                <td>{r.horario}</td>
                <td>{r.medicamento}</td>
                <td>
                  <span className={`badge ${r.status === 'tomado' ? 'bg-success' : 'bg-danger'}`}>
                    {r.status.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
