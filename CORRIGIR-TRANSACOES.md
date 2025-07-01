# Corrigir Transações com Problemas de Exibição

## Problema
As transações estão aparecendo com números estranhos (UUIDs) no campo categoria em vez do nome da categoria.

## Solução

### 1. Executar Script de Correção

1. Acesse o **Supabase Dashboard**
2. Vá para **SQL Editor**
3. Execute o script `check-transactions-table.sql` linha por linha:

```sql
-- Primeiro, verificar a estrutura da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'transactions' 
ORDER BY ordinal_position;
```

```sql
-- Verificar dados recentes
SELECT id, description, amount, category, type, created_at, user_id
FROM transactions 
ORDER BY created_at DESC 
LIMIT 10;
```

```sql
-- Verificar se há transações com category como UUID
SELECT id, description, category, type
FROM transactions 
WHERE category ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
ORDER BY created_at DESC;
```

```sql
-- Ver categorias existentes
SELECT id, name, type FROM categories ORDER BY name;
```

```sql
-- Corrigir transações com category como UUID
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
```

```sql
-- Para transações sem categoria correspondente, definir como 'Outros'
UPDATE transactions 
SET category = 'Outros'
WHERE category ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
AND NOT EXISTS (
  SELECT 1 FROM categories c WHERE c.id = transactions.category
);
```

```sql
-- Verificar resultado após correção
SELECT id, description, amount, category, type, created_at
FROM transactions 
ORDER BY created_at DESC 
LIMIT 10;
```

### 2. Testar no App

1. Feche o app completamente
2. Abra o app novamente
3. Vá para o Dashboard
4. Verifique se as transações aparecem corretamente
5. Vá para a tela de Transações
6. Verifique se as categorias aparecem com nomes em vez de UUIDs

### 3. Verificar Dashboard

O dashboard deve atualizar automaticamente quando você voltar da tela de adicionar transação, pois já implementamos o listener de foco.

## Resultado Esperado

- Transações devem aparecer com nomes de categorias (ex: "Alimentação", "Transporte")
- Dashboard deve mostrar transações recentes
- Saldo total deve ser calculado corretamente
- Calendário deve funcionar corretamente ao mudar de mês

## Se o Problema Persistir

1. Verifique se o script foi executado corretamente
2. Verifique se há erros no console do app
3. Tente criar uma nova transação para testar
4. Verifique se as categorias estão sendo criadas corretamente 