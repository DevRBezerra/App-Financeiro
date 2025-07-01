-- Configuração do Supabase para o app Organizze

-- 1. Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Criar tabela de usuários (se não existir)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela de contas
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    balance DECIMAL(10,2) DEFAULT 0,
    type TEXT DEFAULT 'checking',
    color TEXT DEFAULT '#007AFF',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar coluna color se não existir (para tabelas já criadas)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'accounts' AND column_name = 'color') THEN
        ALTER TABLE public.accounts ADD COLUMN color TEXT DEFAULT '#007AFF';
    END IF;
END $$;

-- 4. Criar tabela de categorias
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    color TEXT DEFAULT '#007AFF',
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Criar tabela de transações
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer', 'credit_expense')),
    date DATE NOT NULL,
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_paid BOOLEAN DEFAULT FALSE,
    is_fixed BOOLEAN DEFAULT FALSE,
    is_repeat BOOLEAN DEFAULT FALSE,
    repeat_interval TEXT,
    is_installment BOOLEAN DEFAULT FALSE,
    installment_count INTEGER DEFAULT 1,
    ignore_expense BOOLEAN DEFAULT FALSE,
    carried_over BOOLEAN DEFAULT FALSE,
    original_transaction_id UUID REFERENCES public.transactions(id),
    repeat_number INTEGER,
    total_repeats INTEGER
);

-- 6. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_is_paid ON public.transactions(is_paid);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);

-- 7. Função para criar perfil do usuário automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. Função RPC para criar perfil do usuário
CREATE OR REPLACE FUNCTION public.create_user_profile(
    user_id UUID,
    user_email TEXT,
    user_name TEXT
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.users (id, email, name)
    VALUES (user_id, user_email, user_name)
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Políticas de segurança (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Política para usuários
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Política para contas
CREATE POLICY "Users can view own accounts" ON public.accounts
    FOR ALL USING (auth.uid() = user_id);

-- Política para categorias
CREATE POLICY "Users can view own categories" ON public.categories
    FOR ALL USING (auth.uid() = user_id);

-- Política para transações
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR ALL USING (auth.uid() = user_id);

-- 11. Inserir categorias padrão (opcional)
INSERT INTO public.categories (user_id, name, type, color, icon) VALUES
    ('00000000-0000-0000-0000-000000000000', 'Alimentação', 'expense', '#FF6B6B', 'restaurant'),
    ('00000000-0000-0000-0000-000000000000', 'Transporte', 'expense', '#4ECDC4', 'car'),
    ('00000000-0000-0000-0000-000000000000', 'Saúde', 'expense', '#45B7D1', 'medical'),
    ('00000000-0000-0000-0000-000000000000', 'Educação', 'expense', '#96CEB4', 'school'),
    ('00000000-0000-0000-0000-000000000000', 'Lazer', 'expense', '#FFEAA7', 'game-controller'),
    ('00000000-0000-0000-0000-000000000000', 'Vestuário', 'expense', '#DDA0DD', 'shirt'),
    ('00000000-0000-0000-0000-000000000000', 'Moradia', 'expense', '#98D8C8', 'home'),
    ('00000000-0000-0000-0000-000000000000', 'Serviços', 'expense', '#F7DC6F', 'construct'),
    ('00000000-0000-0000-0000-000000000000', 'Salário', 'income', '#4CAF50', 'trending-up'),
    ('00000000-0000-0000-0000-000000000000', 'Freelance', 'income', '#4CAF50', 'trending-up'),
    ('00000000-0000-0000-0000-000000000000', 'Investimentos', 'income', '#4CAF50', 'trending-up'),
    ('00000000-0000-0000-0000-000000000000', 'Outros', 'expense', '#BB8FCE', 'ellipsis-horizontal')
ON CONFLICT DO NOTHING;

-- 12. Comentários para documentação
COMMENT ON TABLE public.users IS 'Perfis dos usuários do sistema';
COMMENT ON TABLE public.accounts IS 'Contas bancárias dos usuários';
COMMENT ON TABLE public.categories IS 'Categorias de transações';
COMMENT ON TABLE public.transactions IS 'Transações financeiras dos usuários'; 