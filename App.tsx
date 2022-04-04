import 'react-native-gesture-handler';
// Biblioteca resolve formatação de data no Android
import 'intl';
import 'intl/locale-data/jsonp/pt-BR';

// import AsyncStorage from '@react-native-async-storage/async-storage';

import React from 'react';
import { StatusBar } from 'react-native';
import AppLoading from 'expo-app-loading';
import { ThemeProvider } from 'styled-components';

import theme from './src/global/styles/theme';

import { Routes } from './src/routes';

// import { AppRoutes } from './src/routes/app.routes';

// import { SignIn } from './src/screens/SignIn';
// import { Dashboard } from './src/screens/Dashboard';
// import { Register } from './src/screens/Register';
// import { CategorySelect } from './src/screens/CategorySelect';
// import { isLoaded } from 'expo-font';

import { AuthProvider, useAuth } from './src/hooks/auth';

import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_700Bold
} from '@expo-google-fonts/poppins';

export default function App() {
  // Carrega as fontes e passa para a variável um boolean q informa se as fontes
  // foram carregadas ou não
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold
  });

  const { userStorageLoading } = useAuth();

  // Verifica se as fontes foram carregadas
  if(!fontsLoaded || userStorageLoading) {
    // Enquanto não forem carrgadas, exibe a splash screen
    return  <AppLoading/>
  }

  //Apaga tudo do Asyncstorage
  // AsyncStorage.removeItem('@gofinances:transactions');
  // AsyncStorage.removeItem('@gofinances:user');
  
  return (
    // Provê o tema para nossa aplicação
    <ThemeProvider theme={theme}>  
        {/** Muda a cor da status bar no iPhone */}
        <StatusBar barStyle="light-content"/>
        {/* Precisar estar dentro do AuthProvider para que possamos acessar o contexto dentro das rotas */}
        <AuthProvider>
          <Routes />
        </AuthProvider>
    </ThemeProvider>
    
  )
}