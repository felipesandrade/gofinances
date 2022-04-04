import React , { useCallback, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import AsynStorage from '@react-native-async-storage/async-storage';
import { VictoryPie } from 'victory-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { addMonths, subMonths, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useTheme } from 'styled-components';
import { useAuth } from '../../hooks/auth';

import { useFocusEffect } from '@react-navigation/native';

import { HistoryCard } from '../../components/HistoryCard';

import { 
    Container,
    Header,
    Title, 
    Content,
    ChartContainer,
    MonthSelect,
    MonthSelectButton,
    MonthSelectIcon,
    Month,
    LoadContainer,
} from './styles';

import { categories } from '../../utils/categories';
// import { Category } from '../CategorySelect/styles';

interface TransactionData {
    type: 'positive' | 'negative';
    name: string;
    amount: string;
    category: string;
    date: string;
}

interface CategoryData {
    key: string;
    name: string;
    color: string;
    totalFormatted: string;
    total: number;
    percent: string;
}

export function Resume(){
    const [ isLoading, setIsLoading ] = useState(false); 
    const [ selectedDate, setSelectedDate ] = useState(new Date());
    const [ totalByCategories, setTotalByCategories ] = useState<CategoryData[]>([]);

    const { user } = useAuth();

    const theme = useTheme();

    function handleDateChange(action: 'next' | 'prev') {

        if(action === 'next') {
            const newDate = addMonths(selectedDate, 1);
            setSelectedDate(newDate);
        } else {
            const newDate = subMonths(selectedDate, 1);
            setSelectedDate(newDate);
        }
    }

    async function loadData() {
        setIsLoading(true);
        // Chave que identifica a coleção
        const dataKey = `@gofinances:transactions_user:${user.id}`;

        // Pega as informações armazenadas no dispositvo
        const response = await AsynStorage.getItem(dataKey);
        // Caso existam informações, armazena na constante.
        const responseFormatted = response ? JSON.parse(response) : [];

        // Pegando apenas as transações de saída
        const expensives = responseFormatted
        .filter((expensive: TransactionData) => 
            expensive.type === 'negative' &&
            new Date(expensive.date).getMonth() === selectedDate.getMonth() &&
            new Date(expensive.date).getFullYear() === selectedDate.getFullYear()
            );

        // Somando o valor total de saídas
        const expensivesTotal = expensives
            .reduce((acumullator: number, expensive: TransactionData) => {
                return acumullator += Number(expensive.amount);
        }, 0);

        // Cria um array vazio.
        const totalByCategory: CategoryData[] = [];

        // Percorre a lista de categorias.
        categories.forEach(category => {
            // Inicia a variável com 0
            let categorySum = 0;

            // Percorre a lista de saídas armazenadas no dispositivo, através do
            // AsynStorage.
            expensives.forEach((expensive: TransactionData) => {
                // Se a chave das duas listas forem iguais
                if(expensive.category === category.key) {
                    // Soma o valor da saída referente à categoria
                    categorySum += Number(expensive.amount); 
                }
            });

            // Mostra apenas as categorias com valor
            if(categorySum > 0) {
                // Formatando a soma por categoria
                const categorySumFormatted = categorySum.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                });

                const percent = `${(categorySum / expensivesTotal * 100).toFixed(0)}%`;

                totalByCategory.push({
                    key: category.key,
                    name: category.name,
                    color: category.color,
                    totalFormatted: categorySumFormatted,
                    total: categorySum,
                    percent,
                });
            }
        });

        // Seta as iformações no estado.
        setTotalByCategories(totalByCategory);

        setIsLoading(false);
    } 

    // useEffect(() => {
    //     loadData();
    // } , []);

    useFocusEffect(useCallback(() => {
        loadData();
    }, [selectedDate]));

    return(
        <Container>

                <Header>
                    <Title>Resumo por categoria</Title>
                </Header>

                {
                isLoading ?
                    <LoadContainer>
                        <ActivityIndicator 
                            color={theme.colors.primary}
                            size="large"
                        />
                    </LoadContainer> :

                <Content
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingHorizontal: 24,
                        paddingBottom: useBottomTabBarHeight(),
                    }}
                >

                    <MonthSelect>
                        <MonthSelectButton
                            onPress={() => handleDateChange('prev')}
                        >
                            <MonthSelectIcon name="chevron-left" />
                        </MonthSelectButton>

                            <Month>
                                {format(selectedDate, 'MMMM, yyyy', {locale: ptBR})}
                            </Month>

                        <MonthSelectButton
                            onPress={() => handleDateChange('next')}
                        >
                            <MonthSelectIcon name="chevron-right" />
                        </MonthSelectButton>
                    </MonthSelect>

                    <ChartContainer>
                        <VictoryPie 
                            data={totalByCategories}
                            colorScale={totalByCategories.map(category => category.color)}
                            style={{
                                labels: { 
                                    fontSize: RFValue(16),
                                    fontWeight: 'bold',
                                    fill: theme.colors.shape
                                }
                            }}
                            labelRadius={110}
                            x="percent"
                            y="total"
                        />
                    </ChartContainer>

                    {
                        // Percorre o estado para montar a lista de totais por categoria.
                        totalByCategories.map(item => (
                        <HistoryCard
                            key={item.key}
                            title={item.name}
                            amount={item.totalFormatted}
                            color={item.color}
                        />
                    ))
                    }

                </Content>
            }

        </Container>

    )
}