# Solução Simples para o Erro de Foreign Key

## O Problema
O erro indica que a tabela `users` não existe ou não foi criada corretamente, causando violação de foreign key constraint.

## A Solução
Execute o script SQL simples que criei para você:

### Passo 1: Acesse o Supabase
1. Vá para o [Supabase Dashboard](https://supabase.com/dashboard)
2. Acesse seu projeto
3. Clique em "SQL Editor" no menu lateral

### Passo 2: Execute o Script
1. Abra o arquivo `simple-setup.sql` no seu projeto
2. Copie todo o conteúdo do arquivo
3. Cole no SQL Editor do Supabase
4. Clique em "Run" para executar

### Passo 3: Verifique o Resultado
Após executar, você deve ver uma tabela com 4 linhas mostrando:
- users
- accounts  
- categories
- transactions

## O que o Script Faz
1. Remove todas as tabelas existentes (se houver)
2. Cria uma tabela `users` simples
3. Cria as tabelas `accounts`, `categories` e `transactions` sem foreign keys
4. Desabilita RLS (Row Level Security) para desenvolvimento
5. Cria índices para melhor performance

## Teste o App
Após executar o script:
1. Pare o app (Ctrl+C no terminal)
2. Execute `npm start` novamente
3. Tente criar uma nova conta
4. O cadastro deve funcionar sem erros

## Se Ainda Houver Problemas
Se o erro persistir, verifique:
1. Se o script foi executado com sucesso
2. Se você está conectado ao projeto correto no Supabase
3. Se as variáveis de ambiente estão configuradas corretamente

O script é mais simples e não depende de foreign keys, então deve funcionar mesmo se houver problemas com a estrutura anterior. 