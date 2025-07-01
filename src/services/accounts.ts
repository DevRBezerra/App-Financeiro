import { supabase, authService } from './supabase';

export interface Account {
  id: string;
  user_id: string;
  name: string;
  balance: number;
  type: 'checking' | 'savings' | 'credit' | 'investment';
  created_at: string;
}

export const accountsService = {
  // Buscar contas do usuário
  async getAccounts(userId: string): Promise<Account[]> {
    try {
      // Garantir que o usuário existe
      const user = await authService.getCurrentUser();
      if (user) {
        await authService.ensureUserExists(user.id, user.email || '', user.user_metadata?.name || '');
      }

      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar contas:', error);
      throw error;
    }
  },

  // Buscar uma conta específica
  async getAccount(accountId: string): Promise<Account | null> {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', accountId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar conta:', error);
      throw error;
    }
  },

  // Criar nova conta
  async createAccount(accountData: Omit<Account, 'id' | 'created_at'>): Promise<Account> {
    try {
      console.log('accountsService.createAccount - Dados recebidos:', accountData);
      
      // Garantir que o usuário existe
      const user = await authService.getCurrentUser();
      if (user) {
        await authService.ensureUserExists(user.id, user.email || '', user.user_metadata?.name || '');
      }

      const { data, error } = await supabase
        .from('accounts')
        .insert([accountData])
        .select();

      if (error) {
        console.error('Erro do Supabase ao criar conta:', error);
        throw error;
      }
      
      console.log('accountsService.createAccount - Conta criada:', data[0]);
      return data[0];
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      throw error;
    }
  },

  // Atualizar conta
  async updateAccount(accountId: string, updates: Partial<Account>): Promise<Account> {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .update(updates)
        .eq('id', accountId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao atualizar conta:', error);
      throw error;
    }
  },

  // Atualizar saldo da conta
  async updateAccountBalance(accountId: string, balance: number): Promise<Account> {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .update({ balance })
        .eq('id', accountId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao atualizar saldo:', error);
      throw error;
    }
  },

  // Deletar conta
  async deleteAccount(accountId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', accountId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar conta:', error);
      throw error;
    }
  },

  // Calcular saldo total do usuário
  async getTotalBalance(userId: string): Promise<number> {
    try {
      const accounts = await this.getAccounts(userId);
      return accounts.reduce((total, account) => total + parseFloat(String(account.balance || 0)), 0);
    } catch (error) {
      console.error('Erro ao calcular saldo total:', error);
      return 0;
    }
  },

  // Buscar contas por tipo
  async getAccountsByType(userId: string, type: Account['type']): Promise<Account[]> {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .eq('type', type)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar contas por tipo:', error);
      throw error;
    }
  },

  // Escutar mudanças nas contas em tempo real
  subscribeToAccounts(userId: string, callback: (account: Account) => void) {
    return supabase
      .channel('accounts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'accounts',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new as Account);
        }
      )
      .subscribe();
  },
}; 