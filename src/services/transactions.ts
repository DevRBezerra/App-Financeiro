import { supabase } from './supabase';

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer' | 'credit_expense';
  category: string;
  date: string;
  created_at: string;
  is_paid?: boolean;
  is_installment?: boolean;
  installment_group?: string;
  installment_number?: number;
  total_installments?: number;
  is_repeat?: boolean;
  original_transaction_id?: string;
  repeat_number?: number;
  total_repeats?: number;
  due_date?: string;
}

export const transactionsService = {
  // Buscar transações do usuário
  async getTransactions(userId: string): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      throw error;
    }
  },

  // Buscar transações por conta
  async getTransactionsByAccount(accountId: string): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('account_id', accountId)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar transações por conta:', error);
      throw error;
    }
  },

  // Buscar transações por período
  async getTransactionsByPeriod(userId: string, startDate: string, endDate: string): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar transações por período:', error);
      throw error;
    }
  },

  // Buscar transações por tipo
  async getTransactionsByType(userId: string, type: Transaction['type']): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('type', type)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar transações por tipo:', error);
      throw error;
    }
  },

  // Buscar uma transação específica
  async getTransaction(transactionId: string): Promise<Transaction | null> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar transação:', error);
      throw error;
    }
  },

  // Criar nova transação
  async createTransaction(transactionData: any): Promise<Transaction> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([transactionData])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      throw error;
    }
  },

  // Criar múltiplas transações
  async createMultipleTransactions(transactionsData: any[]): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert(transactionsData)
        .select();

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao criar múltiplas transações:', error);
      throw error;
    }
  },

  // Buscar transações por mês
  async getTransactionsByMonth(userId: string, year: number, month: number) {
    try {
      const startDate = new Date(year, month, 1).toISOString();
      const endDate = new Date(year, month + 1, 0).toISOString();

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar transações do mês:', error);
      throw error;
    }
  },

  // Buscar transações não pagas
  async getUnpaidTransactions(userId: string) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_paid', false)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar transações não pagas:', error);
      throw error;
    }
  },

  // Marcar transação como paga
  async markAsPaid(transactionId: string) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update({ is_paid: true })
        .eq('id', transactionId)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Erro ao marcar como paga:', error);
      throw error;
    }
  },

  // Processar transações não pagas para o próximo mês
  async processUnpaidTransactions(userId: string) {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      // Buscar transações não pagas do mês atual
      const startDate = new Date(currentYear, currentMonth, 1).toISOString();
      const endDate = new Date(currentYear, currentMonth + 1, 0).toISOString();

      const { data: unpaidTransactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_paid', false)
        .gte('due_date', startDate)
        .lte('due_date', endDate);

      if (error) throw error;

      // Criar novas transações para o próximo mês
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;

      const newTransactions = unpaidTransactions.map(transaction => ({
        user_id: transaction.user_id,
        account_id: transaction.account_id,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        date: new Date(nextYear, nextMonth, new Date(transaction.due_date).getDate()).toISOString().slice(0, 10),
        due_date: new Date(nextYear, nextMonth, new Date(transaction.due_date).getDate()).toISOString().slice(0, 10),
        description: `${transaction.description} (Repassado do mês anterior)`,
        created_at: new Date().toISOString(),
        is_paid: false,
        is_fixed: transaction.is_fixed,
        is_repeat: transaction.is_repeat,
        repeat_interval: transaction.repeat_interval,
        is_installment: transaction.is_installment,
        installment_count: transaction.installment_count,
        ignore_expense: transaction.ignore_expense,
        carried_over: true, // Marca como repassada
        original_transaction_id: transaction.id, // Referência à transação original
      }));

      if (newTransactions.length > 0) {
        const { error: insertError } = await supabase
          .from('transactions')
          .insert(newTransactions);

        if (insertError) throw insertError;
      }

      return newTransactions.length;
    } catch (error) {
      console.error('Erro ao processar transações não pagas:', error);
      throw error;
    }
  },

  // Executar processamento automático no início do mês
  async runMonthlyProcessing() {
    try {
      const currentDate = new Date();
      const currentDay = currentDate.getDate();

      // Executar apenas no primeiro dia do mês
      if (currentDay === 1) {
        // Buscar todos os usuários únicos
        const { data: users, error: usersError } = await supabase
          .from('transactions')
          .select('user_id')
          .not('user_id', 'is', null);

        if (usersError) throw usersError;

        const uniqueUsers = [...new Set(users.map(u => u.user_id))];

        // Processar para cada usuário
        for (const userId of uniqueUsers) {
          await this.processUnpaidTransactions(userId);
        }
      }
    } catch (error) {
      console.error('Erro no processamento mensal:', error);
      throw error;
    }
  },

  // Atualizar transação
  async updateTransaction(transactionId: string, updates: any): Promise<Transaction> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', transactionId)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      throw error;
    }
  },

  // Deletar transação
  async deleteTransaction(transactionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar transação:', error);
      throw error;
    }
  },

  // Deletar transação e suas parcelas
  async deleteTransactionWithInstallments(transactionId: string): Promise<void> {
    try {
      // Primeiro, buscar a transação para verificar se é uma transação principal
      const transaction = await this.getTransaction(transactionId);
      
      if (!transaction) {
        throw new Error('Transação não encontrada');
      }

      console.log('Excluindo transação:', transaction.id, 'Tipo:', transaction.type, 'Valor:', transaction.amount);

      // Reverter o saldo da conta antes de excluir a transação
      const { data: accountData, error: accountError } = await supabase
        .from('accounts')
        .select('balance')
        .eq('id', transaction.account_id)
        .single();

      if (accountError) {
        console.error('Erro ao buscar conta:', accountError);
        throw accountError;
      }

      let newBalance = accountData.balance;
      if (transaction.type === 'income') {
        newBalance -= parseFloat(String(transaction.amount || 0));
      } else {
        newBalance += parseFloat(String(transaction.amount || 0));
      }

      console.log('Saldo anterior:', accountData.balance, 'Novo saldo:', newBalance);

      // Atualizar o saldo da conta
      const { error: updateError } = await supabase
        .from('accounts')
        .update({ balance: newBalance })
        .eq('id', transaction.account_id);

      if (updateError) {
        console.error('Erro ao atualizar saldo da conta:', updateError);
        throw updateError;
      }

      // Se for uma transação principal com parcelamento, deletar todas as parcelas
      if (transaction.is_installment && !transaction.original_transaction_id) {
        console.log('Excluindo parcelas da transação principal:', transactionId);
        
        // Deletar todas as parcelas relacionadas
        const { error: installmentsError } = await supabase
          .from('transactions')
          .delete()
          .eq('original_transaction_id', transactionId);

        if (installmentsError) {
          console.error('Erro ao excluir parcelas:', installmentsError);
          throw installmentsError;
        }
        
        console.log('Parcelas excluídas com sucesso');
      }

      // Se for uma transação principal com repetição, deletar todas as repetições
      if (transaction.is_repeat && !transaction.original_transaction_id) {
        console.log('Excluindo repetições da transação principal:', transactionId);
        
        // Deletar todas as repetições relacionadas
        const { error: repeatsError } = await supabase
          .from('transactions')
          .delete()
          .eq('original_transaction_id', transactionId);

        if (repeatsError) {
          console.error('Erro ao excluir repetições:', repeatsError);
          throw repeatsError;
        }
        
        console.log('Repetições excluídas com sucesso');
      }

      // Se for uma parcela ou repetição, deletar apenas ela
      if (transaction.original_transaction_id) {
        console.log('Excluindo parcela/repetição individual:', transactionId);
        
        // Deletar apenas esta parcela/repetição
        const { error } = await supabase
          .from('transactions')
          .delete()
          .eq('id', transactionId);

        if (error) throw error;
        return;
      }

      // Deletar a transação principal
      console.log('Excluindo transação principal:', transactionId);
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar transação com parcelas:', error);
      throw error;
    }
  },

  // Calcular total de receitas por período
  async getTotalIncome(userId: string, startDate?: string, endDate?: string): Promise<number> {
    try {
      let query = supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('type', 'income');

      if (startDate) {
        query = query.gte('date', startDate);
      }
      if (endDate) {
        query = query.lte('date', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data?.reduce((total, transaction) => total + parseFloat(String(transaction.amount || 0)), 0) || 0;
    } catch (error) {
      console.error('Erro ao calcular total de receitas:', error);
      return 0;
    }
  },

  // Calcular total de despesas por período
  async getTotalExpenses(userId: string, startDate?: string, endDate?: string): Promise<number> {
    try {
      let query = supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('type', 'expense');

      if (startDate) {
        query = query.gte('date', startDate);
      }
      if (endDate) {
        query = query.lte('date', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data?.reduce((total, transaction) => total + parseFloat(String(transaction.amount || 0)), 0) || 0;
    } catch (error) {
      console.error('Erro ao calcular total de despesas:', error);
      return 0;
    }
  },

  // Calcular saldo por período
  async getBalance(userId: string, startDate?: string, endDate?: string): Promise<number> {
    try {
      const income = await this.getTotalIncome(userId, startDate, endDate);
      const expenses = await this.getTotalExpenses(userId, startDate, endDate);
      return income - expenses;
    } catch (error) {
      console.error('Erro ao calcular saldo:', error);
      return 0;
    }
  },

  // Buscar transações por categoria
  async getTransactionsByCategory(userId: string, category: string): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('category', category)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar transações por categoria:', error);
      throw error;
    }
  },

  // Obter estatísticas de transações
  async getTransactionStats(userId: string, startDate?: string, endDate?: string) {
    try {
      const transactions = await this.getTransactionsByPeriod(userId, startDate || '1900-01-01', endDate || '2100-12-31');
      
      const stats = {
        totalTransactions: transactions.length,
        totalIncome: 0,
        totalExpenses: 0,
        averageTransaction: 0,
        mostUsedCategory: '',
        categoryBreakdown: {} as Record<string, number>,
      };

      transactions.forEach(transaction => {
        if (transaction.type === 'income') {
          stats.totalIncome += parseFloat(String(transaction.amount || 0));
        } else {
          stats.totalExpenses += parseFloat(String(transaction.amount || 0));
        }

        // Contar por categoria
        if (!stats.categoryBreakdown[transaction.category]) {
          stats.categoryBreakdown[transaction.category] = 0;
        }
        stats.categoryBreakdown[transaction.category] += parseFloat(String(transaction.amount || 0));
      });

      // Calcular média
      if (transactions.length > 0) {
        const totalAmount = transactions.reduce((sum, t) => sum + parseFloat(String(t.amount || 0)), 0);
        stats.averageTransaction = totalAmount / transactions.length;
      }

      // Categoria mais usada
      const categoryEntries = Object.entries(stats.categoryBreakdown);
      if (categoryEntries.length > 0) {
        stats.mostUsedCategory = categoryEntries.reduce((a, b) => 
          stats.categoryBreakdown[a[0]] > stats.categoryBreakdown[b[0]] ? a : b
        )[0];
      }

      return stats;
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
      throw error;
    }
  },

  // Escutar mudanças nas transações em tempo real
  subscribeToTransactions(userId: string, callback: (transaction: Transaction) => void) {
    return supabase
      .channel('transactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new as Transaction);
        }
      )
      .subscribe();
  },

  // Buscar estatísticas do usuário
  async getUserStats(userId: string, year: number, month: number) {
    try {
      const startDate = new Date(year, month, 1).toISOString();
      const endDate = new Date(year, month + 1, 0).toISOString();

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate);

      if (error) throw error;

      const income = data
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

      const expenses = data
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

      const unpaid = data
        .filter(t => !t.is_paid)
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

      return {
        income,
        expenses,
        balance: income - expenses,
        unpaid,
        totalTransactions: data.length,
        paidTransactions: data.filter(t => t.is_paid).length,
        unpaidTransactions: data.filter(t => !t.is_paid).length,
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  },
}; 