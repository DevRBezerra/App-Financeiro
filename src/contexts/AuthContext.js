import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se há um usuário logado
    const checkUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser({
            id: currentUser.id,
            email: currentUser.email || '',
            name: currentUser.user_metadata?.name,
          });
        }
      } catch (error) {
        console.error('Erro ao verificar usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      if (user) {
        setUser({
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    try {
      await authService.signIn(email, password);
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  };

  const signUp = async (email, password, name) => {
    try {
      const result = await authService.signUp(email, password, name);
      console.log('Resultado do cadastro:', result);
      
      // Se a confirmação de e-mail estiver desabilitada, o usuário já estará logado
      if (result.user && !result.session) {
        // Usuário criado mas precisa confirmar e-mail
        console.log('Usuário criado. Verifique seu e-mail para confirmar a conta.');
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}; 