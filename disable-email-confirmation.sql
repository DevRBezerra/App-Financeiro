-- Script para desabilitar confirmação de email em desenvolvimento
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar configurações atuais
SELECT 
    name,
    value,
    description
FROM auth.config 
WHERE name LIKE '%email%';

-- 2. Desabilitar confirmação de email (para desenvolvimento)
UPDATE auth.config 
SET value = 'false' 
WHERE name = 'enable_signup';

-- 3. Configurar para permitir login sem confirmação
UPDATE auth.config 
SET value = 'false' 
WHERE name = 'enable_confirmations';

-- 4. Verificar se as alterações foram aplicadas
SELECT 
    name,
    value,
    description
FROM auth.config 
WHERE name IN ('enable_signup', 'enable_confirmations');

-- 5. Alternativa: Configurar via SQL (se a tabela auth.config não existir)
-- Execute estes comandos no terminal do Supabase ou via API:

-- Para desabilitar confirmação de email via API:
-- curl -X PUT 'https://gpkimpjagdyssbyfblga.supabase.co/auth/v1/admin/config' \
--   -H "apikey: YOUR_SERVICE_ROLE_KEY" \
--   -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
--   -H "Content-Type: application/json" \
--   -d '{"enable_confirmations": false}'

-- 6. Verificar usuários existentes
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10; 