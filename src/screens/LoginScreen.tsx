import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  
  const { signIn, signUp } = useAuth();

  const handleSubmit = async () => {
    if (!email || !password || (isSignUp && !name)) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password, name);
        Alert.alert('Sucesso', 'Conta criada com sucesso!');
      } else {
        await signIn(email, password);
      }
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Organizze</Text>
            <Text style={styles.subtitle}>
              {isSignUp ? 'Crie sua conta' : 'Faça login para continuar'}
            </Text>
          </View>

          <View style={styles.form}>
            {isSignUp && (
              <Input
                label="Nome"
                value={name}
                onChangeText={setName}
                placeholder="Digite seu nome completo"
                autoCapitalize="words"
              />
            )}

            <Input
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              placeholder="Digite seu e-mail"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Input
              label="Senha"
              value={password}
              onChangeText={setPassword}
              placeholder="Digite sua senha"
              secureTextEntry
              autoCapitalize="none"
            />

            <Button
              title={isSignUp ? 'Criar Conta' : 'Entrar'}
              onPress={handleSubmit}
              loading={loading}
              style={styles.submitButton}
            />

            <Button
              title={isSignUp ? 'Já tenho uma conta' : 'Criar nova conta'}
              onPress={() => setIsSignUp(!isSignUp)}
              variant="outline"
              style={styles.switchButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 16,
  },
  switchButton: {
    marginTop: 8,
  },
}); 