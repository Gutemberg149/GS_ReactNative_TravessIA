import {
  DadosCadastroUsuario,
  RespostaPaginada,
  Usuario,
} from '../tipos/modelos';
import { clienteApi } from './clienteApi';

export async function listarUsuariosApi(
  pagina = 0,
  tamanho = 20
): Promise<RespostaPaginada<Usuario>> {
  const resposta = await clienteApi.get<RespostaPaginada<Usuario>>(
    `/usuarios?page=${pagina}&size=${tamanho}`
  );
  return resposta.data;
}

export async function obterUsuarioPorIdApi(id: number): Promise<Usuario> {
  const resposta = await clienteApi.get<Usuario>(`/usuarios/${id}`);
  return resposta.data;
}

export async function atualizarUsuarioApi(
  id: number,
  dados: DadosCadastroUsuario
): Promise<Usuario> {
  const resposta = await clienteApi.put<Usuario>(`/usuarios/${id}`, dados);
  return resposta.data;
}

export async function removerUsuarioApi(id: number): Promise<void> {
  await clienteApi.delete(`/usuarios/${id}`);
}
