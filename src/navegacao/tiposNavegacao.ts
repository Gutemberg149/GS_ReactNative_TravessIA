import { Semaforo } from '../tipos/modelos';

export type ParametrosPilhaAutenticacao = {
  TelaLogin: undefined;
  TelaCadastro: undefined;
};

export type ParametrosAbasPrincipais = {
  AbaSemaforos: undefined;
  AbaTravessia: { semaforoInicial?: Semaforo } | undefined;
  AbaHistorico: undefined;
  AbaPerfil: undefined;
};

export type ParametrosPilhaPrincipal = {
  AbasPrincipais: undefined;
  TelaFormularioSemaforo: { semaforoParaEditar?: Semaforo } | undefined;
};
