# 🚀 Solução Final - Corrigir Todas as Tabelas

## Problema Atual
```
ERROR: 42703: column "is_paid" does not exist
```

## Solução Definitiva

### **Passo 1: Execute o Script de Correção**

No **SQL Editor** do Supabase, execute o script `fix-all-tables.sql`:

```sql
-- Remover tabelas existentes (se houver)
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.accounts CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Criar tabela de usuários
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de contas
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

-- Criar tabela de categorias
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

-- Criar tabela de transações
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

-- Desabilitar RLS
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
```

### **Passo 2: Verificar Configuração**

Execute esta query para verificar se tudo foi criado:

```sql
-- Verificar tabelas
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'accounts', 'categories', 'transactions')
ORDER BY table_name;

-- Verificar colunas da tabela transactions
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'transactions' 
ORDER BY ordinal_position;
```

### **Passo 3: Teste o App**

1. **Cadastre um novo usuário**
2. **Verifique se a conta padrão foi criada**
3. **Confirme se as categorias estão disponíveis**

## O que o Script Faz

### ✅ **Remove Tabelas Problemáticas**
- Remove todas as tabelas existentes que podem ter problemas
- Cria tabelas novas com estrutura correta

### ✅ **Cria Estrutura Completa**
- `users` - Perfis dos usuários
- `accounts` - Contas bancárias
- `categories` - Categorias de transações
- `transactions` - Transações financeiras

### ✅ **Configura Corretamente**
- Foreign keys funcionais
- Colunas necessárias incluindo `is_paid`
- RLS desabilitado para desenvolvimento

## Resultado Esperado

### **Logs de Sucesso:**
```
LOG  Usuário criado com sucesso: [user-id]
LOG  Criando conta padrão para usuário: [user-id]
LOG  Conta padrão criada com sucesso: [account-id]
LOG  Criando categorias padrão para usuário: [user-id]
LOG  12 categorias padrão criadas com sucesso
```

### **Funcionalidades:**
- ✅ **Onboarding automático** completo
- ✅ **Conta padrão** criada automaticamente
- ✅ **12 categorias** disponíveis
- ✅ **Sistema de repetição** funcionando
- ✅ **Interface responsiva** e moderna

## Importante

⚠️ **Este script remove todas as tabelas existentes!**
- Se você já tem dados importantes, faça backup primeiro
- Para desenvolvimento, é seguro executar

## Teste Agora

Execute o script `fix-all-tables.sql` e teste o cadastro. Deve funcionar perfeitamente! 🎯 