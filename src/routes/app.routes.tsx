import React from "react";
import { Platform } from 'react-native';
// Biblioteca de ícones disponível no Expo.
import { MaterialIcons } from '@expo/vector-icons';
// Importanto o tema para ser utilizado
import { useTheme } from 'styled-components';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { Dashboard } from '../screens/Dashboard';
import { Register } from '../screens/Register';
import { Resume } from '../screens/Resume';

const { Navigator, Screen } = createBottomTabNavigator();

export function AppRoutes() {
    // Passsando o tema para a constante.
    const theme = useTheme();

    return(
        <Navigator
            screenOptions={{
                // Remove o cabeçalho do react navigator
                headerShown: false, 
                // Muda a cor do menu ativo
                tabBarActiveTintColor: theme.colors.secondary, 
                // Muda a cor do menu inativo
                tabBarInactiveTintColor: theme.colors.text, 
                // Mantendo o ícone ao lado do texto
                tabBarLabelPosition: 'beside-icon', 
                // Estilizando a barra de navegação
                tabBarStyle: {
                    height: 88,
                    // Verifica a plataforma e aplica a estilização
                    paddingVertical: Platform.OS === 'ios' ? 20 : 0, 
                }
            }}
        >
            <Screen 
                name="Listagem"
                component={Dashboard}
                options={{
                    tabBarIcon: (({ size, color }) => 
                    <MaterialIcons 
                        name="format-list-bulleted"
                        size={size}
                        color={color}
                    />
                    )
                }}
            />

            <Screen 
                name="Cadastrar"
                component={Register}
                options={{
                    tabBarIcon: (({ size, color }) => 
                    <MaterialIcons 
                        name="attach-money"
                        size={size}
                        color={color}
                    />
                    )
                }}
            />

            <Screen 
                name="Resumo"
                component={Resume}
                options={{
                    tabBarIcon: (({ size, color }) => 
                    <MaterialIcons 
                        name="pie-chart"
                        size={size}
                        color={color}
                    />
                    )
                }}
            />
        </Navigator>
    )
}