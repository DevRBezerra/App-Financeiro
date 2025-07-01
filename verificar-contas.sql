-- Verificar estrutura da tabela accounts
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'accounts' 
ORDER BY ordinal_position;

-- Verificar contas existentes
SELECT id, name, balance, type, user_id, created_at
FROM accounts 
ORDER BY created_at DESC;

-- Verificar se há contas com saldo
SELECT name, balance, type, user_id
FROM accounts 
WHERE balance > 0
ORDER BY balance DESC;

-- Verificar contas por usuário (substitua pelo user_id correto)
-- SELECT name, balance, type, created_at
-- FROM accounts 
-- WHERE user_id = 'SEU_USER_ID_AQUI'
-- ORDER BY created_at DESC;

-- Verificar se há problemas com o campo balance
SELECT name, balance, type, user_id
FROM accounts 
WHERE balance IS NULL OR balance = 0
ORDER BY created_at DESC; 