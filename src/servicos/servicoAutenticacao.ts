import {
  DadosCadastroUsuario,
  DadosLogin,
  RespostaAutenticacao,
} from '../tipos/modelos';
import { clienteApi } from './clienteApi';

export async function autenticarUsuarioApi(dados: DadosLogin): Promise<RespostaAutenticacao> {
  const resposta = await clienteApi.post<RespostaAutenticacao>('/auth/login', {
    nome: dados.nome.trim(),
  });
  return resposta.data;
}

export async function cadastrarUsuarioApi(
  dados: DadosCadastroUsuario
): Promise<RespostaAutenticacao> {
  const resposta = await clienteApi.post<RespostaAutenticacao>('/auth/signup', {
    nome: dados.nome.trim(),
    idade: dados.idade,
    pcd: dados.pcd,
    papel: dados.papel,
  });
  return resposta.data;
}
