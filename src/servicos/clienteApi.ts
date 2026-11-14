import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError } from 'axios';

export const CHAVE_TOKEN_STORAGE = '@TravessIA:token';
export const CHAVE_USUARIO_STORAGE = '@TravessIA:usuario';

export const URL_BASE_API = 'https://travessia-gateway.onrender.com/api';

export const clienteApi = axios.create({
  baseURL: URL_BASE_API,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

clienteApi.interceptors.request.use(
  async (configuracao) => {
    const rotaPublica =
      configuracao.url?.includes('/auth/login') || configuracao.url?.includes('/auth/signup');

    if (!rotaPublica) {
      const tokenSalvo = await AsyncStorage.getItem(CHAVE_TOKEN_STORAGE);
      if (tokenSalvo && configuracao.headers) {
        configuracao.headers.Authorization = `Bearer ${tokenSalvo}`;
      }
    }
    return configuracao;
  },
  (erro) => Promise.reject(erro)
);

export function extrairMensagemErro(erro: unknown): string {
  if (axios.isAxiosError(erro)) {
    const erroAxios = erro as AxiosError<Record<string, unknown>>;
    if (!erroAxios.response) {
      return 'Não foi possível conectar ao servidor (https://travessia-gateway.onrender.com). Verifique sua conexão ou aguarde o servidor no Render iniciar.';
    }

    const status = erroAxios.response.status;
    const dados = erroAxios.response.data;

    if (dados && typeof dados === 'object') {
      if (typeof dados.error === 'string') {
        try {
          const erroInterno = JSON.parse(dados.error);
          if (erroInterno && typeof erroInterno.error === 'string') {
            return erroInterno.error;
          }
        } catch {
          return dados.error;
        }
      }
      if (dados.fields && typeof dados.fields === 'object') {
        const mensagensCampos = Object.values(dados.fields as Record<string, string>).join('; ');
        if (mensagensCampos) {
          return `Campos inválidos: ${mensagensCampos}`;
        }
      }
    }

    if (status === 403) {
      return 'Acesso negado: esta ação é permitida apenas para o perfil Administrador (ADMIN).';
    }
    if (status === 401) {
      return 'Sessão expirada ou não autorizada. Faça login novamente.';
    }
    if (status === 404) {
      return 'Registro não encontrado no servidor.';
    }
    return `Erro na requisição (HTTP ${status}).`;
  }

  if (erro instanceof Error) {
    return erro.message;
  }

  return 'Ocorreu um erro inesperado ao comunicar com o servidor.';
}
