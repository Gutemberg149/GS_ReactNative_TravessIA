import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BotaoPersonalizado } from '../componentes/BotaoPersonalizado';
import { CampoTexto } from '../componentes/CampoTexto';
import { MensagemFeedback } from '../componentes/MensagemFeedback';
import { usarAutenticacao } from '../contextos/ContextoAutenticacao';
import { estilosGlobais } from '../estilos/estilosGlobais';
import { bordas, cores, espacamentos, fontes } from '../estilos/tema';
import { ParametrosPilhaAutenticacao } from '../navegacao/tiposNavegacao';
import { extrairMensagemErro } from '../servicos/clienteApi';

type Propriedades = NativeStackScreenProps<ParametrosPilhaAutenticacao, 'TelaLogin'>;

export const TelaLogin: React.FC<Propriedades> = ({ navigation }) => {
  const { realizarLogin } = usarAutenticacao();
  const [nomeUsuario, setNomeUsuario] = useState<string>('');
  const [carregando, setCarregando] = useState<boolean>(false);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  async function manipularLogin() {
    setMensagemErro(null);
    if (!nomeUsuario.trim()) {
      setMensagemErro('Por favor, informe o seu nome de usuário para entrar.');
      return;
    }

    try {
      setCarregando(true);
      await realizarLogin(nomeUsuario.trim());
    } catch (erro) {
      setMensagemErro(extrairMensagemErro(erro));
    } finally {
      setCarregando(false);
    }
  }

  function preencherCredencialExemplo(nomeExemplo: string) {
    setMensagemErro(null);
    setNomeUsuario(nomeExemplo);
  }

  return (
    <SafeAreaView style={estilosGlobais.areaSegura}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={estilos.conteudoScroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={estilos.cabecalhoVisual}>
            <Image
              source={require('../ativos/imagens/logo-travessia.png')}
              style={estilos.imagemLogo}
            />
            <Text style={estilos.tituloPrincipal}>TravessIA</Text>
            <Text style={estilos.descricaoApp}>
              Travessia inteligente assistida por IA e GPS para pessoas 60+ e PCD
            </Text>
          </View>

          <View style={estilosGlobais.cartao}>
            <Text style={estilosGlobais.tituloSecao}>Acessar Conta</Text>
            <Text style={estilosGlobais.subtituloSecao}>
              Sua sessão permanece ativa por 1 ano até você realizar o logout manual.
            </Text>

            <MensagemFeedback mensagem={mensagemErro} tipo="erro" />

            <CampoTexto
              rotulo="Nome de Usuário"
              valor={nomeUsuario}
              aoMudarTexto={setNomeUsuario}
              placeholder="Ex.: maria_silva ou admin_gutemberg"
              dica="Informe o nome cadastrado na plataforma TravessIA."
            />

            <View style={estilos.blocoAtalhos}>
              <Text style={estilos.rotuloAtalhos}>Preenchimento rápido para teste:</Text>
              <View style={estilos.linhaAtalhos}>
                <TouchableOpacity
                  style={estilos.chipAtalho}
                  onPress={() => preencherCredencialExemplo('maria_silva')}
                >
                  <Text style={estilos.textoChip}>Cidadão: maria_silva</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[estilos.chipAtalho, estilos.chipAdmin]}
                  onPress={() => preencherCredencialExemplo('admin_gutemberg')}
                >
                  <Text style={estilos.textoChip}>Admin: admin_gutemberg</Text>
                </TouchableOpacity>
              </View>
            </View>

            <BotaoPersonalizado
              titulo="Entrar no Aplicativo"
              aoPressionar={manipularLogin}
              carregando={carregando}
            />

            <BotaoPersonalizado
              titulo="Criar Nova Conta (60+ ou/e PCD)"
              variante="contorno"
              aoPressionar={() => navigation.navigate('TelaCadastro')}
              desabilitado={carregando}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const estilos = StyleSheet.create({
  conteudoScroll: {
    flexGrow: 1,
    padding: espacamentos.md,
    justifyContent: 'center',
  },
  cabecalhoVisual: {
    alignItems: 'center',
    marginBottom: espacamentos.lg,
  },
  imagemLogo: {
    width: 96,
    height: 96,
    borderRadius: bordas.raioGrande,
    marginBottom: espacamentos.sm,
  },
  tituloPrincipal: {
    fontSize: 32,
    fontWeight: '800',
    color: cores.primaria,
    marginBottom: 4,
  },
  descricaoApp: {
    fontSize: fontes.tamanhos.corpo,
    color: cores.textoSecundario,
    textAlign: 'center',
    paddingHorizontal: espacamentos.md,
    lineHeight: 22,
  },
  blocoAtalhos: {
    marginBottom: espacamentos.md,
    backgroundColor: cores.primariaClara,
    padding: espacamentos.sm,
    borderRadius: bordas.raioMedio,
  },
  rotuloAtalhos: {
    fontSize: fontes.tamanhos.pequeno,
    fontWeight: '700',
    color: cores.primariaEscura,
    marginBottom: 8,
  },
  linhaAtalhos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipAtalho: {
    backgroundColor: cores.secundaria,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: bordas.raioCircular,
  },
  chipAdmin: {
    backgroundColor: cores.primaria,
  },
  textoChip: {
    color: cores.textoClaro,
    fontSize: fontes.tamanhos.pequeno,
    fontWeight: '700',
  },
});
