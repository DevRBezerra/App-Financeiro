import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabaseConfig } from '../config/supabase';

export const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
});

// Função para traduzir erros do Supabase
const translateError = (error: any) => {
  console.log('Erro original:', error);
  
  if (error.message) {
    if (error.message.includes('Invalid login credentials')) {
      return 'E-mail ou senha incorretos.';
    } else if (error.message.includes('User already registered')) {
      return 'Este e-mail já está em uso.';
    } else if (error.message.includes('Password should be at least')) {
      return 'A senha deve ter pelo menos 6 caracteres.';
    } else if (error.message.includes('Invalid email')) {
      return 'E-mail inválido.';
    } else if (error.message.includes('Email not confirmed')) {
      return 'E-mail não confirmado. Verifique sua caixa de entrada.';
    } else if (error.message.includes('requested path is invalid')) {
      return 'Erro de configuração. Verifique as configurações do Supabase.';
    } else if (error.message.includes('row-level security policy')) {
      return 'Erro de permissão. Verifique as configurações do banco de dados.';
    }
  }
  
  return error.message || 'Ocorreu um erro inesperado. Tente novamente.';
};

// Serviços de autenticação
export const authService = {
  // Cadastrar usuário
  async signUp(email: string, password: string, name: string) {
    try {
      console.log('Iniciando cadastro para:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          emailRedirectTo: undefined,
        },
      });

      if (error) {
        console.error('Erro no signUp:', error);
        throw new Error(translateError(error));
      }

      console.log('Usuário criado com sucesso:', data.user?.id);

      if (data.user && !data.session) {
        console.log('Usuário criado, mas precisa confirmar email');
        
        try {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (signInError) {
            console.error('Erro ao fazer login após cadastro:', signInError);
            throw new Error('Cadastro realizado, mas não foi possível fazer login automático. Tente fazer login manualmente.');
          }

          console.log('Login automático realizado com sucesso');
          
          if (signInData.user) {
            try {
              await this.createDefaultAccount(signInData.user.id, name);
              await this.createDefaultCategories(signInData.user.id);
            } catch (profileError) {
              console.warn('Aviso: Não foi possível criar conta padrão ou categorias:', profileError);
            }
          }

          return signInData;
        } catch (autoLoginError) {
          console.error('Erro no login automático:', autoLoginError);
          throw new Error('Cadastro realizado com sucesso! Faça login manualmente.');
        }
      }

      if (data.user && data.session) {
        console.log('Usuário criado e logado automaticamente');
        
        try {
          await this.createDefaultAccount(data.user.id, name);
          await this.createDefaultCategories(data.user.id);
        } catch (profileError) {
          console.warn('Aviso: Não foi possível criar conta padrão ou categorias:', profileError);
        }
      }

      return data;
    } catch (error) {
      console.error('Erro no cadastro:', error);
      throw error;
    }
  },

  // Criar perfil do usuário
  async createUserProfile(userId: string, userEmail: string, userName: string) {
    try {
      const { error: rpcError } = await supabase.rpc('create_user_profile', {
        user_id: userId,
        user_email: userEmail,
        user_name: userName
      });
      
      if (rpcError) {
        console.log('RPC não disponível, tentando inserção direta:', rpcError);
        
        const { error: insertError } = await supabase
          .from('users')
          .insert([
            {
              id: userId,
              email: userEmail,
              name: userName,
              created_at: new Date().toISOString(),
            },
          ]);
        
        if (insertError) {
          console.error('Erro ao criar perfil:', insertError);
          if (insertError.code !== '23505') {
            throw new Error(translateError(insertError));
          }
        } else {
          console.log('Perfil do usuário criado com sucesso');
        }
      } else {
        console.log('Perfil do usuário criado via RPC');
      }
    } catch (error) {
      console.error('Erro ao criar perfil do usuário:', error);
      throw error;
    }
  },

  // Criar conta padrão para o usuário
  async createDefaultAccount(userId: string, userName: string) {
    try {
      console.log('Criando conta padrão para usuário:', userId);
      
      const defaultAccount = {
        user_id: userId,
        name: 'Conta Principal',
        balance: 0,
        type: 'checking',
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('accounts')
        .insert([defaultAccount])
        .select();

      if (error) {
        console.error('Erro ao criar conta padrão:', error);
        
        if (error.code === '23503') {
          console.log('Tentando criar usuário na tabela users primeiro...');
          
          try {
            const { error: userError } = await supabase
              .from('users')
              .insert([
                {
                  id: userId,
                  email: '',
                  name: userName,
                  created_at: new Date().toISOString(),
                },
              ]);

            if (userError && userError.code !== '23505') {
              console.error('Erro ao criar usuário:', userError);
              throw userError;
            }

            const { data: retryData, error: retryError } = await supabase
              .from('accounts')
              .insert([defaultAccount])
              .select();

            if (retryError) {
              console.error('Erro ao criar conta após criar usuário:', retryError);
              throw retryError;
            }

            console.log('Conta padrão criada com sucesso após criar usuário:', retryData[0].id);
            return retryData[0];
          } catch (userCreateError) {
            console.error('Erro ao criar usuário e conta:', userCreateError);
            throw userCreateError;
          }
        }
        
        throw error;
      }

      console.log('Conta padrão criada com sucesso:', data[0].id);
      return data[0];
    } catch (error) {
      console.error('Erro ao criar conta padrão:', error);
      throw error;
    }
  },

  // Criar categorias padrão para o usuário
  async createDefaultCategories(userId: string) {
    try {
      console.log('Criando categorias padrão para usuário:', userId);
      
      const { data: rpcData, error: rpcError } = await supabase.rpc('create_default_categories', {
        user_id: userId
      });
      
      if (rpcError) {
        console.log('RPC não disponível, tentando inserção direta:', rpcError);
        
        const defaultCategories = [
          // Despesas
          { user_id: userId, name: 'Alimentação', type: 'expense', color: '#FF6B6B', icon: 'restaurant' },
          { user_id: userId, name: 'Transporte', type: 'expense', color: '#4ECDC4', icon: 'car' },
          { user_id: userId, name: 'Saúde', type: 'expense', color: '#45B7D1', icon: 'medical' },
          { user_id: userId, name: 'Educação', type: 'expense', color: '#96CEB4', icon: 'school' },
          { user_id: userId, name: 'Lazer', type: 'expense', color: '#FFEAA7', icon: 'game-controller' },
          { user_id: userId, name: 'Vestuário', type: 'expense', color: '#DDA0DD', icon: 'shirt' },
          { user_id: userId, name: 'Moradia', type: 'expense', color: '#98D8C8', icon: 'home' },
          { user_id: userId, name: 'Serviços', type: 'expense', color: '#F7DC6F', icon: 'construct' },
          { user_id: userId, name: 'Outros', type: 'expense', color: '#BB8FCE', icon: 'ellipsis-horizontal' },
          
          // Receitas
          { user_id: userId, name: 'Salário', type: 'income', color: '#4CAF50', icon: 'trending-up' },
          { user_id: userId, name: 'Freelance', type: 'income', color: '#4CAF50', icon: 'trending-up' },
          { user_id: userId, name: 'Investimentos', type: 'income', color: '#4CAF50', icon: 'trending-up' },
          { user_id: userId, name: 'Presentes', type: 'income', color: '#E91E63', icon: 'gift' },
          { user_id: userId, name: 'Reembolso', type: 'income', color: '#9C27B0', icon: 'card' },
          
          // Transferências
          { user_id: userId, name: 'Transferência entre contas', type: 'transfer', color: '#2196F3', icon: 'swap-horizontal' },
          { user_id: userId, name: 'Depósito', type: 'transfer', color: '#00BCD4', icon: 'arrow-down' },
          { user_id: userId, name: 'Saque', type: 'transfer', color: '#FF5722', icon: 'arrow-up' },
          
          // Despesas de cartão
          { user_id: userId, name: 'Cartão de Crédito', type: 'credit_expense', color: '#FF9800', icon: 'card' },
          { user_id: userId, name: 'Parcelamento', type: 'credit_expense', color: '#FF5722', icon: 'list' },
          { user_id: userId, name: 'Taxa de Juros', type: 'credit_expense', color: '#E91E63', icon: 'trending-up' },
        ];

        const { data, error } = await supabase
          .from('categories')
          .insert(defaultCategories)
          .select();

        if (error) {
          console.error('Erro ao criar categorias padrão:', error);
          throw error;
        }

        console.log(`${data.length} categorias padrão criadas com sucesso`);
        return data;
      } else {
        console.log(`${rpcData.length} categorias padrão criadas via RPC`);
        return rpcData;
      }
    } catch (error) {
      console.error('Erro ao criar categorias padrão:', error);
      throw error;
    }
  },

  // Fazer login
  async signIn(email: string, password: string) {
    try {
      console.log('Iniciando login para:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Erro no signIn:', error);
        throw new Error(translateError(error));
      }

      console.log('Login realizado com sucesso:', data.user?.id);
      return data;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  },

  // Fazer logout
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(translateError(error));
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    }
  },

  // Obter usuário atual
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw new Error(translateError(error));
      return user;
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      throw error;
    }
  },

  // Escutar mudanças de autenticação
  onAuthStateChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      console.log('Mudança de autenticação:', event, session?.user?.id);
      callback(session?.user || null);
    });
  },

  // Garantir que o usuário existe na tabela users
  async ensureUserExists(userId: string, userEmail: string, userName: string) {
    try {
      const { data: existingUser, error: selectError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        console.error('Erro ao verificar usuário:', selectError);
        throw selectError;
      }

      if (!existingUser) {
        console.log('Criando usuário na tabela users:', userId);
        const { error: insertError } = await supabase
          .from('users')
          .insert([
            {
              id: userId,
              email: userEmail,
              name: userName,
              created_at: new Date().toISOString(),
            },
          ]);

        if (insertError) {
          console.error('Erro ao criar usuário:', insertError);
          if (insertError.code !== '23505') {
            throw new Error(translateError(insertError));
          }
        } else {
          console.log('Usuário criado com sucesso na tabela users');
        }
      } else {
        console.log('Usuário já existe na tabela users');
      }
    } catch (error) {
      console.error('Erro ao garantir existência do usuário:', error);
      throw error;
    }
  },

  // Atualizar perfil do usuário
  async updateProfile({ name, email }: { name: string, email: string }) {
    try {
      // Atualizar nome no user_metadata
      const { data, error } = await supabase.auth.updateUser({
        email,
        data: { name },
      });
      if (error) throw error;
      // Atualizar também na tabela users, se existir
      const user = await this.getCurrentUser();
      if (user) {
        await supabase.from('users').update({ name, email }).eq('id', user.id);
      }
      return data;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  },
}; 