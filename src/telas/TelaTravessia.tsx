import { useFocusEffect, useRoute } from '@react-navigation/native';
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BotaoPersonalizado } from '../componentes/BotaoPersonalizado';
import { CabecalhoApp } from '../componentes/CabecalhoApp';
import { MensagemFeedback } from '../componentes/MensagemFeedback';
import { usarAutenticacao } from '../contextos/ContextoAutenticacao';
import { estilosGlobais } from '../estilos/estilosGlobais';
import { bordas, cores, espacamentos, fontes } from '../estilos/tema';
import { extrairMensagemErro } from '../servicos/clienteApi';
import {
  listarSemaforosApi,
  verificarProximidadeSemaforoApi,
} from '../servicos/servicoSemaforo';
import { criarSolicitacaoTravessiaApi } from '../servicos/servicoSolicitacao';
import {
  RespostaProximidade,
  Semaforo,
  SolicitacaoTravessia,
} from '../tipos/modelos';

const TEMPO_BASE_SEMAFORO_SEGUNDOS = 15;

export const TelaTravessia: React.FC = () => {
  const rota = useRoute<any>();
  const { usuarioLogado } = usarAutenticacao();

  const [semaforosDisponiveis, setSemaforosDisponiveis] = useState<Semaforo[]>([]);
  const [semaforoSelecionado, setSemaforoSelecionado] = useState<Semaforo | null>(null);
  const [latitudeUsuario, setLatitudeUsuario] = useState<number>(-23.55875);
  const [longitudeUsuario, setLongitudeUsuario] = useState<number>(-46.6602);
  const [dadosProximidade, setDadosProximidade] = useState<RespostaProximidade | null>(null);
  const [ultimaSolicitacao, setUltimaSolicitacao] = useState<SolicitacaoTravessia | null>(null);

  const [carregandoProximidade, setCarregandoProximidade] = useState<boolean>(false);
  const [enviandoSolicitacao, setEnviandoSolicitacao] = useState<boolean>(false);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  const carregarListaInicial = useCallback(async () => {
    try {
      const pagina = await listarSemaforosApi(0, 50);
      const lista = pagina.content || [];
      setSemaforosDisponiveis(lista);

      const recebidoPorRota: Semaforo | undefined = rota.params?.semaforoInicial;
      if (recebidoPorRota) {
        setSemaforoSelecionado(recebidoPorRota);
        setLatitudeUsuario( Number((recebidoPorRota.latitude - 0.00004).toFixed(5)) );
        setLongitudeUsuario(recebidoPorRota.longitude);
      } else if (lista.length > 0 && !semaforoSelecionado) {
        const primeiro = lista[0];
        setSemaforoSelecionado(primeiro);
        setLatitudeUsuario(Number((primeiro.latitude - 0.00004).toFixed(5)));
        setLongitudeUsuario(primeiro.longitude);
      }
    } catch (erro) {
      setMensagemErro(extrairMensagemErro(erro));
    }
  }, [rota.params?.semaforoInicial]);

  useFocusEffect(
    useCallback(() => {
      carregarListaInicial();
    }, [carregarListaInicial])
  );

  const checarProximidadeNaApi = useCallback(
    async (semaforo: Semaforo, lat: number, lon: number) => {
      try {
        setCarregandoProximidade(true);
        setMensagemErro(null);
        const resposta = await verificarProximidadeSemaforoApi(semaforo.id, lat, lon);
        setDadosProximidade(resposta);
      } catch (erro) {
        setMensagemErro(extrairMensagemErro(erro));
      } finally {
        setCarregandoProximidade(false);
      }
    },
    []
  );

  useEffect(() => {
    if (semaforoSelecionado) {
      checarProximidadeNaApi(semaforoSelecionado, latitudeUsuario, longitudeUsuario);
    }
  }, [semaforoSelecionado, latitudeUsuario, longitudeUsuario, checarProximidadeNaApi]);

  function simularPosicaoPerto() {
    if (!semaforoSelecionado) return;
    setUltimaSolicitacao(null);
    setMensagemSucesso(null);
    const latPerto = Number((semaforoSelecionado.latitude - 0.00004).toFixed(5));
    setLatitudeUsuario(latPerto);
    setLongitudeUsuario(semaforoSelecionado.longitude);
  }

  function simularPosicaoLonge() {
    if (!semaforoSelecionado) return;
    setUltimaSolicitacao(null);
    setMensagemSucesso(null);
    const latLonge = Number((semaforoSelecionado.latitude - 0.0053).toFixed(5));
    setLatitudeUsuario(latLonge);
    setLongitudeUsuario(semaforoSelecionado.longitude);
  }

  async function obterGpsRealDoAparelho() {
    try {
      setMensagemErro(null);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setMensagemErro('Permissão de localização GPS negada no simulador.');
        return;
      }
      const posicao = await Location.getCurrentPositionAsync({});
      setLatitudeUsuario(Number(posicao.coords.latitude.toFixed(5)));
      setLongitudeUsuario(Number(posicao.coords.longitude.toFixed(5)));
    } catch {
      setMensagemErro(
        'Não foi possível ler o GPS do simulador. Use os botões de simulação rápida abaixo.'
      );
    }
  }

  async function manipularSolicitacaoTravessia() {
    if (!semaforoSelecionado || !usuarioLogado) return;

    try {
      setEnviandoSolicitacao(true);
      setMensagemErro(null);
      setMensagemSucesso(null);

      const resposta = await criarSolicitacaoTravessiaApi({
        usuarioId: usuarioLogado.id,
        semaforoId: semaforoSelecionado.id,
        latitudeUsuario,
        longitudeUsuario,
      });

      setUltimaSolicitacao(resposta);
      const segundosCalculados =
        resposta.segundosExtras ?? resposta.tempoAdicionalCalculado ?? 5;
      const tempoTotalAberto = TEMPO_BASE_SEMAFORO_SEGUNDOS + segundosCalculados;
      const climaAtual =
        resposta.condicaoClimatica ?? resposta.condicaoClima ?? 'Consultado';

      setMensagemSucesso(
        `Travessia autorizada! Clima: ${climaAtual} • Quando o semáforo abrir, você terá ${tempoTotalAberto} segundos no total (${TEMPO_BASE_SEMAFORO_SEGUNDOS}s padrão + ${segundosCalculados}s extras).`
      );
    } catch (erro) {
      setMensagemErro(extrairMensagemErro(erro));
    } finally {
      setEnviandoSolicitacao(false);
    }
  }

  const botaoLiberado = dadosProximidade?.botaoDesbloqueado === true;
  const segundosExtrasUltimaSolicitacao =
    ultimaSolicitacao?.segundosExtras ?? ultimaSolicitacao?.tempoAdicionalCalculado ?? 5;
  const tempoTotalUltimaSolicitacao =
    TEMPO_BASE_SEMAFORO_SEGUNDOS + segundosExtrasUltimaSolicitacao;

  return (
    <SafeAreaView style={estilosGlobais.areaSegura}>
      <CabecalhoApp
        titulo="Botão de Travessia"
        subtitulo="Validação GPS (<= 10m) + Clima + Spring AI"
      />

      <ScrollView
        style={estilosGlobais.container}
        contentContainerStyle={{ paddingBottom: espacamentos.xl }}
      >
        <View style={estilosGlobais.cartao}>
          <Text style={estilosGlobais.tituloSecao}>1. Escolha o Semáforo</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={estilos.linhaSemaforos}>
              {semaforosDisponiveis.map((sem) => {
                const selecionado = semaforoSelecionado?.id === sem.id;
                return (
                  <TouchableOpacity
                    key={sem.id}
                    style={[
                      estilos.chipSemaforo,
                      selecionado && estilos.chipSemaforoAtivo,
                    ]}
                    onPress={() => {
                      setSemaforoSelecionado(sem);
                      setUltimaSolicitacao(null);
                      setLatitudeUsuario(Number((sem.latitude - 0.00004).toFixed(5)));
                      setLongitudeUsuario(sem.longitude);
                    }}
                  >
                    <Text
                      style={[
                        estilos.textoChipSemaforo,
                        selecionado && estilos.textoChipSemaforoAtivo,
                      ]}
                    >
                      #{sem.id} {sem.descricao}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {semaforoSelecionado ? (
          <View style={estilosGlobais.cartao}>
            <Text style={estilosGlobais.tituloSecao}>2. Simulador de Proximidade GPS</Text>
            <Text style={estilosGlobais.subtituloSecao}>
              O botão só é liberado quando você está a 10 metros ou menos do semáforo ativo.
            </Text>

            <View style={estilos.linhaBotoesSimulacao}>
              <TouchableOpacity
                style={[estilos.botaoSimulacao, estilos.botaoPerto]}
                onPress={simularPosicaoPerto}
              >
                <Text style={estilos.textoBotaoSimulacao}>Simular Perto (~5m)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[estilos.botaoSimulacao, estilos.botaoLonge]}
                onPress={simularPosicaoLonge}
              >
                <Text style={estilos.textoBotaoSimulacao}>Simular Longe (~589m)</Text>
              </TouchableOpacity>
            </View>

            <BotaoPersonalizado
              titulo="Usar Localização GPS do Simulador iOS"
              variante="contorno"
              aoPressionar={obterGpsRealDoAparelho}
            />

            <View style={estilos.painelDistancia}>
              {carregandoProximidade ? (
                <ActivityIndicator color={cores.primaria} />
              ) : (
                <>
                  <Text style={estilos.rotuloDistancia}>
                    Distância calculada até "{semaforoSelecionado.descricao}":
                  </Text>
                  <Text
                    style={[
                      estilos.valorDistancia,
                      { color: botaoLiberado ? cores.secundaria : cores.perigo },
                    ]}
                  >
                    {dadosProximidade?.distanciaMetros ?? '--'} metros
                  </Text>
                  <Text style={estilos.statusBotaoTexto}>
                    Status:{' '}
                    {botaoLiberado
                      ? 'DENTRO DO RAIO (<= 10m) — BOTÃO DESBLOQUEADO'
                      : 'FORA DO RAIO (> 10m ou Inativo) — BOTÃO BLOQUEADO'}
                  </Text>
                </>
              )}
            </View>
          </View>
        ) : null}

        <MensagemFeedback mensagem={mensagemErro} tipo="erro" />
        <MensagemFeedback mensagem={mensagemSucesso} tipo="sucesso" />

        {ultimaSolicitacao ? (
          <View style={[estilosGlobais.cartao, estilos.cartaoResultadoIa]}>
            <Text style={estilos.tituloResultadoIa}>TEMPO TOTAL COM SEMÁFORO ABERTO</Text>
            <Text style={estilos.cronometroValor}>{tempoTotalUltimaSolicitacao}s</Text>
            <Text style={estilos.detalheClima}>
              Quando o semáforo abrir, você terá {tempoTotalUltimaSolicitacao} segundos para
              atravessar ({TEMPO_BASE_SEMAFORO_SEGUNDOS}s padrão + {segundosExtrasUltimaSolicitacao}
              s extras).
            </Text>
            <Text style={estilos.detalheClima}>
              Clima em tempo real:{' '}
              {ultimaSolicitacao.condicaoClimatica ?? ultimaSolicitacao.condicaoClima}
            </Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[
            estilos.botaoGiganteTravessia,
            !botaoLiberado && estilos.botaoGiganteBloqueado,
          ]}
          disabled={!botaoLiberado || enviandoSolicitacao}
          onPress={manipularSolicitacaoTravessia}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Solicitar Tempo Extra de Travessia"
        >
          {enviandoSolicitacao ? (
            <ActivityIndicator size="large" color={cores.textoClaro} />
          ) : (
            <>
              <Text style={estilos.tituloBotaoGigante}>
                {botaoLiberado
                  ? 'SOLICITAR TRAVESSIA AGORA'
                  : 'APROXIME-SE DO SEMÁFORO (MÁX. 10m)'}
              </Text>
              <Text style={estilos.subtituloBotaoGigante}>
                {botaoLiberado
                  ? 'Toque para acionar Clima + Spring AI (+5s seco / +10s chuva)'
                  : 'Botão travado por segurança porque você está longe do semáforo'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const estilos = StyleSheet.create({
  linhaSemaforos: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  chipSemaforo: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: bordas.raioMedio,
    borderWidth: 1.5,
    borderColor: cores.borda,
    backgroundColor: cores.fundo,
  },
  chipSemaforoAtivo: {
    borderColor: cores.primaria,
    backgroundColor: cores.primaria,
  },
  textoChipSemaforo: {
    fontSize: fontes.tamanhos.pequeno,
    fontWeight: '700',
    color: cores.textoPrincipal,
  },
  textoChipSemaforoAtivo: {
    color: cores.textoClaro,
  },
  linhaBotoesSimulacao: {
    flexDirection: 'row',
    gap: espacamentos.sm,
    marginBottom: espacamentos.xs,
  },
  botaoSimulacao: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: bordas.raioMedio,
    alignItems: 'center',
  },
  botaoPerto: {
    backgroundColor: cores.secundaria,
  },
  botaoLonge: {
    backgroundColor: cores.destaque,
  },
  textoBotaoSimulacao: {
    color: cores.textoClaro,
    fontWeight: '800',
    fontSize: fontes.tamanhos.pequeno,
  },
  painelDistancia: {
    marginTop: espacamentos.sm,
    padding: espacamentos.md,
    borderRadius: bordas.raioMedio,
    backgroundColor: cores.fundo,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: cores.borda,
  },
  rotuloDistancia: {
    fontSize: fontes.tamanhos.pequeno,
    color: cores.textoSecundario,
    textAlign: 'center',
  },
  valorDistancia: {
    fontSize: 30,
    fontWeight: '900',
    marginVertical: 4,
  },
  statusBotaoTexto: {
    fontSize: 12,
    fontWeight: '800',
    color: cores.textoPrincipal,
    textAlign: 'center',
  },
  cartaoResultadoIa: {
    backgroundColor: cores.secundariaClara,
    borderColor: cores.secundaria,
    alignItems: 'center',
  },
  tituloResultadoIa: {
    fontSize: fontes.tamanhos.pequeno,
    fontWeight: '800',
    color: cores.secundaria,
  },
  cronometroValor: {
    fontSize: fontes.tamanhos.cronometro,
    fontWeight: '900',
    color: cores.secundaria,
    marginVertical: 4,
  },
  detalheClima: {
    fontSize: fontes.tamanhos.corpo,
    fontWeight: '700',
    color: cores.textoPrincipal,
    textAlign: 'center',
    marginTop: 4,
  },
  botaoGiganteTravessia: {
    backgroundColor: cores.secundaria,
    borderRadius: bordas.raioGrande,
    paddingVertical: espacamentos.lg,
    paddingHorizontal: espacamentos.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: cores.sombra,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  botaoGiganteBloqueado: {
    backgroundColor: cores.desabilitado,
  },
  tituloBotaoGigante: {
    fontSize: fontes.tamanhos.subtitulo,
    fontWeight: '900',
    color: cores.textoClaro,
    textAlign: 'center',
  },
  subtituloBotaoGigante: {
    fontSize: fontes.tamanhos.pequeno,
    color: cores.textoClaro,
    textAlign: 'center',
    marginTop: 6,
  },
});
