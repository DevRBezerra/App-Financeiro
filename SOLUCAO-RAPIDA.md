# 🚀 Solução Rápida - Erro de RLS

## Problema
```
ERROR: new row violates row-level security policy for table "accounts"
```

## Solução Imediata

### **Passo 1: Execute este script no Supabase**

No **SQL Editor** do Supabase, execute:

```sql
-- Desabilitar RLS temporariamente
ALTER TABLE public.accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
```

### **Passo 2: Teste o App**

1. **Cadastre um novo usuário**
2. **Verifique se a conta padrão foi criada**
3. **Confirme se as categorias estão disponíveis**

### **Passo 3: Reabilitar RLS (Opcional)**

Depois que tudo estiver funcionando, você pode reabilitar o RLS:

```sql
-- Reabilitar RLS
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
```

## Por que esta solução funciona?

- ✅ **Simples**: Apenas 3 linhas de SQL
- ✅ **Rápida**: Resolve imediatamente
- ✅ **Funcional**: Permite onboarding automático
- ⚠️ **Temporária**: Remove segurança temporariamente

## Alternativa Mais Segura

Se quiser manter a segurança, execute o script completo:

```sql
-- Criar políticas corretas
DROP POLICY IF EXISTS "Users can insert own accounts" ON public.accounts;
CREATE POLICY "Users can insert own accounts" ON public.accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own categories" ON public.categories;
CREATE POLICY "Users can insert own categories" ON public.categories
    FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## Teste Agora

Execute o script de desabilitar RLS e teste o cadastro. Deve funcionar imediatamente! 🎯

## Próximos Passos

1. **Escolha uma das soluções acima**
2. **Teste o cadastro no app**
3. **Se funcionar, o usuário será criado no Supabase Auth**
4. **O perfil será criado na tabela `users` (se RLS estiver configurado)**

## Nota Importante

- Para **desenvolvimento**: Desabilitar RLS é a solução mais simples
- Para **produção**: Configure as políticas RLS corretamente
- O app funcionará mesmo sem a tabela `users` (dados ficam no `auth.users`) 