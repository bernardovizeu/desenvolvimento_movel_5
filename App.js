import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

const API_URL = 'https://open.er-api.com/v6/latest/USD';
const STORAGE_KEY = '@conversor_moedas_favoritas';

// 1. TELA INICIO (DRAWER)
function TelaInicio({ navigation }) {
  return (
    <SafeAreaView style={styles.safeContainer} edges={['bottom', 'left', 'right']}>
      <View style={styles.containerTela}>
        <View style={styles.cardPrincipal}>
          <Text style={styles.tituloPrincipal}>Conversor de Moedas</Text>
          <Text style={styles.subtituloPrincipal}>
            Aplicativo Desenvolvido em React Native
          </Text>

          <View style={styles.divisor} />

          <Text style={styles.secaoTitulo}>Objetivo do Aplicativo:</Text>
          <Text style={styles.textoCorpo}>
            Construir um conversor de moedas completo que consome dados da API
            ExchangeRate-API em tempo real, permite favoritar moedas com
            persistencia local via AsyncStorage e realizar conversoes diretas.
          </Text>

          <Text style={styles.secaoTitulo}>Estrutura de Navegacao:</Text>
          <Text style={styles.textoCorpo}>
            1. Menu Lateral (Drawer Navigation):
          </Text>
          <Text style={styles.textoItem}>- Inicio: Apresentacao do aplicativo</Text>
          <Text style={styles.textoItem}>- Sobre: Informacoes institucionais do projeto</Text>
          <Text style={styles.textoItem}>- Moedas: Central de cotacoes e conversoes</Text>

          <Text style={styles.textoCorpo}>
            2. Abas Inferiores (Bottom Tabs Navigation em Moedas):
          </Text>
          <Text style={styles.textoItem}>- Moedas: Lista de todas as taxas recuperadas da API</Text>
          <Text style={styles.textoItem}>- Favoritas: Apenas as moedas marcadas pelo usuario</Text>
          <Text style={styles.textoItem}>- Converter: Calculadora de conversao entre moedas</Text>

          <View style={styles.divisor} />

          <TouchableOpacity
            style={styles.botaoPrincipal}
            onPress={() => navigation.navigate('Moedas')}
          >
            <Text style={styles.textoBotaoPrincipal}>Acessar Moedas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botaoSecundario}
            onPress={() => navigation.navigate('Sobre')}
          >
            <Text style={styles.textoBotaoSecundario}>Acessar Sobre</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// 2. TELA SOBRE (DRAWER)
function TelaSobre({ navigation }) {
  return (
    <SafeAreaView style={styles.safeContainer} edges={['bottom', 'left', 'right']}>
      <View style={styles.containerTela}>
        <View style={styles.cardPrincipal}>
          <Text style={styles.tituloPrincipal}>Sobre o Aplicativo</Text>
          <Text style={styles.subtituloPrincipal}>
            Informacoes Tecnicas e Autoria
          </Text>

          <View style={styles.divisor} />

          <View style={styles.linhaInfo}>
            <Text style={styles.rotuloInfo}>Nome do App:</Text>
            <Text style={styles.valorInfo}>Conversor de Moedas</Text>
          </View>

          <View style={styles.linhaInfo}>
            <Text style={styles.rotuloInfo}>Versao:</Text>
            <Text style={styles.valorInfo}>1.0.0</Text>
          </View>

          <View style={styles.linhaInfo}>
            <Text style={styles.rotuloInfo}>Disciplina:</Text>
            <Text style={styles.valorInfo}>Desenvolvimento Mobile (React Native)</Text>
          </View>

          <View style={styles.linhaInfo}>
            <Text style={styles.rotuloInfo}>Referencia Didatica:</Text>
            <Text style={styles.valorInfo}>Prof. Victor Vidigal Ribeiro</Text>
          </View>

          <View style={styles.linhaInfo}>
            <Text style={styles.rotuloInfo}>API Utilizada:</Text>
            <Text style={styles.valorInfo}>ExchangeRate-API (open.er-api.com)</Text>
          </View>

          <View style={styles.linhaInfo}>
            <Text style={styles.rotuloInfo}>Persistencia:</Text>
            <Text style={styles.valorInfo}>AsyncStorage (Local)</Text>
          </View>

          <View style={styles.linhaInfo}>
            <Text style={styles.rotuloInfo}>Navegacao:</Text>
            <Text style={styles.valorInfo}>Drawer + Bottom Tabs Integrados</Text>
          </View>

          <View style={styles.linhaInfo}>
            <Text style={styles.rotuloInfo}>Proposito:</Text>
            <Text style={styles.valorInfo}>
              Aplicacao academica desenvolvida para exercitar consumo de API REST,
              gerenciamento de estado e navegacao aninhada.
            </Text>
          </View>

          <View style={styles.divisor} />

          <TouchableOpacity
            style={styles.botaoPrincipal}
            onPress={() => navigation.navigate('Início')}
          >
            <Text style={styles.textoBotaoPrincipal}>Voltar para o Inicio</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// 3. TELA MOEDAS (BOTTOM TAB 1)
function TelaMoedas({
  moedas,
  favoritas,
  alternarFavorita,
  carregando,
  erro,
  carregarCotacoes,
}) {
  const [busca, setBusca] = useState('');

  const moedasFiltradas = moedas.filter((item) =>
    item.codigo.toLowerCase().includes(busca.trim().toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeContainer} edges={['bottom', 'left', 'right']}>
      <View style={styles.containerTela}>
        <View style={styles.cabecalhoSecao}>
          <Text style={styles.tituloSecao}>Listagem de Moedas</Text>
          <Text style={styles.subtituloSecao}>
            Cotacoes recuperadas da API (Base: USD)
          </Text>
        </View>

        <View style={styles.boxBusca}>
          <Text style={styles.rotuloBusca}>Filtrar Moeda:</Text>
          <TextInput
            style={styles.inputBusca}
            placeholder="Digite o codigo (ex: BRL, EUR, JPY)..."
            value={busca}
            onChangeText={setBusca}
            autoCapitalize="characters"
          />
        </View>

        {carregando ? (
          <View style={styles.boxCentro}>
            <ActivityIndicator size="large" color="#0044aa" />
            <Text style={styles.textoCarregando}>Carregando taxas da API...</Text>
          </View>
        ) : erro ? (
          <View style={styles.boxCentro}>
            <Text style={styles.textoErro}>{erro}</Text>
            <TouchableOpacity
              style={styles.botaoRecarregar}
              onPress={carregarCotacoes}
            >
              <Text style={styles.textoBotaoRecarregar}>Recarregar Cotacoes</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={moedasFiltradas}
            keyExtractor={(item) => item.codigo}
            renderItem={({ item }) => {
              const ehFavorita = favoritas.includes(item.codigo);
              return (
                <View style={styles.itemMoeda}>
                  <View style={styles.infoMoeda}>
                    <Text style={styles.codigoMoeda}>{item.codigo}</Text>
                    <Text style={styles.taxaMoeda}>
                      Taxa: {item.taxa} USD
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={ehFavorita ? styles.botaoRemover : styles.botaoFavoritar}
                    onPress={() => alternarFavorita(item.codigo)}
                  >
                    <Text
                      style={
                        ehFavorita
                          ? styles.textoBotaoRemover
                          : styles.textoBotaoFavoritar
                      }
                    >
                      {ehFavorita ? '[Remover]' : '[Favoritar]'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            }}
            ItemSeparatorComponent={() => <View style={styles.divisorLista} />}
            ListEmptyComponent={() => (
              <View style={styles.boxVazio}>
                <Text style={styles.textoVazio}>
                  Nenhuma moeda encontrada para o filtro informado.
                </Text>
              </View>
            )}
            contentContainerStyle={styles.listaConteudo}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

// 4. TELA FAVORITAS (BOTTOM TAB 2)
function TelaFavoritas({ moedas, favoritas, alternarFavorita }) {
  const moedasFavoritas = moedas.filter((item) => favoritas.includes(item.codigo));

  return (
    <SafeAreaView style={styles.safeContainer} edges={['bottom', 'left', 'right']}>
      <View style={styles.containerTela}>
        <View style={styles.cabecalhoSecao}>
          <Text style={styles.tituloSecao}>Moedas Favoritas</Text>
          <Text style={styles.subtituloSecao}>
            Moedas salvas no AsyncStorage ({favoritas.length})
          </Text>
        </View>

        <FlatList
          data={moedasFavoritas}
          keyExtractor={(item) => item.codigo}
          renderItem={({ item }) => (
            <View style={styles.itemMoeda}>
              <View style={styles.infoMoeda}>
                <Text style={styles.codigoMoeda}>{item.codigo}</Text>
                <Text style={styles.taxaMoeda}>
                  Taxa: {item.taxa} USD
                </Text>
              </View>
              <TouchableOpacity
                style={styles.botaoRemover}
                onPress={() => alternarFavorita(item.codigo)}
              >
                <Text style={styles.textoBotaoRemover}>[Remover]</Text>
              </TouchableOpacity>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={styles.divisorLista} />}
          ListEmptyComponent={() => (
            <View style={styles.boxVazio}>
              <Text style={styles.textoVazio}>
                Nenhuma moeda definida como favorita.
              </Text>
              <Text style={styles.textoVazioSecundario}>
                Acesse a aba Moedas e toque em [Favoritar] para salvar moedas aqui.
              </Text>
            </View>
          )}
          contentContainerStyle={styles.listaConteudo}
        />
      </View>
    </SafeAreaView>
  );
}

// 5. TELA CONVERTER (BOTTOM TAB 3)
function TelaConverter({ taxasMap }) {
  const [moedaOrigem, setMoedaOrigem] = useState('USD');
  const [moedaDestino, setMoedaDestino] = useState('BRL');
  const [valorInput, setValorInput] = useState('100');
  const [resultado, setResultado] = useState(null);
  const [mensagemErro, setMensagemErro] = useState('');

  const converter = () => {
    setMensagemErro('');
    setResultado(null);

    const origem = moedaOrigem.trim().toUpperCase();
    const destino = moedaDestino.trim().toUpperCase();
    const valorNumerico = parseFloat(valorInput.replace(',', '.'));

    if (!origem || !destino) {
      setMensagemErro('Preencha os campos Moeda Origem e Moeda Destino.');
      return;
    }

    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      setMensagemErro('Informe um valor numerico valido maior que zero.');
      return;
    }

    if (!taxasMap || Object.keys(taxasMap).length === 0) {
      setMensagemErro('As cotacoes ainda nao foram carregadas da API.');
      return;
    }

    if (!taxasMap[origem]) {
      setMensagemErro('Moeda de Origem "' + origem + '" nao encontrada na API.');
      return;
    }

    if (!taxasMap[destino]) {
      setMensagemErro('Moeda de Destino "' + destino + '" nao encontrada na API.');
      return;
    }

    const taxaOrigem = taxasMap[origem];
    const taxaDestino = taxasMap[destino];
    const taxaConversao = taxaDestino / taxaOrigem;
    const valorConvertido = valorNumerico * taxaConversao;

    setResultado({
      valorOrigem: valorNumerico,
      moedaOrigem: origem,
      valorDestino: valorConvertido,
      moedaDestino: destino,
      taxaConversao: taxaConversao,
    });
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={['bottom', 'left', 'right']}>
      <View style={styles.containerTela}>
        <View style={styles.cabecalhoSecao}>
          <Text style={styles.tituloSecao}>Conversor de Moedas</Text>
          <Text style={styles.subtituloSecao}>
            Calcule a conversao direta entre duas moedas
          </Text>
        </View>

        <View style={styles.cardFormulario}>
          <Text style={styles.rotuloCampo}>Moeda Origem:</Text>
          <TextInput
            style={styles.inputForm}
            value={moedaOrigem}
            onChangeText={setMoedaOrigem}
            placeholder="Ex: USD"
            autoCapitalize="characters"
            maxLength={5}
          />

          <Text style={styles.rotuloCampo}>Moeda Destino:</Text>
          <TextInput
            style={styles.inputForm}
            value={moedaDestino}
            onChangeText={setMoedaDestino}
            placeholder="Ex: BRL"
            autoCapitalize="characters"
            maxLength={5}
          />

          <Text style={styles.rotuloCampo}>Valor a ser convertido:</Text>
          <TextInput
            style={styles.inputForm}
            value={valorInput}
            onChangeText={setValorInput}
            placeholder="Ex: 100"
            keyboardType="numeric"
          />

          <View style={styles.linhaBotoesRapidos}>
            <TouchableOpacity
              style={styles.botaoAtalho}
              onPress={() => {
                setMoedaOrigem('USD');
                setMoedaDestino('BRL');
              }}
            >
              <Text style={styles.textoBotaoAtalho}>USD para BRL</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botaoAtalho}
              onPress={() => {
                setMoedaOrigem('EUR');
                setMoedaDestino('BRL');
              }}
            >
              <Text style={styles.textoBotaoAtalho}>EUR para BRL</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botaoAtalho}
              onPress={() => {
                setMoedaOrigem('BRL');
                setMoedaDestino('USD');
              }}
            >
              <Text style={styles.textoBotaoAtalho}>BRL para USD</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.botaoConverter} onPress={converter}>
            <Text style={styles.textoBotaoConverter}>Converter</Text>
          </TouchableOpacity>
        </View>

        {mensagemErro ? (
          <View style={styles.boxErroConversao}>
            <Text style={styles.textoErro}>{mensagemErro}</Text>
          </View>
        ) : null}

        {resultado ? (
          <View style={styles.cardResultado}>
            <Text style={styles.tituloResultado}>Resultado da Conversao:</Text>
            <View style={styles.divisor} />
            <View style={styles.linhaResultado}>
              <Text style={styles.rotuloResultado}>Valor Origem:</Text>
              <Text style={styles.valorResultado}>
                {resultado.valorOrigem.toFixed(2)} {resultado.moedaOrigem}
              </Text>
            </View>
            <View style={styles.linhaResultado}>
              <Text style={styles.rotuloResultado}>Valor Destino:</Text>
              <Text style={styles.valorResultado}>
                {resultado.valorDestino.toFixed(4)} {resultado.moedaDestino}
              </Text>
            </View>
            <View style={styles.linhaResultado}>
              <Text style={styles.rotuloResultado}>Taxa de Conversao:</Text>
              <Text style={styles.valorResultado}>
                1 {resultado.moedaOrigem} = {resultado.taxaConversao.toFixed(6)}{' '}
                {resultado.moedaDestino}
              </Text>
            </View>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

// 6. NAVEGADOR DE ABAS (BOTTOM TABS)
function AbasMoedas() {
  const [moedas, setMoedas] = useState([]);
  const [taxasMap, setTaxasMap] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [favoritas, setFavoritas] = useState([]);

  const carregarCotacoes = () => {
    setCarregando(true);
    setErro(null);

    fetch(API_URL)
      .then((resposta) => resposta.json())
      .then((dados) => {
        if (dados && dados.rates) {
          setTaxasMap(dados.rates);
          const lista = Object.keys(dados.rates).map((codigo) => ({
            codigo: codigo,
            taxa: dados.rates[codigo],
          }));
          setMoedas(lista);
        } else {
          setErro('Formato de resposta inesperado da API.');
        }
      })
      .catch((err) => {
        setErro('Falha de conexao com a API: ' + err.message);
      })
      .finally(() => {
        setCarregando(false);
      });
  };

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((salvo) => {
        if (salvo !== null) {
          setFavoritas(JSON.parse(salvo));
        }
      })
      .catch((err) => {
        console.log('Erro ao ler AsyncStorage:', err);
      });

    carregarCotacoes();
  }, []);

  const salvarFavoritas = (novaLista) => {
    setFavoritas(novaLista);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(novaLista)).catch((err) => {
      console.log('Erro ao salvar no AsyncStorage:', err);
    });
  };

  const alternarFavorita = (codigo) => {
    if (favoritas.includes(codigo)) {
      salvarFavoritas(favoritas.filter((c) => c !== codigo));
    } else {
      salvarFavoritas([...favoritas, codigo]);
    }
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0044aa',
        tabBarInactiveTintColor: '#666666',
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: 'bold',
        },
        tabBarIconStyle: {
          display: 'none',
        },
        tabBarStyle: {
          height: 52,
          backgroundColor: '#f0f0f0',
          borderTopWidth: 1,
          borderTopColor: '#cccccc',
          paddingBottom: 4,
        },
      }}
    >
      <Tab.Screen name="MoedasTab" options={{ tabBarLabel: 'Moedas' }}>
        {(props) => (
          <TelaMoedas
            {...props}
            moedas={moedas}
            favoritas={favoritas}
            alternarFavorita={alternarFavorita}
            carregando={carregando}
            erro={erro}
            carregarCotacoes={carregarCotacoes}
          />
        )}
      </Tab.Screen>

      <Tab.Screen name="FavoritasTab" options={{ tabBarLabel: 'Favoritas' }}>
        {(props) => (
          <TelaFavoritas
            {...props}
            moedas={moedas}
            favoritas={favoritas}
            alternarFavorita={alternarFavorita}
          />
        )}
      </Tab.Screen>

      <Tab.Screen name="ConverterTab" options={{ tabBarLabel: 'Converter' }}>
        {(props) => (
          <TelaConverter
            {...props}
            taxasMap={taxasMap}
            moedas={moedas}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

// 7. COMPONENTE PRINCIPAL (DRAWER)
export default function App() {
  return (
    <SafeAreaProvider style={styles.containerApp}>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Drawer.Navigator
          initialRouteName="Início"
          screenOptions={{
            headerTitleAlign: 'center',
            drawerActiveTintColor: '#0044aa',
            drawerInactiveTintColor: '#333333',
            drawerStyle: {
              width: 240,
              backgroundColor: '#f7f7f7',
            },
            headerStyle: {
              backgroundColor: '#eaeaea',
              borderBottomWidth: 1,
              borderBottomColor: '#cccccc',
            },
            headerTitleStyle: {
              fontWeight: 'bold',
              color: '#222222',
            },
          }}
        >
          <Drawer.Screen
            name="Início"
            component={TelaInicio}
            options={{ title: 'Início' }}
          />
          <Drawer.Screen
            name="Sobre"
            component={TelaSobre}
            options={{ title: 'Sobre' }}
          />
          <Drawer.Screen
            name="Moedas"
            component={AbasMoedas}
            options={{ title: 'Moedas' }}
          />
        </Drawer.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

// 8. ESTILOS (STYLESHEET)
const styles = StyleSheet.create({
  containerApp: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  safeContainer: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  containerTela: {
    flex: 1,
    padding: 12,
  },
  cardPrincipal: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cccccc',
    padding: 16,
  },
  tituloPrincipal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111111',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtituloPrincipal: {
    fontSize: 13,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 10,
  },
  divisor: {
    height: 1,
    backgroundColor: '#dddddd',
    marginVertical: 10,
  },
  secaoTitulo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#222222',
    marginTop: 8,
    marginBottom: 4,
  },
  textoCorpo: {
    fontSize: 13,
    color: '#444444',
    lineHeight: 18,
    marginBottom: 6,
  },
  textoItem: {
    fontSize: 12,
    color: '#555555',
    marginLeft: 10,
    marginBottom: 3,
  },
  botaoPrincipal: {
    backgroundColor: '#0044aa',
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#003388',
  },
  textoBotaoPrincipal: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  botaoSecundario: {
    backgroundColor: '#eeeeee',
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#999999',
  },
  textoBotaoSecundario: {
    color: '#333333',
    fontWeight: 'bold',
    fontSize: 13,
  },
  linhaInfo: {
    flexDirection: 'row',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  rotuloInfo: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#222222',
    width: 140,
  },
  valorInfo: {
    fontSize: 13,
    color: '#444444',
    flex: 1,
  },
  cabecalhoSecao: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cccccc',
    padding: 10,
    marginBottom: 10,
  },
  tituloSecao: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111111',
  },
  subtituloSecao: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  boxBusca: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cccccc',
    padding: 10,
    marginBottom: 10,
  },
  rotuloBusca: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  inputBusca: {
    borderWidth: 1,
    borderColor: '#aaaaaa',
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 13,
  },
  boxCentro: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  textoCarregando: {
    marginTop: 10,
    fontSize: 14,
    color: '#444444',
  },
  textoErro: {
    fontSize: 13,
    color: '#aa0000',
    textAlign: 'center',
    marginBottom: 10,
  },
  botaoRecarregar: {
    backgroundColor: '#0044aa',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#003388',
  },
  textoBotaoRecarregar: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  itemMoeda: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cccccc',
    padding: 10,
  },
  infoMoeda: {
    flex: 1,
  },
  codigoMoeda: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111111',
  },
  taxaMoeda: {
    fontSize: 12,
    color: '#555555',
    marginTop: 2,
  },
  botaoFavoritar: {
    backgroundColor: '#f0f4ff',
    borderWidth: 1,
    borderColor: '#0044aa',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  textoBotaoFavoritar: {
    color: '#0044aa',
    fontWeight: 'bold',
    fontSize: 12,
  },
  botaoRemover: {
    backgroundColor: '#fff0f0',
    borderWidth: 1,
    borderColor: '#aa2222',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  textoBotaoRemover: {
    color: '#aa2222',
    fontWeight: 'bold',
    fontSize: 12,
  },
  divisorLista: {
    height: 6,
  },
  listaConteudo: {
    paddingBottom: 10,
  },
  boxVazio: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cccccc',
    padding: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  textoVazio: {
    fontSize: 13,
    color: '#666666',
    textAlign: 'center',
  },
  textoVazioSecundario: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
    marginTop: 6,
  },
  cardFormulario: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cccccc',
    padding: 12,
    marginBottom: 10,
  },
  rotuloCampo: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 6,
    marginBottom: 4,
  },
  inputForm: {
    borderWidth: 1,
    borderColor: '#aaaaaa',
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 13,
  },
  linhaBotoesRapidos: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 10,
  },
  botaoAtalho: {
    backgroundColor: '#eeeeee',
    borderWidth: 1,
    borderColor: '#aaaaaa',
    paddingVertical: 5,
    paddingHorizontal: 6,
    flex: 1,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  textoBotaoAtalho: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333333',
  },
  botaoConverter: {
    backgroundColor: '#0044aa',
    borderWidth: 1,
    borderColor: '#003388',
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  textoBotaoConverter: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  boxErroConversao: {
    backgroundColor: '#fff0f0',
    borderWidth: 1,
    borderColor: '#aa2222',
    padding: 10,
    marginBottom: 10,
  },
  cardResultado: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cccccc',
    padding: 12,
  },
  tituloResultado: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111111',
    marginBottom: 4,
  },
  linhaResultado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  rotuloResultado: {
    fontSize: 13,
    color: '#444444',
  },
  valorResultado: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0044aa',
  },
});
