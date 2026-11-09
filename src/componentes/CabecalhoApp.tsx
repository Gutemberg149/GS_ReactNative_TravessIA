import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { usarAutenticacao } from '../contextos/ContextoAutenticacao';
import { bordas, cores, espacamentos, fontes } from '../estilos/tema';

interface PropriedadesCabecalho {
  titulo: string;
  subtitulo?: string;
}

export const CabecalhoApp: React.FC<PropriedadesCabecalho> = ({ titulo, subtitulo }) => {
  const { ehAdmin } = usarAutenticacao();

  return (
    <View style={estilos.container}>
      <View style={estilos.linhaTopo}>
        <View style={estilos.blocoMarca}>
          <Image
            source={require('../ativos/imagens/logo-travessia.png')}
            style={estilos.logo}
            accessibilityLabel="Logotipo do aplicativo TravessIA"
          />
          <View style={estilos.textosCabecalho}>
            <Text style={estilos.titulo}>{titulo}</Text>
            {subtitulo ? <Text style={estilos.subtitulo}>{subtitulo}</Text> : null}
          </View>
        </View>

        {ehAdmin ? (
          <View style={estilos.seloAdmin}>
            <Text style={estilos.textoSelo}>ADMIN</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const estilos = StyleSheet.create({
  container: {
    backgroundColor: cores.primaria,
    paddingHorizontal: espacamentos.md,
    paddingVertical: espacamentos.md,
    borderBottomLeftRadius: bordas.raioGrande,
    borderBottomRightRadius: bordas.raioGrande,
    marginBottom: espacamentos.md,
  },
  linhaTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  blocoMarca: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: bordas.raioMedio,
    marginRight: espacamentos.sm,
    backgroundColor: cores.primariaEscura,
  },
  textosCabecalho: {
    flex: 1,
  },
  titulo: {
    fontSize: fontes.tamanhos.titulo,
    fontFamily: fontes.negrito,
    fontWeight: '800',
    color: cores.textoClaro,
  },
  subtitulo: {
    fontSize: fontes.tamanhos.pequeno,
    color: cores.primariaClara,
    marginTop: 2,
  },
  seloAdmin: {
    backgroundColor: cores.destaque,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: bordas.raioCircular,
    marginLeft: espacamentos.xs,
  },
  textoSelo: {
    color: cores.textoClaro,
    fontSize: 12,
    fontWeight: '800',
  },
});
