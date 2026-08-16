import { createContext, useContext, useState, type ReactNode } from 'react';
import { api, type Usuario } from '../api';

interface AuthContextType {
  usuario: Usuario | null;
  entrar: (email: string, senha: string) => Promise<void>;
  registrar: (nome: string, email: string, senha: string) => Promise<void>;
  sair: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const raw = localStorage.getItem('usuario');
    return raw ? JSON.parse(raw) : null;
  });

  function salvar(token: string, u: Usuario) {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(u));
    setUsuario(u);
  }

  async function entrar(email: string, senha: string) {
    const resp = await api.login(email, senha);
    salvar(resp.token, resp.usuario);
  }

  async function registrar(nome: string, email: string, senha: string) {
    const resp = await api.registrar(nome, email, senha);
    salvar(resp.token, resp.usuario);
  }

  function sair() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, entrar, registrar, sair }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de AuthProvider');
  return ctx;
}
