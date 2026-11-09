import { StyleSheet } from 'react-native';
import { bordas, cores, espacamentos, fontes } from './tema';

export const estilosGlobais = StyleSheet.create({
  areaSegura: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  container: {
    flex: 1,
    backgroundColor: cores.fundo,
    paddingHorizontal: espacamentos.md,
  },
  cartao: {
    backgroundColor: cores.superficie,
    borderRadius: bordas.raioMedio,
    padding: espacamentos.md,
    marginBottom: espacamentos.md,
    borderWidth: 1,
    borderColor: cores.borda,
    shadowColor: cores.sombra,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  tituloSecao: {
    fontSize: fontes.tamanhos.titulo,
    fontWeight: '700',
    color: cores.textoPrincipal,
    marginBottom: espacamentos.xs,
  },
  subtituloSecao: {
    fontSize: fontes.tamanhos.corpo,
    color: cores.textoSecundario,
    marginBottom: espacamentos.md,
    lineHeight: 22,
  },
  linhaEntreElementos: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  etiqueta: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: bordas.raioCircular,
    alignSelf: 'flex-start',
  },
  textoEtiqueta: {
    fontSize: fontes.tamanhos.pequeno,
    fontWeight: '700',
  },
});
