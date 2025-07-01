-- Verificar estrutura atual da tabela transactions
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'transactions' 
ORDER BY ordinal_position;

-- Verificar dados recentes na tabela
SELECT id, description, amount, category, type, created_at, user_id
FROM transactions 
ORDER BY created_at DESC 
LIMIT 10;

-- Verificar se há transações com category como UUID
SELECT id, description, category, type
FROM transactions 
WHERE category ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
ORDER BY created_at DESC;

-- Corrigir transações com category como UUID (se necessário)
-- Primeiro, vamos ver quais categorias existem
SELECT id, name, type FROM categories ORDER BY name;

-- Atualizar transações que têm category como UUID para usar o nome da categoria
UPDATE transactions 
SET category = (
  SELECT c.name 
  FROM categories c 
  WHERE c.id = transactions.category
)
WHERE category ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
AND EXISTS (
  SELECT 1 FROM categories c WHERE c.id = transactions.category
);

-- Para transações que não encontram categoria correspondente, definir como 'Outros'
UPDATE transactions 
SET category = 'Outros'
WHERE category ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
AND NOT EXISTS (
  SELECT 1 FROM categories c WHERE c.id = transactions.category
);

-- Verificar resultado após correção
SELECT id, description, amount, category, type, created_at
FROM transactions 
ORDER BY created_at DESC 
LIMIT 10; 