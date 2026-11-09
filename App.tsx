import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ProvedorAutenticacao } from './src/contextos/ContextoAutenticacao';
import { NavegadorPrincipal } from './src/navegacao/NavegadorPrincipal';

export default function App() {
  return (
    <SafeAreaProvider>
      <ProvedorAutenticacao>
        <StatusBar style="dark" />
        <NavegadorPrincipal />
      </ProvedorAutenticacao>
    </SafeAreaProvider>
  );
}
