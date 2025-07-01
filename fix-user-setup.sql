-- Script para corrigir setup de usuários e garantir conta/categorias padrão
-- Execute este script no SQL Editor do Supabase

-- 1. Função para criar conta padrão se não existir
CREATE OR REPLACE FUNCTION ensure_default_account(user_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Criar conta padrão se não existir
    INSERT INTO public.accounts (id, user_id, name, balance, type, color, created_at)
    VALUES (
        gen_random_uuid(),
        user_id,
        'Conta Principal',
        0,
        'checking',
        '#007AFF',
        NOW()
    )
    ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Função para criar categorias padrão se não existirem
CREATE OR REPLACE FUNCTION ensure_default_categories(user_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Criar categorias padrão se não existirem
    INSERT INTO public.categories (id, user_id, name, type, color, icon, created_at)
    VALUES 
        (gen_random_uuid(), user_id, 'Alimentação', 'expense', '#FF6B6B', 'restaurant', NOW()),
        (gen_random_uuid(), user_id, 'Transporte', 'expense', '#4ECDC4', 'car', NOW()),
        (gen_random_uuid(), user_id, 'Saúde', 'expense', '#45B7D1', 'medical', NOW()),
        (gen_random_uuid(), user_id, 'Educação', 'expense', '#96CEB4', 'school', NOW()),
        (gen_random_uuid(), user_id, 'Lazer', 'expense', '#FFEAA7', 'game-controller', NOW()),
        (gen_random_uuid(), user_id, 'Vestuário', 'expense', '#DDA0DD', 'shirt', NOW()),
        (gen_random_uuid(), user_id, 'Moradia', 'expense', '#98D8C8', 'home', NOW()),
        (gen_random_uuid(), user_id, 'Serviços', 'expense', '#F7DC6F', 'construct', NOW()),
        (gen_random_uuid(), user_id, 'Outros', 'expense', '#BB8FCE', 'ellipsis-horizontal', NOW()),
        (gen_random_uuid(), user_id, 'Salário', 'income', '#4CAF50', 'trending-up', NOW()),
        (gen_random_uuid(), user_id, 'Freelance', 'income', '#4CAF50', 'trending-up', NOW()),
        (gen_random_uuid(), user_id, 'Investimentos', 'income', '#4CAF50', 'trending-up', NOW())
    ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Executar para todos os usuários existentes
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN 
        SELECT id FROM auth.users 
        WHERE id NOT IN (SELECT id FROM public.users)
    LOOP
        -- Garantir que o usuário existe na tabela users
        INSERT INTO public.users (id, email, name, created_at)
        SELECT 
            au.id,
            au.email,
            COALESCE(au.raw_user_meta_data->>'name', au.email),
            NOW()
        FROM auth.users au
        WHERE au.id = user_record.id
        ON CONFLICT (id) DO NOTHING;
        
        -- Garantir conta padrão
        PERFORM ensure_default_account(user_record.id);
        
        -- Garantir categorias padrão
        PERFORM ensure_default_categories(user_record.id);
    END LOOP;
END $$;

-- 4. Verificar status final
SELECT 
    'Total de usuários' as tipo,
    COUNT(*) as quantidade
FROM public.users

UNION ALL

SELECT 
    'Usuários com conta' as tipo,
    COUNT(DISTINCT u.id) as quantidade
FROM public.users u
INNER JOIN public.accounts a ON u.id = a.user_id

UNION ALL

SELECT 
    'Usuários com categorias' as tipo,
    COUNT(DISTINCT u.id) as quantidade
FROM public.users u
INNER JOIN public.categories c ON u.id = c.user_id;
