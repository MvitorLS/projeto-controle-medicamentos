const API_URL = 'http://localhost:3001/api';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
}

export interface RespostaLogin {
  token: string;
  usuario: Usuario;
}

export interface Horario {
  id: number;
  horario: string;
}

export interface Medicamento {
  id: number;
  nome: string;
  dosagem: string;
  instrucoes: string | null;
  ativo: boolean;
  horarios: Horario[];
}

export interface DoseHoje {
  horarioId: number;
  medicamentoId: number;
  medicamento: string;
  dosagem: string;
  horario: string;
  status: 'pendente' | 'tomado' | 'nao_tomado';
}

export interface Adesao {
  dias: number;
  total: number;
  tomados: number;
  naoTomados: number;
  percentual: number | null;
}

export interface RegistroHistorico {
  id: number;
  data: string;
  status: 'tomado' | 'nao_tomado';
  horario: string;
  medicamento: string;
}

function headers(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function tratar<T>(resp: Response): Promise<T> {
  if (!resp.ok) {
    const erro = await resp.json().catch(() => ({ erro: 'Erro na requisição' }));
    throw new Error(erro.erro || 'Erro na requisição');
  }
  if (resp.status === 204) return undefined as T;
  return resp.json();
}

export const api = {
  login: (email: string, senha: string): Promise<RespostaLogin> =>
    fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    }).then((r) => tratar(r)),

  registrar: (nome: string, email: string, senha: string): Promise<RespostaLogin> =>
    fetch(`${API_URL}/auth/registrar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha }),
    }).then((r) => tratar(r)),

  listarMedicamentos: (): Promise<Medicamento[]> =>
    fetch(`${API_URL}/medicamentos`, { headers: headers() }).then((r) => tratar(r)),

  criarMedicamento: (nome: string, dosagem: string, instrucoes: string, horarios: string[]): Promise<Medicamento> =>
    fetch(`${API_URL}/medicamentos`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ nome, dosagem, instrucoes, horarios }),
    }).then((r) => tratar(r)),

  inativarMedicamento: (id: number): Promise<void> =>
    fetch(`${API_URL}/medicamentos/${id}/inativar`, { method: 'PATCH', headers: headers() }).then((r) => tratar(r)),

  excluirMedicamento: (id: number): Promise<void> =>
    fetch(`${API_URL}/medicamentos/${id}`, { method: 'DELETE', headers: headers() }).then((r) => tratar(r)),

  dosesHoje: (): Promise<DoseHoje[]> =>
    fetch(`${API_URL}/registros/hoje`, { headers: headers() }).then((r) => tratar(r)),

  marcarDose: (horarioId: number, data: string, status: 'tomado' | 'nao_tomado'): Promise<void> =>
    fetch(`${API_URL}/registros`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ horarioId, data, status }),
    }).then((r) => tratar(r)),

  adesao: (dias = 30): Promise<Adesao> =>
    fetch(`${API_URL}/registros/adesao?dias=${dias}`, { headers: headers() }).then((r) => tratar(r)),

  historico: (dias = 14): Promise<RegistroHistorico[]> =>
    fetch(`${API_URL}/registros/historico?dias=${dias}`, { headers: headers() }).then((r) => tratar(r)),
};
