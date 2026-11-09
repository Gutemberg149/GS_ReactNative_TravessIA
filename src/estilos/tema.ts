import { Platform } from 'react-native';

export const cores = {
  primaria: '#0F4C81',
  primariaEscura: '#093257',
  primariaClara: '#E6F0FA',
  secundaria: '#00875A',
  secundariaClara: '#E3FCEF',
  destaque: '#FF8B00',
  destaqueClaro: '#FFF0B3',
  perigo: '#DE350B',
  perigoClaro: '#FFEBE6',
  fundo: '#F4F6F9',
  superficie: '#FFFFFF',
  textoPrincipal: '#172B4D',
  textoSecundario: '#505F79',
  textoClaro: '#FFFFFF',
  borda: '#DFE1E6',
  desabilitado: '#C1C7D0',
  sombra: '#091E42',
};

export const fontes = {
  regular: Platform.select({ ios: 'System', android: 'Roboto', default: 'System' }),
  media: Platform.select({ ios: 'System', android: 'Roboto', default: 'System' }),
  negrito: Platform.select({ ios: 'System', android: 'Roboto', default: 'System' }),
  tamanhos: {
    pequeno: 13,
    corpo: 16,
    subtitulo: 18,
    titulo: 22,
    destaque: 28,
    cronometro: 44,
  },
};

export const espacamentos = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
};

export const bordas = {
  raioPequeno: 8,
  raioMedio: 14,
  raioGrande: 22,
  raioCircular: 999,
};
