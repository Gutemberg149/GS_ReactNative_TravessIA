import {
  DadosNovaSolicitacao,
  RespostaPaginada,
  SolicitacaoTravessia,
} from '../tipos/modelos';
import { clienteApi } from './clienteApi';

export async function criarSolicitacaoTravessiaApi(
  dados: DadosNovaSolicitacao
): Promise<SolicitacaoTravessia> {
  const resposta = await clienteApi.post<SolicitacaoTravessia>('/solicitacoes', dados);
  return resposta.data;
}

export async function listarSolicitacoesTravessiaApi(
  pagina = 0,
  tamanho = 20
): Promise<RespostaPaginada<SolicitacaoTravessia>> {
  const resposta = await clienteApi.get<RespostaPaginada<SolicitacaoTravessia>>(
    `/solicitacoes?page=${pagina}&size=${tamanho}`
  );
  return resposta.data;
}

export async function obterSolicitacaoPorIdApi(id: number): Promise<SolicitacaoTravessia> {
  const resposta = await clienteApi.get<SolicitacaoTravessia>(`/solicitacoes/${id}`);
  return resposta.data;
}

export async function atualizarSolicitacaoTravessiaApi(
  id: number,
  dados: DadosNovaSolicitacao
): Promise<SolicitacaoTravessia> {
  const resposta = await clienteApi.put<SolicitacaoTravessia>(`/solicitacoes/${id}`, dados);
  return resposta.data;
}

export async function removerSolicitacaoTravessiaApi(id: number): Promise<void> {
  await clienteApi.delete(`/solicitacoes/${id}`);
}
