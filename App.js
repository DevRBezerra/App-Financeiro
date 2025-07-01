import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Alert, Image, FlatList, ScrollView, Modal, Dimensions, Linking, Share } from 'react-native';
import { Ionicons } from 'react-native-vector-icons';
import { authService } from './src/services/supabase';
import { transactionsService } from './src/services/transactions';
import AddTransactionScreen from './src/screens/AddTransactionScreen';
import CategoriesScreen from './src/screens/CategoriesScreen';
import { accountsService } from './src/services/accounts';
import { categoriesService } from './src/services/categories';
import ViewShot from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
// import LoginScreen from './src/screens/LoginScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tela de Login moderna
const LoginScreenLocal = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('');

  const handleAuth = async () => {
    setMessage(null);
    setMessageType('');
    if (!email || !password || (isSignUp && !name)) {
      setMessage('Por favor, preencha todos os campos');
      setMessageType('error');
      return;
    }
    setLoading(true);
    try {
      if (isSignUp) {
        await authService.signUp(email, password, name);
        setMessage('Conta criada com sucesso! Verifique seu e-mail para confirmar.');
        setMessageType('success');
        setIsSignUp(false);
      } else {
        await authService.signIn(email, password);
      }
    } catch (error) {
      let errorMessage = 'Ocorreu um erro. Tente novamente.';
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'E-mail ou senha incorretos.';
      } else if (error.message.includes('User already registered')) {
        errorMessage = 'Este e-mail já está em uso.';
      } else if (error.message.includes('Password should be at least')) {
        errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
      } else if (error.message.includes('Invalid email')) {
        errorMessage = 'E-mail inválido.';
      }
      setMessage(errorMessage);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // Funções para abrir links das redes sociais
  const openGitHub = () => {
    Linking.openURL('https://github.com/renanbezerra');
  };

  const openLinkedIn = () => {
    Linking.openURL('https://linkedin.com/in/renanbezerra');
  };

  const openEmail = () => {
    Linking.openURL('mailto:renan@example.com');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.loginContent}>
        <Image source={require('./assets/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>RK GESTÃO</Text>
        <Text style={styles.subtitle}>{isSignUp ? 'Crie sua conta' : 'Acesse sua conta'}</Text>
        {message && (
          <View style={[styles.messageBox, messageType === 'error' ? styles.errorBox : styles.successBox]}>
            <Text style={styles.messageText}>{message}</Text>
          </View>
        )}
        {isSignUp && (
          <TextInput
            style={styles.input}
            placeholder="Nome completo"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        )}
        <TextInput
          style={styles.input}
          placeholder="E-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />
        <TouchableOpacity 
          style={styles.button}
          onPress={handleAuth}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Carregando...' : (isSignUp ? 'Criar Conta' : 'Entrar')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]}
          onPress={() => { setIsSignUp(!isSignUp); setMessage(null); }}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            {isSignUp ? 'Já tenho uma conta' : 'Criar nova conta'}
          </Text>
        </TouchableOpacity>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>✨ Organize sua vida financeira</Text>
          <Text style={styles.infoText}>• Suas contas e categorias salvas na nuvem</Text>
          <Text style={styles.infoText}>• Acesse de qualquer lugar</Text>
          <Text style={styles.infoText}>• Segurança e praticidade</Text>
        </View>
        
        {/* Crédito do desenvolvedor com redes sociais */}
        <View style={styles.developerSection}>
          <Text style={styles.developerCredit}>Desenvolvido por Renan Bezerra</Text>
          <View style={styles.socialLinks}>
            <TouchableOpacity style={styles.socialButton} onPress={openGitHub}>
              <Ionicons name="logo-github" size={20} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} onPress={openLinkedIn}>
              <Ionicons name="logo-linkedin" size={20} color="#0077B5" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} onPress={openEmail}>
              <Ionicons name="mail" size={20} color="#EA4335" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

// Novo Dashboard moderno inspirado no Mobills
const DashboardHome = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (userData) {
        loadDashboardData();
      }
    });

    return unsubscribe;
  }, [navigation, userData]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('state', (e) => {
      // Verificar se voltou da tela de contas
      const currentRoute = e.data.state.routes[e.data.state.index];
      if (currentRoute.name === 'Main' && currentRoute.params?.refresh) {
        loadDashboardData();
      }
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (selectedTransaction) {
      setShowTransactionModal(true);
    }
  }, [selectedTransaction]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadDashboardData();
    });

    return unsubscribe;
  }, [navigation]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Carregando dados do dashboard...');
      const user = await authService.getCurrentUser();
      if (user) {
        setUserData({
          name: user.user_metadata?.name || user.email?.split('@')[0],
          email: user.email
        });
        
        // Carregar contas
        const userAccounts = await accountsService.getAccounts(user.id);
        console.log('Contas carregadas:', userAccounts);
        
        // Carregar transações
        const userTransactions = await transactionsService.getTransactions(user.id);
        setTransactions(userTransactions?.slice(0, 10) || []);
        
        // Calcular saldo de cada conta baseado nas transações reais do mês atual
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const accountsWithCalculatedBalance = userAccounts?.map(account => {
          const accountTransactions = userTransactions?.filter(t => {
            const transactionDate = new Date(t.created_at);
            return t.account_id === account.id && 
                   transactionDate.getMonth() === currentMonth && 
                   transactionDate.getFullYear() === currentYear;
          }) || [];
          let calculatedBalance = 0;
          
          if (accountTransactions.length > 0) {
            calculatedBalance = accountTransactions.reduce((sum, transaction) => {
              const amount = parseFloat(transaction.amount || 0);
              if (transaction.type === 'income') {
                return sum + amount;
              } else if (transaction.type === 'expense' || transaction.type === 'credit_expense') {
                return sum - amount;
              }
              return sum;
            }, 0);
          }
          
          return {
            ...account,
            balance: calculatedBalance
          };
        }) || [];
        
        console.log('Contas com saldo calculado:', accountsWithCalculatedBalance);
        setAccounts(accountsWithCalculatedBalance);
        
        // Calcular saldo total baseado nas transações reais do mês atual
        let totalBalance = 0;
        if (userTransactions && userTransactions.length > 0) {
          const currentMonthTransactions = userTransactions.filter(t => {
            const transactionDate = new Date(t.created_at);
            return transactionDate.getMonth() === currentMonth && 
                   transactionDate.getFullYear() === currentYear;
          });
          
          totalBalance = currentMonthTransactions.reduce((sum, transaction) => {
            const amount = parseFloat(transaction.amount || 0);
            if (transaction.type === 'income') {
              return sum + amount;
            } else if (transaction.type === 'expense' || transaction.type === 'credit_expense') {
              return sum - amount;
            }
            return sum;
          }, 0);
        }
        
        console.log('Saldo total calculado baseado nas transações do mês atual:', totalBalance);
        setTotalBalance(totalBalance);
        
        // Calcular receitas e despesas do mês
        const monthlyTransactions = userTransactions?.filter(t => {
          const transactionDate = new Date(t.created_at);
          return transactionDate.getMonth() === currentMonth && 
                 transactionDate.getFullYear() === currentYear;
        }) || [];
        
        const income = monthlyTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
        
        const expenses = monthlyTransactions
          .filter(t => t.type === 'expense' || t.type === 'credit_expense')
          .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
        
        const balance = income - expenses;
        
        // Agrupar por categoria
        const categoryExpenses = {};
        monthlyTransactions
          .filter(t => t.type === 'expense' || t.type === 'credit_expense')
          .forEach(t => {
            if (!categoryExpenses[t.category]) {
              categoryExpenses[t.category] = 0;
            }
            categoryExpenses[t.category] += parseFloat(t.amount || 0);
          });
        
        setMonthlyIncome(income);
        setMonthlyExpenses(expenses);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Alimentação': 'restaurant',
      'Transporte': 'car',
      'Saúde': 'medical',
      'Educação': 'school',
      'Lazer': 'game-controller',
      'Vestuário': 'shirt',
      'Moradia': 'home',
      'Serviços': 'construct',
      'Outros': 'ellipsis-horizontal'
    };
    return icons[category] || 'ellipsis-horizontal';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Alimentação': '#FF6B6B',
      'Transporte': '#4ECDC4',
      'Saúde': '#45B7D1',
      'Educação': '#96CEB4',
      'Lazer': '#FFEAA7',
      'Vestuário': '#DDA0DD',
      'Moradia': '#98D8C8',
      'Serviços': '#F7DC6F',
      'Outros': '#BB8FCE'
    };
    return colors[category] || '#BB8FCE';
  };

  const handleMarkAsPaid = async (transaction) => {
    try {
      console.log('Marcando transação como paga:', transaction.id);
      
      // Marcar transação como paga
      await transactionsService.markAsPaid(transaction.id);
      
      // Se a transação foi transferida para o próximo mês, removê-la
      if (transaction.original_transaction_id) {
        console.log('Removendo transação transferida:', transaction.id);
        await transactionsService.deleteTransactionWithInstallments(transaction.id);
      }
      
      // Atualizar saldo da conta
      const selectedAccount = accounts.find(acc => acc.id === transaction.account_id);
      if (selectedAccount) {
        let newBalance = selectedAccount.balance;
        if (transaction.type === 'income') {
          newBalance += parseFloat(transaction.amount);
        } else {
          newBalance -= parseFloat(transaction.amount);
        }
        
        await accountsService.updateAccountBalance(transaction.account_id, newBalance);
      }
      
      // Recarregar transações
      await loadTransactions();
      
      setShowTransactionModal(false);
      setSelectedTransaction(null);
      
      Alert.alert('Sucesso', 'Transação marcada como paga!');
    } catch (error) {
      console.error('Erro ao marcar como paga:', error);
      Alert.alert('Erro', 'Erro ao marcar transação como paga');
    }
  };

  const handleDeleteTransaction = async (transaction) => {
    try {
      console.log('Excluindo transação:', transaction.id);
      
      // Excluir transação e suas parcelas (se houver)
      // A função deleteTransactionWithInstallments já reverte o saldo automaticamente
      await transactionsService.deleteTransactionWithInstallments(transaction.id);
      
      // Recarregar apenas as transações
      await loadTransactions();
      
      setShowTransactionModal(false);
      setSelectedTransaction(null);
      
      Alert.alert('Sucesso', 'Transação excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
      Alert.alert('Erro', 'Erro ao excluir transação');
    }
  };

  // Header moderno
  const Header = () => (
    <View style={styles.modernHeader}>
      <View style={styles.headerTop}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerGreeting}>Olá, {userData?.name || 'Usuário'}!</Text>
          <Text style={styles.headerDate}>{new Date().toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</Text>
        </View>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => navigation.navigate('Perfil')}
        >
          <Ionicons name="person-circle" size={40} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Seção de saldo principal
  const BalanceSection = () => (
    <View style={styles.balanceCard}>
      <Text style={styles.balanceLabel}>Saldo Total</Text>
      <Text style={styles.balanceAmount}>{formatCurrency(totalBalance)}</Text>
      <View style={[styles.balanceStats, {flexWrap: 'wrap'}]}>
        <View style={[styles.balanceStat, {flex: 1, minWidth: 120, maxWidth: '50%'}]}>
          <Ionicons name="arrow-down-circle" size={20} color="#4CAF50" />
          <View style={{flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'space-between'}}>
            <Text style={styles.balanceStatLabel}>Receitas</Text>
            <Text style={styles.balanceStatValue}>{formatCurrency(monthlyIncome)}</Text>
          </View>
        </View>
        <View style={[styles.balanceStat, {flex: 1, minWidth: 120, maxWidth: '50%'}]}>
          <Ionicons name="arrow-up-circle" size={20} color="#F44336" />
          <View style={{flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'space-between'}}>
            <Text style={styles.balanceStatLabel}>Despesas</Text>
            <Text style={styles.balanceStatValue}>{formatCurrency(monthlyExpenses)}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  // Cards de contas
  const AccountsSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Suas Contas</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Contas')}>
          <Text style={styles.seeAllText}>Ver todas</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.accountsContainer}>
        {accounts.slice(0, 3).map((account) => (
          <TouchableOpacity key={account.id} style={styles.accountCard}>
            <View style={[styles.accountIcon, { backgroundColor: getCategoryColor(account.name) }]}>
              <Ionicons name="wallet" size={24} color="#fff" />
            </View>
            <Text style={styles.accountName}>{account.name}</Text>
            <Text style={styles.accountBalance}>{formatCurrency(account.balance)}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Transações recentes
  const TransactionsSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Transações Recentes</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Transações')}>
          <Text style={styles.seeAllText}>Ver todas</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.transactionsContainer}>
        {transactions.map((transaction) => (
          <TouchableOpacity 
            key={transaction.id} 
            style={styles.transactionCard}
            onPress={() => setSelectedTransaction(transaction)}
          >
            <View style={[styles.transactionIcon, { backgroundColor: getCategoryColor(transaction.category) }]}>
              <Ionicons name={getCategoryIcon(transaction.category)} size={20} color="#fff" />
            </View>
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionDescription}>{transaction.description}</Text>
              <Text style={styles.transactionCategory}>{transaction.category}</Text>
              <Text style={styles.transactionDate}>
                {new Date(transaction.created_at).toLocaleDateString('pt-BR')}
              </Text>
            </View>
            <View style={styles.transactionAmount}>
              <Text style={[
                styles.transactionAmountText, 
                { color: transaction.is_paid ? '#4CAF50' : (transaction.type === 'income' ? '#4CAF50' : '#F44336') }
              ]}>
                {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="refresh" size={40} color="#007AFF" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Header />
        <BalanceSection />
        <AccountsSection />
        <TransactionsSection />
      </ScrollView>

      {/* Modal de Transação */}
      <Modal visible={showTransactionModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalhes da Transação</Text>
              <TouchableOpacity onPress={() => {
                setShowTransactionModal(false);
                setSelectedTransaction(null);
              }}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            {selectedTransaction && (
              <View style={styles.transactionDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Descrição:</Text>
                  <Text style={styles.detailValue}>{selectedTransaction.description}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Categoria:</Text>
                  <Text style={styles.detailValue}>{selectedTransaction.category}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Valor:</Text>
                  <Text style={[
                    styles.detailValue, 
                    { color: selectedTransaction.is_paid ? '#4CAF50' : (selectedTransaction.type === 'income' ? '#4CAF50' : '#F44336') }
                  ]}>
                    {selectedTransaction.type === 'income' ? '+' : '-'}{formatCurrency(selectedTransaction.amount)}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Data:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(selectedTransaction.created_at).toLocaleDateString('pt-BR')}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status:</Text>
                  <Text style={[
                    styles.detailValue,
                    { color: selectedTransaction.is_paid ? '#4CAF50' : '#F44336' }
                  ]}>
                    {selectedTransaction.is_paid ? 'Pago' : 'Não Pago'}
                  </Text>
                </View>
                
                {selectedTransaction.original_transaction_id && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Transferida:</Text>
                    <Text style={styles.detailValue}>Sim (do mês anterior)</Text>
                  </View>
                )}
              </View>
            )}
            
            {selectedTransaction && !selectedTransaction.is_paid && (selectedTransaction.type === 'expense' || selectedTransaction.type === 'credit_expense') && (
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: '#4CAF50' }]} 
                onPress={() => handleMarkAsPaid(selectedTransaction)}
              >
                <Text style={styles.modalButtonText}>Marcar como Pago</Text>
              </TouchableOpacity>
            )}
            
            {selectedTransaction && (
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: '#F44336', marginTop: 8 }]} 
                onPress={() => {
                  Alert.alert(
                    'Confirmar Exclusão',
                    'Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.',
                    [
                      {
                        text: 'Cancelar',
                        style: 'cancel',
                      },
                      {
                        text: 'Excluir',
                        style: 'destructive',
                        onPress: () => handleDeleteTransaction(selectedTransaction),
                      },
                    ]
                  );
                }}
              >
                <Text style={styles.modalButtonText}>Excluir Transação</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Tela de Contas funcional
const ContasScreen = ({ navigation }) => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountBalance, setNewAccountBalance] = useState('');
  const [newAccountType, setNewAccountType] = useState('checking');

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      // Atualizar o dashboard quando sair da tela de contas
      navigation.navigate('Main', { refresh: true });
    });

    return unsubscribe;
  }, [navigation]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const user = await authService.getCurrentUser();
      if (user) {
        const userAccounts = await accountsService.getAccounts(user.id);
        const userTransactions = await transactionsService.getTransactions(user.id);
        
        // Calcular saldo de cada conta baseado nas transações reais do mês atual
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const accountsWithCalculatedBalance = userAccounts?.map(account => {
          const accountTransactions = userTransactions?.filter(t => {
            const transactionDate = new Date(t.created_at);
            return t.account_id === account.id && 
                   transactionDate.getMonth() === currentMonth && 
                   transactionDate.getFullYear() === currentYear;
          }) || [];
          let calculatedBalance = 0;
          
          if (accountTransactions.length > 0) {
            calculatedBalance = accountTransactions.reduce((sum, transaction) => {
              const amount = parseFloat(transaction.amount || 0);
              if (transaction.type === 'income') {
                return sum + amount;
              } else if (transaction.type === 'expense' || transaction.type === 'credit_expense') {
                return sum - amount;
              }
              return sum;
            }, 0);
          }
          
          return {
            ...account,
            balance: calculatedBalance
          };
        }) || [];
        
        setAccounts(accountsWithCalculatedBalance);
      }
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
      Alert.alert('Erro', 'Erro ao carregar contas');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = async () => {
    if (!newAccountName.trim()) {
      Alert.alert('Erro', 'Digite o nome da conta');
      return;
    }

    try {
      console.log('Criando nova conta...');
      const user = await authService.getCurrentUser();
      if (user) {
        const accountData = {
          user_id: user.id,
          name: newAccountName.trim(),
          balance: parseFloat(newAccountBalance.replace(',', '.')) || 0,
          type: newAccountType,
        };
        console.log('Dados da conta:', accountData);
        
        const newAccount = await accountsService.createAccount(accountData);
        console.log('Conta criada:', newAccount);
        
        setAccounts([...accounts, newAccount]);
        setNewAccountName('');
        setNewAccountBalance('');
        setShowAddModal(false);
        Alert.alert('Sucesso', 'Conta criada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      Alert.alert('Erro', 'Erro ao criar conta');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0);
  };

  const getAccountIcon = (type) => {
    const icons = {
      'checking': 'card',
      'savings': 'wallet',
      'credit': 'card-outline',
      'investment': 'trending-up'
    };
    return icons[type] || 'wallet';
  };

  const getAccountColor = (type) => {
    const colors = {
      'checking': '#007AFF',
      'savings': '#4CAF50',
      'credit': '#FF9800',
      'investment': '#9C27B0'
    };
    return colors[type] || '#007AFF';
  };

  const getAccountTypeName = (type) => {
    const names = {
      'checking': 'Conta Corrente',
      'savings': 'Conta Poupança',
      'credit': 'Cartão de Crédito',
      'investment': 'Investimento'
    };
    return names[type] || 'Conta';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="refresh" size={40} color="#007AFF" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.accountsHeader}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.accountsTitle}>Suas Contas</Text>
          <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.accountsAddButton}>
            <Ionicons name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista de Contas */}
      <FlatList
        data={accounts}
        keyExtractor={(item) => item.id}
        style={styles.accountsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="wallet-outline" size={60} color="#CCC" />
            <Text style={styles.emptyText}>Nenhuma conta encontrada</Text>
            <Text style={styles.emptySubtext}>Adicione sua primeira conta</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.accountItem}>
            <View style={[styles.accountIcon, { backgroundColor: getAccountColor(item.type) }]}>
              <Ionicons name={getAccountIcon(item.type)} size={24} color="#fff" />
            </View>
            <View style={styles.accountInfo}>
              <Text style={styles.accountName}>{item.name}</Text>
              <Text style={styles.accountType}>{getAccountTypeName(item.type)}</Text>
            </View>
            <View style={styles.accountBalance}>
              <Text style={styles.balanceText}>{formatCurrency(item.balance)}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Modal para adicionar conta */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova Conta</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Nome da conta"
              value={newAccountName}
              onChangeText={setNewAccountName}
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Saldo inicial (opcional)"
              value={newAccountBalance}
              onChangeText={setNewAccountBalance}
              keyboardType="numeric"
            />
            
            <View style={styles.typeSelector}>
              <Text style={styles.typeLabel}>Tipo de conta:</Text>
              <View style={styles.typeOptions}>
                {[
                  { id: 'checking', name: 'Conta Corrente', icon: 'card' },
                  { id: 'savings', name: 'Poupança', icon: 'wallet' },
                  { id: 'credit', name: 'Cartão', icon: 'card-outline' },
                  { id: 'investment', name: 'Investimento', icon: 'trending-up' }
                ].map(type => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.typeOption,
                      newAccountType === type.id && styles.typeOptionSelected
                    ]}
                    onPress={() => setNewAccountType(type.id)}
                  >
                    <Ionicons 
                      name={type.icon} 
                      size={20} 
                      color={newAccountType === type.id ? '#fff' : '#666'} 
                    />
                    <Text style={[
                      styles.typeOptionText,
                      newAccountType === type.id && styles.typeOptionTextSelected
                    ]}>
                      {type.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: '#007AFF' }]} 
              onPress={handleAddAccount}
            >
              <Text style={styles.modalButtonText}>Criar Conta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Tela de Transações com filtro por mês
const TransacoesScreen = ({ navigation }) => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const viewShotRef = useRef(null);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState({ current: 0, total: 0 });
  const [currentExportBatch, setCurrentExportBatch] = useState([]);
  const [batchesToExport, setBatchesToExport] = useState([]);
  const exportViewShotRef = useRef(null);

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  useEffect(() => {
    loadTransactions();
    loadAccounts();
    loadCategories();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, selectedMonth, selectedYear, selectedCategory]);

  useEffect(() => {
    // Recarregar categorias quando o mês/ano mudar
    loadCategories();
    setSelectedCategory(''); // Resetar categoria selecionada
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    if (selectedTransaction) {
      setShowTransactionModal(true);
    }
  }, [selectedTransaction]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadTransactions();
    });

    return unsubscribe;
  }, [navigation]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const user = await authService.getCurrentUser();
      if (user) {
        const userTransactions = await transactionsService.getTransactions(user.id);
        setTransactions(userTransactions || []);
      }
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
      Alert.alert('Erro', 'Erro ao carregar transações');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        // Buscar apenas categorias que existem nas transações do mês selecionado
        const userTransactions = await transactionsService.getTransactions(user.id);
        const monthTransactions = userTransactions?.filter(transaction => {
          const transactionDate = new Date(transaction.created_at);
          return transactionDate.getMonth() === selectedMonth && 
                 transactionDate.getFullYear() === selectedYear;
        }) || [];
        
        // Extrair categorias únicas das transações do mês
        const uniqueCategories = [...new Set(monthTransactions.map(t => t.category))];
        setCategories(uniqueCategories.map(name => ({ id: name, name })));
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const user = await authService.getCurrentUser();
      if (user) {
        const userAccounts = await accountsService.getAccounts(user.id);
        const userTransactions = await transactionsService.getTransactions(user.id);
        
        // Calcular saldo de cada conta baseado nas transações reais do mês atual
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const accountsWithCalculatedBalance = userAccounts?.map(account => {
          const accountTransactions = userTransactions?.filter(t => {
            const transactionDate = new Date(t.created_at);
            return t.account_id === account.id && 
                   transactionDate.getMonth() === currentMonth && 
                   transactionDate.getFullYear() === currentYear;
          }) || [];
          let calculatedBalance = 0;
          
          if (accountTransactions.length > 0) {
            calculatedBalance = accountTransactions.reduce((sum, transaction) => {
              const amount = parseFloat(transaction.amount || 0);
              if (transaction.type === 'income') {
                return sum + amount;
              } else if (transaction.type === 'expense' || transaction.type === 'credit_expense') {
                return sum - amount;
              }
              return sum;
            }, 0);
          }
          
          return {
            ...account,
            balance: calculatedBalance
          };
        }) || [];
        
        setAccounts(accountsWithCalculatedBalance);
      }
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
      Alert.alert('Erro', 'Erro ao carregar contas');
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.created_at);
      const monthMatch = transactionDate.getMonth() === selectedMonth && 
                        transactionDate.getFullYear() === selectedYear;
      
      const categoryMatch = !selectedCategory || transaction.category === selectedCategory;
      
      return monthMatch && categoryMatch;
    });
    setFilteredTransactions(filtered);
  };

  // Função para dividir em lotes
  function chunkArray(array, size) {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  }

  const exportTransactions = async () => {
    try {
      if (filteredTransactions.length === 0) {
        Alert.alert('Aviso', 'Não há transações para exportar');
        return;
      }
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão Negada', 'É necessário permitir o acesso à galeria para salvar a imagem');
        return;
      }
      // Dividir em lotes de 20
      const batches = chunkArray(filteredTransactions, 20);
      setBatchesToExport(batches);
      setExportProgress({ current: 1, total: batches.length });
      setExporting(true);
      setCurrentExportBatch(batches[0]);
    } catch (error) {
      console.error('Erro ao exportar transações:', error);
      Alert.alert('Erro', 'Erro ao exportar transações');
    }
  };

  // Efeito para exportar cada lote
  useEffect(() => {
    const exportBatch = async () => {
      if (!exporting || currentExportBatch.length === 0) return;
      try {
        // Pequeno delay para garantir renderização
        await new Promise(res => setTimeout(res, 500));
        const uri = await exportViewShotRef.current.capture();
        const asset = await MediaLibrary.createAssetAsync(uri);
        await MediaLibrary.createAlbumAsync('RK GESTÃO', asset, false);
        // Próximo lote
        const nextIndex = exportProgress.current;
        if (nextIndex < batchesToExport.length) {
          setExportProgress({ current: nextIndex + 1, total: batchesToExport.length });
          setCurrentExportBatch(batchesToExport[nextIndex]);
        } else {
          setExporting(false);
          setCurrentExportBatch([]);
          setBatchesToExport([]);
          setExportProgress({ current: 0, total: 0 });
          Alert.alert('Sucesso', 'Todas as imagens foram salvas na galeria!');
        }
      } catch (error) {
        setExporting(false);
        setCurrentExportBatch([]);
        setBatchesToExport([]);
        setExportProgress({ current: 0, total: 0 });
        Alert.alert('Erro', 'Erro ao exportar transações');
      }
    };
    if (exporting && currentExportBatch.length > 0) {
      exportBatch();
    }
  }, [exporting, currentExportBatch]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Alimentação': 'restaurant',
      'Transporte': 'car',
      'Saúde': 'medical',
      'Educação': 'school',
      'Lazer': 'game-controller',
      'Vestuário': 'shirt',
      'Moradia': 'home',
      'Serviços': 'construct',
      'Outros': 'ellipsis-horizontal'
    };
    return icons[category] || 'ellipsis-horizontal';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Alimentação': '#FF6B6B',
      'Transporte': '#4ECDC4',
      'Saúde': '#45B7D1',
      'Educação': '#96CEB4',
      'Lazer': '#FFEAA7',
      'Vestuário': '#DDA0DD',
      'Moradia': '#98D8C8',
      'Serviços': '#F7DC6F',
      'Outros': '#BB8FCE'
    };
    return colors[category] || '#BB8FCE';
  };

  const handleMarkAsPaid = async (transaction) => {
    try {
      console.log('Marcando transação como paga:', transaction.id);
      
      // Marcar transação como paga
      await transactionsService.markAsPaid(transaction.id);
      
      // Se a transação foi transferida para o próximo mês, removê-la
      if (transaction.original_transaction_id) {
        console.log('Removendo transação transferida:', transaction.id);
        await transactionsService.deleteTransactionWithInstallments(transaction.id);
      }
      
      // Atualizar saldo da conta
      const selectedAccount = accounts.find(acc => acc.id === transaction.account_id);
      if (selectedAccount) {
        let newBalance = selectedAccount.balance;
        if (transaction.type === 'income') {
          newBalance += parseFloat(transaction.amount);
        } else {
          newBalance -= parseFloat(transaction.amount);
        }
        
        await accountsService.updateAccountBalance(transaction.account_id, newBalance);
      }
      
      // Recarregar transações
      await loadTransactions();
      
      setShowTransactionModal(false);
      setSelectedTransaction(null);
      
      Alert.alert('Sucesso', 'Transação marcada como paga!');
    } catch (error) {
      console.error('Erro ao marcar como paga:', error);
      Alert.alert('Erro', 'Erro ao marcar transação como paga');
    }
  };

  const handleDeleteTransaction = async (transaction) => {
    try {
      console.log('Excluindo transação:', transaction.id);
      
      // Excluir transação e suas parcelas (se houver)
      // A função deleteTransactionWithInstallments já reverte o saldo automaticamente
      await transactionsService.deleteTransactionWithInstallments(transaction.id);
      
      // Recarregar apenas as transações
      await loadTransactions();
      
      setShowTransactionModal(false);
      setSelectedTransaction(null);
      
      Alert.alert('Sucesso', 'Transação excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
      Alert.alert('Erro', 'Erro ao excluir transação');
    }
  };

  const renderTransaction = ({ item }) => (
    <TouchableOpacity 
      style={styles.transactionCard}
      onPress={() => setSelectedTransaction(item)}
    >
      <View style={[styles.transactionIcon, { backgroundColor: getCategoryColor(item.category) }]}>
        <Ionicons name={getCategoryIcon(item.category)} size={20} color="#fff" />
      </View>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionDescription}>{item.description}</Text>
        <Text style={styles.transactionCategory}>{item.category}</Text>
        <Text style={styles.transactionDate}>
          {new Date(item.created_at).toLocaleDateString('pt-BR')}
        </Text>
      </View>
      <View style={styles.transactionAmount}>
        <Text style={[
          styles.transactionAmountText, 
          { color: item.is_paid ? '#4CAF50' : (item.type === 'income' ? '#4CAF50' : '#F44336') }
        ]}>
          {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="refresh" size={40} color="#007AFF" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.transactionsHeader}>
        <Text style={styles.transactionsTitle}>Transações</Text>
        
        {/* Filtro de categoria */}
        <View style={styles.categoryFilter}>
          <TouchableOpacity 
            style={styles.categoryFilterButton}
            onPress={() => setShowCategoryFilter(!showCategoryFilter)}
          >
            <Ionicons name="filter" size={20} color="#007AFF" />
            <Text style={styles.categoryFilterText}>
              {selectedCategory || 'Todas as categorias'}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#007AFF" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.exportButton}
            onPress={exportTransactions}
          >
            <Ionicons name="download" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Dropdown de categorias */}
        {showCategoryFilter && (
          <View style={styles.categoryDropdown}>
            <ScrollView style={styles.categoryScrollView} showsVerticalScrollIndicator={false}>
              <TouchableOpacity 
                style={styles.categoryOption}
                onPress={() => {
                  setSelectedCategory('');
                  setShowCategoryFilter(false);
                }}
              >
                <Text style={styles.categoryOptionText}>Todas as categorias</Text>
              </TouchableOpacity>
              {categories.map((category) => (
                <TouchableOpacity 
                  key={category.id}
                  style={styles.categoryOption}
                  onPress={() => {
                    setSelectedCategory(category.name);
                    setShowCategoryFilter(false);
                  }}
                >
                  <Text style={styles.categoryOptionText}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        
        {/* Filtro de mês */}
        <View style={styles.monthFilter}>
          <TouchableOpacity 
            style={styles.monthButton}
            onPress={() => {
              if (selectedMonth > 0) {
                setSelectedMonth(selectedMonth - 1);
              } else {
                setSelectedMonth(11);
                setSelectedYear(selectedYear - 1);
              }
            }}
          >
            <Ionicons name="chevron-back" size={20} color="#007AFF" />
          </TouchableOpacity>
          
          <Text style={styles.monthText}>
            {months[selectedMonth]} {selectedYear}
          </Text>
          
          <TouchableOpacity 
            style={styles.monthButton}
            onPress={() => {
              if (selectedMonth < 11) {
                setSelectedMonth(selectedMonth + 1);
              } else {
                setSelectedMonth(0);
                setSelectedYear(selectedYear + 1);
              }
            }}
          >
            <Ionicons name="chevron-forward" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ViewShot ref={viewShotRef} style={[styles.viewShotContainer, { position: 'absolute', left: -9999 }]}>
        {/* Header da exportação */}
        <View style={styles.exportHeader}>
          <Text style={styles.exportTitle}>RK GESTÃO</Text>
          <Text style={styles.exportSubtitle}>
            Transações - {months[selectedMonth]} {selectedYear}
            {selectedCategory && ` - ${selectedCategory}`}
          </Text>
          <Text style={styles.exportDate}>
            Exportado em: {new Date().toLocaleDateString('pt-BR')}
          </Text>
        </View>

        {/* Lista de transações para exportação */}
        <View style={styles.exportTransactionsList}>
          {filteredTransactions.map((transaction) => (
            <View key={transaction.id} style={styles.exportTransactionItem}>
              <View style={styles.exportTransactionInfo}>
                <Text style={styles.exportTransactionDescription}>
                  {transaction.description}
                </Text>
                <Text style={styles.exportTransactionCategory}>
                  {transaction.category}
                </Text>
                <Text style={styles.exportTransactionDate}>
                  {new Date(transaction.created_at).toLocaleDateString('pt-BR')}
                </Text>
              </View>
              <Text style={[
                styles.exportTransactionAmount,
                { color: transaction.is_paid ? '#4CAF50' : (transaction.type === 'income' ? '#4CAF50' : '#F44336') }
              ]}>
                {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
              </Text>
            </View>
          ))}
        </View>
      </ViewShot>

      <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        style={styles.transactionsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={60} color="#CCC" />
            <Text style={styles.emptyText}>Nenhuma transação encontrada</Text>
            <Text style={styles.emptySubtext}>Adicione sua primeira transação</Text>
          </View>
        }
      />

      {/* Modal de Transação */}
      <Modal visible={showTransactionModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalhes da Transação</Text>
              <TouchableOpacity onPress={() => {
                setShowTransactionModal(false);
                setSelectedTransaction(null);
              }}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            {selectedTransaction && (
              <View style={styles.transactionDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Descrição:</Text>
                  <Text style={styles.detailValue}>{selectedTransaction.description}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Categoria:</Text>
                  <Text style={styles.detailValue}>{selectedTransaction.category}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Valor:</Text>
                  <Text style={[
                    styles.detailValue, 
                    { color: selectedTransaction.is_paid ? '#4CAF50' : (selectedTransaction.type === 'income' ? '#4CAF50' : '#F44336') }
                  ]}>
                    {selectedTransaction.type === 'income' ? '+' : '-'}{formatCurrency(selectedTransaction.amount)}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Data:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(selectedTransaction.created_at).toLocaleDateString('pt-BR')}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status:</Text>
                  <Text style={[
                    styles.detailValue,
                    { color: selectedTransaction.is_paid ? '#4CAF50' : '#F44336' }
                  ]}>
                    {selectedTransaction.is_paid ? 'Pago' : 'Não Pago'}
                  </Text>
                </View>
                
                {selectedTransaction.original_transaction_id && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Transferida:</Text>
                    <Text style={styles.detailValue}>Sim (do mês anterior)</Text>
                  </View>
                )}
              </View>
            )}
            
            {selectedTransaction && !selectedTransaction.is_paid && (selectedTransaction.type === 'expense' || selectedTransaction.type === 'credit_expense') && (
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: '#4CAF50' }]} 
                onPress={() => handleMarkAsPaid(selectedTransaction)}
              >
                <Text style={styles.modalButtonText}>Marcar como Pago</Text>
              </TouchableOpacity>
            )}
            
            {selectedTransaction && (
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: '#F44336', marginTop: 8 }]} 
                onPress={() => {
                  Alert.alert(
                    'Confirmar Exclusão',
                    'Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.',
                    [
                      {
                        text: 'Cancelar',
                        style: 'cancel',
                      },
                      {
                        text: 'Excluir',
                        style: 'destructive',
                        onPress: () => handleDeleteTransaction(selectedTransaction),
                      },
                    ]
                  );
                }}
              >
                <Text style={styles.modalButtonText}>Excluir Transação</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {exporting && (
        <ViewShot ref={exportViewShotRef} style={[styles.viewShotContainer, { position: 'absolute', left: -9999 }]}> 
          <View style={styles.exportHeader}>
            <Text style={styles.exportTitle}>RK GESTÃO</Text>
            <Text style={styles.exportSubtitle}>
              Transações - {months[selectedMonth]} {selectedYear}
              {selectedCategory && ` - ${selectedCategory}`}
            </Text>
            <Text style={styles.exportDate}>
              Exportado em: {new Date().toLocaleDateString('pt-BR')}
            </Text>
          </View>
          <View style={styles.exportTransactionsList}>
            {currentExportBatch.map((transaction) => (
              <View key={transaction.id} style={styles.exportTransactionItem}>
                <View style={styles.exportTransactionInfo}>
                  <Text style={styles.exportTransactionDescription}>{transaction.description}</Text>
                  <Text style={styles.exportTransactionCategory}>{transaction.category}</Text>
                  <Text style={styles.exportTransactionDate}>{new Date(transaction.created_at).toLocaleDateString('pt-BR')}</Text>
                </View>
                <Text style={[
                  styles.exportTransactionAmount,
                  { color: transaction.is_paid ? '#4CAF50' : (transaction.type === 'income' ? '#4CAF50' : '#F44336') }
                ]}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </Text>
              </View>
            ))}
          </View>
        </ViewShot>
      )}
      {exporting && (
        <View style={{ position: 'absolute', top: 60, left: 0, right: 0, alignItems: 'center', zIndex: 999 }}>
          <View style={{ backgroundColor: '#FFF', padding: 16, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#007AFF' }}>Exportando imagens...</Text>
            <Text style={{ fontSize: 14, color: '#333', marginTop: 8 }}>Lote {exportProgress.current} de {exportProgress.total}</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const PlanejamentoScreen = () => (
  <View style={styles.center}>
    <Text style={styles.title}>Planejamento</Text>
    <Text style={styles.subtitle}>Em breve você poderá planejar seu orçamento aqui.</Text>
  </View>
);

const PerfilScreen = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        setUserData({
          name: user.user_metadata?.name || user.email?.split('@')[0],
          email: user.email,
          id: user.id
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
    } catch (error) {
      Alert.alert('Erro', 'Erro ao fazer logout');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.title}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.profileAvatar}>
          <Ionicons name="person-circle" size={80} color="#007AFF" />
        </View>
        <Text style={styles.profileName}>{userData?.name}</Text>
        <Text style={styles.profileEmail}>{userData?.email}</Text>
      </View>

      <View style={styles.profileSection}>
        <Text style={styles.sectionTitle}>Configurações</Text>
        
        <TouchableOpacity style={styles.profileOption}>
          <Ionicons name="person-outline" size={24} color="#007AFF" />
          <Text style={styles.profileOptionText}>Editar Perfil</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.profileOption}>
          <Ionicons name="notifications-outline" size={24} color="#007AFF" />
          <Text style={styles.profileOptionText}>Notificações</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.profileOption}>
          <Ionicons name="shield-outline" size={24} color="#007AFF" />
          <Text style={styles.profileOptionText}>Privacidade</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.profileOption}>
          <Ionicons name="help-circle-outline" size={24} color="#007AFF" />
          <Text style={styles.profileOptionText}>Ajuda</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <TouchableOpacity 
          style={[styles.profileOption, styles.logoutOption]} 
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#F44336" />
          <Text style={[styles.profileOptionText, styles.logoutText]}>Sair</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Tela de Relatórios
const RelatoriosScreen = ({ navigation }) => {
  const [transactions, setTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [monthlyData, setMonthlyData] = useState(null);
  const [loading, setLoading] = useState(true);

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  useEffect(() => {
    loadTransactions();
    loadCategories();
  }, []);

  useEffect(() => {
    filterAndSummarize();
  }, [transactions, selectedMonth, selectedYear, selectedCategory]);

  useEffect(() => {
    // Atualizar ao voltar para a tela
    const unsubscribe = navigation.addListener('focus', () => {
      loadTransactions();
      loadCategories();
    });
    return unsubscribe;
  }, [navigation]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const user = await authService.getCurrentUser();
      if (user) {
        const userTransactions = await transactionsService.getTransactions(user.id);
        setTransactions(userTransactions || []);
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao carregar transações');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        // Buscar apenas categorias que existem nas transações do mês selecionado
        const userTransactions = await transactionsService.getTransactions(user.id);
        const monthTransactions = userTransactions?.filter(transaction => {
          const transactionDate = new Date(transaction.created_at);
          return transactionDate.getMonth() === selectedMonth && 
                 transactionDate.getFullYear() === selectedYear;
        }) || [];
        const uniqueCategories = [...new Set(monthTransactions.map(t => t.category))];
        setCategories(uniqueCategories.map(name => ({ id: name, name })));
      }
    } catch (error) {
      // ignora
    }
  };

  const filterAndSummarize = () => {
    const filtered = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.created_at);
      const monthMatch = transactionDate.getMonth() === selectedMonth && 
                        transactionDate.getFullYear() === selectedYear;
      const categoryMatch = !selectedCategory || transaction.category === selectedCategory;
      return monthMatch && categoryMatch;
    });
    const income = filtered.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    const expenses = filtered.filter(t => t.type === 'expense' || t.type === 'credit_expense').reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    const balance = income - expenses;
    const categoryExpenses = {};
    filtered.filter(t => t.type === 'expense' || t.type === 'credit_expense').forEach(t => {
      if (!categoryExpenses[t.category]) categoryExpenses[t.category] = 0;
      categoryExpenses[t.category] += parseFloat(t.amount || 0);
    });
    setMonthlyData({ income, expenses, balance, categoryExpenses, totalTransactions: filtered.length });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="refresh" size={40} color="#007AFF" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.reportsHeader}>
        <Text style={styles.reportsTitle}>Relatório Mensal</Text>
        <Text style={styles.reportsSubtitle}>
          {months[selectedMonth]} {selectedYear}
        </Text>
      </View>
      {/* Filtros */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', margin: 16 }}>
        {/* Mês */}
        <TouchableOpacity onPress={() => setSelectedMonth(selectedMonth > 0 ? selectedMonth - 1 : 11)}>
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#007AFF' }}>{months[selectedMonth]} {selectedYear}</Text>
        <TouchableOpacity onPress={() => setSelectedMonth(selectedMonth < 11 ? selectedMonth + 1 : 0)}>
          <Ionicons name="chevron-forward" size={24} color="#007AFF" />
        </TouchableOpacity>
        {/* Categoria */}
        <View style={{ flex: 1, marginLeft: 16 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity style={{ marginRight: 8 }} onPress={() => setSelectedCategory('')}>
              <Text style={{ color: !selectedCategory ? '#007AFF' : '#333', fontWeight: 'bold' }}>Todas</Text>
            </TouchableOpacity>
            {categories.map(cat => (
              <TouchableOpacity key={cat.id} style={{ marginRight: 8 }} onPress={() => setSelectedCategory(cat.name)}>
                <Text style={{ color: selectedCategory === cat.name ? '#007AFF' : '#333', fontWeight: selectedCategory === cat.name ? 'bold' : 'normal' }}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Resumo geral */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Ionicons name="arrow-down-circle" size={24} color="#4CAF50" />
              <Text style={styles.summaryLabel}>Receitas</Text>
              <Text style={styles.summaryValue}>{formatCurrency(monthlyData?.income || 0)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="arrow-up-circle" size={24} color="#F44336" />
              <Text style={styles.summaryLabel}>Despesas</Text>
              <Text style={styles.summaryValue}>{formatCurrency(monthlyData?.expenses || 0)}</Text>
            </View>
          </View>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Saldo do Mês</Text>
            <Text style={[
              styles.balanceValue,
              { color: (monthlyData?.balance || 0) >= 0 ? '#4CAF50' : '#F44336' }
            ]}>
              {formatCurrency(monthlyData?.balance || 0)}
            </Text>
          </View>
        </View>
        {/* Gastos por categoria */}
        <View style={styles.categoryCard}>
          <Text style={styles.categoryTitle}>Gastos por Categoria</Text>
          {Object.entries(monthlyData?.categoryExpenses || {}).map(([category, amount]) => (
            <View key={category} style={styles.categoryRow}>
              <Text style={styles.categoryName}>{category}</Text>
              <Text style={styles.categoryAmount}>{formatCurrency(amount)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Tela de seleção do tipo de transação
const SelectTransactionTypeScreen = ({ navigation }) => {
  const transactionTypes = [
    { id: 'income', title: 'Receita', icon: 'trending-up', color: '#4CAF50' },
    { id: 'transfer', title: 'Transferência', icon: 'swap-horizontal', color: '#2196F3' },
    { id: 'expense', title: 'Despesa', icon: 'trending-down', color: '#F44336' },
    { id: 'credit_expense', title: 'Despesa Cartão', icon: 'card', color: '#FF9800' },
  ];

  const handleSelectType = (type) => {
    navigation.navigate('NovaTransacao', { transactionType: type });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.selectTypeContainer}>
        <Text style={styles.selectTypeTitle}>Nova Transação</Text>
        <Text style={styles.selectTypeSubtitle}>Selecione o tipo de transação</Text>
        
        <View style={styles.typeGrid}>
          {transactionTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[styles.typeCard, { borderColor: type.color }]}
              onPress={() => handleSelectType(type)}
            >
              <View style={[styles.typeIcon, { backgroundColor: type.color }]}>
                <Ionicons name={type.icon} size={24} color="#FFF" />
              </View>
              <Text style={styles.typeTitle}>{type.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

// Componente vazio para a tela Adicionar
const EmptyScreen = () => null;

function MainTabs({ navigation }) {
  const [showActionSheet, setShowActionSheet] = useState(false);

  const handleAddPress = () => {
    setShowActionSheet(true);
  };

  const handleSelectType = (type) => {
    setShowActionSheet(false);
    navigation.navigate('NovaTransacao', { transactionType: type });
  };

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === 'Home') iconName = 'home';
            else if (route.name === 'Transações') iconName = 'swap-horizontal';
            else if (route.name === 'Adicionar') iconName = 'add-circle';
            else if (route.name === 'Relatórios') iconName = 'bar-chart';
            else if (route.name === 'Perfil') iconName = 'person';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#888',
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#FFF',
            borderTopWidth: 1,
            borderTopColor: '#E0E0E0',
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        })}
      >
        <Tab.Screen name="Home" component={DashboardHome} />
        <Tab.Screen name="Transações" component={TransacoesScreen} />
        <Tab.Screen
          name="Adicionar"
          component={EmptyScreen}
          options={{
            tabBarButton: (props) => (
              <TouchableOpacity {...props} onPress={handleAddPress} style={styles.addButton}>
                <Ionicons name="add-circle" size={48} color="#007AFF" />
              </TouchableOpacity>
            ),
            tabBarLabel: '',
          }}
        />
        <Tab.Screen name="Relatórios" component={RelatoriosScreen} />
        <Tab.Screen name="Perfil" component={PerfilScreen} />
      </Tab.Navigator>
      {/* ActionSheet */}
      <Modal
        visible={showActionSheet}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActionSheet(false)}
      >
        <TouchableOpacity style={styles.actionSheetOverlay} activeOpacity={1} onPress={() => setShowActionSheet(false)}>
          <View style={styles.actionSheetContainer}>
            <Text style={styles.actionSheetTitle}>Nova Transação</Text>
            <View style={styles.actionSheetOptions}>
              <TouchableOpacity style={styles.actionSheetOption} onPress={() => handleSelectType({ id: 'expense', title: 'Despesa' })}>
                <Ionicons name="trending-down" size={24} color="#F44336" />
                <Text style={styles.actionSheetOptionText}>Despesa</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionSheetOption} onPress={() => handleSelectType({ id: 'income', title: 'Receita' })}>
                <Ionicons name="trending-up" size={24} color="#4CAF50" />
                <Text style={styles.actionSheetOptionText}>Receita</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionSheetOption} onPress={() => handleSelectType({ id: 'transfer', title: 'Transferência' })}>
                <Ionicons name="swap-horizontal" size={24} color="#2196F3" />
                <Text style={styles.actionSheetOptionText}>Transferência</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionSheetOption} onPress={() => handleSelectType({ id: 'credit_expense', title: 'Despesa Cartão' })}>
                <Ionicons name="card" size={24} color="#FF9800" />
                <Text style={styles.actionSheetOptionText}>Despesa Cartão</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.actionSheetCancel} onPress={() => setShowActionSheet(false)}>
              <Text style={styles.actionSheetCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Hook para processamento mensal automático - só executa quando há usuário
  useEffect(() => {
    if (user) {
      // Executar processamento mensal apenas quando há usuário autenticado
      const processUnpaidTransactions = async () => {
        try {
          console.log('Processando transações não pagas...');
          
          // Buscar transações não pagas do mês anterior
          const currentDate = new Date();
          const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
          const lastMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
          
          const unpaidTransactions = await transactionsService.getUnpaidTransactions(user.id);
          
          // Filtrar transações do mês anterior que não foram pagas
          const oldUnpaidTransactions = unpaidTransactions.filter(transaction => {
            const transactionDate = new Date(transaction.created_at);
            return transactionDate >= lastMonth && transactionDate <= lastMonthEnd;
          });
          
          console.log(`Encontradas ${oldUnpaidTransactions.length} transações não pagas do mês anterior`);
          
          // Criar transações para o mês atual
          for (const transaction of oldUnpaidTransactions) {
            const newTransaction = {
              user_id: transaction.user_id,
              account_id: transaction.account_id,
              amount: transaction.amount,
              type: transaction.type,
              category: transaction.category,
              date: new Date().toISOString().slice(0, 10),
              due_date: new Date().toISOString().slice(0, 10),
              description: `${transaction.description} (Transferida do mês anterior)`,
              created_at: `${new Date().toISOString().slice(0, 10)}T00:00:00`, // Sem 'Z' para evitar problemas de timezone
              is_paid: false,
              is_fixed: transaction.is_fixed,
              is_repeat: false,
              repeat_interval: null,
              is_installment: transaction.is_installment,
              installment_count: transaction.installment_count,
              ignore_expense: transaction.ignore_expense,
              original_transaction_id: transaction.id, // Referência à transação original
            };
            
            await transactionsService.createTransaction(newTransaction);
            console.log(`Transação transferida: ${transaction.description}`);
          }
        } catch (error) {
          console.error('Erro ao processar transações não pagas:', error);
        }
      };

      processUnpaidTransactions();
    }
  }, [user]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>RK GESTÃO</Text>
          <Text style={styles.subtitle}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="NovaTransacao" component={AddTransactionScreen} />
            <Stack.Screen name="Contas" component={ContasScreen} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreenLocal} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loginContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logo: {
    width: 72,
    height: 72,
    marginBottom: 16,
    borderRadius: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#007AFF',
    marginTop: 8,
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
  infoCard: {
    backgroundColor: '#F1F3F6',
    borderRadius: 12,
    padding: 16,
    marginTop: 32,
    width: '100%',
    alignItems: 'center',
  },
  infoTitle: {
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
    fontSize: 16,
  },
  infoText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 2,
  },
  developerCredit: {
    color: '#007AFF',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
    fontWeight: '500',
  },
  developerSection: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  socialLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageBox: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  errorBox: {
    backgroundColor: '#FFD6D6',
    borderColor: '#FF5A5F',
    borderWidth: 1,
  },
  successBox: {
    backgroundColor: '#D6FFD6',
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  messageText: {
    color: '#333',
    fontSize: 15,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modernHeader: {
    padding: 20,
    backgroundColor: '#007AFF',
    paddingTop: 40,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
  },
  headerGreeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  headerDate: {
    fontSize: 16,
    color: '#FFF',
    opacity: 0.9,
  },
  profileButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  balanceCard: {
    margin: 16,
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    minHeight: 120,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  balanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  balanceStat: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginHorizontal: 4,
    marginBottom: 8,
    minWidth: 120,
    flex: 1,
    minHeight: 60,
  },
  balanceStatLabel: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    flex: 1,
    textAlign: 'left',
  },
  balanceStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'right',
  },
  section: {
    padding: 16,
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    flex: 1,
  },
  seeAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    textAlign: 'right',
  },
  accountsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  accountCard: {
    width: '48%',
    minHeight: 120,
    borderRadius: 12,
    backgroundColor: '#FFF',
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    alignSelf: 'center',
  },
  accountName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
    paddingHorizontal: 8,
    marginBottom: 4,
    alignSelf: 'center',
  },
  accountBalance: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    alignSelf: 'center',
  },
  transactionsContainer: {
    maxHeight: 400,
    flex: 1,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  transactionCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionAmountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 24,
    right: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  profileHeader: {
    padding: 24,
    backgroundColor: '#FFF',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#666',
  },
  profileSection: {
    backgroundColor: '#FFF',
    marginTop: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  profileOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  profileOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  logoutOption: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#F44336',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  transactionsHeader: {
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'column',
  },
  transactionsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  monthFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  monthButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  monthText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    flex: 1,
    textAlign: 'center',
  },
  transactionsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  reportsHeader: {
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  reportsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 16,
  },
  reportsSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  summaryCard: {
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  categoryCard: {
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    color: '#666',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    alignItems: 'flex-end',
  },
  fabMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fabMenuText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  fabActive: {
    backgroundColor: '#F44336',
    transform: [{ rotate: '45deg' }],
  },
  selectTypeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  selectTypeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 16,
  },
  selectTypeSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  typeCard: {
    width: '45%',
    height: 120,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 8,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  actionSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  actionSheetContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 32,
  },
  actionSheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  actionSheetOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  actionSheetOption: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  actionSheetOptionText: {
    marginTop: 8,
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  actionSheetCancel: {
    marginTop: 8,
    alignItems: 'center',
  },
  actionSheetCancelText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
    top: -10,
  },
  accountsHeader: {
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accountsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  accountsList: {
    flex: 1,
    padding: 16,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  accountIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
    paddingHorizontal: 8,
    marginBottom: 4,
    alignSelf: 'center',
  },
  accountType: {
    fontSize: 14,
    color: '#666',
  },
  accountBalance: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    alignSelf: 'center',
  },
  balanceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  transactionDetails: {
    padding: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  typeSelector: {
    marginBottom: 20,
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  typeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F8F9FA',
  },
  typeOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  typeOptionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  typeOptionTextSelected: {
    color: '#FFF',
  },
  accountsAddButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  categoryFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    flex: 1,
    marginRight: 12,
  },
  categoryFilterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginHorizontal: 8,
    flex: 1,
  },
  exportButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  categoryDropdown: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    maxHeight: 200,
  },
  categoryOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  categoryOptionText: {
    fontSize: 16,
    color: '#333',
  },
  viewShotContainer: {
    width: '100%',
    minHeight: 400,
    backgroundColor: '#FFF', // fundo branco para exportação
    paddingBottom: 24,
  },
  exportHeader: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    marginBottom: 8,
  },
  exportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  exportSubtitle: {
    fontSize: 14,
    color: '#FFF',
    marginBottom: 4,
  },
  exportDate: {
    fontSize: 12,
    color: '#FFF',
    opacity: 0.9,
  },
  exportTransactionsList: {
    flex: 1,
  },
  exportTransactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  exportTransactionInfo: {
    flex: 1,
  },
  exportTransactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  exportTransactionCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  exportTransactionDate: {
    fontSize: 12,
    color: '#999',
  },
  exportTransactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryScrollView: {
    maxHeight: 200,
  },
}); 