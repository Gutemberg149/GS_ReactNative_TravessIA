import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { usarAutenticacao } from '../contextos/ContextoAutenticacao';
import { cores, fontes } from '../estilos/tema';
import { TelaCadastro } from '../telas/TelaCadastro';
import { TelaFormularioSemaforo } from '../telas/TelaFormularioSemaforo';
import { TelaHistorico } from '../telas/TelaHistorico';
import { TelaLogin } from '../telas/TelaLogin';
import { TelaPerfil } from '../telas/TelaPerfil';
import { TelaSemaforos } from '../telas/TelaSemaforos';
import { TelaTravessia } from '../telas/TelaTravessia';
import {
  ParametrosAbasPrincipais,
  ParametrosPilhaAutenticacao,
  ParametrosPilhaPrincipal,
} from './tiposNavegacao';

const PilhaAutenticacao = createNativeStackNavigator<ParametrosPilhaAutenticacao>();
const Abas = createBottomTabNavigator<ParametrosAbasPrincipais>();
const PilhaPrincipal = createNativeStackNavigator<ParametrosPilhaPrincipal>();

const NavegadorAbasPrincipais: React.FC = () => {
  return (
    <Abas.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: cores.primaria,
        tabBarInactiveTintColor: cores.textoSecundario,
        tabBarStyle: estilos.barraAbas,
        tabBarLabelStyle: estilos.rotuloAba,
        tabBarIcon: ({ color, size }) => {
          let nomeIcone: keyof typeof Ionicons.glyphMap = 'Navigate' as any;
          if (route.name === 'AbaSemaforos') {
            nomeIcone = 'trail-sign-outline';
          } else if (route.name === 'AbaTravessia') {
            nomeIcone = 'walk-outline';
          } else if (route.name === 'AbaHistorico') {
            nomeIcone = 'time-outline';
          } else if (route.name === 'AbaPerfil') {
            nomeIcone = 'person-circle-outline';
          }
          return <Ionicons name={nomeIcone} size={size} color={color} />;
        },
      })}
    >
      <Abas.Screen
        name="AbaSemaforos"
        component={TelaSemaforos}
        options={{ title: 'Semáforos' }}
      />
      <Abas.Screen
        name="AbaTravessia"
        component={TelaTravessia}
        options={{ title: 'Travessia IA' }}
      />
      <Abas.Screen
        name="AbaHistorico"
        component={TelaHistorico}
        options={{ title: 'Histórico' }}
      />
      <Abas.Screen
        name="AbaPerfil"
        component={TelaPerfil}
        options={{ title: 'Meu Perfil' }}
      />
    </Abas.Navigator>
  );
};

export const NavegadorPrincipal: React.FC = () => {
  const { usuarioLogado, carregandoSessao } = usarAutenticacao();

  if (carregandoSessao) {
    return (
      <View style={estilos.telaCarregamento}>
        <ActivityIndicator size="large" color={cores.primaria} />
        <Text style={estilos.textoCarregamento}>Restaurando sessão salva...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {usuarioLogado ? (
        <PilhaPrincipal.Navigator screenOptions={{ headerShown: false }}>
          <PilhaPrincipal.Screen
            name="AbasPrincipais"
            component={NavegadorAbasPrincipais}
          />
          <PilhaPrincipal.Screen
            name="TelaFormularioSemaforo"
            component={TelaFormularioSemaforo}
          />
        </PilhaPrincipal.Navigator>
      ) : (
        <PilhaAutenticacao.Navigator screenOptions={{ headerShown: false }}>
          <PilhaAutenticacao.Screen name="TelaLogin" component={TelaLogin} />
          <PilhaAutenticacao.Screen name="TelaCadastro" component={TelaCadastro} />
        </PilhaAutenticacao.Navigator>
      )}
    </NavigationContainer>
  );
};

const estilos = StyleSheet.create({
  barraAbas: {
    height: 64,
    paddingBottom: 8,
    paddingTop: 6,
    backgroundColor: cores.superficie,
    borderTopColor: cores.borda,
    borderTopWidth: 1,
  },
  rotuloAba: {
    fontSize: 12,
    fontFamily: fontes.negrito,
    fontWeight: '700',
  },
  telaCarregamento: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.fundo,
  },
  textoCarregamento: {
    marginTop: 12,
    fontSize: fontes.tamanhos.corpo,
    color: cores.textoSecundario,
  },
});
