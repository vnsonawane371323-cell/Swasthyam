import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';
import { useAuth } from '../../context/AuthContext';
import { 
  useGoogleAuth, 
  useFacebookAuth, 
  signInWithApple, 
  isAppleSignInAvailable 
} from '../../services/socialAuth';

interface LoginProps {
  onComplete: () => void;
  onSignup: () => void;
  language: string;
  onLanguageChange?: (lang: string) => void;
}

export function Login({ onComplete, onSignup, language, onLanguageChange }: LoginProps) {
  const { login, loginWithSocial, isLoading, error, clearError } = useAuth();
  
  // Social auth hooks
  const { signInWithGoogle, isReady: googleReady } = useGoogleAuth();
  const { signInWithFacebook, isReady: facebookReady } = useFacebookAuth();
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Check if Apple Sign In is available
  useEffect(() => {
    isAppleSignInAvailable().then(setAppleAvailable);
  }, []);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
  ];

  const currentLanguage = languages.find(l => l.code === language) || languages[0];

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Email validation
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(email.trim())) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!password) {
      errors.password = 'Password is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    clearError();
    
    if (!validateForm()) {
      return;
    }
    
    const response = await login({
      email: email.trim().toLowerCase(),
      password
    });
    
    if (response.success) {
      onComplete();
    } else {
      // Show error from backend
      if (response.errors) {
        setValidationErrors(response.errors);
      } else {
        Alert.alert('Login Failed', response.message || 'Invalid email or password');
      }
    }
  };

  // Handle social login
  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    setSocialLoading(provider);
    clearError();
    
    try {
      let result;
      
      switch (provider) {
        case 'google':
          result = await signInWithGoogle();
          break;
        case 'facebook':
          result = await signInWithFacebook();
          break;
        case 'apple':
          result = await signInWithApple();
          break;
      }
      
      if (result.success && result.token && result.user) {
        // Store auth data using AuthContext
        await loginWithSocial(result.token, result.user as any);
        onComplete();
      } else if (result.error && result.error !== 'Sign in cancelled') {
        Alert.alert('Sign In Failed', result.error);
      }
    } catch (err) {
      console.error(`${provider} sign in error:`, err);
      Alert.alert('Error', `Failed to sign in with ${provider}. Please try again.`);
    } finally {
      setSocialLoading(null);
    }
  };

  const isFormValid = email && password;

  const text = {
    en: {
      hello: 'Hello!',
      welcome: 'Welcome to Swasthyam',
      login: 'Login',
      email: 'Email',
      password: 'Password',
      forgotPassword: 'Forgot Password?',
      loginButton: 'Login',
      orLoginWith: 'Or login with',
      noAccount: "Don't have account?",
      signUp: 'Sign Up',
    },
    hi: {
      hello: 'नमस्ते!',
      welcome: 'SwasthTel में आपका स्वागत है',
      login: 'लॉगिन',
      email: 'ईमेल',
      password: 'पासवर्ड',
      forgotPassword: 'पासवर्ड भूल गए?',
      loginButton: 'लॉगिन करें',
      orLoginWith: 'या लॉगिन करें',
      noAccount: 'खाता नहीं है?',
      signUp: 'साइन अप करें',
    },
  };

  const t = text[language as keyof typeof text] || text.en;

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Decorative Background Elements */}
        <View style={[styles.decorCircle, styles.decorCircle1]} />
        <View style={[styles.decorCircle, styles.decorCircle2]} />
        <View style={[styles.decorCircle, styles.decorCircle3]} />

        {/* Language Selector */}
        <View style={styles.languageSelector}>
          <TouchableOpacity
            style={styles.languageButton}
            onPress={() => setShowLanguageMenu(!showLanguageMenu)}
          >
            <Ionicons name="language" size={18} color="#ffffff" />
            <Text style={styles.languageText}>{currentLanguage.name}</Text>
            <Ionicons 
              name={showLanguageMenu ? "chevron-up" : "chevron-down"} 
              size={16} 
              color="#ffffff" 
            />
          </TouchableOpacity>
          
          {showLanguageMenu && (
            <View style={styles.languageMenu}>
              {languages.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageMenuItem,
                    language === lang.code && styles.languageMenuItemActive
                  ]}
                  onPress={() => {
                    onLanguageChange?.(lang.code);
                    setShowLanguageMenu(false);
                  }}
                >
                  <Text style={[
                    styles.languageMenuText,
                    language === lang.code && styles.languageMenuTextActive
                  ]}>{lang.name}</Text>
                  {language === lang.code && (
                    <Ionicons name="checkmark" size={18} color="#07A996" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.helloText}>{t.hello}</Text>
          <Text style={styles.welcomeText}>{t.welcome}</Text>
        </View>

        {/* Login Card */}
        <View style={styles.card}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/icon.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.loginTitle}>{t.login}</Text>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <View style={[styles.inputContainer, validationErrors.email && styles.inputError]}>
              <Ionicons name="mail-outline" size={20} color="#5B5B5B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t.email}
                placeholderTextColor="#5B5B5B"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (validationErrors.email) {
                    setValidationErrors({ ...validationErrors, email: '' });
                  }
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {validationErrors.email && (
              <Text style={styles.errorText}>{validationErrors.email}</Text>
            )}
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <View style={[styles.inputContainer, validationErrors.password && styles.inputError]}>
              <Ionicons name="lock-closed-outline" size={20} color="#5B5B5B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t.password}
                placeholderTextColor="#5B5B5B"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (validationErrors.password) {
                    setValidationErrors({ ...validationErrors, password: '' });
                  }
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons 
                  name={showPassword ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color="#5B5B5B" 
                />
              </TouchableOpacity>
            </View>
            {validationErrors.password && (
              <Text style={styles.errorText}>{validationErrors.password}</Text>
            )}
          </View>

          {/* Forgot Password */}
          <TouchableOpacity style={styles.forgotPasswordContainer}>
            <Text style={styles.forgotPasswordText}>{t.forgotPassword}</Text>
          </TouchableOpacity>

          {/* Global Error */}
          {error && (
            <View style={styles.globalError}>
              <Ionicons name="alert-circle" size={16} color="#ef4444" />
              <Text style={styles.globalErrorText}>{error}</Text>
            </View>
          )}

          {/* Login Button */}
          <Button
            onPress={handleLogin}
            style={[styles.button, (!isFormValid || isLoading) && styles.buttonDisabled]}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              t.loginButton
            )}
          </Button>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t.orLoginWith}</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Login Buttons */}
          <View style={styles.socialContainer}>
            <TouchableOpacity
              style={[styles.socialButton, socialLoading === 'facebook' && styles.socialButtonLoading]}
              onPress={() => handleSocialLogin('facebook')}
              disabled={!!socialLoading}
            >
              {socialLoading === 'facebook' ? (
                <ActivityIndicator color="#1877F2" size="small" />
              ) : (
                <Ionicons name="logo-facebook" size={24} color="#1877F2" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.socialButton,
                socialLoading === 'google' && styles.socialButtonLoading,
                !googleReady && styles.socialButtonDisabled
              ]}
              onPress={() => handleSocialLogin('google')}
              disabled={!!socialLoading || !googleReady}
            >
              {socialLoading === 'google' ? (
                <ActivityIndicator color="#EA4335" size="small" />
              ) : (
                <Ionicons name="logo-google" size={24} color="#EA4335" />
              )}
            </TouchableOpacity>

            {(Platform.OS === 'ios' || appleAvailable) && (
              <TouchableOpacity
                style={[styles.socialButton, socialLoading === 'apple' && styles.socialButtonLoading]}
                onPress={() => handleSocialLogin('apple')}
                disabled={!!socialLoading}
              >
                {socialLoading === 'apple' ? (
                  <ActivityIndicator color="#040707" size="small" />
                ) : (
                  <Ionicons name="logo-apple" size={24} color="#040707" />
                )}
              </TouchableOpacity>
            )}
          </View>

          {!googleReady && (
            <Text style={styles.socialSetupHint}>
              Google Sign-In needs OAuth client IDs in project .env.
            </Text>
          )}

          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>{t.noAccount} </Text>
            <TouchableOpacity onPress={onSignup}>
              <Text style={styles.signupLink}>{t.signUp}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1b4a5a',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 9999,
  },
  decorCircle1: {
    top: 40,
    left: 40,
    width: 128,
    height: 128,
    backgroundColor: '#E7F2F1',
    opacity: 0.3,
  },
  decorCircle2: {
    top: 80,
    right: -20,
    width: 160,
    height: 160,
    backgroundColor: '#ffffff',
    opacity: 0.2,
  },
  decorCircle3: {
    bottom: 80,
    left: -30,
    width: 192,
    height: 192,
    backgroundColor: '#E7F2F1',
    opacity: 0.25,
  },
  languageSelector: {
    alignSelf: 'flex-end',
    marginBottom: 16,
    zIndex: 100,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  languageText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  languageMenu: {
    position: 'absolute',
    top: 45,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  languageMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  languageMenuItemActive: {
    backgroundColor: '#E7F2F1',
  },
  languageMenuText: {
    flex: 1,
    fontSize: 14,
    color: '#040707',
  },
  languageMenuTextActive: {
    color: '#07A996',
    fontWeight: '600',
  },
  header: {
    marginBottom: 32,
  },
  helloText: {
    color: '#ffffff',
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  welcomeText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 24,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#E7F2F1',
    borderRadius: 32,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoContainer: {
    position: 'absolute',
    top: -30,
    right: 32,
    width: 80,
    height: 80,
    backgroundColor: '#ffffff',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    overflow: 'hidden',
  },
  logoImage: {
    width: 60,
    height: 60,
  },
  loginTitle: {
    fontSize: 24,
    color: '#040707',
    fontWeight: '600',
    marginBottom: 24,
    marginTop: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#040707',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#07A996',
    fontSize: 14,
  },
  globalError: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  globalErrorText: {
    flex: 1,
    color: '#ef4444',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#1b4a5a',
    height: 56,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginButton: {
    backgroundColor: '#1b4a5a',
    height: 56,
    marginTop: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#5B5B5B',
    opacity: 0.3,
  },
  dividerText: {
    color: '#5B5B5B',
    fontSize: 14,
    marginHorizontal: 16,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  socialButton: {
    width: 56,
    height: 56,
    backgroundColor: '#ffffff',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  socialButtonLoading: {
    opacity: 0.7,
  },
  socialButtonDisabled: {
    opacity: 0.4,
  },
  socialSetupHint: {
    textAlign: 'center',
    color: '#5B5B5B',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 20,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signupText: {
    color: '#5B5B5B',
    fontSize: 14,
  },
  signupLink: {
    color: '#07A996',
    fontSize: 14,
    fontWeight: '600',
  },
});
