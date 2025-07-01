import { supabase, authService } from './supabase';

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: 'income' | 'expense' | 'transfer' | 'credit_expense';
  color: string;
  icon: string;
  created_at: string;
}

export const categoriesService = {
  // Buscar categorias do usuário
  async getCategories(userId: string): Promise<Category[]> {
    try {
      // Garantir que o usuário existe
      const user = await authService.getCurrentUser();
      if (user) {
        await authService.ensureUserExists(user.id, user.email || '', user.user_metadata?.name || '');
      }

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      throw error;
    }
  },

  // Buscar categorias por tipo
  async getCategoriesByType(userId: string, type: Category['type']): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .eq('type', type)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar categorias por tipo:', error);
      throw error;
    }
  },

  // Buscar uma categoria específica
  async getCategory(categoryId: string): Promise<Category | null> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar categoria:', error);
      throw error;
    }
  },

  // Criar nova categoria
  async createCategory(categoryData: Omit<Category, 'id' | 'created_at'>): Promise<Category> {
    try {
      // Garantir que o usuário existe
      const user = await authService.getCurrentUser();
      if (user) {
        await authService.ensureUserExists(user.id, user.email || '', user.user_metadata?.name || '');
      }

      const { data, error } = await supabase
        .from('categories')
        .insert([categoryData])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      throw error;
    }
  },

  // Atualizar categoria
  async updateCategory(categoryId: string, updates: Partial<Category>): Promise<Category> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', categoryId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      throw error;
    }
  },

  // Deletar categoria
  async deleteCategory(categoryId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      throw error;
    }
  },

  // Criar categorias padrão para um usuário
  async createDefaultCategories(userId: string): Promise<void> {
    const defaultCategories: Omit<Category, 'id' | 'created_at'>[] = [
      // Categorias de despesa
      { user_id: userId, name: 'Alimentação', type: 'expense', color: '#FF6B6B', icon: '🍕' },
      { user_id: userId, name: 'Transporte', type: 'expense', color: '#4ECDC4', icon: '🚗' },
      { user_id: userId, name: 'Moradia', type: 'expense', color: '#45B7D1', icon: '🏠' },
      { user_id: userId, name: 'Saúde', type: 'expense', color: '#96CEB4', icon: '💊' },
      { user_id: userId, name: 'Educação', type: 'expense', color: '#FFEAA7', icon: '📚' },
      { user_id: userId, name: 'Lazer', type: 'expense', color: '#DDA0DD', icon: '🎮' },
      { user_id: userId, name: 'Vestuário', type: 'expense', color: '#98D8C8', icon: '👕' },
      { user_id: userId, name: 'Serviços', type: 'expense', color: '#F7DC6F', icon: '🔧' },
      
      // Categorias de receita
      { user_id: userId, name: 'Salário', type: 'income', color: '#4CAF50', icon: '💰' },
      { user_id: userId, name: 'Freelance', type: 'income', color: '#8BC34A', icon: '💼' },
      { user_id: userId, name: 'Investimentos', type: 'income', color: '#FF9800', icon: '📈' },
      { user_id: userId, name: 'Presentes', type: 'income', color: '#E91E63', icon: '🎁' },
      { user_id: userId, name: 'Reembolso', type: 'income', color: '#9C27B0', icon: '💳' },
      
      // Categorias de transferência
      { user_id: userId, name: 'Transferência entre contas', type: 'transfer', color: '#2196F3', icon: '🔄' },
      { user_id: userId, name: 'Depósito', type: 'transfer', color: '#00BCD4', icon: '📥' },
      { user_id: userId, name: 'Saque', type: 'transfer', color: '#FF5722', icon: '📤' },
      
      // Categorias de despesa de cartão
      { user_id: userId, name: 'Cartão de Crédito', type: 'credit_expense', color: '#FF9800', icon: '💳' },
      { user_id: userId, name: 'Parcelamento', type: 'credit_expense', color: '#FF5722', icon: '📋' },
      { user_id: userId, name: 'Taxa de Juros', type: 'credit_expense', color: '#E91E63', icon: '📊' },
    ];

    try {
      const { error } = await supabase
        .from('categories')
        .insert(defaultCategories);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao criar categorias padrão:', error);
      throw error;
    }
  },

  // Verificar se usuário tem categorias
  async hasCategories(userId: string): Promise<boolean> {
    try {
      const categories = await this.getCategories(userId);
      return categories.length > 0;
    } catch (error) {
      console.error('Erro ao verificar categorias:', error);
      return false;
    }
  },

  // Escutar mudanças nas categorias em tempo real
  subscribeToCategories(userId: string, callback: (category: Category) => void) {
    return supabase
      .channel('categories')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'categories',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new as Category);
        }
      )
      .subscribe();
  },
}; 