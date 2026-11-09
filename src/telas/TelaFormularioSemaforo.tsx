import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BotaoPersonalizado } from '../componentes/BotaoPersonalizado';
import { CabecalhoApp } from '../componentes/CabecalhoApp';
import { CampoTexto } from '../componentes/CampoTexto';
import { MensagemFeedback } from '../componentes/MensagemFeedback';
import { estilosGlobais } from '../estilos/estilosGlobais';
import { bordas, cores, espacamentos, fontes } from '../estilos/tema';
import { ParametrosPilhaPrincipal } from '../navegacao/tiposNavegacao';
import { extrairMensagemErro } from '../servicos/clienteApi';
import { atualizarSemaforoApi, criarSemaforoApi } from '../servicos/servicoSemaforo';

type Propriedades = NativeStackScreenProps<
  ParametrosPilhaPrincipal,
  'TelaFormularioSemaforo'
>;

export const TelaFormularioSemaforo: React.FC<Propriedades> = ({ navigation, route }) => {
  const semaforoExistente = route.params?.semaforoParaEditar;
  const modoEdicao = Boolean(semaforoExistente);

  const [descricao, setDescricao] = useState<string>(
    semaforoExistente?.descricao || ''
  );
  const [latitudeTexto, setLatitudeTexto] = useState<string>(
    semaforoExistente ? String(semaforoExistente.latitude) : '-23.5741'
  );
  const [longitudeTexto, setLongitudeTexto] = useState<string>(
    semaforoExistente ? String(semaforoExistente.longitude) : '-46.6234'
  );
  const [ativo, setAtivo] = useState<boolean>(
    semaforoExistente ? semaforoExistente.ativo : true
  );
  const [carregando, setCarregando] = useState<boolean>(false);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  function preencherLocalSugerido(nomeLocal: string, lat: string, lon: string) {
    setDescricao(nomeLocal);
    setLatitudeTexto(lat);
    setLongitudeTexto(lon);
  }

  async function manipularSalvarSemaforo() {
    setMensagemErro(null);
    const descricaoLimpa = descricao.trim();
    const latitudeNumero = Number(latitudeTexto.replace(',', '.'));
    const longitudeNumero = Number(longitudeTexto.replace(',', '.'));

    if (!descricaoLimpa) {
      setMensagemErro('A descrição ou endereço do semáforo é obrigatória.');
      return;
    }

    if (
      Number.isNaN(latitudeNumero) ||
      Number.isNaN(longitudeNumero) ||
      latitudeNumero < -90 ||
      latitudeNumero > 90 ||
      longitudeNumero < -180 ||
      longitudeNumero > 180
    ) {
      setMensagemErro('Informe coordenadas válidas de latitude (-90 a 90) e longitude (-180 a 180).');
      return;
    }

    try {
      setCarregando(true);
      const dadosPayload = {
        descricao: descricaoLimpa,
        latitude: latitudeNumero,
        longitude: longitudeNumero,
        ativo,
      };

      if (modoEdicao && semaforoExistente) {
        await atualizarSemaforoApi(semaforoExistente.id, dadosPayload);
      } else {
        await criarSemaforoApi(dadosPayload);
      }

      navigation.goBack();
    } catch (erro) {
      setMensagemErro(extrairMensagemErro(erro));
    } finally {
      setCarregando(false);
    }
  }

  return (
    <SafeAreaView style={estilosGlobais.areaSegura}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: espacamentos.xl }}
          keyboardShouldPersistTaps="handled"
        >
          <CabecalhoApp
            titulo={modoEdicao ? `Editar Semáforo #${semaforoExistente?.id}` : 'Novo Semáforo'}
            subtitulo="Operação exclusiva para Administrador (ADMIN)"
          />

          <View style={estilosGlobais.container}>
            <View style={estilosGlobais.cartao}>
              <Text style={estilosGlobais.tituloSecao}>
                {modoEdicao ? 'Atualizar Dados do Cruzamento' : 'Cadastrar Cruzamento no Oracle'}
              </Text>

              <MensagemFeedback mensagem={mensagemErro} tipo="erro" />

              <View style={estilos.blocoSugestoes}>
                <Text style={estilos.tituloSugestoes}>Locais rápidos de São Paulo:</Text>
                <View style={estilos.linhaSugestoes}>
                  <TouchableOpacity
                    style={estilos.chipSugestao}
                    onPress={() =>
                      preencherLocalSugerido(
                        'Av. Lins de Vasconcelos - FIAP',
                        '-23.5741',
                        '-46.6234'
                      )
                    }
                  >
                    <Text style={estilos.textoChipSugestao}>FIAP Aclimação</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={estilos.chipSugestao}
                    onPress={() =>
                      preencherLocalSugerido(
                        'Av. Paulista x Rua Augusta',
                        '-23.5587',
                        '-46.6602'
                      )
                    }
                  >
                    <Text style={estilos.textoChipSugestao}>Paulista x Augusta</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <CampoTexto
                rotulo="Descrição / Endereço do Cruzamento"
                valor={descricao}
                aoMudarTexto={setDescricao}
                placeholder="Ex.: Av. Paulista x Rua da Consolação"
                autoCapitalize="sentences"
              />

              <CampoTexto
                rotulo="Latitude"
                valor={latitudeTexto}
                aoMudarTexto={setLatitudeTexto}
                placeholder="-23.5587"
                tipoTeclado="numbers-and-punctuation"
              />

              <CampoTexto
                rotulo="Longitude"
                valor={longitudeTexto}
                aoMudarTexto={setLongitudeTexto}
                placeholder="-46.6602"
                tipoTeclado="numbers-and-punctuation"
              />

              <View style={estilos.linhaSwitch}>
                <View style={{ flex: 1, paddingRight: espacamentos.sm }}>
                  <Text style={estilos.tituloSwitch}>Semáforo Ativo para Travessia</Text>
                  <Text style={estilos.descricaoSwitch}>
                    Se desativado, o botão de travessia ficará bloqueado para os usuários.
                  </Text>
                </View>
                <Switch
                  value={ativo}
                  onValueChange={setAtivo}
                  trackColor={{ false: cores.borda, true: cores.secundaria }}
                />
              </View>

              <BotaoPersonalizado
                titulo={modoEdicao ? 'Salvar Alterações (PUT)' : 'Cadastrar Semáforo (POST)'}
                variante="secundario"
                aoPressionar={manipularSalvarSemaforo}
                carregando={carregando}
              />

              <BotaoPersonalizado
                titulo="Cancelar e Voltar"
                variante="contorno"
                aoPressionar={() => navigation.goBack()}
                desabilitado={carregando}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const estilos = StyleSheet.create({
  blocoSugestoes: {
    backgroundColor: cores.primariaClara,
    padding: espacamentos.sm,
    borderRadius: bordas.raioMedio,
    marginBottom: espacamentos.md,
  },
  tituloSugestoes: {
    fontSize: fontes.tamanhos.pequeno,
    fontWeight: '700',
    color: cores.primariaEscura,
    marginBottom: 6,
  },
  linhaSugestoes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipSugestao: {
    backgroundColor: cores.primaria,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: bordas.raioCircular,
  },
  textoChipSugestao: {
    color: cores.textoClaro,
    fontSize: 12,
    fontWeight: '700',
  },
  linhaSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: cores.fundo,
    padding: espacamentos.md,
    borderRadius: bordas.raioMedio,
    marginBottom: espacamentos.md,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  tituloSwitch: {
    fontSize: fontes.tamanhos.corpo,
    fontWeight: '700',
    color: cores.textoPrincipal,
  },
  descricaoSwitch: {
    fontSize: fontes.tamanhos.pequeno,
    color: cores.textoSecundario,
    marginTop: 2,
  },
});
