import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  Alert,
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
import { extrairMensagemErro } from '../servicos/clienteApi';
import {
  atualizarUsuarioApi,
  listarUsuariosApi,
  removerUsuarioApi,
} from '../servicos/servicoUsuario';
import { Usuario } from '../tipos/modelos';

export const TelaPerfil: React.FC = () => {
  const {
    usuarioLogado,
    ehAdmin,
    atualizarSessaoUsuario,
    realizarLogout,
  } = usarAutenticacao();

  const [nome, setNome] = useState<string>(usuarioLogado?.nome || '');
  const [idadeTexto, setIdadeTexto] = useState<string>(
    String(usuarioLogado?.idade || 65)
  );
  const [pcd, setPcd] = useState<boolean>(usuarioLogado?.pcd ?? true);
  const [salvandoPerfil, setSalvandoPerfil] = useState<boolean>(false);
  const [usuariosCadastrados, setUsuariosCadastrados] = useState<Usuario[]>([]);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  const carregarUsuariosSeAdmin = useCallback(async () => {
    if (!ehAdmin) return;
    try {
      const pagina = await listarUsuariosApi(0, 50);
      setUsuariosCadastrados(pagina.content || []);
    } catch {
      setUsuariosCadastrados([]);
    }
  }, [ehAdmin]);

  useFocusEffect(
    useCallback(() => {
      carregarUsuariosSeAdmin();
    }, [carregarUsuariosSeAdmin])
  );

  async function manipularAtualizarPerfil() {
    if (!usuarioLogado) return;
    setMensagemErro(null);
    setMensagemSucesso(null);

    const idadeNumero = Number(idadeTexto);
    if (!nome.trim()) {
      setMensagemErro('O nome não pode ficar em branco.');
      return;
    }
    if (!pcd && idadeNumero < 60) {
      setMensagemErro(
        'O cadastro exige que a pessoa tenha 60 anos ou mais (60+) ou seja PCD.'
      );
      return;
    }

    try {
      setSalvandoPerfil(true);
      const atualizado = await atualizarUsuarioApi(usuarioLogado.id, {
        nome: nome.trim(),
        idade: idadeNumero,
        pcd,
        papel: usuarioLogado.papel,
      });
      await atualizarSessaoUsuario(atualizado);
      setMensagemSucesso('Seus dados foram atualizados no banco Oracle com sucesso!');
      await carregarUsuariosSeAdmin();
    } catch (erro) {
      setMensagemErro(extrairMensagemErro(erro));
    } finally {
      setSalvandoPerfil(false);
    }
  }

  function confirmarRemoverUsuario(alvo: Usuario) {
    Alert.alert(
      'Remover Usuário',
      `Deseja remover o usuário "${alvo.nome}" (ID ${alvo.id})?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              setMensagemErro(null);
              setMensagemSucesso(null);
              await removerUsuarioApi(alvo.id);
              setMensagemSucesso(`Usuário "${alvo.nome}" removido com sucesso.`);
              await carregarUsuariosSeAdmin();
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
        titulo="Meu Perfil e Sessão"
        subtitulo={`ID #${usuarioLogado?.id} • Papel: ${usuarioLogado?.papel}`}
      />

      <ScrollView
        style={estilosGlobais.container}
        contentContainerStyle={{ paddingBottom: espacamentos.xl }}
      >
        <View style={estilosGlobais.cartao}>
          <Text style={estilosGlobais.tituloSecao}>Atualizar Dados Cadastrais (PUT)</Text>
          <Text style={estilosGlobais.subtituloSecao}>
            Token JWT ativo com validade de 1 ano no dispositivo.
          </Text>

          <MensagemFeedback mensagem={mensagemErro} tipo="erro" />
          <MensagemFeedback mensagem={mensagemSucesso} tipo="sucesso" />

          <CampoTexto
            rotulo="Nome de Usuário"
            valor={nome}
            aoMudarTexto={setNome}
          />

          <CampoTexto
            rotulo="Idade (anos)"
            valor={idadeTexto}
            aoMudarTexto={setIdadeTexto}
            tipoTeclado="numeric"
          />

          <View style={estilos.linhaSwitch}>
            <Text style={estilos.rotuloSwitch}>Pessoa com Deficiência (PCD)</Text>
            <Switch
              value={pcd}
              onValueChange={setPcd}
              trackColor={{ false: cores.borda, true: cores.secundaria }}
            />
          </View>

          <BotaoPersonalizado
            titulo="Salvar Alterações no Perfil"
            variante="primario"
            aoPressionar={manipularAtualizarPerfil}
            carregando={salvandoPerfil}
          />

          <BotaoPersonalizado
            titulo="Sair da Conta (Logout)"
            variante="perigo"
            aoPressionar={realizarLogout}
          />
        </View>

        {ehAdmin ? (
          <View style={estilosGlobais.cartao}>
            <Text style={estilosGlobais.tituloSecao}>
              Gestão de Usuários Cadastrados (Admin)
            </Text>
            <Text style={estilosGlobais.subtituloSecao}>
              Lista vinda de GET /api/usuarios no banco Oracle:
            </Text>

            {usuariosCadastrados.map((item) => (
              <View key={item.id} style={estilos.itemUsuario}>
                <View style={{ flex: 1 }}>
                  <Text style={estilos.nomeItemUsuario}>
                    #{item.id} {item.nome} ({item.papel})
                  </Text>
                  <Text style={estilos.detalheItemUsuario}>
                    Idade: {item.idade} anos • {item.pcd ? 'PCD: Sim' : 'PCD: Não'}
                  </Text>
                </View>

                {item.id !== usuarioLogado?.id ? (
                  <TouchableOpacity
                    style={estilos.botaoRemoverPequeno}
                    onPress={() => confirmarRemoverUsuario(item)}
                  >
                    <Text style={estilos.textoRemoverPequeno}>Excluir</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
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
  rotuloSwitch: {
    fontSize: fontes.tamanhos.corpo,
    fontWeight: '700',
    color: cores.textoPrincipal,
  },
  itemUsuario: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
  },
  nomeItemUsuario: {
    fontSize: fontes.tamanhos.corpo,
    fontWeight: '700',
    color: cores.textoPrincipal,
  },
  detalheItemUsuario: {
    fontSize: fontes.tamanhos.pequeno,
    color: cores.textoSecundario,
  },
  botaoRemoverPequeno: {
    backgroundColor: cores.perigoClaro,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: bordas.raioPequeno,
    borderWidth: 1,
    borderColor: cores.perigo,
  },
  textoRemoverPequeno: {
    color: cores.perigo,
    fontSize: 12,
    fontWeight: '700',
  },
});
