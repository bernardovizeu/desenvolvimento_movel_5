import 'react-native-gesture-handler';
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Modal,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

const EXCHANGERATE_API_KEY = '';
const API_URL = EXCHANGERATE_API_KEY
  ? `https://v6.exchangerate-api.com/v6/${EXCHANGERATE_API_KEY}/latest/USD`
  : 'https://open.er-api.com/v6/latest/USD';

const STORAGE_KEY = '@conversor_moedas_favoritas';

const NOMES_MOEDAS = {
  BRL: 'Real Brasileiro',
  USD: 'Dolar Americano',
  EUR: 'Euro',
  GBP: 'Libra Esterlina',
  JPY: 'Iene Japones',
  CAD: 'Dolar Canadense',
  AUD: 'Dolar Australiano',
  CHF: 'Franco Suico',
  CNY: 'Yuan Chines',
  ARS: 'Peso Argentino',
  CLP: 'Peso Chileno',
  COP: 'Peso Colombiano',
  MXN: 'Peso Mexicano',
  PEN: 'Sol Peruano',
  UYU: 'Peso Uruguaio',
  INR: 'Rupia Indiana',
  KRW: 'Won Sul-Coreano',
  RUB: 'Rublo Russo',
  TRY: 'Lira Turca',
  ZAR: 'Rand Sul-Africano',
  SEK: 'Coroa Sueca',
  NOK: 'Coroa Norueguesa',
  DKK: 'Coroa Dinamarquesa',
  NZD: 'Dolar Neozelandes',
  SGD: 'Dolar de Cingapura',
  HKD: 'Dolar de Hong Kong',
};

function obterDescricaoMoeda(codigo) {
  if (!codigo) return '';
  const chave = codigo.toUpperCase();
  return NOMES_MOEDAS[chave] || '';
}

function DropdownMoeda({
  rotulo,
  valorSelecionado,
  aoSelecionar,
  opcoes = [],
  desabilitado = false,
}) {
  const [modalAberto, setModalAberto] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');

  const descricao = obterDescricaoMoeda(valorSelecionado);

  const opcoesFiltradas = useMemo(() => {
    const termo = termoBusca.trim().toLowerCase();
    if (!termo) return opcoes;
    return opcoes.filter((item) => {
      const codigo = (item.codigo || '').toLowerCase();
      const nome = (NOMES_MOEDAS[item.codigo] || '').toLowerCase();
      return codigo.includes(termo) || nome.includes(termo);
    });
  }, [opcoes, termoBusca]);

  const fecharModal = () => {
    setModalAberto(false);
    setTermoBusca('');
  };

  const selecionarMoeda = (codigo) => {
    aoSelecionar(codigo);
    fecharModal();
  };

  return (
    <View style={styles.dropdownContainer}>
      <Text style={styles.rotuloCampo}>{rotulo}</Text>
      <TouchableOpacity
        style={[styles.dropdownGatilho, desabilitado && styles.dropdownDesabilitado]}
        onPress={() => !desabilitado && setModalAberto(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.dropdownTextoPrincipal}>
          {valorSelecionado ? valorSelecionado : 'Selecione'}
          {descricao ? ` - ${descricao}` : ''}
        </Text>
        <Text style={styles.dropdownTextoSeta}>v</Text>
      </TouchableOpacity>

      <Modal
        visible={modalAberto}
        animationType="none"
        transparent={true}
        onRequestClose={fecharModal}
      >
        <View style={styles.modalFundo}>
          <View style={styles.modalCard}>
            <View style={styles.modalCabecalho}>
              <Text style={styles.modalTitulo}>{rotulo}</Text>
              <TouchableOpacity
                style={styles.modalBotaoFechar}
                onPress={fecharModal}
              >
                <Text style={styles.modalTextoFechar}>Fechar</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.boxBuscaModal}>
              <TextInput
                style={styles.inputBusca}
                placeholder="Filtrar moeda por codigo ou nome..."
                value={termoBusca}
                onChangeText={setTermoBusca}
                autoCapitalize="characters"
              />
            </View>

            <FlatList
              data={opcoesFiltradas}
              keyExtractor={(item) => item.codigo}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={20}
              maxToRenderPerBatch={25}
              renderItem={({ item }) => {
                const nome = NOMES_MOEDAS[item.codigo];
                const selecionado = item.codigo === valorSelecionado;
                return (
                  <TouchableOpacity
                    style={[
                      styles.modalItemMoeda,
                      selecionado && styles.modalItemMoedaSelecionado,
                    ]}
                    onPress={() => selecionarMoeda(item.codigo)}
                  >
                    <View style={styles.modalItemInfo}>
                      <Text
                        style={[
                          styles.modalItemCodigo,
                          selecionado && styles.modalItemCodigoSelecionado,
                        ]}
                      >
                        {item.codigo}
                      </Text>
                      {nome ? (
                        <Text style={styles.modalItemNome}> - {nome}</Text>
                      ) : null}
                    </View>
                    {selecionado ? (
                      <Text style={styles.modalItemCheck}>[Selecionada]</Text>
                    ) : item.taxa ? (
                      <Text style={styles.modalItemTaxa}>
                        {typeof item.taxa === 'number'
                          ? item.taxa.toFixed(4)
                          : item.taxa}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
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
          </View>
        </View>
      </Modal>
    </View>
  );
}

function TelaInicio({ navigation }) {
  return (
    <SafeAreaView style={styles.safeContainer} edges={['bottom', 'left', 'right']}>
      <View style={styles.containerTela}>
        <View style={styles.cardPrincipal}>
          <Text style={styles.tituloPrincipal}>Conversor de Moedas</Text>
          <Text style={styles.subtituloPrincipal}>
            Cotacoes e Conversoes
          </Text>

          <View style={styles.divisor} />

          <Text style={styles.textoCorpo}>
            Aplicativo para consulta de cotacoes em tempo real e realizacao de conversoes diretas entre diferentes moedas.
          </Text>

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

function TelaSobre({ navigation }) {
  return (
    <SafeAreaView style={styles.safeContainer} edges={['bottom', 'left', 'right']}>
      <View style={styles.containerTela}>
        <View style={styles.cardPrincipal}>
          <Text style={styles.tituloPrincipal}>Sobre</Text>
          <Text style={styles.subtituloPrincipal}>
            Informacoes Gerais
          </Text>

          <View style={styles.divisor} />

          <View style={styles.linhaInfo}>
            <Text style={styles.rotuloInfo}>Aplicativo:</Text>
            <Text style={styles.valorInfo}>Conversor de Moedas</Text>
          </View>

          <View style={styles.linhaInfo}>
            <Text style={styles.rotuloInfo}>Versao:</Text>
            <Text style={styles.valorInfo}>1.0.0</Text>
          </View>

          <View style={styles.linhaInfo}>
            <Text style={styles.rotuloInfo}>Descricao:</Text>
            <Text style={styles.valorInfo}>
              Ferramenta simples para acompanhamento de taxas de cambio e calculo de conversao entre moedas.
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

function TelaMoedas({
  moedas,
  favoritas,
  alternarFavorita,
  carregando,
  erro,
  carregarCotacoes,
}) {
  const [busca, setBusca] = useState('');

  const moedasFiltradas = moedas.filter((item) => {
    const termo = busca.trim().toLowerCase();
    const nome = (NOMES_MOEDAS[item.codigo] || '').toLowerCase();
    return (
      item.codigo.toLowerCase().includes(termo) ||
      nome.includes(termo)
    );
  });

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
            placeholder="Digite o codigo ou nome (ex: BRL, EUR, USD)..."
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
              const nome = NOMES_MOEDAS[item.codigo];
              return (
                <View style={styles.itemMoeda}>
                  <View style={styles.infoMoeda}>
                    <Text style={styles.codigoMoeda}>
                      {item.codigo}
                      {nome ? ` - ${nome}` : ''}
                    </Text>
                    <Text style={styles.taxaMoeda}>
                      1 USD = {item.taxa} {item.codigo}
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
          renderItem={({ item }) => {
            const nome = NOMES_MOEDAS[item.codigo];
            return (
              <View style={styles.itemMoeda}>
                <View style={styles.infoMoeda}>
                  <Text style={styles.codigoMoeda}>
                    {item.codigo}
                    {nome ? ` - ${nome}` : ''}
                  </Text>
                  <Text style={styles.taxaMoeda}>
                    1 USD = {item.taxa} {item.codigo}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.botaoRemover}
                  onPress={() => alternarFavorita(item.codigo)}
                >
                  <Text style={styles.textoBotaoRemover}>[Remover]</Text>
                </TouchableOpacity>
              </View>
            );
          }}
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

function TelaConverter({ taxasMap, moedas = [], carregando }) {
  const [moedaOrigem, setMoedaOrigem] = useState('USD');
  const [moedaDestino, setMoedaDestino] = useState('BRL');
  const [valorInput, setValorInput] = useState('100');
  const [resultado, setResultado] = useState(null);
  const [mensagemErro, setMensagemErro] = useState('');

  const listaOpcoes = useMemo(() => {
    if (moedas && moedas.length > 0) {
      return moedas;
    }
    const codigosPadrao = [
      'USD', 'BRL', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF',
      'CNY', 'ARS', 'CLP', 'COP', 'MXN', 'INR', 'KRW', 'RUB',
    ];
    return codigosPadrao.map((c) => ({
      codigo: c,
      taxa: taxasMap && taxasMap[c] ? taxasMap[c] : null,
    }));
  }, [moedas, taxasMap]);

  const inverterMoedas = () => {
    const temp = moedaOrigem;
    setMoedaOrigem(moedaDestino);
    setMoedaDestino(temp);
    setResultado(null);
  };

  const converter = () => {
    setMensagemErro('');
    setResultado(null);

    const origem = moedaOrigem ? moedaOrigem.trim().toUpperCase() : '';
    const destino = moedaDestino ? moedaDestino.trim().toUpperCase() : '';
    const valorNumerico = parseFloat(valorInput.replace(',', '.'));

    if (!origem || !destino) {
      setMensagemErro('Selecione as moedas de Origem e Destino.');
      return;
    }

    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      setMensagemErro('Informe um valor numerico valido maior que zero.');
      return;
    }

    if (!taxasMap || Object.keys(taxasMap).length === 0) {
      setMensagemErro('As cotacoes da API ainda nao foram carregadas.');
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
    const taxaReversa = taxaOrigem / taxaDestino;
    const valorConvertido = valorNumerico * taxaConversao;

    setResultado({
      valorOrigem: valorNumerico,
      moedaOrigem: origem,
      valorDestino: valorConvertido,
      moedaDestino: destino,
      taxaConversao: taxaConversao,
      taxaReversa: taxaReversa,
    });
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={['bottom', 'left', 'right']}>
      <View style={styles.containerTela}>
        <View style={styles.cabecalhoSecao}>
          <Text style={styles.tituloSecao}>Conversor de Moedas</Text>
          <Text style={styles.subtituloSecao}>
            Selecione as moedas no menu e calcule a conversao
          </Text>
        </View>

        <View style={styles.cardFormulario}>
          <DropdownMoeda
            rotulo="Moeda de Origem:"
            valorSelecionado={moedaOrigem}
            aoSelecionar={(codigo) => {
              setMoedaOrigem(codigo);
              setResultado(null);
            }}
            opcoes={listaOpcoes}
            desabilitado={carregando}
          />

          <View style={styles.linhaInverter}>
            <TouchableOpacity
              style={styles.botaoInverter}
              onPress={inverterMoedas}
              activeOpacity={0.7}
            >
              <Text style={styles.textoBotaoInverter}>Inverter Moedas</Text>
            </TouchableOpacity>
          </View>

          <DropdownMoeda
            rotulo="Moeda de Destino:"
            valorSelecionado={moedaDestino}
            aoSelecionar={(codigo) => {
              setMoedaDestino(codigo);
              setResultado(null);
            }}
            opcoes={listaOpcoes}
            desabilitado={carregando}
          />

          <Text style={styles.rotuloCampo}>Valor a ser convertido:</Text>
          <TextInput
            style={styles.inputForm}
            value={valorInput}
            onChangeText={(texto) => {
              setValorInput(texto);
              setResultado(null);
            }}
            placeholder="Ex: 100"
            keyboardType="numeric"
          />

          <View style={styles.linhaBotoesRapidos}>
            <TouchableOpacity
              style={styles.botaoAtalho}
              onPress={() => {
                setMoedaOrigem('USD');
                setMoedaDestino('BRL');
                setResultado(null);
              }}
            >
              <Text style={styles.textoBotaoAtalho}>USD para BRL</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botaoAtalho}
              onPress={() => {
                setMoedaOrigem('EUR');
                setMoedaDestino('BRL');
                setResultado(null);
              }}
            >
              <Text style={styles.textoBotaoAtalho}>EUR para BRL</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botaoAtalho}
              onPress={() => {
                setMoedaOrigem('BRL');
                setMoedaDestino('USD');
                setResultado(null);
              }}
            >
              <Text style={styles.textoBotaoAtalho}>BRL para USD</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.botaoConverter, carregando && styles.botaoDesabilitado]}
            onPress={converter}
            disabled={carregando}
          >
            <Text style={styles.textoBotaoConverter}>
              {carregando ? 'Carregando Cotacoes...' : 'Converter'}
            </Text>
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
              <Text style={styles.rotuloResultado}>Taxa direta:</Text>
              <Text style={styles.valorResultado}>
                1 {resultado.moedaOrigem} = {resultado.taxaConversao.toFixed(6)}{' '}
                {resultado.moedaDestino}
              </Text>
            </View>

            <View style={styles.linhaResultado}>
              <Text style={styles.rotuloResultado}>Taxa inversa:</Text>
              <Text style={styles.valorResultado}>
                1 {resultado.moedaDestino} = {resultado.taxaReversa.toFixed(6)}{' '}
                {resultado.moedaOrigem}
              </Text>
            </View>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

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
      .then((resposta) => {
        if (!resposta.ok) {
          throw new Error(`Falha HTTP: ${resposta.status}`);
        }
        return resposta.json();
      })
      .then((dados) => {
        const taxas = dados.conversion_rates || dados.rates;
        if (dados && dados.result === 'success' && taxas) {
          setTaxasMap(taxas);
          const lista = Object.keys(taxas).map((codigo) => ({
            codigo: codigo,
            taxa: taxas[codigo],
          }));
          lista.sort((a, b) => a.codigo.localeCompare(b.codigo));
          setMoedas(lista);
        } else if (dados && dados['error-type']) {
          setErro(`Erro retornado pela API: ${dados['error-type']}`);
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
            carregando={carregando}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

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
  textoCorpo: {
    fontSize: 13,
    color: '#444444',
    lineHeight: 18,
    marginBottom: 6,
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
    width: 100,
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
    fontSize: 15,
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
  linhaInverter: {
    alignItems: 'center',
    marginVertical: 4,
  },
  botaoInverter: {
    backgroundColor: '#eeeeee',
    borderWidth: 1,
    borderColor: '#aaaaaa',
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  textoBotaoInverter: {
    color: '#333333',
    fontSize: 12,
    fontWeight: 'bold',
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
  botaoDesabilitado: {
    backgroundColor: '#888888',
    borderColor: '#666666',
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
  dropdownContainer: {
    marginBottom: 6,
  },
  dropdownGatilho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#aaaaaa',
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  dropdownDesabilitado: {
    backgroundColor: '#eeeeee',
    borderColor: '#cccccc',
  },
  dropdownTextoPrincipal: {
    fontSize: 13,
    color: '#111111',
    flex: 1,
  },
  dropdownTextoSeta: {
    fontSize: 12,
    color: '#555555',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  modalFundo: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 14,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#333333',
    maxHeight: '85%',
    padding: 12,
  },
  modalCabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitulo: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111111',
  },
  modalBotaoFechar: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#999999',
    backgroundColor: '#eeeeee',
  },
  modalTextoFechar: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333333',
  },
  boxBuscaModal: {
    marginBottom: 8,
  },
  modalItemMoeda: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dddddd',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  modalItemMoedaSelecionado: {
    backgroundColor: '#e6f0ff',
    borderColor: '#0044aa',
  },
  modalItemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalItemCodigo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111111',
  },
  modalItemCodigoSelecionado: {
    color: '#0044aa',
  },
  modalItemNome: {
    fontSize: 12,
    color: '#555555',
  },
  modalItemTaxa: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 8,
  },
  modalItemCheck: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0044aa',
  },
});
