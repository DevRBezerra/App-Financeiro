-- Script para corrigir problema de chave duplicada na tabela users
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se o usuário já existe na tabela users
SELECT id, email, name, created_at 
FROM public.users 
WHERE id = 'f137911d-2408-400f-917d-b5b1e2d1120e';

-- 2. Se o usuário não existir, criar com ON CONFLICT DO NOTHING
INSERT INTO public.users (id, email, name, created_at)
VALUES (
    'f137911d-2408-400f-917d-b5b1e2d1120e',
    'seu-email@exemplo.com', -- Substitua pelo email real
    'Seu Nome', -- Substitua pelo nome real
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 3. Verificar se a conta padrão existe para este usuário
SELECT id, name, balance, type 
FROM public.accounts 
WHERE user_id = 'f137911d-2408-400f-917d-b5b1e2d1120e';

-- 4. Se não existir conta, criar conta padrão
INSERT INTO public.accounts (id, user_id, name, balance, type, color, created_at)
VALUES (
    gen_random_uuid(),
    'f137911d-2408-400f-917d-b5b1e2d1120e',
    'Conta Principal',
    0,
    'checking',
    '#007AFF',
    NOW()
)
ON CONFLICT DO NOTHING;

-- 5. Verificar se as categorias padrão existem
SELECT COUNT(*) as total_categorias
FROM public.categories 
WHERE user_id = 'f137911d-2408-400f-917d-b5b1e2d1120e';

-- 6. Se não existirem categorias, criar categorias padrão
INSERT INTO public.categories (id, user_id, name, type, color, icon, created_at)
VALUES 
    (gen_random_uuid(), 'f137911d-2408-400f-917d-b5b1e2d1120e', 'Alimentação', 'expense', '#FF6B6B', 'restaurant', NOW()),
    (gen_random_uuid(), 'f137911d-2408-400f-917d-b5b1e2d1120e', 'Transporte', 'expense', '#4ECDC4', 'car', NOW()),
    (gen_random_uuid(), 'f137911d-2408-400f-917d-b5b1e2d1120e', 'Saúde', 'expense', '#45B7D1', 'medical', NOW()),
    (gen_random_uuid(), 'f137911d-2408-400f-917d-b5b1e2d1120e', 'Educação', 'expense', '#96CEB4', 'school', NOW()),
    (gen_random_uuid(), 'f137911d-2408-400f-917d-b5b1e2d1120e', 'Lazer', 'expense', '#FFEAA7', 'game-controller', NOW()),
    (gen_random_uuid(), 'f137911d-2408-400f-917d-b5b1e2d1120e', 'Vestuário', 'expense', '#DDA0DD', 'shirt', NOW()),
    (gen_random_uuid(), 'f137911d-2408-400f-917d-b5b1e2d1120e', 'Moradia', 'expense', '#98D8C8', 'home', NOW()),
    (gen_random_uuid(), 'f137911d-2408-400f-917d-b5b1e2d1120e', 'Serviços', 'expense', '#F7DC6F', 'construct', NOW()),
    (gen_random_uuid(), 'f137911d-2408-400f-917d-b5b1e2d1120e', 'Outros', 'expense', '#BB8FCE', 'ellipsis-horizontal', NOW()),
    (gen_random_uuid(), 'f137911d-2408-400f-917d-b5b1e2d1120e', 'Salário', 'income', '#4CAF50', 'trending-up', NOW()),
    (gen_random_uuid(), 'f137911d-2408-400f-917d-b5b1e2d1120e', 'Freelance', 'income', '#4CAF50', 'trending-up', NOW()),
    (gen_random_uuid(), 'f137911d-2408-400f-917d-b5b1e2d1120e', 'Investimentos', 'income', '#4CAF50', 'trending-up', NOW())
ON CONFLICT DO NOTHING;

-- 7. Verificar se tudo foi criado corretamente
SELECT 
    'users' as tabela,
    COUNT(*) as total
FROM public.users 
WHERE id = 'f137911d-2408-400f-917d-b5b1e2d1120e'

UNION ALL

SELECT 
    'accounts' as tabela,
    COUNT(*) as total
FROM public.accounts 
WHERE user_id = 'f137911d-2408-400f-917d-b5b1e2d1120e'

UNION ALL

SELECT 
    'categories' as tabela,
    COUNT(*) as total
FROM public.categories 
WHERE user_id = 'f137911d-2408-400f-917d-b5b1e2d1120e';

-- 8. Mostrar dados criados
SELECT 'Contas:' as tipo, name, balance, type FROM public.accounts WHERE user_id = 'f137911d-2408-400f-917d-b5b1e2d1120e'
UNION ALL
SELECT 'Categorias:' as tipo, name, type, color FROM public.categories WHERE user_id = 'f137911d-2408-400f-917d-b5b1e2d1120e'; 