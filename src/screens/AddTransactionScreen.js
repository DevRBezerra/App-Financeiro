import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Alert, Modal, FlatList, Switch, ScrollView, Dimensions } from 'react-native';
import { accountsService } from '../services/accounts';
import { categoriesService } from '../services/categories';
import { transactionsService } from '../services/transactions';
import { authService } from '../services/supabase';
import { Ionicons } from 'react-native-vector-icons';

const { width } = Dimensions.get('window');

const AddTransactionScreen = ({ navigation, route }) => {
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedType, setSelectedType] = useState(route?.params?.transactionType || { id: 'expense', title: 'Despesa' });
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [isFixed, setIsFixed] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [repeatInterval, setRepeatInterval] = useState('1');
  const [isInstallment, setIsInstallment] = useState(false);
  const [installmentCount, setInstallmentCount] = useState(1);
  const [ignoreExpense, setIgnoreExpense] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCategorySelectionModal, setShowCategorySelectionModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showAccountSelectionModal, setShowAccountSelectionModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountBalance, setNewAccountBalance] = useState('');
  const [showRepeatModal, setShowRepeatModal] = useState(false);
  const [isFixedInstallment, setIsFixedInstallment] = useState(false);
  const [showInstallmentModal, setShowInstallmentModal] = useState(false);

  const transactionTypes = [
    { id: 'income', title: 'Receita', icon: 'trending-up', color: '#4CAF50' },
    { id: 'transfer', title: 'Transferência', icon: 'swap-horizontal', color: '#2196F3' },
    { id: 'expense', title: 'Despesa', icon: 'trending-down', color: '#F44336' },
    { id: 'credit_expense', title: 'Despesa Cartão', icon: 'card', color: '#FF9800' },
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        // Obter usuário atual
        const user = await authService.getCurrentUser();
        console.log('Usuário atual:', user?.id);
        
        if (user) {
          setUserId(user.id);
          
          console.log('Carregando contas e categorias para usuário:', user.id);
          
          const [accountsData, categoriesData, transactionsData] = await Promise.all([
            accountsService.getAccounts(user.id),
            categoriesService.getCategories(user.id),
            transactionsService.getTransactions(user.id)
          ]);
          
          console.log('Contas carregadas:', accountsData?.length || 0);
          console.log('Categorias carregadas:', categoriesData?.length || 0);
          
          // Calcular saldo de cada conta baseado nas transações reais do mês atual
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();
          
          const accountsWithCalculatedBalance = accountsData?.map(account => {
            const accountTransactions = transactionsData?.filter(t => {
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
          
          // Se não há contas, criar conta padrão
          if (!accountsData || accountsData.length === 0) {
            try {
              console.log('Criando conta padrão...');
              await authService.createDefaultAccount(user.id, user.user_metadata?.name || user.email?.split('@')[0]);
              const newAccountsData = await accountsService.getAccounts(user.id);
              const newTransactionsData = await transactionsService.getTransactions(user.id);
              
              // Calcular saldo da nova conta
              const newAccountsWithCalculatedBalance = newAccountsData?.map(account => {
                const accountTransactions = newTransactionsData?.filter(t => {
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
              
              setAccounts(newAccountsWithCalculatedBalance);
            } catch (error) {
              console.log('Erro ao criar conta padrão (pode já existir):', error.message);
              setAccounts(accountsWithCalculatedBalance);
            }
          } else {
            setAccounts(accountsWithCalculatedBalance);
          }
          
          // Se não há categorias, criar categorias padrão
          if (!categoriesData || categoriesData.length === 0) {
            try {
              console.log('Criando categorias padrão...');
              await authService.createDefaultCategories(user.id);
              const newCategoriesData = await categoriesService.getCategories(user.id);
              setCategories(newCategoriesData || []);
            } catch (error) {
              console.log('Erro ao criar categorias padrão (pode já existir):', error.message);
              setCategories(categoriesData || []);
            }
          } else {
            setCategories(categoriesData);
          }
          
          console.log('Categorias por tipo:', {
            income: categoriesData?.filter(c => c.type === 'income').length || 0,
            expense: categoriesData?.filter(c => c.type === 'expense').length || 0,
            transfer: categoriesData?.filter(c => c.type === 'transfer').length || 0,
            credit_expense: categoriesData?.filter(c => c.type === 'credit_expense').length || 0,
          });
        } else {
          console.log('Nenhum usuário encontrado');
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };

    loadData();
  }, []);

  const handleAddTransaction = async () => {
    if (!accountId || !amount || !categoryId) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      console.log('Data escolhida no formulário:', date);
      console.log('É parcelado?', isInstallment, 'Quantidade de parcelas:', installmentCount);

      // Se for parcelado, não criar transação principal
      if (isInstallment && installmentCount > 1) {
        console.log('Criando apenas parcelas...');
        
        const parcelas = [];
        const valorTotal = parseFloat(amount.replace(',', '.'));
        let valorParcela = isFixedInstallment ? valorTotal : parseFloat((valorTotal / installmentCount).toFixed(2));
        let resto = isFixedInstallment ? 0 : valorTotal - (valorParcela * installmentCount);

        console.log('Criando parcelamento:', {
          valorTotal,
          installmentCount,
          isFixedInstallment,
          valorParcela,
          resto,
          dataInicial: date
        });

        // Data base para começar (usar a data escolhida no formulário)
        const dataBase = new Date(date);
        console.log('Data base original:', dataBase.toISOString());
        console.log('Data base formatada:', dataBase.toLocaleDateString('pt-BR'));
        
        for (let i = 0; i < installmentCount; i++) {
          // Criar nova data usando a data escolhida como base
          // Usar a lógica correta para adicionar meses sem problemas de timezone
          const novaData = new Date(dataBase.getFullYear(), dataBase.getMonth() + i, dataBase.getDate());
          
          const dataFormatada = novaData.toISOString().slice(0, 10);
          
          console.log(`Parcela ${i + 1}: ${dataFormatada} (${novaData.getMonth() + 1}/${novaData.getFullYear()}) - Dia: ${novaData.getDate()}`);
          console.log(`  - Data formatada BR: ${novaData.toLocaleDateString('pt-BR')}`);
          
          // Ajustar valor da última parcela para compensar arredondamento
          let valorFinal = valorParcela;
          if (!isFixedInstallment && i === installmentCount - 1) {
            valorFinal += resto;
          }
          
          parcelas.push({
            user_id: userId,
            account_id: accountId,
            amount: valorFinal,
            type: selectedType.id,
            category: categories.find(cat => cat.id === categoryId)?.name || 'Outros',
            date: dataFormatada,
            due_date: dataFormatada,
            description: `${description} (Parcela ${i + 1}/${installmentCount})`,
            created_at: `${dataFormatada}T00:00:00`, // Sem 'Z' para evitar problemas de timezone
            is_paid: false,
            is_fixed: isFixed,
            is_repeat: false,
            repeat_interval: null,
            is_installment: true,
            installment_count: installmentCount,
            ignore_expense: ignoreExpense,
            original_transaction_id: null, // Primeira parcela não tem transação original
            repeat_number: i + 1,
            total_repeats: installmentCount,
          });
        }
        
        console.log('Parcelas criadas:', parcelas.map(p => ({ 
          data: p.date, 
          valor: p.amount, 
          descricao: p.description 
        })));
        
        // Criar todas as parcelas
        for (const parcela of parcelas) {
          await transactionsService.createTransaction(parcela);
        }
        
        // Atualizar saldo da conta (apenas da primeira parcela se for paga)
        const selectedAccount = accounts.find(acc => acc.id === accountId);
        if (selectedAccount && isPaid) {
          let newBalance = selectedAccount.balance;
          if (selectedType.id === 'income') {
            newBalance += valorParcela; // Apenas o valor da primeira parcela
          } else {
            newBalance -= valorParcela; // Apenas o valor da primeira parcela
          }
          
          console.log('Saldo anterior:', selectedAccount.balance, 'Novo saldo:', newBalance);
          await accountsService.updateAccountBalance(accountId, newBalance);
          console.log('Saldo da conta atualizado');
        }
      } else {
        // Transação normal (não parcelada)
        console.log('Criando transação normal...');
        
        const transactionData = {
          user_id: userId,
          account_id: accountId,
          amount: parseFloat(amount.replace(',', '.')),
          type: selectedType.id,
          category: categories.find(cat => cat.id === categoryId)?.name || 'Outros',
          date: date, // Usar a data escolhida no formulário
          due_date: date,
          description,
          created_at: `${date}T00:00:00`, // Sem 'Z' para evitar problemas de timezone
          is_paid: isPaid,
          is_fixed: isFixed,
          is_installment: false,
          installment_count: 1,
          ignore_expense: ignoreExpense,
        };

        const mainTransaction = await transactionsService.createTransaction(transactionData);
        console.log('Transação criada:', mainTransaction);

        // Atualizar saldo da conta
        const selectedAccount = accounts.find(acc => acc.id === accountId);
        if (selectedAccount) {
          let newBalance = selectedAccount.balance;
          if (selectedType.id === 'income') {
            newBalance += parseFloat(amount.replace(',', '.'));
          } else {
            newBalance -= parseFloat(amount.replace(',', '.'));
          }
          
          console.log('Saldo anterior:', selectedAccount.balance, 'Novo saldo:', newBalance);
          await accountsService.updateAccountBalance(accountId, newBalance);
          console.log('Saldo da conta atualizado');
        }
      }

      Alert.alert('Sucesso', `Transação adicionada${isInstallment && installmentCount > 1 ? ` e ${installmentCount} parcelas criadas` : ''}!`);
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      Alert.alert('Erro', 'Erro ao adicionar transação');
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = () => {
    return transactionTypes.find(t => t.id === selectedType.id)?.color || '#F44336';
  };

  const getTypeIcon = () => {
    return transactionTypes.find(t => t.id === selectedType.id)?.icon || 'trending-down';
  };

  // Função para formatar data para DD/MM/YYYY
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  // Função para converter DD/MM/YYYY para YYYY-MM-DD
  const formatDateForStorage = (dateString) => {
    if (!dateString) return '';
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
  };

  // Função para criar nova categoria
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Erro', 'Digite o nome da categoria');
      return;
    }

    try {
      const newCategory = await categoriesService.createCategory({
        user_id: userId,
        name: newCategoryName.trim(),
        type: selectedType.id,
        color: getTypeColor(),
      });
      
      setCategories([...categories, newCategory]);
      setCategoryId(newCategory.id);
      setNewCategoryName('');
      setShowCategoryModal(false);
      Alert.alert('Sucesso', 'Categoria criada com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Erro ao criar categoria');
    }
  };

  // Função para criar nova conta
  const handleCreateAccount = async () => {
    if (!newAccountName.trim()) {
      Alert.alert('Erro', 'Digite o nome da conta');
      return;
    }

    try {
      const newAccount = await accountsService.createAccount({
        user_id: userId,
        name: newAccountName.trim(),
        balance: parseFloat(newAccountBalance.replace(',', '.')) || 0,
        type: 'checking',
        color: '#007AFF',
      });
      
      setAccounts([...accounts, newAccount]);
      setAccountId(newAccount.id);
      setNewAccountName('');
      setNewAccountBalance('');
      setShowAccountModal(false);
      Alert.alert('Sucesso', 'Conta criada com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Erro ao criar conta');
    }
  };

  // Componente de calendário simples
  const DatePickerModal = ({ visible, onClose, onSelect, currentDate }) => {
    const [selectedDate, setSelectedDate] = useState(currentDate);
    const [currentMonth, setCurrentMonth] = useState(new Date(currentDate).getMonth());
    const [currentYear, setCurrentYear] = useState(new Date(currentDate).getFullYear());
    
    // Reset selectedDate quando o modal abre
    useEffect(() => {
      if (visible && currentDate) {
        const dateObj = new Date(currentDate);
        setSelectedDate(currentDate);
        setCurrentMonth(dateObj.getMonth());
        setCurrentYear(dateObj.getFullYear());
      }
    }, [visible, currentDate]);
    
    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getMonthName = (month) => {
      const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                     'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      return months[month];
    };

    const days = daysInMonth(currentYear, currentMonth);

    const handleDateSelect = (day) => {
      const newDate = new Date(currentYear, currentMonth, day);
      const formattedDate = newDate.toISOString().slice(0, 10);
      onSelect(formattedDate);
      onClose();
    };

    const changeMonth = (direction) => {
      const newMonth = currentMonth + direction;
      const newYear = currentYear;
      
      // Ajustar ano se necessário
      let adjustedMonth = newMonth;
      let adjustedYear = newYear;
      
      if (newMonth < 0) {
        adjustedMonth = 11;
        adjustedYear = newYear - 1;
      } else if (newMonth > 11) {
        adjustedMonth = 0;
        adjustedYear = newYear + 1;
      }
      
      setCurrentMonth(adjustedMonth);
      setCurrentYear(adjustedYear);
    };

    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { 
            width: '95%', 
            maxHeight: '90%',
            minHeight: 400
          }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Data</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={() => changeMonth(-1)}>
                <Ionicons name="chevron-back" size={24} color="#007AFF" />
              </TouchableOpacity>
              <Text style={styles.calendarTitle}>
                {getMonthName(currentMonth)} {currentYear}
              </Text>
              <TouchableOpacity onPress={() => changeMonth(1)}>
                <Ionicons name="chevron-forward" size={24} color="#007AFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.calendarGrid}>
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <Text key={day} style={styles.calendarDayHeader}>{day}</Text>
              ))}
              
              {Array.from({ length: new Date(currentYear, currentMonth, 1).getDay() }, (_, i) => (
                <View key={`empty-${i}`} style={styles.calendarDay} />
              ))}
              
              {Array.from({ length: days }, (_, i) => {
                const day = i + 1;
                const isSelected = day === new Date(selectedDate).getDate() && 
                                 currentMonth === new Date(selectedDate).getMonth() && 
                                 currentYear === new Date(selectedDate).getFullYear();
                return (
                  <TouchableOpacity
                    key={day}
                    style={[styles.calendarDay, isSelected && styles.calendarDaySelected]}
                    onPress={() => handleDateSelect(day)}
                  >
                    <Text style={[styles.calendarDayText, isSelected && styles.calendarDayTextSelected]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            
            <TouchableOpacity style={styles.calendarCancel} onPress={onClose}>
              <Text style={styles.calendarCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelButton}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.typeSelector, { borderColor: selectedType.color }]} onPress={() => setShowTypeModal(true)}>
          <Ionicons name={selectedType.icon} size={20} color={selectedType.color} />
          <Text style={[styles.typeText, { color: selectedType.color }]}>{selectedType.title}</Text>
          <Ionicons name="chevron-down" size={16} color={selectedType.color} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.saveButton, { backgroundColor: selectedType.color }]} 
          onPress={() => {
            console.log('Botão salvar pressionado');
            handleAddTransaction();
          }} 
          disabled={loading}
        >
          <Text style={styles.saveText}>Salvar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Valor */}
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>VALOR</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>R$</Text>
            <TextInput 
              style={styles.amountInput} 
              placeholder="0,00" 
              keyboardType="numeric" 
              value={amount} 
              onChangeText={setAmount} 
              autoFocus 
            />
          </View>
        </View>

        {/* Pago */}
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>PAGO</Text>
          <Switch 
            value={isPaid} 
            onValueChange={setIsPaid} 
            trackColor={{ false: '#E0E0E0', true: selectedType.color }} 
            thumbColor={isPaid ? '#FFF' : '#FFF'} 
          />
        </View>

        {/* Data */}
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>DATA</Text>
          <TouchableOpacity 
            style={styles.dateInput} 
            onPress={() => setShowDateModal(true)}
          >
            <Text style={styles.dateInputText}>
              {formatDateForDisplay(date) || 'DD/MM/AAAA'}
            </Text>
            <Ionicons name="calendar" size={20} color="#888" />
          </TouchableOpacity>
        </View>

        {/* Categoria */}
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>CATEGORIA</Text>
          <TouchableOpacity 
            style={styles.selectField} 
            onPress={() => setShowCategorySelectionModal(true)}
          >
            <Text style={styles.selectFieldText}>
              {categories.find(cat => cat.id === categoryId)?.name || 'Selecionar categoria'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#888" />
          </TouchableOpacity>
        </View>

        {/* Conta */}
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>CONTA</Text>
          <TouchableOpacity 
            style={styles.selectField} 
            onPress={() => setShowAccountSelectionModal(true)}
          >
            <Text style={styles.selectFieldText}>
              {accounts.find(acc => acc.id === accountId)?.name || 'Selecionar conta'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#888" />
          </TouchableOpacity>
        </View>

        {/* Descrição */}
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>DESCRIÇÃO</Text>
          <TextInput 
            style={styles.textInput} 
            placeholder="Descrição da transação" 
            value={description} 
            onChangeText={setDescription} 
          />
        </View>

        {/* Ignorar despesa */}
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>IGNORAR</Text>
          <Switch 
            value={ignoreExpense} 
            onValueChange={setIgnoreExpense} 
            trackColor={{ false: '#E0E0E0', true: '#888' }} 
            thumbColor={ignoreExpense ? '#FFF' : '#FFF'} 
          />
        </View>

        {/* Parcelamento - apenas para despesas e cartão */}
        {(selectedType.id === 'expense' || selectedType.id === 'credit_expense') && (
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>PARCELAR</Text>
            <Switch 
              value={isInstallment} 
              onValueChange={setIsInstallment} 
              trackColor={{ false: '#E0E0E0', true: selectedType.color }} 
              thumbColor={isInstallment ? '#FFF' : '#FFF'} 
            />
          </View>
        )}

        {/* Quantidade de parcelas */}
        {isInstallment && (selectedType.id === 'expense' || selectedType.id === 'credit_expense') && (
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>PARCELAS</Text>
            <TouchableOpacity 
              style={styles.selectField} 
              onPress={() => setShowInstallmentModal(true)}
            >
              <Text style={styles.selectFieldText}>
                {installmentCount} {installmentCount === 1 ? 'parcela' : 'parcelas'}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        )}

        {/* Switch de valor fixo/dividido - apenas quando parcelamento está ativo */}
        {isInstallment && installmentCount > 1 && (selectedType.id === 'expense' || selectedType.id === 'credit_expense') && (
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>VALOR FIXO</Text>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>
                {isFixedInstallment ? 'Valor fixo por parcela' : 'Valor dividido'}
              </Text>
              <Switch
                value={isFixedInstallment}
                onValueChange={setIsFixedInstallment}
                trackColor={{ false: '#E0E0E0', true: selectedType.color }}
                thumbColor={isFixedInstallment ? '#FFF' : '#FFF'}
              />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Modal de seleção de tipo */}
      <Modal visible={showTypeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tipo de Transação</Text>
              <TouchableOpacity onPress={() => setShowTypeModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            {transactionTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={styles.modalOption}
                onPress={() => {
                  setSelectedType(type);
                  setShowTypeModal(false);
                }}
              >
                <View style={[styles.modalIcon, { backgroundColor: type.color }]}>
                  <Ionicons name={type.icon} size={20} color="#FFF" />
                </View>
                <Text style={styles.modalOptionText}>{type.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Modal de seleção de categoria */}
      <Modal visible={showCategorySelectionModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { 
            width: '95%', 
            maxHeight: '90%',
            minHeight: 400
          }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Categoria</Text>
              <TouchableOpacity onPress={() => setShowCategorySelectionModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            {/* Lista de categorias existentes */}
            <View style={{ flex: 1, marginTop: 10, marginBottom: 10 }}>
              <ScrollView showsVerticalScrollIndicator={true} style={{ flex: 1 }}>
                {(() => {
                  const filteredCategories = categories.filter(cat => cat.type === selectedType.id);
                  console.log('Filtrando categorias para tipo:', selectedType.id, 'Resultado:', filteredCategories.length);
                  
                  if (filteredCategories.length === 0) {
                    return (
                      <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>
                          Nenhuma categoria do tipo "{selectedType.title}" encontrada
                        </Text>
                        <Text style={styles.emptyStateSubtext}>
                          Crie uma nova categoria ou mude o tipo de transação
                        </Text>
                      </View>
                    );
                  }
                  
                  return filteredCategories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={styles.modalOption}
                      onPress={() => {
                        setCategoryId(category.id);
                        setShowCategorySelectionModal(false);
                      }}
                    >
                      <View style={[styles.modalIcon, { backgroundColor: category.color || '#007AFF' }]}>
                        <Text style={styles.categoryIconText}>{category.icon || '📁'}</Text>
                      </View>
                      <View style={styles.categoryInfo}>
                        <Text style={styles.modalOptionText}>{category.name}</Text>
                      </View>
                    </TouchableOpacity>
                  ));
                })()}
              </ScrollView>
            </View>
            
            {/* Botão para criar nova categoria */}
            <TouchableOpacity 
              style={[styles.modalOption, styles.createNewButton]}
              onPress={() => {
                setShowCategorySelectionModal(false);
                setShowCategoryModal(true);
              }}
            >
              <View style={[styles.modalIcon, { backgroundColor: '#4CAF50' }]}>
                <Ionicons name="add" size={20} color="#FFF" />
              </View>
              <Text style={styles.modalOptionText}>Criar nova categoria</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de criação de categoria */}
      <Modal visible={showCategoryModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova Categoria</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.modalInput}
              placeholder="Nome da categoria"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={handleCreateCategory}>
                <Text style={styles.modalButtonText}>Criar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonSecondary]} onPress={() => setShowCategoryModal(false)}>
                <Text style={[styles.modalButtonText, styles.modalButtonTextSecondary]}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de seleção de conta */}
      <Modal visible={showAccountSelectionModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { 
            width: '95%', 
            maxHeight: '90%',
            minHeight: 400
          }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Conta</Text>
              <TouchableOpacity onPress={() => setShowAccountSelectionModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            {/* Lista de contas existentes */}
            <View style={{ flex: 1, marginTop: 10, marginBottom: 10 }}>
              <ScrollView showsVerticalScrollIndicator={true} style={{ flex: 1 }}>
                {(() => {
                  console.log('Todas as contas:', accounts.map(a => ({ name: a.name, balance: a.balance })));
                  
                  if (accounts.length === 0) {
                    return (
                      <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>Nenhuma conta encontrada</Text>
                      </View>
                    );
                  }
                  
                  return accounts.map((account) => (
                    <TouchableOpacity
                      key={account.id}
                      style={styles.modalOption}
                      onPress={() => {
                        setAccountId(account.id);
                        setShowAccountSelectionModal(false);
                      }}
                    >
                      <View style={[styles.modalIcon, { backgroundColor: account.color || '#007AFF' }]}>
                        <Ionicons name="wallet" size={20} color="#FFF" />
                      </View>
                      <View style={styles.accountInfo}>
                        <Text style={styles.modalOptionText}>{account.name}</Text>
                        <Text style={styles.accountBalance}>R$ {account.balance?.toFixed(2) || '0,00'}</Text>
                      </View>
                    </TouchableOpacity>
                  ));
                })()}
              </ScrollView>
            </View>
            
            {/* Botão para criar nova conta */}
            <TouchableOpacity 
              style={[styles.modalOption, styles.createNewButton]}
              onPress={() => {
                setShowAccountSelectionModal(false);
                setShowAccountModal(true);
              }}
            >
              <View style={[styles.modalIcon, { backgroundColor: '#4CAF50' }]}>
                <Ionicons name="add" size={20} color="#FFF" />
              </View>
              <Text style={styles.modalOptionText}>Criar nova conta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de criação de conta */}
      <Modal visible={showAccountModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova Conta</Text>
              <TouchableOpacity onPress={() => setShowAccountModal(false)}>
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
              placeholder="Saldo inicial (R$ 0,00)"
              value={newAccountBalance}
              onChangeText={setNewAccountBalance}
              keyboardType="numeric"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={handleCreateAccount}>
                <Text style={styles.modalButtonText}>Criar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonSecondary]} onPress={() => setShowAccountModal(false)}>
                <Text style={[styles.modalButtonText, styles.modalButtonTextSecondary]}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de seleção de parcelas */}
      <Modal visible={showInstallmentModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Parcelas</Text>
              <TouchableOpacity onPress={() => setShowInstallmentModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {Array.from({ length: 11 }, (_, i) => {
                const parcelCount = i + 2; // Começar de 2 parcelas
                return (
                  <TouchableOpacity
                    key={parcelCount}
                    style={styles.modalOption}
                    onPress={() => {
                      setInstallmentCount(parcelCount);
                      setShowInstallmentModal(false);
                    }}
                  >
                    <View style={[styles.modalIcon, { backgroundColor: selectedType.color }]}>
                      <Text style={styles.categoryIconText}>{parcelCount}</Text>
                    </View>
                    <Text style={styles.modalOptionText}>
                      {parcelCount} {parcelCount === 1 ? 'parcela' : 'parcelas'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Calendários */}
      <DatePickerModal
        visible={showDateModal}
        onClose={() => setShowDateModal(false)}
        onSelect={setDate}
        currentDate={date}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    zIndex: 1000,
    elevation: 5,
    minHeight: 60,
  },
  cancelButton: {
    padding: 8,
  },
  cancelText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  typeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 20,
    gap: 4,
    maxWidth: 120,
  },
  typeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  saveText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFF',
    marginBottom: 1,
    paddingHorizontal: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    minWidth: 80,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  amountInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right',
    minWidth: 120,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    backgroundColor: '#F8F9FA',
    minWidth: 120,
    justifyContent: 'space-between',
  },
  dateInputText: {
    fontSize: 14,
    color: '#333',
  },
  selectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    gap: 8,
  },
  selectField: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    backgroundColor: '#F8F9FA',
    flex: 1,
    maxWidth: 200,
  },
  selectFieldText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  textInput: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flex: 1,
    maxWidth: 200,
    textAlign: 'right',
  },
  numberInput: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minWidth: 60,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFF',
  },
  modalIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    fontWeight: '500',
  },
  modalInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 16,
    width: '100%',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  modalButtonSecondary: {
    backgroundColor: '#E0E0E0',
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextSecondary: {
    color: '#333',
  },
  calendarContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
    width: '90%',
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  calendarDayHeader: {
    width: width / 7 - 8,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  calendarDay: {
    width: width / 7 - 8,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  calendarDaySelected: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
  },
  calendarDayText: {
    fontSize: 16,
    color: '#333',
  },
  calendarDayTextSelected: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  calendarCancel: {
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  calendarCancelText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  repeatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  repeatText: {
    fontSize: 14,
    color: '#666',
  },
  categoryList: {
    flex: 1,
  },
  categoryIconText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  createNewButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 0,
  },
  accountInfo: {
    flexDirection: 'column',
    flex: 1,
  },
  accountBalance: {
    fontSize: 12,
    color: '#666',
  },
  categoryInfo: {
    flexDirection: 'column',
    flex: 1,
  },
  categoryType: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#666',
    fontSize: 16,
  },
  emptyStateSubtext: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchLabel: {
    fontSize: 14,
    color: '#666',
  },
});

export default AddTransactionScreen; 