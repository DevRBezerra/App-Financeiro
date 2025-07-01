# 🚀 Configuração do Supabase para Organizze

## 1. Criar conta no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Faça login com GitHub ou Google
4. Crie um novo projeto

## 2. Configurar o banco de dados

### Tabela `users`
```sql
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Tabela `accounts`
```sql
CREATE TABLE accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  balance DECIMAL(10,2) DEFAULT 0,
  type TEXT CHECK (type IN ('checking', 'savings', 'credit', 'investment')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tabela `transactions`
```sql
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tabela `categories`
```sql
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense')),
  color TEXT DEFAULT '#007AFF',
  icon TEXT DEFAULT '💰',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 3. Configurar Row Level Security (RLS)

### Política para users
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### Política para accounts
```sql
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own accounts" ON accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own accounts" ON accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts" ON accounts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own accounts" ON accounts
  FOR DELETE USING (auth.uid() = user_id);
```

### Política para transactions
```sql
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);
```

### Política para categories
```sql
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own categories" ON categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON categories
  FOR DELETE USING (auth.uid() = user_id);
```

## 4. Configurar o app

### Obter credenciais
1. No dashboard do Supabase, vá em Settings > API
2. Copie a URL e a anon key
3. Atualize o arquivo `src/services/supabase.ts`:

```typescript
const supabaseUrl = 'https://seu-projeto.supabase.co';
const supabaseAnonKey = 'sua-chave-anonima';
```

## 5. Funcionalidades disponíveis

✅ **Autenticação completa** (signup, signin, signout)
✅ **Perfil de usuário** com dados personalizados
✅ **Gestão de contas** (criar, editar, deletar)
✅ **Transações** com categorização
✅ **Tempo real** - mudanças sincronizadas instantaneamente
✅ **Offline support** - dados sincronizados quando online
✅ **Segurança** - cada usuário vê apenas seus dados

## 6. Vantagens do Supabase

- 🆓 **Gratuito** até 500MB e 50k usuários/mês
- 🔒 **Seguro** com RLS nativo
- ⚡ **Rápido** com PostgreSQL
- 🔄 **Tempo real** com WebSockets
- 📱 **React Native** suporte nativo
- 🎨 **Dashboard** intuitivo
- 📊 **Analytics** integrado
- 🔧 **API REST** automática

## 7. Próximos passos

1. Criar conta no Supabase
2. Executar os scripts SQL
3. Configurar as credenciais no app
4. Testar a integração
5. Implementar funcionalidades específicas

O Supabase é uma excelente alternativa ao Firebase, especialmente para projetos que precisam de mais controle e flexibilidade! 