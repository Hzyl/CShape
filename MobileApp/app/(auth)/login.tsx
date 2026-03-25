import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../hooks/useAuth';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, isAuthenticated, failedLoginAttempts, isLocked } = useAuth();

  const [email, setEmail] = useState('admin@vinh-khanh.local');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState<string | null>(null);

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(app)/map');
    }
  }, [isAuthenticated, router]);

  // Check if account is locked
  const isAccountLocked = isLocked && isLocked > Date.now();
  const lockRemainingSeconds = isAccountLocked
    ? Math.ceil((isLocked - Date.now()) / 1000)
    : 0;

  const handleLogin = async () => {
    try {
      setError(null);

      if (!email || !password) {
        setError('Email and password are required');
        return;
      }

      // Attempt login
      await login(email, password);

      // If successful, auto-redirect (handled by useEffect above)
    } catch (err: any) {
      const errorMessage =
        err.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);

      // Show alert for better UX
      Alert.alert('Login Failed', errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Vinh Khanh Guide</Text>
          <Text style={styles.subtitle}>Admin Login</Text>
        </View>

        {/* Lockout Warning */}
        {isAccountLocked && (
          <View style={styles.lockoutAlert}>
            <Text style={styles.lockoutText}>
              Account locked due to too many failed login attempts.{'\n'}
              Try again in {lockRemainingSeconds} seconds.
            </Text>
          </View>
        )}

        {/* Error Message */}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Form */}
        <View style={styles.form}>
          {/* Email Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              editable={!isAccountLocked && !isLoading}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              editable={!isAccountLocked && !isLoading}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {/* Failed Attempts Counter */}
          {failedLoginAttempts > 0 && failedLoginAttempts < 5 && (
            <Text style={styles.attemptsText}>
              Failed attempts: {failedLoginAttempts}/5
            </Text>
          )}

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              (isLoading || isAccountLocked) && styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={isLoading || isAccountLocked}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>
                {isAccountLocked ? 'Account Locked' : 'Login'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Demo Credentials Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Demo Credentials:</Text>
          <Text style={styles.footerSubtext}>Email: admin@vinh-khanh.local</Text>
          <Text style={styles.footerSubtext}>Password: password</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  lockoutAlert: {
    backgroundColor: '#fee',
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
    padding: 12,
    borderRadius: 4,
    marginBottom: 20,
  },
  lockoutText: {
    color: '#c0392b',
    fontSize: 14,
    lineHeight: 20,
  },
  errorBox: {
    backgroundColor: '#f8d7da',
    borderRadius: 4,
    padding: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
  },
  errorText: {
    color: '#721c24',
    fontSize: 14,
  },
  form: {
    marginBottom: 30,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  attemptsText: {
    fontSize: 12,
    color: '#e74c3c',
    marginBottom: 12,
    marginTop: -8,
  },
  loginButton: {
    backgroundColor: '#2980b9',
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    backgroundColor: '#95a5a6',
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#999',
  },
});
