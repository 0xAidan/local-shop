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
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
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
      const phone = registerData.phone?.trim();
      await register({
        username: registerData.username.trim(),
        firstName: registerData.firstName.trim(),
        lastName: registerData.lastName.trim(),
        email: email.trim(),
        password,
        role: registerData.role || 'customer',
        ...(phone ? { phone } : {}),
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
        Alert.alert('Connection test', result.message);
      } else {
        Alert.alert('Connection failed', result.message, [
          { text: 'OK' },
          { text: 'View Details', onPress: () => Alert.alert('Details', JSON.stringify(result.details, null, 2)) }
        ]);
      }
    } catch (error) {
      Alert.alert('Test error', error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.logoMark}>
                <Ionicons name="storefront-outline" size={32} color={colors.primary} />
              </View>
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

              {__DEV__ && (
                <TouchableOpacity
                  style={styles.testButton}
                  onPress={handleTestConnection}
                  disabled={isLoading}
                >
                  <Text style={styles.testButtonText}>Test API connection</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  logoMark: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: colors.surfaceElevated,
    color: colors.textPrimary,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  switchButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  switchText: {
    color: colors.primary,
    fontSize: 14,
  },
  shopOwnerButton: {
    alignItems: 'center',
    marginTop: 15,
    padding: 10,
  },
  shopOwnerText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  testButton: {
    alignItems: 'center',
    marginTop: 15,
    padding: 10,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 8,
  },
  testButtonText: {
    color: colors.textMuted,
    fontSize: 12,
  },
}); 