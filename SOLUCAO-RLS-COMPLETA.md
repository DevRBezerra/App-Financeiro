# 🔧 Solução Completa - Erro de RLS (Row Level Security)

## Problema
```
ERROR: new row violates row-level security policy for table "accounts"
```

## Causa
As políticas de segurança (RLS) do Supabase estão bloqueando a criação de contas e categorias durante o cadastro.

## Soluções (Execute na Ordem)

### 1. **Solução Rápida - Funções RPC**

Execute o script `create-rpc-functions.sql` no **SQL Editor** do Supabase:

```sql
-- Função para criar conta padrão
CREATE OR REPLACE FUNCTION public.create_default_account(
    user_id UUID,
    account_name TEXT DEFAULT 'Conta Principal',
    account_type TEXT DEFAULT 'checking'
)
RETURNS JSON AS $$
DECLARE
    new_account_id UUID;
    result JSON;
BEGIN
    INSERT INTO public.accounts (id, user_id, name, balance, type, created_at)
    VALUES (uuid_generate_v4(), user_id, account_name, 0, account_type, NOW())
    RETURNING id INTO new_account_id;
    
    SELECT json_build_object(
        'id', id,
        'user_id', user_id,
        'name', name,
        'balance', balance,
        'type', type,
        'created_at', created_at
    ) INTO result
    FROM public.accounts
    WHERE id = new_account_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2. **Solução Definitiva - Corrigir Políticas RLS**

Execute o script `fix-rls-policies.sql`:

```sql
-- Remover políticas conflitantes
DROP POLICY IF EXISTS "Users can insert own accounts" ON public.accounts;

-- Criar política correta
CREATE POLICY "Users can insert own accounts" ON public.accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 3. **Verificar Configuração**

Execute esta query para verificar se tudo está correto:

```sql
-- Verificar políticas
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('accounts', 'categories', 'transactions');

-- Verificar funções RPC
SELECT routine_name, security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('create_default_account', 'create_default_categories');
```

## Como Funciona

### **Funções RPC (SECURITY DEFINER)**
- ✅ Contornam as políticas RLS
- ✅ Executam com privilégios elevados
- ✅ Garantem que o onboarding funcione

### **Políticas RLS Corrigidas**
- ✅ Permitem inserção para usuários autenticados
- ✅ Mantêm segurança dos dados
- ✅ Funcionam com o app normalmente

## Teste

Após executar os scripts:

1. **Cadastre um novo usuário**
2. **Verifique se a conta padrão foi criada**
3. **Confirme se as categorias estão disponíveis**
4. **Teste adicionar uma transação**

## Logs Esperados

```
LOG  Usuário criado com sucesso: [user-id]
LOG  Perfil do usuário criado via RPC
LOG  Criando conta padrão para usuário: [user-id]
LOG  Conta padrão criada via RPC
LOG  Criando categorias padrão para usuário: [user-id]
LOG  12 categorias padrão criadas via RPC
```

## Alternativas

### **Opção 1: Apenas Funções RPC**
- ✅ Funciona imediatamente
- ✅ Não afeta políticas existentes
- ❌ Requer execução de script SQL

### **Opção 2: Corrigir Políticas RLS**
- ✅ Solução definitiva
- ✅ Mantém segurança
- ❌ Pode afetar outras funcionalidades

### **Opção 3: Desabilitar RLS Temporariamente**
```sql
ALTER TABLE public.accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
```
- ⚠️ **NÃO RECOMENDADO** - Remove segurança

## Próximos Passos

1. **Execute o script `create-rpc-functions.sql`**
2. **Teste o cadastro de um usuário**
3. **Se ainda houver problemas, execute `fix-rls-policies.sql`**
4. **Verifique se tudo está funcionando**

A solução com funções RPC é a mais segura e eficaz! 🚀 