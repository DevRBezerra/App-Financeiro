-- =====================================================
-- CORREÇÕES PARA O SUPABASE - ORGANIZZE APP
-- =====================================================

-- 1. DESABILITAR RLS TEMPORARIAMENTE (para desenvolvimento)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 2. OU, se preferir manter RLS, criar política correta:
-- Primeiro, remover política existente
DROP POLICY IF EXISTS "auth" ON public.users;

-- Criar nova política que permite inserção
CREATE POLICY "users_policy" ON public.users
FOR ALL USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 3. CRIAR FUNÇÃO RPC PARA CRIAR PERFIL DE USUÁRIO
CREATE OR REPLACE FUNCTION create_user_profile(
  user_id UUID,
  user_email TEXT,
  user_name TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (id, email, name, created_at)
  VALUES (user_id, user_email, user_name, NOW())
  ON CONFLICT (id) DO NOTHING;
END;
$$;

-- 4. CONCEDER PERMISSÕES NECESSÁRIAS
GRANT EXECUTE ON FUNCTION create_user_profile TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 5. VERIFICAR SE A TABELA USERS EXISTE E TEM A ESTRUTURA CORRETA
-- Se a tabela não existir, criar:
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);

-- 7. HABILITAR RLS (se foi desabilitado)
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- INSTRUÇÕES DE USO:
-- =====================================================
-- 1. Execute este SQL no SQL Editor do Supabase
-- 2. Se quiser manter RLS, descomente a linha 7
-- 3. Se quiser desabilitar RLS para desenvolvimento, mantenha a linha 1
-- 4. Teste o cadastro novamente no app 