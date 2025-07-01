# Corrigir Problemas de Saldo das Contas

## Problemas Identificados

1. **Saldo não está sendo atualizado no dashboard**
2. **Nome da conta "Conta Principal" está muito colado à esquerda**
3. **Dashboard não atualiza após criar/modificar contas**

## Soluções Implementadas

### 1. ✅ Layout Corrigido
- Adicionado `paddingHorizontal: 8` e `marginBottom: 4` ao nome da conta
- Melhorado o espaçamento e alinhamento

### 2. ✅ Listeners de Atualização
- Adicionado listener no dashboard para detectar mudanças
- Adicionado listener na tela de contas para atualizar dashboard
- Logs de debug adicionados para rastrear problemas

### 3. ✅ Logs de Debug
- Logs no dashboard para verificar carregamento de dados
- Logs na criação de contas
- Logs no serviço de contas

## Como Testar

### 1. Verificar Logs no Console
1. Abra o console do React Native
2. Crie uma nova conta com saldo
3. Verifique os logs:
   - "Criando nova conta..."
   - "Dados da conta: {...}"
   - "accountsService.createAccount - Dados recebidos: {...}"
   - "accountsService.createAccount - Conta criada: {...}"
   - "Carregando dados do dashboard..."
   - "Contas carregadas: [...]"
   - "Saldo total calculado: X"

### 2. Verificar Banco de Dados
Execute o script `verificar-contas.sql` no Supabase SQL Editor:

```sql
-- Verificar contas existentes
SELECT id, name, balance, type, user_id, created_at
FROM accounts 
ORDER BY created_at DESC;

-- Verificar se há contas com saldo
SELECT name, balance, type, user_id
FROM accounts 
WHERE balance > 0
ORDER BY balance DESC;
```

### 3. Testar Fluxo Completo
1. **Dashboard**: Verifique o saldo total no topo
2. **Criar Conta**: Vá para "Suas Contas" → "Ver todas" → "+"
3. **Adicionar Saldo**: Digite um valor no campo "Saldo inicial"
4. **Salvar**: Clique em "Criar Conta"
5. **Voltar**: Use o botão voltar para retornar ao dashboard
6. **Verificar**: O saldo total deve ter sido atualizado

## Possíveis Problemas e Soluções

### Problema: Saldo não aparece no dashboard
**Causa**: Dashboard não está recarregando os dados
**Solução**: Os listeners já foram implementados

### Problema: Saldo não é salvo no banco
**Causa**: Erro na criação da conta
**Solução**: Verificar logs do console e banco de dados

### Problema: Layout quebrado
**Causa**: Estilos incorretos
**Solução**: Estilos já foram corrigidos

## Debug Avançado

### 1. Verificar Estrutura da Tabela
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'accounts' 
ORDER BY ordinal_position;
```

### 2. Verificar Dados de uma Conta Específica
```sql
SELECT * FROM accounts WHERE name = 'Conta Principal';
```

### 3. Forçar Atualização do Dashboard
- Feche o app completamente
- Abra novamente
- Vá para o dashboard

## Resultado Esperado

- ✅ Nome da conta com espaçamento correto
- ✅ Saldo sendo salvo no banco de dados
- ✅ Dashboard atualizando automaticamente
- ✅ Saldo total calculado corretamente
- ✅ Logs mostrando o fluxo completo

## Se o Problema Persistir

1. Verifique se há erros no console
2. Execute o script SQL para verificar o banco
3. Teste criar uma nova conta com saldo
4. Verifique se o user_id está correto
5. Confirme se as políticas RLS estão permitindo inserção 