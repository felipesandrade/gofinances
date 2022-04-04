import React, { 
    createContext, 
    ReactNode, 
    useContext,
    useState,
    useEffect,
} from 'react';

const { CLIENT_ID } = process.env;

const { REDIRECT_URI } = process.env;

import * as AuthSession from 'expo-auth-session';

import * as AppleAuthenticantion from 'expo-apple-authentication';

import * as SecureStore from 'expo-secure-store';

import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthProviderProps {
    children: ReactNode;
}

interface User {
    id: string;
    name: string;
    email: string;
    photo?: string;
}

interface IAuthContextData {
    user: User;
    signInWithGoogle(): Promise<void>;
    signInWithApple(): Promise<void>;
    signOut(): Promise<void>;
    userStorageLoading: boolean;
}

interface AuthorizationResponse {
    params: {
        access_token: string;
    },
    type: string;
}

//Criando nosso contexto, inciando como vazio.
const AuthContext = createContext({} as IAuthContextData);

function AuthProvider({ children }: AuthProviderProps){
    const [ user , setUser ] = useState<User>({} as User);
    const [ userStorageLoading, setUserStorageLoading] = useState(true);

    const userStorageKey = '@gofinances:user';

    async function save(key: any, value: any) {
       await SecureStore.setItemAsync(key, value);
    }

    // Autenticação com Google
    async function signInWithGoogle() {
        try {
            // O que esperamos de retorno
            const RESPONSE_TYPE = 'token';
            // O que queremos acessar do usuário
            const SCOPE = encodeURI('profile email');

            const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`;

            const { type, params } = await AuthSession
                .startAsync({ authUrl }) as AuthorizationResponse;
            
            // Se o precesso de autenticação ocorreu com sucesso.
            if(type === 'success') {
                // Acessar o endpoint (endereço) passando o token como parametro para consumir as informações do usuário.
                const response = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${params.access_token}`);
                const userInfo = await response.json();

                const userLogged = {
                    id: String(userInfo.user),
                    name: userInfo.given_name!,
                    email: userInfo.email!,
                    photo: userInfo.picture!,
                }

                setUser(userLogged);

                await AsyncStorage.setItem(userStorageKey, JSON.stringify(userLogged));

                // console.log(userLogged);
            }
            
        } catch (error: any) {
            throw new Error(error);
        }
    }

    async function signInWithApple(){
        try {
            const credential = await AppleAuthenticantion.signInAsync({
                requestedScopes: [
                    AppleAuthenticantion.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthenticantion.AppleAuthenticationScope.EMAIL,
                ],
            });
            
            if(!credential.user) {
                await save(credential.user, credential.fullName!.givenName!);
            }

            const userName = await SecureStore.getItemAsync(credential.user);

            if(credential){
                // const name = credential.fullName!.givenName!;
                const name = userName!;
                const photo = `https://ui-avatars.com/api/?name=${name}&length=1`;
                const userLogged = {
                    id: String(credential.user),
                    name,
                    email: credential.email!,
                    photo
                };

                setUser(userLogged);

                await AsyncStorage.setItem(userStorageKey, JSON.stringify(userLogged));

            }
            
        } catch (error: any) {
            throw new Error(error);        
        }
    }

    async function signOut() {
        setUser({} as User);

        await AsyncStorage.removeItem(userStorageKey);
    }

    useEffect(() => {
        async function loadUserStorageData() {
            const userStoragged = await AsyncStorage.getItem(userStorageKey);

            if(userStoragged) {
                const userLogged = JSON.parse(userStoragged) as User;
                setUser(userLogged);
            }

            setUserStorageLoading(false);
        }

        loadUserStorageData();
    },[]);

    return(
        <AuthContext.Provider value={{
            user,
            signInWithGoogle,
            signInWithApple,
            signOut,
            userStorageLoading
        }}>
          { children }
        </AuthContext.Provider>
    );
}

//Criando nosso Hook de Contexto
function useAuth(){
    const context = useContext(AuthContext);

    return context;
}

export { AuthProvider, useAuth };