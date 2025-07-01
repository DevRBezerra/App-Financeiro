-- Script para inserir dados de teste
-- Execute este script no SQL Editor do Supabase após executar o simple-setup.sql

-- 1. Inserir usuário de teste (substitua pelo ID do seu usuário real)
-- Pegue o ID do seu usuário nos logs do app ou no dashboard do Supabase
INSERT INTO public.users (id, email, name, created_at) 
VALUES (
  'd3ebf1be-51a1-4cae-83fa-080acb43d3b5', -- Substitua pelo ID do seu usuário
  'teste@exemplo.com',
  'Usuário Teste',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 2. Inserir contas de teste
INSERT INTO public.accounts (user_id, name, balance, type, color, created_at) 
VALUES 
  ('d3ebf1be-51a1-4cae-83fa-080acb43d3b5', 'Conta Principal', 1000.00, 'checking', '#007AFF', NOW()),
  ('d3ebf1be-51a1-4cae-83fa-080acb43d3b5', 'Poupança', 5000.00, 'savings', '#4CAF50', NOW()),
  ('d3ebf1be-51a1-4cae-83fa-080acb43d3b5', 'Cartão de Crédito', -500.00, 'credit', '#FF9800', NOW())
ON CONFLICT DO NOTHING;

-- 3. Inserir categorias de teste
INSERT INTO public.categories (user_id, name, type, color, icon, created_at) 
VALUES 
  -- Despesas
  ('d3ebf1be-51a1-4cae-83fa-080acb43d3b5', 'Alimentação', 'expense', '#FF6B6B', '🍕', NOW()),
  ('d3ebf1be-51a1-4cae-83fa-080acb43d3b5', 'Transporte', 'expense', '#4ECDC4', '🚗', NOW()),
  ('d3ebf1be-51a1-4cae-83fa-080acb43d3b5', 'Saúde', 'expense', '#45B7D1', '💊', NOW()),
  ('d3ebf1be-51a1-4cae-83fa-080acb43d3b5', 'Educação', 'expense', '#96CEB4', '📚', NOW()),
  ('d3ebf1be-51a1-4cae-83fa-080acb43d3b5', 'Lazer', 'expense', '#FFEAA7', '🎮', NOW()),
  ('d3ebf1be-51a1-4cae-83fa-080acb43d3b5', 'Vestuário', 'expense', '#DDA0DD', '👕', NOW()),
  ('d3ebf1be-51a1-4cae-83fa-080acb43d3b5', 'Moradia', 'expense', '#98D8C8', '🏠', NOW()),
  ('d3ebf1be-51a1-4cae-83fa-080acb43d3b5', 'Serviços', 'expense', '#F7DC6F', '🔧', NOW()),
  
  -- Receitas
  ('d3ebf1be-51a1-4cae-83fa-080acb43d3b5', 'Salário', 'income', '#4CAF50', '💰', NOW()),
  ('d3ebf1be-51a1-4cae-83fa-080acb43d3b5', 'Freelance', 'income', '#8BC34A', '💼', NOW()),
  ('d3ebf1be-51a1-4cae-83fa-080acb43d3b5', 'Investimentos', 'income', '#FF9800', '📈', NOW()),
  ('d3ebf1be-51a1-4cae-83fa-080acb43d3b5', 'Presentes', 'income', '#E91E63', '🎁', NOW()),
  
  -- Transferências
  ('d3ebf1be-51a1-4cae-83fa-080acb43d3b5', 'Transferência entre contas', 'transfer', '#2196F3', '🔄', NOW()),
  ('d3ebf1be-51a1-4cae-83fa-080acb43d3b5', 'Depósito', 'transfer', '#00BCD4', '📥', NOW()),
  ('d3ebf1be-51a1-4cae-83fa-080acb43d3b5', 'Saque', 'transfer', '#FF5722', '📤', NOW()),
  
  -- Despesas de cartão
  ('d3ebf1be-51a1-4cae-83fa-080acb43d3b5', 'Cartão de Crédito', 'credit_expense', '#FF9800', '💳', NOW()),
  ('d3ebf1be-51a1-4cae-83fa-080acb43d3b5', 'Parcelamento', 'credit_expense', '#FF5722', '📋', NOW())
ON CONFLICT DO NOTHING;

-- 4. Verificar dados inseridos
SELECT 'Contas:' as tipo, COUNT(*) as quantidade FROM public.accounts WHERE user_id = 'd3ebf1be-51a1-4cae-83fa-080acb43d3b5'
UNION ALL
SELECT 'Categorias:' as tipo, COUNT(*) as quantidade FROM public.categories WHERE user_id = 'd3ebf1be-51a1-4cae-83fa-080acb43d3b5';

-- 5. Mostrar contas
SELECT id, name, balance, type, color FROM public.accounts WHERE user_id = 'd3ebf1be-51a1-4cae-83fa-080acb43d3b5';

-- 6. Mostrar categorias
SELECT id, name, type, color, icon FROM public.categories WHERE user_id = 'd3ebf1be-51a1-4cae-83fa-080acb43d3b5'; 