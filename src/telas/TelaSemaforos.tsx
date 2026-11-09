import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
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
import { listarSemaforosApi, removerSemaforoApi } from '../servicos/servicoSemaforo';
import { Semaforo } from '../tipos/modelos';

export const TelaSemaforos: React.FC = () => {
  const navegacao = useNavigation<any>();
  const { ehAdmin, usuarioLogado } = usarAutenticacao();

  const [listaSemaforos, setListaSemaforos] = useState<Semaforo[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [atualizando, setAtualizando] = useState<boolean>(false);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  const carregarSemaforos = useCallback(async (silencioso = false) => {
    try {
      if (!silencioso) setCarregando(true);
      setMensagemErro(null);
      const pagina = await listarSemaforosApi(0, 50);
      setListaSemaforos(pagina.content || []);
    } catch (erro) {
      setMensagemErro(extrairMensagemErro(erro));
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarSemaforos();
    }, [carregarSemaforos])
  );

  function confirmarExclusaoSemaforo(semaforo: Semaforo) {
    Alert.alert(
      'Excluir Semáforo',
      `Deseja realmente remover o semáforo "${semaforo.descricao}" (ID ${semaforo.id}) do banco Oracle?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setMensagemErro(null);
              setMensagemSucesso(null);
              await removerSemaforoApi(semaforo.id);
              setMensagemSucesso(`Semáforo "${semaforo.descricao}" removido com sucesso!`);
              await carregarSemaforos(true);
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
        titulo="TravessIA"
        subtitulo={`Olá, ${usuarioLogado?.nome || 'pedestre'} • Selecione um cruzamento`}
      />

      <View style={estilosGlobais.container}>
        <View style={estilos.bannerInformativo}>
          <Image
            source={require('../ativos/imagens/banner-travessia.png')}
            style={estilos.imagemBanner}
          />
          <View style={estilos.textosBanner}>
            <Text style={estilos.tituloBanner}>Travessia Assistida por IA</Text>
            <Text style={estilos.descricaoBanner}>
              Aproxime-se a até 10 metros do semáforo ativo para liberar +5s (tempo seco) ou +10s (chuva).
            </Text>
          </View>
        </View>

        {ehAdmin ? (
          <BotaoPersonalizado
            titulo="+ Cadastrar Novo Semáforo (Admin)"
            variante="secundario"
            aoPressionar={() =>
              navegacao.navigate('TelaFormularioSemaforo', { semaforoParaEditar: undefined })
            }
          />
        ) : null}

        <MensagemFeedback mensagem={mensagemErro} tipo="erro" />
        <MensagemFeedback mensagem={mensagemSucesso} tipo="sucesso" />

        {carregando ? (
          <View style={estilos.blocoCarregando}>
            <ActivityIndicator size="large" color={cores.primaria} />
            <Text style={estilos.textoCarregando}>Consultando semáforos na API Java...</Text>
          </View>
        ) : (
          <FlatList
            data={listaSemaforos}
            keyExtractor={(item) => String(item.id)}
            refreshControl={
              <RefreshControl
                refreshing={atualizando}
                onRefresh={() => {
                  setAtualizando(true);
                  carregarSemaforos(true);
                }}
              />
            }
            contentContainerStyle={{ paddingBottom: espacamentos.xl }}
            ListEmptyComponent={
              <View style={estilosGlobais.cartao}>
                <Text style={estilosGlobais.tituloSecao}>Nenhum semáforo cadastrado</Text>
                <Text style={estilosGlobais.subtituloSecao}>
                  {ehAdmin
                    ? 'Toque no botão acima para cadastrar o primeiro semáforo.'
                    : 'Aguarde o administrador cadastrar os semáforos da cidade.'}
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={estilosGlobais.cartao}>
                <View style={estilosGlobais.linhaEntreElementos}>
                  <Text style={estilos.idSemaforo}>SEMÁFORO #{item.id}</Text>
                  <View
                    style={[
                      estilosGlobais.etiqueta,
                      {
                        backgroundColor: item.ativo
                          ? cores.secundariaClara
                          : cores.perigoClaro,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        estilosGlobais.textoEtiqueta,
                        { color: item.ativo ? cores.secundaria : cores.perigo },
                      ]}
                    >
                      {item.ativo ? 'ATIVO' : 'INATIVO'}
                    </Text>
                  </View>
                </View>

                <Text style={estilos.descricaoSemaforo}>{item.descricao}</Text>
                <Text style={estilos.coordenadasTexto}>
                  Coordenadas GPS: Lat {item.latitude.toFixed(4)} | Lon {item.longitude.toFixed(4)}
                </Text>

                <BotaoPersonalizado
                  titulo="Abrir Painel de Travessia deste Semáforo"
                  aoPressionar={() =>
                    navegacao.navigate('AbaTravessia', { semaforoInicial: item })
                  }
                />

                {ehAdmin ? (
                  <View style={estilos.linhaBotoesAdmin}>
                    <TouchableOpacity
                      style={[estilos.botaoAcaoAdmin, estilos.botaoEditar]}
                      onPress={() =>
                        navegacao.navigate('TelaFormularioSemaforo', {
                          semaforoParaEditar: item,
                        })
                      }
                    >
                      <Text style={estilos.textoBotaoEditar}>Editar / Ativar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[estilos.botaoAcaoAdmin, estilos.botaoExcluir]}
                      onPress={() => confirmarExclusaoSemaforo(item)}
                    >
                      <Text style={estilos.textoBotaoExcluir}>Excluir</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const estilos = StyleSheet.create({
  bannerInformativo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.primariaClara,
    borderRadius: bordas.raioMedio,
    padding: espacamentos.sm,
    marginBottom: espacamentos.sm,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  imagemBanner: {
    width: 64,
    height: 64,
    borderRadius: bordas.raioPequeno,
    marginRight: espacamentos.sm,
  },
  textosBanner: {
    flex: 1,
  },
  tituloBanner: {
    fontSize: fontes.tamanhos.corpo,
    fontWeight: '800',
    color: cores.primariaEscura,
  },
  descricaoBanner: {
    fontSize: fontes.tamanhos.pequeno,
    color: cores.textoSecundario,
    marginTop: 2,
    lineHeight: 18,
  },
  blocoCarregando: {
    paddingVertical: espacamentos.xl,
    alignItems: 'center',
  },
  textoCarregando: {
    marginTop: espacamentos.sm,
    fontSize: fontes.tamanhos.corpo,
    color: cores.textoSecundario,
  },
  idSemaforo: {
    fontSize: fontes.tamanhos.pequeno,
    fontWeight: '800',
    color: cores.primaria,
  },
  descricaoSemaforo: {
    fontSize: fontes.tamanhos.subtitulo,
    fontWeight: '800',
    color: cores.textoPrincipal,
    marginTop: 6,
  },
  coordenadasTexto: {
    fontSize: fontes.tamanhos.pequeno,
    color: cores.textoSecundario,
    marginTop: 4,
    marginBottom: espacamentos.sm,
  },
  linhaBotoesAdmin: {
    flexDirection: 'row',
    gap: espacamentos.sm,
    marginTop: 6,
  },
  botaoAcaoAdmin: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: bordas.raioPequeno,
    alignItems: 'center',
    borderWidth: 1,
  },
  botaoEditar: {
    backgroundColor: cores.primariaClara,
    borderColor: cores.primaria,
  },
  botaoExcluir: {
    backgroundColor: cores.perigoClaro,
    borderColor: cores.perigo,
  },
  textoBotaoEditar: {
    color: cores.primaria,
    fontWeight: '700',
    fontSize: fontes.tamanhos.pequeno,
  },
  textoBotaoExcluir: {
    color: cores.perigo,
    fontWeight: '700',
    fontSize: fontes.tamanhos.pequeno,
  },
});
