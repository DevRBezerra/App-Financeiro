# 📧 Configuração de Email no Supabase

## Problema Atual
Quando um usuário cria uma conta, o Supabase envia um email de confirmação que redireciona para `localhost`, o que não funciona em apps móveis.

## Solução

### 1. Configurar URL de Redirecionamento no Supabase

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Authentication** > **URL Configuration**
4. Configure as URLs:

```
Site URL: exp://192.168.1.35:8081
Redirect URLs: 
- exp://192.168.1.35:8081/*
- exp://localhost:8081/*
- organizze://*
```

### 2. Configurar Deep Linking (Opcional)

Para melhor experiência, você pode configurar deep linking:

1. No seu projeto Expo, adicione no `app.json`:
```json
{
  "expo": {
    "scheme": "organizze",
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "organizze"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

### 3. Desabilitar Confirmação de Email (Para Desenvolvimento)

Se você quiser testar sem confirmação de email:

1. No Supabase Dashboard
2. Vá em **Authentication** > **Settings**
3. Desabilite **"Enable email confirmations"**

### 4. Configurar Email Templates

1. Vá em **Authentication** > **Email Templates**
2. Personalize os templates de email
3. Use variáveis como `{{ .ConfirmationURL }}` para o link de confirmação

## Configuração Rápida para Teste

Para desenvolvimento, recomendo desabilitar a confirmação de email temporariamente:

1. Supabase Dashboard > Authentication > Settings
2. Desabilite "Enable email confirmations"
3. Agora os usuários podem fazer login imediatamente após o cadastro

## Próximos Passos

Após configurar, vamos desenvolver o dashboard com:
- ✅ Gestão de transações
- ✅ Múltiplas contas
- ✅ Relatórios
- ✅ Sincronização em tempo real 