# Como Resolver: Categorias e Contas Não Carregam do Banco

## O Problema
As categorias e contas não estão sendo carregadas do banco de dados no app.

## Solução Passo a Passo

### Passo 1: Verificar se o Script SQL foi Executado
1. Vá para o [Supabase Dashboard](https://supabase.com/dashboard)
2. Acesse seu projeto
3. Clique em "SQL Editor"
4. Execute o script `simple-setup.sql` primeiro
5. Depois execute o script `test-data.sql`

### Passo 2: Verificar o ID do Usuário
No script `test-data.sql`, você precisa substituir o ID do usuário:

1. **No app**, faça login e veja nos logs o ID do usuário:
   ```
   LOG  Login realizado com sucesso: d3ebf1be-51a1-4cae-83fa-080acb43d3b5
   ```

2. **Substitua** no script `test-data.sql`:
   ```sql
   'd3ebf1be-51a1-4cae-83fa-080acb43d3b5' -- Seu ID real aqui
   ```

### Passo 3: Executar os Scripts SQL

#### Script 1: Configuração do Banco
```sql
-- Copie e execute o conteúdo do arquivo simple-setup.sql
```

#### Script 2: Dados de Teste
```sql
-- Copie e execute o conteúdo do arquivo test-data.sql
-- (lembre de trocar o ID do usuário)
```

### Passo 4: Verificar se os Dados Foram Inseridos
Após executar o script, você deve ver:
- **Contas:** 3 contas (Conta Principal, Poupança, Cartão de Crédito)
- **Categorias:** 17 categorias (despesas, receitas, transferências)

### Passo 5: Testar no App
1. **Pare o app** (Ctrl+C no terminal)
2. **Execute**: `npm start`
3. **Faça login** com sua conta
4. **Vá em "Adicionar Transação"**
5. **Clique em "Categoria"** - deve mostrar as categorias
6. **Clique em "Conta"** - deve mostrar as contas

## Se Ainda Não Funcionar

### Verificar Logs do App
Procure por erros como:
- "Erro ao carregar dados"
- "Erro ao buscar contas"
- "Erro ao buscar categorias"

### Verificar no Supabase Dashboard
1. Vá em "Table Editor"
2. Verifique se as tabelas `accounts` e `categories` existem
3. Verifique se há dados para o seu usuário

### Verificar Permissões
1. Vá em "Authentication" > "Policies"
2. Verifique se as políticas RLS estão desabilitadas
3. Se estiverem habilitadas, desabilite temporariamente

## Comandos SQL Úteis

### Verificar Dados do Usuário
```sql
SELECT * FROM public.users WHERE id = 'SEU_ID_AQUI';
```

### Verificar Contas
```sql
SELECT * FROM public.accounts WHERE user_id = 'SEU_ID_AQUI';
```

### Verificar Categorias
```sql
SELECT * FROM public.categories WHERE user_id = 'SEU_ID_AQUI';
```

### Contar Registros
```sql
SELECT 
  'users' as tabela, COUNT(*) as total FROM public.users
UNION ALL
SELECT 'accounts', COUNT(*) FROM public.accounts
UNION ALL
SELECT 'categories', COUNT(*) FROM public.categories;
```

## Se Nada Funcionar
1. **Delete todas as tabelas** e recrie
2. **Execute os scripts** novamente
3. **Crie uma nova conta** no app
4. **Teste** se funciona

Me avise o resultado para que eu possa te ajudar mais! 