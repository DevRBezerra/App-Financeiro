const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Adicionar suporte para aliases
config.resolver.alias = {
  '@': './src',
  '@/components': './src/components',
  '@/screens': './src/screens',
  '@/services': './src/services',
  '@/types': './src/types',
  '@/utils': './src/utils',
  '@/contexts': './src/contexts',
};

module.exports = config; 