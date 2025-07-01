# Como Configurar o Supabase para Não Exigir Confirmação de Email

## O Problema
O link de confirmação de email está expirando ou inválido, impedindo o login.

## Solução 1: Via Dashboard do Supabase (Recomendado)

### Passo 1: Acesse o Dashboard
1. Vá para [Supabase Dashboard](https://supabase.com/dashboard)
2. Acesse seu projeto
3. Clique em "Authentication" no menu lateral

### Passo 2: Configure as Configurações
1. Clique em "Settings" na seção Authentication
2. Role até "Email Auth"
3. **Desmarque** a opção "Enable email confirmations"
4. **Desmarque** a opção "Enable sign up" (se quiser desabilitar cadastros)
5. Clique em "Save"

### Passo 3: Configure URLs de Redirecionamento
1. Ainda em "Settings"
2. Role até "URL Configuration"
3. Em "Site URL", coloque: `https://gpkimpjagdyssbyfblga.supabase.co`
4. Em "Redirect URLs", adicione:
   ```
   exp://192.168.1.35:8081
   exp://localhost:8081
   exp://127.0.0.1:8081
   organizze://
   ```
5. Clique em "Save"

## Solução 2: Para Usuários Existentes

Se você já tem usuários que não confirmaram email:

### Via SQL Editor
1. Execute este comando no SQL Editor:
```sql
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;
```

### Ou via Dashboard
1. Vá em "Authentication" > "Users"
2. Encontre o usuário
3. Clique nos 3 pontos (...)
4. Selecione "Confirm user"

## Solução 3: Teste o App

Após configurar:

1. **Pare o app** (Ctrl+C no terminal)
2. **Execute novamente**: `npm start`
3. **Tente criar uma nova conta**
4. **O login deve funcionar automaticamente** sem precisar confirmar email

## Configurações Recomendadas para Desenvolvimento

- ✅ **Enable sign up**: Sim (para permitir cadastros)
- ❌ **Enable email confirmations**: Não (para não exigir confirmação)
- ✅ **Enable phone confirmations**: Não (não estamos usando)
- ✅ **Enable manual linking**: Não

## Para Produção

Quando for para produção, lembre-se de:
1. **Reativar** "Enable email confirmations"
2. **Configurar** URLs de redirecionamento corretas
3. **Configurar** templates de email personalizados

## Se Ainda Houver Problemas

1. **Verifique** se as configurações foram salvas
2. **Limpe o cache** do app
3. **Teste** com um email diferente
4. **Verifique** os logs no console do Supabase

A configuração via Dashboard é mais fácil e visual que via SQL! 