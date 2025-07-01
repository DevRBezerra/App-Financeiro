# Configuração de Redirecionamento do Supabase

## Problema
O erro "requested path is invalid" ocorre porque o URL de redirecionamento configurado no Supabase não está correto.

## Solução

### 1. Acesse o Painel do Supabase
- Vá para https://supabase.com
- Faça login na sua conta
- Acesse o projeto `gpkimpjagdyssbyfblga`

### 2. Configure o Redirecionamento
1. No painel do Supabase, vá para **Authentication** > **URL Configuration**
2. Em **Site URL**, adicione:
   ```
   exp://192.168.1.35:8081
   ```
3. Em **Redirect URLs**, adicione TODAS estas URLs:
   ```
   exp://192.168.1.35:8081
   exp://192.168.1.100:8081
   exp://192.168.0.100:8081
   exp://localhost:8081
   exp://127.0.0.1:8081
   organizze://
   ```

### 3. Para Desenvolvimento (Recomendado)
Para evitar problemas com confirmação de e-mail durante o desenvolvimento:

1. Ir para **Authentication** > **Settings**
2. Desabilitar **Enable email confirmations**
3. Ou configurar **Confirm email template** para usar um redirecionamento simples

### 4. Verificar IP Correto
Para descobrir o IP correto do seu ambiente:

1. No terminal, rode: `npx expo start`
2. Observe o output que mostra algo como:
   ```
   › Metro waiting on exp://192.168.1.35:8081
   ```
3. Use esse IP na configuração do Supabase

### 5. Teste a Configuração
Após configurar, teste criando uma nova conta. O link de confirmação deve funcionar corretamente.

## URLs de Redirecionamento Configuradas
O app está configurado para tentar estas URLs:
- `exp://192.168.1.35:8081` (IP atual do seu ambiente)
- `exp://192.168.1.100:8081` (IP comum em redes domésticas)
- `exp://192.168.0.100:8081` (IP alternativo)
- `exp://localhost:8081` (Localhost)
- `exp://127.0.0.1:8081` (IP local)
- `organizze://` (Para produção)

## Nota Importante
Se você estiver usando Expo Go, o IP pode variar dependendo da sua rede. Verifique o IP correto no terminal quando rodar `npx expo start`. 