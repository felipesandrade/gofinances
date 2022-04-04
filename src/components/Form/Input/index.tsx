import React from "react";
// Tipando o nosso componente com o tipo TextInput do React Native
import { TextInputProps } from "react-native";

import { Container } from "./styles";

type Props = TextInputProps;

// Pega todas as propriedades que vem do TextInput
export function Input({...rest} : Props){
    return(
        // Despeja essas propriedades no Container do nosso componente
        <Container {...rest} />
    )
}