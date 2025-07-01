-- Funções RPC para contornar políticas RLS
-- Execute este script no SQL Editor do Supabase

-- 1. Função para criar conta padrão
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
    -- Inserir conta com SECURITY DEFINER (contorna RLS)
    INSERT INTO public.accounts (id, user_id, name, balance, type, created_at)
    VALUES (uuid_generate_v4(), user_id, account_name, 0, account_type, NOW())
    RETURNING id INTO new_account_id;
    
    -- Retornar dados da conta criada
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

-- 2. Função para criar categorias padrão
CREATE OR REPLACE FUNCTION public.create_default_categories(user_id UUID)
RETURNS JSON[] AS $$
DECLARE
    category_data JSON;
    categories JSON[] := '{}';
    default_categories TEXT[][] := ARRAY[
        ['Alimentação', 'expense', '#FF6B6B', 'restaurant'],
        ['Transporte', 'expense', '#4ECDC4', 'car'],
        ['Saúde', 'expense', '#45B7D1', 'medical'],
        ['Educação', 'expense', '#96CEB4', 'school'],
        ['Lazer', 'expense', '#FFEAA7', 'game-controller'],
        ['Vestuário', 'expense', '#DDA0DD', 'shirt'],
        ['Moradia', 'expense', '#98D8C8', 'home'],
        ['Serviços', 'expense', '#F7DC6F', 'construct'],
        ['Outros', 'expense', '#BB8FCE', 'ellipsis-horizontal'],
        ['Salário', 'income', '#4CAF50', 'trending-up'],
        ['Freelance', 'income', '#4CAF50', 'trending-up'],
        ['Investimentos', 'income', '#4CAF50', 'trending-up']
    ];
    cat_record RECORD;
BEGIN
    -- Inserir categorias padrão
    FOR i IN 1..array_length(default_categories, 1) LOOP
        INSERT INTO public.categories (id, user_id, name, type, color, icon, created_at)
        VALUES (
            uuid_generate_v4(),
            user_id,
            default_categories[i][1],
            default_categories[i][2],
            default_categories[i][3],
            default_categories[i][4],
            NOW()
        );
    END LOOP;
    
    -- Retornar categorias criadas
    FOR cat_record IN 
        SELECT * FROM public.categories 
        WHERE user_id = create_default_categories.user_id 
        ORDER BY created_at DESC 
        LIMIT 12
    LOOP
        SELECT json_build_object(
            'id', cat_record.id,
            'user_id', cat_record.user_id,
            'name', cat_record.name,
            'type', cat_record.type,
            'color', cat_record.color,
            'icon', cat_record.icon,
            'created_at', cat_record.created_at
        ) INTO category_data;
        
        categories := array_append(categories, category_data);
    END LOOP;
    
    RETURN categories;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Função para criar perfil de usuário
CREATE OR REPLACE FUNCTION public.create_user_profile(
    user_id UUID,
    user_email TEXT,
    user_name TEXT
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- Inserir perfil com SECURITY DEFINER
    INSERT INTO public.users (id, email, name, created_at)
    VALUES (user_id, user_email, user_name, NOW())
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        updated_at = NOW();
    
    -- Retornar dados do perfil
    SELECT json_build_object(
        'id', id,
        'email', email,
        'name', name,
        'created_at', created_at
    ) INTO result
    FROM public.users
    WHERE id = user_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Verificar funções criadas
SELECT routine_name, routine_type, security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('create_default_account', 'create_default_categories', 'create_user_profile')
ORDER BY routine_name; 