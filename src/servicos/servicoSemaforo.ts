import {
  DadosFormularioSemaforo,
  RespostaPaginada,
  RespostaProximidade,
  Semaforo,
} from '../tipos/modelos';
import { clienteApi } from './clienteApi';

export async function listarSemaforosApi(
  pagina = 0,
  tamanho = 20
): Promise<RespostaPaginada<Semaforo>> {
  const resposta = await clienteApi.get<RespostaPaginada<Semaforo>>(
    `/semaforos?page=${pagina}&size=${tamanho}`
  );
  return resposta.data;
}

export async function obterSemaforoPorIdApi(id: number): Promise<Semaforo> {
  const resposta = await clienteApi.get<Semaforo>(`/semaforos/${id}`);
  return resposta.data;
}

export async function criarSemaforoApi(dados: DadosFormularioSemaforo): Promise<Semaforo> {
  const resposta = await clienteApi.post<Semaforo>('/semaforos', dados);
  return resposta.data;
}

export async function atualizarSemaforoApi(
  id: number,
  dados: DadosFormularioSemaforo
): Promise<Semaforo> {
  const resposta = await clienteApi.put<Semaforo>(`/semaforos/${id}`, dados);
  return resposta.data;
}

export async function removerSemaforoApi(id: number): Promise<void> {
  await clienteApi.delete(`/semaforos/${id}`);
}

export async function verificarProximidadeSemaforoApi(
  semaforoId: number,
  latitude: number,
  longitude: number
): Promise<RespostaProximidade> {
  const resposta = await clienteApi.get<RespostaProximidade>(
    `/semaforos/${semaforoId}/proximidade?latitude=${latitude}&longitude=${longitude}`
  );
  return resposta.data;
}
