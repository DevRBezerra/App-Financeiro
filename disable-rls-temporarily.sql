-- Desabilitar RLS temporariamente para onboarding
-- Execute este script no SQL Editor do Supabase

-- 1. Desabilitar RLS nas tabelas
ALTER TABLE public.accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;

-- 2. Verificar status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('accounts', 'categories', 'transactions');

-- 3. Comentário: Para reabilitar RLS depois, execute:
-- ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY; 