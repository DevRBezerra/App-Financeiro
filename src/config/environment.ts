interface Environment {
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  app: {
    name: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
  };
}

const development: Environment = {
  firebase: {
    apiKey: "AIzaSyAu5TbeqoKejz6KPjxfPgLw_m3Yt04C13c",
    authDomain: "rkfinanceiro-9c98a.firebaseapp.com",
    projectId: "rkfinanceiro-9c98a",
    storageBucket: "rkfinanceiro-9c98a.firebasestorage.app",
    messagingSenderId: "582197746184",
    appId: "1:582197746184:web:05caca2c51170a931ecfbd",
  },
  app: {
    name: 'Organizze',
    version: '1.0.0',
    environment: 'development',
  },
};

const staging: Environment = {
  firebase: {
    apiKey: "AIzaSyAu5TbeqoKejz6KPjxfPgLw_m3Yt04C13c",
    authDomain: "rkfinanceiro-9c98a.firebaseapp.com",
    projectId: "rkfinanceiro-9c98a",
    storageBucket: "rkfinanceiro-9c98a.firebasestorage.app",
    messagingSenderId: "582197746184",
    appId: "1:582197746184:web:05caca2c51170a931ecfbd",
  },
  app: {
    name: 'Organizze',
    version: '1.0.0',
    environment: 'staging',
  },
};

const production: Environment = {
  firebase: {
    apiKey: "AIzaSyAu5TbeqoKejz6KPjxfPgLw_m3Yt04C13c",
    authDomain: "rkfinanceiro-9c98a.firebaseapp.com",
    projectId: "rkfinanceiro-9c98a",
    storageBucket: "rkfinanceiro-9c98a.firebasestorage.app",
    messagingSenderId: "582197746184",
    appId: "1:582197746184:web:05caca2c51170a931ecfbd",
  },
  app: {
    name: 'Organizze',
    version: '1.0.0',
    environment: 'production',
  },
};

const getEnvironment = (): Environment => {
  const env = process.env.EXPO_PUBLIC_ENVIRONMENT || 'development';
  
  switch (env) {
    case 'staging':
      return staging;
    case 'production':
      return production;
    default:
      return development;
  }
};

export const environment = getEnvironment(); 