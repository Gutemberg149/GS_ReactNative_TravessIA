import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { CHAVE_TOKEN_STORAGE, CHAVE_USUARIO_STORAGE } from '../servicos/clienteApi';
import { autenticarUsuarioApi, cadastrarUsuarioApi } from '../servicos/servicoAutenticacao';
import { DadosCadastroUsuario, Usuario } from '../tipos/modelos';

interface DadosContextoAutenticacao {
  usuarioLogado: Usuario | null;
  token: string | null;
  carregandoSessao: boolean;
  ehAdmin: boolean;
  realizarLogin: (nome: string) => Promise<void>;
  realizarCadastro: (dados: DadosCadastroUsuario) => Promise<void>;
  atualizarSessaoUsuario: (usuarioAtualizado: Usuario) => Promise<void>;
  realizarLogout: () => Promise<void>;
}

const ContextoAutenticacao = createContext<DadosContextoAutenticacao>(
  {} as DadosContextoAutenticacao
);

export const ProvedorAutenticacao: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [carregandoSessao, setCarregandoSessao] = useState<boolean>(true);

  useEffect(() => {
    async function restaurarSessaoSalva() {
      try {
        const [tokenSalvo, usuarioSalvoJson] = await Promise.all([
          AsyncStorage.getItem(CHAVE_TOKEN_STORAGE),
          AsyncStorage.getItem(CHAVE_USUARIO_STORAGE),
        ]);

        if (tokenSalvo && usuarioSalvoJson) {
          const usuarioConvertido: Usuario = JSON.parse(usuarioSalvoJson);
          setToken(tokenSalvo);
          setUsuarioLogado(usuarioConvertido);
        }
      } catch {
        await AsyncStorage.multiRemove([CHAVE_TOKEN_STORAGE, CHAVE_USUARIO_STORAGE]);
      } finally {
        setCarregandoSessao(false);
      }
    }

    restaurarSessaoSalva();
  }, []);

  async function salvarSessao(novoUsuario: Usuario, novoToken: string) {
    await AsyncStorage.setItem(CHAVE_TOKEN_STORAGE, novoToken);
    await AsyncStorage.setItem(CHAVE_USUARIO_STORAGE, JSON.stringify(novoUsuario));
    setToken(novoToken);
    setUsuarioLogado(novoUsuario);
  }

  async function realizarLogin(nome: string) {
    const resposta = await autenticarUsuarioApi({ nome });
    await salvarSessao(resposta.usuario, resposta.token);
  }

  async function realizarCadastro(dados: DadosCadastroUsuario) {
    const resposta = await cadastrarUsuarioApi(dados);
    await salvarSessao(resposta.usuario, resposta.token);
  }

  async function atualizarSessaoUsuario(usuarioAtualizado: Usuario) {
    await AsyncStorage.setItem(CHAVE_USUARIO_STORAGE, JSON.stringify(usuarioAtualizado));
    setUsuarioLogado(usuarioAtualizado);
  }

  async function realizarLogout() {
    await AsyncStorage.multiRemove([CHAVE_TOKEN_STORAGE, CHAVE_USUARIO_STORAGE]);
    setToken(null);
    setUsuarioLogado(null);
  }

  const ehAdmin = usuarioLogado?.papel === 'ADMIN';

  return (
    <ContextoAutenticacao.Provider
      value={{
        usuarioLogado,
        token,
        carregandoSessao,
        ehAdmin,
        realizarLogin,
        realizarCadastro,
        atualizarSessaoUsuario,
        realizarLogout,
      }}
    >
      {children}
    </ContextoAutenticacao.Provider>
  );
};

export function usarAutenticacao(): DadosContextoAutenticacao {
  return useContext(ContextoAutenticacao);
}
