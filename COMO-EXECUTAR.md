# 🚀 Como Executar o Script SQL

## Passo a Passo Simples

### 1. **Acesse o Supabase**
- Vá para [supabase.com](https://supabase.com)
- Faça login e acesse seu projeto
- Clique em **SQL Editor** no menu lateral

### 2. **Copie o Script SQL**
- Abra o arquivo `execute-this.sql`
- **Copie TODO o conteúdo** (não apenas o título)
- Cole no **SQL Editor** do Supabase

### 3. **Execute o Script**
- Clique no botão **Run** (ou pressione Ctrl+Enter)
- Aguarde a execução completar
- Verifique se não há erros

### 4. **Verifique o Resultado**
Você deve ver uma tabela com 4 linhas:
- users
- accounts  
- categories
- transactions

## Script Correto para Copiar

```sql
-- Script para corrigir todas as tabelas do Organizze
-- Execute este script no SQL Editor do Supabase

-- 1. Remover tabelas existentes (se houver)
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.accounts CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 2. Criar tabela de usuários
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela de contas
CREATE TABLE public.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    balance DECIMAL(10,2) DEFAULT 0,
    type TEXT DEFAULT 'checking',
    color TEXT DEFAULT '#007AFF',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar tabela de categorias
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    color TEXT DEFAULT '#007AFF',
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Criar tabela de transações
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    type TEXT NOT NULL,
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

-- 6. Criar índices
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_date ON public.transactions(date);
CREATE INDEX idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX idx_categories_user_id ON public.categories(user_id);

-- 7. Desabilitar RLS
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;

-- 8. Verificar tabelas criadas
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'accounts', 'categories', 'transactions')
ORDER BY table_name;
```

## ⚠️ Importante

- **Copie TODO o script acima** (não apenas o título)
- **Não copie arquivos .md** - apenas o conteúdo SQL
- **Execute no SQL Editor** do Supabase

## Teste Após Executar

1. **Cadastre um novo usuário** no app
2. **Verifique se a conta padrão foi criada**
3. **Confirme se as categorias estão disponíveis**

## Resultado Esperado

```
LOG  Usuário criado com sucesso: [user-id]
LOG  Criando conta padrão para usuário: [user-id]
LOG  Conta padrão criada com sucesso: [account-id]
LOG  Criando categorias padrão para usuário: [user-id]
LOG  12 categorias padrão criadas com sucesso
```

Execute o script e teste! 🚀 