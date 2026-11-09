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
import { usarAutenticacao } from '../contextos/ContextoAutenticacao';
import { estilosGlobais } from '../estilos/estilosGlobais';
import { bordas, cores, espacamentos, fontes } from '../estilos/tema';
import { ParametrosPilhaAutenticacao } from '../navegacao/tiposNavegacao';
import { extrairMensagemErro } from '../servicos/clienteApi';
import { PapelUsuario } from '../tipos/modelos';

type Propriedades = NativeStackScreenProps<ParametrosPilhaAutenticacao, 'TelaCadastro'>;

export const TelaCadastro: React.FC<Propriedades> = ({ navigation }) => {
  const { realizarCadastro } = usarAutenticacao();
  const [nome, setNome] = useState<string>('');
  const [idadeTexto, setIdadeTexto] = useState<string>('');
  const [possuiDeficiencia, setPossuiDeficiencia] = useState<boolean>(false);
  const [papelSelecionado, setPapelSelecionado] = useState<PapelUsuario>('USUARIO');
  const [carregando, setCarregando] = useState<boolean>(false);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  async function manipularCadastro() {
    setMensagemErro(null);

    const nomeLimpo = nome.trim();
    const idadeNumero = Number(idadeTexto);

    if (!nomeLimpo) {
      setMensagemErro('O nome de usuário é obrigatório.');
      return;
    }

    if (!idadeTexto.trim() || Number.isNaN(idadeNumero) || idadeNumero < 1 || idadeNumero > 120) {
      setMensagemErro('Informe uma idade válida entre 1 e 120 anos.');
      return;
    }

    if (!possuiDeficiencia && idadeNumero < 60) {
      setMensagemErro(
        'Regra de elegibilidade: o cadastro é permitido apenas para pessoas com 60 anos ou mais (60+) ou PCD (Pessoa com Deficiência).'
      );
      return;
    }

    try {
      setCarregando(true);
      await realizarCadastro({
        nome: nomeLimpo,
        idade: idadeNumero,
        pcd: possuiDeficiencia,
        papel: papelSelecionado,
      });
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
            titulo="Novo Cadastro"
            subtitulo="Exclusivo para pedestres 60+ ou PCD"
          />

          <View style={estilosGlobais.container}>
            <View style={estilosGlobais.cartao}>
              <Text style={estilosGlobais.tituloSecao}>Dados do Pedestre / Gestor</Text>
              <Text style={estilosGlobais.subtituloSecao}>
                Para garantir a prioridade nos semáforos inteligentes, o cadastro exige ter 60 anos ou mais ou ser PCD.
              </Text>

              <MensagemFeedback mensagem={mensagemErro} tipo="erro" />

              <CampoTexto
                rotulo="Nome de Identificação (Login)"
                valor={nome}
                aoMudarTexto={setNome}
                placeholder="Ex.: joao_silva"
              />

              <CampoTexto
                rotulo="Idade (anos)"
                valor={idadeTexto}
                aoMudarTexto={setIdadeTexto}
                placeholder="Ex.: 68"
                tipoTeclado="numeric"
              />

              <View style={estilos.linhaSwitch}>
                <View style={{ flex: 1, paddingRight: espacamentos.sm }}>
                  <Text style={estilos.tituloSwitch}>Pessoa com Deficiência (PCD)</Text>
                  <Text style={estilos.descricaoSwitch}>
                    Ative se você possui mobilidade reduzida ou deficiência visual/física.
                  </Text>
                </View>
                <Switch
                  value={possuiDeficiencia}
                  onValueChange={setPossuiDeficiencia}
                  trackColor={{ false: cores.borda, true: cores.secundaria }}
                />
              </View>

              <Text style={estilos.rotuloPapel}>Perfil de Acesso no Sistema</Text>
              <View style={estilos.containerPapeis}>
                <TouchableOpacity
                  style={[
                    estilos.opcaoPapel,
                    papelSelecionado === 'USUARIO' && estilos.opcaoPapelAtiva,
                  ]}
                  onPress={() => setPapelSelecionado('USUARIO')}
                >
                  <Text
                    style={[
                      estilos.textoOpcaoPapel,
                      papelSelecionado === 'USUARIO' && estilos.textoOpcaoPapelAtivo,
                    ]}
                  >
                    Cidadão (USUARIO)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    estilos.opcaoPapel,
                    papelSelecionado === 'ADMIN' && estilos.opcaoPapelAtiva,
                  ]}
                  onPress={() => setPapelSelecionado('ADMIN')}
                >
                  <Text
                    style={[
                      estilos.textoOpcaoPapel,
                      papelSelecionado === 'ADMIN' && estilos.textoOpcaoPapelAtivo,
                    ]}
                  >
                    Gestor (ADMIN)
                  </Text>
                </TouchableOpacity>
              </View>

              <BotaoPersonalizado
                titulo="Concluir Cadastro e Entrar"
                variante="secundario"
                aoPressionar={manipularCadastro}
                carregando={carregando}
              />

              <BotaoPersonalizado
                titulo="Voltar para o Login"
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
  rotuloPapel: {
    fontSize: fontes.tamanhos.corpo,
    fontWeight: '700',
    color: cores.textoPrincipal,
    marginBottom: espacamentos.xs,
  },
  containerPapeis: {
    flexDirection: 'row',
    gap: espacamentos.sm,
    marginBottom: espacamentos.md,
  },
  opcaoPapel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: bordas.raioMedio,
    borderWidth: 1.5,
    borderColor: cores.borda,
    alignItems: 'center',
    backgroundColor: cores.superficie,
  },
  opcaoPapelAtiva: {
    borderColor: cores.primaria,
    backgroundColor: cores.primariaClara,
  },
  textoOpcaoPapel: {
    fontSize: fontes.tamanhos.pequeno,
    fontWeight: '700',
    color: cores.textoSecundario,
  },
  textoOpcaoPapelAtivo: {
    color: cores.primaria,
  },
});
