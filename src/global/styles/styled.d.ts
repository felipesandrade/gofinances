import 'styled-components';
import theme from './theme';

// Copiar os componentes do nosso tema para os tema default.
declare module 'styled-components' {
    // Copias os elementos do tema para ThemeType
    type ThemeType = typeof theme 

    // Exporta os elementos do theme para o Tema Padrão
    export interface DefaultTheme extends ThemeType {}
}