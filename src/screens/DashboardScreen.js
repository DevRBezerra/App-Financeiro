import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
  FlatList,
  Linking,
} from 'react-native';
import { authService } from '../services/supabase';
import { accountsService } from '../services/accounts';
import { transactionsService } from '../services/transactions';
import Ionicons from 'react-native-vector-icons/Ionicons';

const DashboardScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Carregar dados do usuário
      const user = await authService.getCurrentUser();
      if (user) {
        setUserData({
          name: user.user_metadata?.name || user.email?.split('@')[0],
          email: user.email
        });

        // Carregar contas do usuário
        const userAccounts = await accountsService.getAccounts(user.id);
        setAccounts(userAccounts || []);
        
        // Calcular saldo total
        const total = userAccounts?.reduce((sum, account) => sum + parseFloat(String(account.balance || 0)), 0) || 0;
        setTotalBalance(total);

        // Carregar transações recentes
        const userTransactions = await transactionsService.getTransactions(user.id);
        setTransactions(userTransactions?.slice(0, 5) || []); // Últimas 5 transações
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleDeleteTransaction = async (transaction) => {
    try {
      console.log('Iniciando exclusão da transação:', transaction.id);
      console.log('Tipo da transação:', transaction.type);
      console.log('Valor da transação:', transaction.amount);
      console.log('Saldo atual da conta:', accounts.find(acc => acc.id === transaction.account_id)?.balance);
      
      // Excluir a transação (a função já deve reverter o saldo automaticamente)
      await transactionsService.deleteTransactionWithInstallments(transaction.id);
      
      // Recarregar dados do dashboard para atualizar saldo
      console.log('Recarregando dados do dashboard...');
      
      // Carregar dados do usuário
      const user = await authService.getCurrentUser();
      if (user) {
        // Carregar contas do usuário
        const userAccounts = await accountsService.getAccounts(user.id);
        setAccounts(userAccounts || []);
        
        // Calcular saldo total
        const total = userAccounts?.reduce((sum, account) => sum + parseFloat(String(account.balance || 0)), 0) || 0;
        setTotalBalance(total);

        // Carregar transações recentes
        const userTransactions = await transactionsService.getTransactions(user.id);
        setTransactions(userTransactions?.slice(0, 5) || []); // Últimas 5 transações
      }
      
      Alert.alert('Sucesso', 'Transação excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
      Alert.alert('Erro', 'Erro ao excluir transação');
    }
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
    } catch (error) {
      Alert.alert('Erro', 'Erro ao fazer logout');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getTransactionIcon = (type) => {
    return type === 'income' ? '💰' : '💸';
  };

  const getTransactionColor = (type) => {
    return type === 'income' ? '#4CAF50' : '#F44336';
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

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionIcon}>
        <Text style={styles.transactionIconText}>
          {getTransactionIcon(item.type)}
        </Text>
      </View>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionDescription}>{item.description}</Text>
        <Text style={styles.transactionCategory}>{item.category}</Text>
        <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
      </View>
      <View style={styles.transactionAmount}>
        <Text style={[
          styles.transactionAmountText,
          { color: getTransactionColor(item.type) }
        ]}>
          {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
        </Text>
      </View>
    </View>
  );

  const renderAccount = ({ item }) => (
    <View style={styles.accountCard}>
      <View style={styles.accountHeader}>
        <Text style={styles.accountName}>{item.name}</Text>
        <Text style={styles.accountType}>{item.type}</Text>
      </View>
      <Text style={styles.accountBalance}>{formatCurrency(item.balance)}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.title}>RK GESTÃO</Text>
          <Text style={styles.subtitle}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Dashboard</Text>
            <Text style={styles.subtitle}>
              Olá, {userData?.name || 'Usuário'}!
            </Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>

        {/* Saldo Total */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceTitle}>Saldo Total</Text>
          <Text style={styles.balanceValue}>{formatCurrency(totalBalance)}</Text>
        </View>

        {/* Contas */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Suas Contas</Text>
            <TouchableOpacity
              onPress={() => Alert.alert('Em breve', 'Funcionalidade de nova conta será implementada!')}
            >
              <Text style={styles.addButton}>+ Nova</Text>
            </TouchableOpacity>
          </View>
          
          {accounts.length > 0 ? (
            <>
              <FlatList
                data={accounts}
                renderItem={renderAccount}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.accountsList}
              />
              
              {/* Mensagem de boas-vindas para conta padrão */}
              {accounts.length === 1 && accounts[0].name === 'Conta Principal' && (
                <View style={styles.welcomeMessage}>
                  <Text style={styles.welcomeTitle}>🎉 Bem-vindo ao RK GESTÃO!</Text>
                  <Text style={styles.welcomeText}>
                    Sua conta principal foi criada automaticamente. 
                    Agora você pode começar a adicionar suas transações!
                  </Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Nenhuma conta cadastrada</Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => Alert.alert('Em breve', 'Funcionalidade de nova conta será implementada!')}
              >
                <Text style={styles.emptyStateButtonText}>Criar primeira conta</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Transações Recentes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transações Recentes</Text>
            <TouchableOpacity
              onPress={() => Alert.alert('Em breve', 'Funcionalidade de nova transação será implementada!')}
            >
              <Text style={styles.addButton}>+ Nova</Text>
            </TouchableOpacity>
          </View>
          
          {transactions.length > 0 ? (
            <View style={styles.transactionsList}>
              {transactions.map((transaction) => (
                <TouchableOpacity
                  key={transaction.id}
                  style={styles.transactionItem}
                  onPress={() => handleDeleteTransaction(transaction)}
                >
                  <View style={styles.transactionIcon}>
                    <Text style={styles.transactionIconText}>
                      {getTransactionIcon(transaction.type)}
                    </Text>
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionDescription}>{transaction.description}</Text>
                    <Text style={styles.transactionCategory}>{transaction.category}</Text>
                    <Text style={styles.transactionDate}>{formatDate(transaction.date)}</Text>
                  </View>
                  <View style={styles.transactionAmount}>
                    <Text style={[
                      styles.transactionAmountText,
                      { color: getTransactionColor(transaction.type) }
                    ]}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDeleteTransaction(transaction);
                    }}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Nenhuma transação registrada</Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => Alert.alert('Em breve', 'Funcionalidade de nova transação será implementada!')}
              >
                <Text style={styles.emptyStateButtonText}>Registrar primeira transação</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Ações Rápidas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => Alert.alert('Em breve', 'Funcionalidade de nova transação será implementada!')}
            >
              <Text style={styles.quickActionIcon}>💸</Text>
              <Text style={styles.quickActionText}>Nova Despesa</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => Alert.alert('Em breve', 'Funcionalidade de nova receita será implementada!')}
            >
              <Text style={styles.quickActionIcon}>💰</Text>
              <Text style={styles.quickActionText}>Nova Receita</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => Alert.alert('Em breve', 'Funcionalidade de transferência será implementada!')}
            >
              <Text style={styles.quickActionIcon}>🔄</Text>
              <Text style={styles.quickActionText}>Transferir</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Informações */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🚀 Funcionalidades em desenvolvimento:</Text>
          <Text style={styles.infoText}>• Relatórios e gráficos</Text>
          <Text style={styles.infoText}>• Categorização automática</Text>
          <Text style={styles.infoText}>• Metas financeiras</Text>
          <Text style={styles.infoText}>• Sincronização em tempo real</Text>
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
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  balanceCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    marginTop: 10,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  balanceTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  accountsList: {
    marginLeft: -10,
  },
  accountCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 5,
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  accountType: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  accountBalance: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  transactionsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionIconText: {
    fontSize: 18,
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
  emptyState: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyStateButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    margin: 20,
    marginTop: 0,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  welcomeMessage: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  developerCredit: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
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
  deleteButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
});

export default DashboardScreen; 