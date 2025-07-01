# 🔧 Corrigir Tabela Accounts - Erro de Coluna Color

## Problema
```
ERROR: Could not find the 'color' column of 'accounts' in the schema cache
```

## Solução

### 1. **Execute o Script de Correção**

No painel do Supabase, vá para **SQL Editor** e execute o script `fix-accounts-table.sql`:

```sql
-- Adicionar coluna color se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'accounts' AND column_name = 'color') THEN
        ALTER TABLE public.accounts ADD COLUMN color TEXT DEFAULT '#007AFF';
        RAISE NOTICE 'Coluna color adicionada à tabela accounts';
    ELSE
        RAISE NOTICE 'Coluna color já existe na tabela accounts';
    END IF;
END $$;

-- Adicionar coluna updated_at se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'accounts' AND column_name = 'updated_at') THEN
        ALTER TABLE public.accounts ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Coluna updated_at adicionada à tabela accounts';
    ELSE
        RAISE NOTICE 'Coluna updated_at já existe na tabela accounts';
    END IF;
END $$;

-- Atualizar contas existentes
UPDATE public.accounts 
SET color = '#007AFF' 
WHERE color IS NULL;
```

### 2. **Verificar Estrutura da Tabela**

Execute esta query para verificar se as colunas foram adicionadas:

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'accounts' 
ORDER BY ordinal_position;
```

### 3. **Reiniciar o App**

Após executar o script:

1. Pare o servidor Expo (`Ctrl+C`)
2. Execute `npm start` novamente
3. Teste o cadastro de um novo usuário

## Estrutura Correta da Tabela

A tabela `accounts` deve ter estas colunas:

```sql
CREATE TABLE public.accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    balance DECIMAL(10,2) DEFAULT 0,
    type TEXT DEFAULT 'checking',
    color TEXT DEFAULT '#007AFF',           -- ← Esta coluna estava faltando
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()  -- ← Esta também
);
```

## Teste

Após corrigir:

1. **Cadastre um novo usuário**
2. **Verifique se a conta padrão foi criada**
3. **Confirme se não há mais erros no console**

## Alternativa Temporária

Se não conseguir executar o script SQL, o app funcionará sem o campo `color`:

- ✅ Conta será criada sem cor
- ✅ Funcionalidade básica funcionará
- ❌ Contas não terão cores personalizadas

Execute o script SQL para ter a funcionalidade completa! 🚀 