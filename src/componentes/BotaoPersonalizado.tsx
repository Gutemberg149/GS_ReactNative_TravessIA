import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { bordas, cores, espacamentos, fontes } from '../estilos/tema';

type VarianteBotao = 'primario' | 'secundario' | 'perigo' | 'contorno';

interface PropriedadesBotao {
  titulo: string;
  aoPressionar: () => void;
  variante?: VarianteBotao;
  carregando?: boolean;
  desabilitado?: boolean;
  estiloExtra?: ViewStyle;
}

export const BotaoPersonalizado: React.FC<PropriedadesBotao> = ({
  titulo,
  aoPressionar,
  variante = 'primario',
  carregando = false,
  desabilitado = false,
  estiloExtra,
}) => {
  const inativo = desabilitado || carregando;

  const corFundo = () => {
    if (inativo) return cores.desabilitado;
    switch (variante) {
      case 'secundario':
        return cores.secundaria;
      case 'perigo':
        return cores.perigo;
      case 'contorno':
        return 'transparent';
      default:
        return cores.primaria;
    }
  };

  const corTexto = variante === 'contorno' && !inativo ? cores.primaria : cores.textoClaro;

  return (
    <TouchableOpacity
      style={[
        estilos.botao,
        { backgroundColor: corFundo() },
        variante === 'contorno' && estilos.botaoContorno,
        estiloExtra,
      ]}
      onPress={aoPressionar}
      disabled={inativo}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={titulo}
    >
      {carregando ? (
        <ActivityIndicator color={corTexto} size="small" />
      ) : (
        <Text style={[estilos.texto, { color: corTexto }]}>{titulo}</Text>
      )}
    </TouchableOpacity>
  );
};

const estilos = StyleSheet.create({
  botao: {
    minHeight: 52,
    borderRadius: bordas.raioMedio,
    paddingHorizontal: espacamentos.md,
    paddingVertical: espacamentos.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: espacamentos.xs,
  },
  botaoContorno: {
    borderWidth: 2,
    borderColor: cores.primaria,
  },
  texto: {
    fontSize: fontes.tamanhos.corpo,
    fontFamily: fontes.negrito,
    fontWeight: '700',
    textAlign: 'center',
  },
});
