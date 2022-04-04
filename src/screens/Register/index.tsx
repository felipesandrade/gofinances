import React, { useState } from 'react';
import { 
    Modal, 
    TouchableWithoutFeedback, // Fechar o teclado ao clicar em qualquer área da tela
    Keyboard, // Fechar o teclado
    Alert // Exibe alerta caso o campo n seja preenchido
} from 'react-native';
import * as Yup from 'yup';
// Validação de formulário com React Hook Form
import { yupResolver } from '@hookform/resolvers/yup'; 
// Biblioteca responsável por armazenar informações no dispositivo do usuário
import AsyncStorage from '@react-native-async-storage/async-storage';
// Gera um id aleatório
import uuid from 'react-native-uuid';

import { useForm } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/auth';

// import { Input } from '../../components/Form/Input';
import { InputForm } from '../../components/Form/InputForm';
import { Button } from '../../components/Form/Button';
import { TransactionTypeButton } from '../../components/Form/TransactionTypeButton';
import { CategorySelectButton } from '../../components/Form/CategorySelectButton';

import { CategorySelect } from '../CategorySelect';

import { 
    Container,
    Header,
    Title,
    Form,
    Fields,
    TransactionsTypes,
 } from './styles';


 interface FormData {
     name: string;
     amount: string;
 }

 // Tipando o Navigation
 type NavigationProps = {
     navigate:(screen: string) => void;
 }

 // Schema de validação dos campos do formulário
 const schema = Yup.object().shape({
    name: Yup
        .string()
        .required('Nome é obrigatório'),
    amount: Yup
        .number()
        .transform((_value, originalValue) => Number(originalValue.replace(/,/, '.'))) // Substitui ponto por virgula
        .positive('O valor não pode ser negativo')
        .required('Valor é obrigatório')
 });

export function Register(){
    // Estado para armazenar o botão que está selecionado.
    const [ transactionType, setTransactionType ] = useState('');

    // Estado para controlar o modal de categoria.
    const [ categoryModalOpen, setCategoryModalOpen ] = useState(false);

    const { user } = useAuth();

    // Estado para pegar a categoria inicial e setar a categoria selecionada.
    const [ category, setCategory ] = useState({
        key: 'category',
        name: 'Categoria'
    });

    const navigation = useNavigation<NavigationProps>();

    //Pega as caracteristicas do React Hook Form
    const {
        control,
        handleSubmit,
        reset, // Resetar os campos do formulário
        formState: { errors } // Elemento que captura os erros na validação do formulário
    } = useForm({
        resolver: yupResolver(schema) // Faz a validação do formulário, conforme o schema
    });

    //const [ name, setName ] = useState(''); //Estado para controlar input

    //const [ amount, setAmount ] = useState(''); //Estado para controlar input

    // Função é acionado ao clicar apertar no botão para alterar o estado.
    // Plavra handle é utilizada em função de algo que foi disparado através
    // da ação do usuário
    function handleTransactionTypeSelect(type: 'positive' | 'negative'){
        setTransactionType(type);

    }

    // Função para abrir o Modal de Categoria.
    function handleOpensSelectCategoryModal(){
        setCategoryModalOpen(true);
    }

    // Função para fechar o Modal de Categoria.
    function handleCloseSelectCategoryModal(){
        setCategoryModalOpen(false);
    }

    // Partial: define como opcional as propriedades de FormData
    // Add o async, pois a tarefa de armazenamento dos dados no dispositivo requer um tempo para ocorrer
    async function handleRegister(form: Partial<FormData>){

        //Verifica se o tipo de transação foi selecionado
        if(!transactionType) {
            return Alert.alert('Selecione o tipo da transação.')
        }

        // Verifica se a categiria foi selecionada
        if(category.key === 'category') {
            return Alert.alert('Selecione a categoria.')
        }

        const newTransaction = {
            id: String(uuid.v4()),
            name: form.name,
            amount: form.amount,
            type: transactionType,
            category: category.key,
            date: new Date()
        }

        // Tenta armazenar no Asyncstorage e caso dê um erro exibe msg de error
        try {
            // Key utilizada no AsyncStorage
            const dataKey = `@gofinances:transactions_user:${user.id}`;

            // Retorna todas as transações.
            const data = await AsyncStorage.getItem(dataKey);

            // Verifica se existe alguma transação já armazenada.
            const currentData =  data ? JSON.parse(data) : [];

            // Junsta as transações já gravadas com a nova.
            const dataFormatted = [
                ...currentData,
                newTransaction
            ];

            // Await -> aguarda a tarefa ser concluída para continuar
            // Passa a datakey e transforma o data em um JSON do tipo string
            // Armaneza um item no AsyncStorage
            await AsyncStorage.setItem(dataKey, JSON.stringify(dataFormatted));

            // Reseta os campos do formulário
            reset();

            // Resetando o campo Tipo da Transação para vazio
            setTransactionType('');

            // Resetando o campo Categoria para o valor inicial
            setCategory({
                key: 'category',
                name: 'Categoria'
            });

            // Retornando para a página Listagem
            navigation.navigate('Listagem');
            
        } catch (error) {

            // Exibe msg no console.
            console.log(error);

            // Exibe msg para o usuário.
            Alert.alert("Não foi possível salvar a informação.");
            
        }
    }

    // Carrega as informações sempre que o app for atualizado
    // useEffect(() => {
    //     async function loadData(){
    //         try {
    //             // Recupera a informação no AsyncStorage
    //             const data = await AsyncStorage.getItem(dataKey);
    //             // Colocando a ! estamos dizendo ao typescript q o data nunca será nulo
    //             console.log(JSON.parse(data!));  
    //         } catch (error) {
    //             console.log(error);  
    //         }
    //     }
    //     loadData();

        //Removendo as transações do AsyncStorage
    //     async function removeAll() {
    //         const dataKey = '@gofinances:transactions';
    //         await AsyncStorage.removeItem(dataKey);
    //     }

    //     removeAll();

    // },[]);

    return (
        // Fecha o teclado ao clicar em qualquer área da tela
        <TouchableWithoutFeedback
           onPress={Keyboard.dismiss} 
        >
            <Container>
                <Header>
                    <Title>Cadastro</Title>
                </Header>

                <Form>
                    <Fields>
                        <InputForm 
                            name="name"
                            control={control} //Assinatura q identifica que o input é do mesmo formulário
                            placeholder="Nome"
                            autoCapitalize="sentences" //Primeira letra em maiúsculo
                            autoCorrect={false} // N tenta corrigir o texto
                            error={errors.name && errors.name.message}
                            // onChangeText={ name => setName(name) } //Alterando estado
                        />

                        <InputForm 
                            name="amount"
                            control={control} //Assinatura q identifica que o input é do mesmo formulário
                            placeholder="Preço"
                            keyboardType="numeric" // Abre apenas o teclado númerico
                            error={errors.amount && errors.amount.message}
                            // onChangeText={ amount => setAmount(amount) } //Alterando estado
                        />

                        <TransactionsTypes>
                            <TransactionTypeButton 
                                type="up"
                                title="Income" 
                                onPress={() => handleTransactionTypeSelect('positive')}
                                isActive={transactionType === 'positive'}                   
                            />

                            <TransactionTypeButton 
                                type="down"
                                title="Outcome"  
                                onPress={() => handleTransactionTypeSelect('negative')}
                                isActive={transactionType === 'negative'}                           
                            />
                        </TransactionsTypes>

                        <CategorySelectButton 
                            title={category.name}
                            onPress={handleOpensSelectCategoryModal}
                        />
                    </Fields>

                    <Button 
                        title="Enviar"
                        onPress={handleSubmit(handleRegister)}
                    />

                </Form>

                <Modal visible={categoryModalOpen}>
                    <CategorySelect
                        category={category}
                        setCategory={setCategory}
                        closeSelectCategory={handleCloseSelectCategoryModal}
                    />
                </Modal>
            </Container>
        </TouchableWithoutFeedback>
    );
}