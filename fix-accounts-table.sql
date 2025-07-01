-- Script para corrigir a tabela accounts
-- Execute este script no SQL Editor do Supabase

-- 1. Adicionar coluna color se não existir
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

-- 2. Adicionar coluna updated_at se não existir
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

-- 3. Atualizar contas existentes para ter cor padrão
UPDATE public.accounts 
SET color = '#007AFF' 
WHERE color IS NULL;

-- 4. Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'accounts' 
ORDER BY ordinal_position; 