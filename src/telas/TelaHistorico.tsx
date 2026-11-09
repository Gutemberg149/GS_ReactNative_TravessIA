import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CabecalhoApp } from '../componentes/CabecalhoApp';
import { MensagemFeedback } from '../componentes/MensagemFeedback';
import { usarAutenticacao } from '../contextos/ContextoAutenticacao';
import { estilosGlobais } from '../estilos/estilosGlobais';
import { bordas, cores, espacamentos, fontes } from '../estilos/tema';
import { extrairMensagemErro } from '../servicos/clienteApi';
import {
  listarSolicitacoesTravessiaApi,
  removerSolicitacaoTravessiaApi,
} from '../servicos/servicoSolicitacao';
import { SolicitacaoTravessia } from '../tipos/modelos';

export const TelaHistorico: React.FC = () => {
  const { ehAdmin } = usarAutenticacao();

  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoTravessia[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [atualizando, setAtualizando] = useState<boolean>(false);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  const carregarHistorico = useCallback(async (silencioso = false) => {
    try {
      if (!silencioso) setCarregando(true);
      setMensagemErro(null);
      const pagina = await listarSolicitacoesTravessiaApi(0, 50);
      setSolicitacoes(pagina.content || []);
    } catch (erro) {
      setMensagemErro(extrairMensagemErro(erro));
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarHistorico();
    }, [carregarHistorico])
  );

  function confirmarExclusaoRegistro(registro: SolicitacaoTravessia) {
    Alert.alert(
      'Remover Solicitação',
      `Deseja remover a solicitação #${registro.id} do histórico?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setMensagemErro(null);
              setMensagemSucesso(null);
              await removerSolicitacaoTravessiaApi(registro.id);
              setMensagemSucesso(`Solicitação #${registro.id} removida com sucesso!`);
              await carregarHistorico(true);
            } catch (erro) {
              setMensagemErro(extrairMensagemErro(erro));
            }
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={estilosGlobais.areaSegura}>
      <CabecalhoApp
        titulo="Histórico de Travessias"
        subtitulo="Registros salvos na tabela TB_TRAVESSIA_SOLICITACAO"
      />

      <View style={estilosGlobais.container}>
        <MensagemFeedback mensagem={mensagemErro} tipo="erro" />
        <MensagemFeedback mensagem={mensagemSucesso} tipo="sucesso" />

        {carregando ? (
          <View style={estilos.blocoCarregando}>
            <ActivityIndicator size="large" color={cores.primaria} />
            <Text style={estilos.textoCarregando}>Buscando solicitações no banco Oracle...</Text>
          </View>
        ) : (
          <FlatList
            data={solicitacoes}
            keyExtractor={(item) => String(item.id)}
            refreshControl={
              <RefreshControl
                refreshing={atualizando}
                onRefresh={() => {
                  setAtualizando(true);
                  carregarHistorico(true);
                }}
              />
            }
            contentContainerStyle={{ paddingBottom: espacamentos.xl }}
            ListEmptyComponent={
              <View style={estilosGlobais.cartao}>
                <Text style={estilosGlobais.tituloSecao}>Nenhuma travessia registrada</Text>
                <Text style={estilosGlobais.subtituloSecao}>
                  Vá até a aba "Travessia" e acione o botão inteligente para registrar o primeiro pedido.
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const segundos = item.segundosExtras ?? item.tempoAdicionalCalculado ?? 5;
              const clima = item.condicaoClimatica ?? item.condicaoClima ?? 'Não informado';
              const dataBruta = item.dataHoraSolicitacao ?? item.dataHora ?? '';
              const dataFormatada = dataBruta
                ? dataBruta.replace('T', ' ').substring(0, 19)
                : 'Agora';

              return (
                <View style={estilosGlobais.cartao}>
                  <View style={estilosGlobais.linhaEntreElementos}>
                    <Text style={estilos.codigoSolicitacao}>SOLICITAÇÃO #{item.id}</Text>
                    <View
                      style={[
                        estilosGlobais.etiqueta,
                        { backgroundColor: cores.secundariaClara },
                      ]}
                    >
                      <Text
                        style={[
                          estilosGlobais.textoEtiqueta,
                          { color: cores.secundaria },
                        ]}
                      >
                        +{segundos}s LIBERADOS PELA IA
                      </Text>
                    </View>
                  </View>

                  <Text style={estilos.nomeSemaforo}>
                    {item.semaforo?.descricao || 'Semáforo'}
                  </Text>
                  <Text style={estilos.infoLinha}>
                    Pedestre: {item.usuario?.nome} ({item.usuario?.idade} anos •{' '}
                    {item.usuario?.pcd ? 'PCD' : '60+'})
                  </Text>
                  <Text style={estilos.infoLinha}>Clima no momento: {clima}</Text>
                  <Text style={estilos.dataTexto}>Data/Hora: {dataFormatada}</Text>

                  {ehAdmin ? (
                    <TouchableOpacity
                      style={estilos.botaoExcluirItem}
                      onPress={() => confirmarExclusaoRegistro(item)}
                    >
                      <Text style={estilos.textoExcluirItem}>
                        Excluir Registro (Admin)
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const estilos = StyleSheet.create({
  blocoCarregando: {
    paddingVertical: espacamentos.xl,
    alignItems: 'center',
  },
  textoCarregando: {
    marginTop: espacamentos.sm,
    fontSize: fontes.tamanhos.corpo,
    color: cores.textoSecundario,
  },
  codigoSolicitacao: {
    fontSize: fontes.tamanhos.pequeno,
    fontWeight: '800',
    color: cores.primaria,
  },
  nomeSemaforo: {
    fontSize: fontes.tamanhos.subtitulo,
    fontWeight: '800',
    color: cores.textoPrincipal,
    marginTop: 6,
    marginBottom: 4,
  },
  infoLinha: {
    fontSize: fontes.tamanhos.pequeno,
    color: cores.textoPrincipal,
    marginTop: 2,
  },
  dataTexto: {
    fontSize: 12,
    color: cores.textoSecundario,
    marginTop: 6,
  },
  botaoExcluirItem: {
    marginTop: espacamentos.sm,
    paddingVertical: 8,
    borderRadius: bordas.raioPequeno,
    backgroundColor: cores.perigoClaro,
    borderWidth: 1,
    borderColor: cores.perigo,
    alignItems: 'center',
  },
  textoExcluirItem: {
    color: cores.perigo,
    fontSize: 12,
    fontWeight: '700',
  },
});
