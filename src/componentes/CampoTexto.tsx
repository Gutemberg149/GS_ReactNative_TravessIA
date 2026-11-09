import React from 'react';
import {
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { bordas, cores, espacamentos, fontes } from '../estilos/tema';

interface PropriedadesCampoTexto {
  rotulo: string;
  valor: string;
  aoMudarTexto: (novoTexto: string) => void;
  placeholder?: string;
  tipoTeclado?: KeyboardTypeOptions;
  dica?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

export const CampoTexto: React.FC<PropriedadesCampoTexto> = ({
  rotulo,
  valor,
  aoMudarTexto,
  placeholder,
  tipoTeclado = 'default',
  dica,
  autoCapitalize = 'none',
}) => {
  return (
    <View style={estilos.bloco}>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      <TextInput
        style={estilos.entrada}
        value={valor}
        onChangeText={aoMudarTexto}
        placeholder={placeholder}
        placeholderTextColor={cores.desabilitado}
        keyboardType={tipoTeclado}
        autoCapitalize={autoCapitalize}
        accessibilityLabel={rotulo}
      />
      {dica ? <Text style={estilos.dica}>{dica}</Text> : null}
    </View>
  );
};

const estilos = StyleSheet.create({
  bloco: {
    marginBottom: espacamentos.md,
  },
  rotulo: {
    fontSize: fontes.tamanhos.corpo,
    fontWeight: '700',
    color: cores.textoPrincipal,
    marginBottom: 6,
  },
  entrada: {
    minHeight: 50,
    backgroundColor: cores.superficie,
    borderWidth: 1.5,
    borderColor: cores.borda,
    borderRadius: bordas.raioMedio,
    paddingHorizontal: espacamentos.md,
    fontSize: fontes.tamanhos.corpo,
    color: cores.textoPrincipal,
  },
  dica: {
    fontSize: fontes.tamanhos.pequeno,
    color: cores.textoSecundario,
    marginTop: 4,
  },
});
