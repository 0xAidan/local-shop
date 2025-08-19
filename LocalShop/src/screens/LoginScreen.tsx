import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { ConnectivityTest } from '../services/connectivityTest';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerData, setRegisterData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'customer' as 'customer' | 'shop_owner',
  });

  const navigation = useNavigation();
  const { login, register } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      // Navigation will be handled automatically by the AppNavigator
    } catch (error) {
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !registerData.username || !registerData.firstName || !registerData.lastName) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        ...registerData,
        email,
        password,
        role: registerData.role || 'customer',
      });
      // Navigation will be handled automatically by the AppNavigator
    } catch (error) {
      Alert.alert('Registration Failed', error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    try {
      const result = await ConnectivityTest.testAPI();
      if (result.success) {
        Alert.alert('✅ Connection Test', result.message);
      } else {
        Alert.alert('❌ Connection Test Failed', result.message, [
          { text: 'OK' },
          { text: 'View Details', onPress: () => Alert.alert('Details', JSON.stringify(result.details, null, 2)) }
        ]);
      }
    } catch (error) {
      Alert.alert('❌ Test Error', error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.logo}>🏪</Text>
              <Text style={styles.title}>Local Shop</Text>
              <Text style={styles.subtitle}>
                {isRegistering ? 'Create your account' : 'Welcome back!'}
              </Text>
            </View>

            <View style={styles.form}>
              {isRegistering && (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Username"
                    placeholderTextColor="#999"
                    value={registerData.username}
                    onChangeText={(text) => setRegisterData({ ...registerData, username: text })}
                    autoCapitalize="none"
                  />
                  <View style={styles.row}>
                    <TextInput
                      style={[styles.input, styles.halfInput]}
                      placeholder="First Name"
                      placeholderTextColor="#999"
                      value={registerData.firstName}
                      onChangeText={(text) => setRegisterData({ ...registerData, firstName: text })}
                    />
                    <TextInput
                      style={[styles.input, styles.halfInput]}
                      placeholder="Last Name"
                      placeholderTextColor="#999"
                      value={registerData.lastName}
                      onChangeText={(text) => setRegisterData({ ...registerData, lastName: text })}
                    />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Phone (optional)"
                    placeholderTextColor="#999"
                    value={registerData.phone}
                    onChangeText={(text) => setRegisterData({ ...registerData, phone: text })}
                    keyboardType="phone-pad"
                  />
                </>
              )}

              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <TouchableOpacity
                style={styles.button}
                onPress={isRegistering ? handleRegister : handleLogin}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? 'Loading...' : (isRegistering ? 'Create Account' : 'Login')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.switchButton}
                onPress={() => setIsRegistering(!isRegistering)}
              >
                <Text style={styles.switchText}>
                  {isRegistering
                    ? 'Already have an account? Login'
                    : "Don't have an account? Register"}
                </Text>
              </TouchableOpacity>

              {!isRegistering && (
                <TouchableOpacity
                  style={styles.shopOwnerButton}
                  onPress={() => {
                    setRegisterData({ ...registerData, role: 'shop_owner' });
                    setIsRegistering(true);
                  }}
                >
                  <Text style={styles.shopOwnerText}>
                    Register as Shop Owner
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.testButton}
                onPress={handleTestConnection}
                disabled={isLoading}
              >
                <Text style={styles.testButtonText}>
                  🧪 Test API Connection
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  button: {
    backgroundColor: '#667eea',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  switchText: {
    color: '#667eea',
    fontSize: 14,
  },
  shopOwnerButton: {
    alignItems: 'center',
    marginTop: 15,
    padding: 10,
  },
  shopOwnerText: {
    color: '#764ba2',
    fontSize: 14,
    fontWeight: '600',
  },
  testButton: {
    alignItems: 'center',
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  testButtonText: {
    color: '#666',
    fontSize: 12,
  },
}); 