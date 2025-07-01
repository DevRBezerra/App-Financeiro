# Organizze App
https://www.instagram.com/p/DLgh--YMgok/ - video do app <br>
Um aplicativo de controle financeiro pessoal inspirado no Organizze, desenvolvido com React Native, Expo e Firebase.

## 🚀 Funcionalidades

- **Autenticação**: Login e cadastro de usuários
- **Dashboard**: Visão geral das finanças com resumo mensal
- **Contas**: Gerenciamento de contas bancárias
- **Transações**: Registro de receitas e despesas
- **Categorias**: Organização de transações por categorias
- **Relatórios**: Análise de gastos e receitas

## 🛠️ Tecnologias

- **React Native** com **Expo**
- **TypeScript** para type safety
- **Firebase** (Authentication, Firestore, Storage)
- **React Navigation** para navegação
- **AsyncStorage** para armazenamento local

## 📱 Plataformas Suportadas

- ✅ iOS
- ✅ Android  
- ✅ Web (React)

## 🚀 Como Executar

### Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn
- Expo CLI
- Conta no Firebase

### 1. Instalação

```bash
# Clone o repositório
git clone <seu-repositorio>
cd organizze-app

# Instale as dependências
npm install
```

### 2. Configuração do Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Ative o Authentication (Email/Password)
3. Crie um banco Firestore
4. Copie as credenciais do projeto

### 3. Configurar Credenciais

Edite o arquivo `src/services/firebase.ts` e substitua as configurações:

```typescript
const firebaseConfig = {
  apiKey: "sua-api-key",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "seu-app-id"
};
```

### 4. Executar o Projeto

```bash
# Para iOS
npm run ios

# Para Android
npm run android

# Para Web
npm run web

# Para desenvolvimento
npm start
```

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── Button.tsx
│   └── Input.tsx
├── contexts/           # Contextos React
│   └── AuthContext.tsx
├── screens/            # Telas do aplicativo
│   ├── LoginScreen.tsx
│   └── DashboardScreen.tsx
├── services/           # Serviços e APIs
│   ├── firebase.ts
│   ├── accounts.ts
│   ├── transactions.ts
│   └── categories.ts
├── types/              # Definições de tipos TypeScript
│   └── index.ts
└── utils/              # Utilitários e helpers
```

## 🔧 Configuração do Firebase

### Regras do Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários podem ler/escrever apenas seus próprios dados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Contas
    match /accounts/{accountId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Transações
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Categorias
    match /categories/{categoryId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

## 📊 Funcionalidades Implementadas

### ✅ Concluído
- [x] Estrutura base do projeto
- [x] Configuração do Firebase
- [x] Sistema de autenticação
- [x] Dashboard principal
- [x] Componentes básicos (Button, Input)
- [x] Serviços para contas, transações e categorias
- [x] Tipos TypeScript

### 🚧 Em Desenvolvimento
- [ ] Tela de nova transação
- [ ] Tela de nova conta
- [ ] Lista de transações
- [ ] Relatórios e gráficos
- [ ] Configurações do usuário
- [ ] Notificações
- [ ] Backup e sincronização

### 📋 Próximas Funcionalidades
- [ ] Metas financeiras
- [ ] Orçamentos mensais
- [ ] Transações recorrentes
- [ ] Exportação de relatórios
- [ ] Integração com bancos
- [ ] Modo offline

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

Se você encontrar algum problema ou tiver dúvidas, abra uma issue no repositório.

---

Desenvolvido com ❤️ usando React Native e Firebase 
