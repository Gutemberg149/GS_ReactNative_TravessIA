export type PapelUsuario = 'USUARIO' | 'ADMIN';

export interface Usuario {
  id: number;
  nome: string;
  idade: number;
  pcd: boolean;
  papel: PapelUsuario;
}

export interface DadosCadastroUsuario {
  nome: string;
  idade: number;
  pcd: boolean;
  papel: PapelUsuario;
}

export interface DadosLogin {
  nome: string;
}

export interface RespostaAutenticacao {
  usuario: Usuario;
  token: string;
}

export interface Semaforo {
  id: number;
  descricao: string;
  latitude: number;
  longitude: number;
  ativo: boolean;
}

export interface DadosFormularioSemaforo {
  descricao: string;
  latitude: number;
  longitude: number;
  ativo: boolean;
}

export interface RespostaProximidade {
  semaforoId: number;
  semaforoAtivo: boolean;
  distanciaMetros: number;
  raioMaximoPermitidoMetros: number;
  botaoDesbloqueado: boolean;
}

export interface SolicitacaoTravessia {
  id: number;
  usuario: Usuario;
  semaforo: Semaforo;
  dataHoraSolicitacao?: string;
  dataHora?: string;
  segundosExtras?: number;
  tempoAdicionalCalculado?: number;
  condicaoClimatica?: string;
  condicaoClima?: string;
}

export interface DadosNovaSolicitacao {
  usuarioId: number;
  semaforoId: number;
  latitudeUsuario: number;
  longitudeUsuario: number;
}

export interface RespostaPaginada<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
