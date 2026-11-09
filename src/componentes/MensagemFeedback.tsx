import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { bordas, cores, espacamentos, fontes } from '../estilos/tema';

interface PropriedadesMensagemFeedback {
  mensagem: string | null;
  tipo?: 'erro' | 'sucesso' | 'aviso';
}

export const MensagemFeedback: React.FC<PropriedadesMensagemFeedback> = ({
  mensagem,
  tipo = 'erro',
}) => {
  if (!mensagem) return null;

  const configuracaoCores = {
    erro: {
      fundo: cores.perigoClaro,
      borda: cores.perigo,
      texto: cores.perigo,
    },
    sucesso: {
      fundo: cores.secundariaClara,
      borda: cores.secundaria,
      texto: cores.secundaria,
    },
    aviso: {
      fundo: cores.destaqueClaro,
      borda: cores.destaque,
      texto: cores.textoPrincipal,
    },
  }[tipo];

  return (
    <View
      style={[
        estilos.caixa,
        {
          backgroundColor: configuracaoCores.fundo,
          borderColor: configuracaoCores.borda,
        },
      ]}
      accessibilityRole="alert"
    >
      <Text style={[estilos.texto, { color: configuracaoCores.texto }]}>{mensagem}</Text>
    </View>
  );
};

const estilos = StyleSheet.create({
  caixa: {
    borderWidth: 1.5,
    borderRadius: bordas.raioMedio,
    padding: espacamentos.md,
    marginBottom: espacamentos.md,
  },
  texto: {
    fontSize: fontes.tamanhos.corpo,
    fontWeight: '600',
    lineHeight: 21,
  },
});
