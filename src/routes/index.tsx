import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { AuthRoutes } from './auth.routes';
import { AppRoutes } from './app.routes';

import { useAuth } from '../hooks/auth';

export function Routes(){
    // Pega do contexto os dados do usuário
    const { user } = useAuth();

    console.log(user);

    return(
        // Container responsável por exibir a tab de navegação
        <NavigationContainer>
            {/* Se existir algo dentro de usuário, chama as rotas privadas se não chama a rota de autenticação */}
            {user.id ? <AppRoutes /> : <AuthRoutes />}
        </NavigationContainer>
    );
}