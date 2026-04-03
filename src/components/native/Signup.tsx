import React, { useState } from 'react';
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

interface SignupProps {
  onComplete: () => void;
  onLogin: () => void;
  language: string;
  onLanguageChange?: (lang: string) => void;
}

export function Signup({ onComplete, onLogin, language, onLanguageChange }: SignupProps) {
  const { signup, isLoading, error, clearError } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
  ];

  const currentLanguage = languages.find(l => l.code === language) || languages[0];

  const text = {
    en: {
      createAccount: 'Create Account',
      joinSwasthyam: 'Join Swasthyam Today',
      name: 'Full Name',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      signUpButton: 'Sign Up',
      orSignUpWith: 'Or sign up with',
      haveAccount: 'Already have an account?',
      login: 'Login',
      passwordHint: 'At least 8 characters with uppercase, lowercase & number',
      namePlaceholder: 'Enter your full name',
      emailPlaceholder: 'Enter your email',
      passwordPlaceholder: 'Create a password',
      confirmPasswordPlaceholder: 'Confirm your password',
    },
    hi: {
      createAccount: 'खाता बनाएं',
      joinSwasthyam: 'आज ही SwasthTel से जुड़ें',
      name: 'पूरा नाम',
      email: 'ईमेल',
      password: 'पासवर्ड',
      confirmPassword: 'पासवर्ड की पुष्टि करें',
      signUpButton: 'साइन अप करें',
      orSignUpWith: 'या साइन अप करें',
      haveAccount: 'पहले से खाता है?',
      login: 'लॉगिन करें',
      passwordHint: 'कम से कम 8 अक्षर अपरकेस, लोअरकेस और नंबर के साथ',
      namePlaceholder: 'अपना पूरा नाम दर्ज करें',
      emailPlaceholder: 'अपना ईमेल दर्ज करें',
      passwordPlaceholder: 'पासवर्ड बनाएं',
      confirmPasswordPlaceholder: 'पासवर्ड की पुष्टि करें',
    },
  };

  const t = text[language as keyof typeof text] || text.en;

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Name validation
    if (!name.trim()) {
      errors.name = 'Name is required';
    }
    
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
    } else {
      if (password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      } else if (!/[A-Z]/.test(password)) {
        errors.password = 'Password must contain at least one uppercase letter';
      } else if (!/[a-z]/.test(password)) {
        errors.password = 'Password must contain at least one lowercase letter';
      } else if (!/[0-9]/.test(password)) {
        errors.password = 'Password must contain at least one number';
      }
    }
    
    // Confirm password validation
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignup = async () => {
    clearError();
    
    if (!validateForm()) {
      return;
    }
    
    const response = await signup({
      email: email.trim().toLowerCase(),
      password,
      name: name.trim()
    });
    
    if (response.success) {
      onComplete();
    } else {
      // Show error from backend
      if (response.errors) {
        setValidationErrors(response.errors);
      } else {
        Alert.alert('Signup Failed', response.message || 'Please try again');
      }
    }
  };

  const handleSocialSignup = (provider: string) => {
    console.log(`Sign up with ${provider}`);
    Alert.alert('Coming Soon', `${provider} signup will be available soon!`);
  };

  const isFormValid = name && email && password && confirmPassword && password === confirmPassword;

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
          <Text style={styles.helloText}>{t.createAccount}</Text>
          <Text style={styles.welcomeText}>{t.joinSwasthyam}</Text>
        </View>

        {/* Signup Card */}
        <View style={styles.card}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/icon.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          {/* Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t.name}</Text>
            <View style={[styles.inputContainer, validationErrors.name && styles.inputError]}>
              <Ionicons name="person-outline" size={20} color="#5B5B5B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t.namePlaceholder}
                placeholderTextColor="#5B5B5B"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (validationErrors.name) {
                    setValidationErrors({ ...validationErrors, name: '' });
                  }
                }}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>
            {validationErrors.name && (
              <Text style={styles.errorText}>{validationErrors.name}</Text>
            )}
          </View>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t.email}</Text>
            <View style={[styles.inputContainer, validationErrors.email && styles.inputError]}>
              <Ionicons name="mail-outline" size={20} color="#5B5B5B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t.emailPlaceholder}
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
            <Text style={styles.inputLabel}>{t.password}</Text>
            <View style={[styles.inputContainer, validationErrors.password && styles.inputError]}>
              <Ionicons name="lock-closed-outline" size={20} color="#5B5B5B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t.passwordPlaceholder}
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
            <Text style={styles.hintText}>{t.passwordHint}</Text>
            {validationErrors.password && (
              <Text style={styles.errorText}>{validationErrors.password}</Text>
            )}
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t.confirmPassword}</Text>
            <View style={[styles.inputContainer, validationErrors.confirmPassword && styles.inputError]}>
              <Ionicons name="lock-closed-outline" size={20} color="#5B5B5B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t.confirmPasswordPlaceholder}
                placeholderTextColor="#5B5B5B"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (validationErrors.confirmPassword) {
                    setValidationErrors({ ...validationErrors, confirmPassword: '' });
                  }
                }}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons 
                  name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color="#5B5B5B" 
                />
              </TouchableOpacity>
            </View>
            {validationErrors.confirmPassword && (
              <Text style={styles.errorText}>{validationErrors.confirmPassword}</Text>
            )}
          </View>

          {/* Global Error */}
          {error && (
            <View style={styles.globalError}>
              <Ionicons name="alert-circle" size={16} color="#ef4444" />
              <Text style={styles.globalErrorText}>{error}</Text>
            </View>
          )}

          {/* Sign Up Button */}
          <Button
            onPress={handleSignup}
            style={[styles.button, (!isFormValid || isLoading) && styles.buttonDisabled]}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              t.signUpButton
            )}
          </Button>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t.orSignUpWith}</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Login Buttons */}
          <View style={styles.socialContainer}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleSocialSignup('facebook')}
            >
              <Ionicons name="logo-facebook" size={24} color="#1877F2" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleSocialSignup('google')}
            >
              <Ionicons name="logo-google" size={24} color="#EA4335" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleSocialSignup('apple')}
            >
              <Ionicons name="logo-apple" size={24} color="#040707" />
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>{t.haveAccount} </Text>
            <TouchableOpacity onPress={onLogin}>
              <Text style={styles.loginLink}>{t.login}</Text>
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
    paddingTop: 40,
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
    marginBottom: 24,
  },
  helloText: {
    color: '#ffffff',
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  welcomeText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 20,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#E7F2F1',
    borderRadius: 32,
    padding: 28,
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
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#040707',
    marginBottom: 8,
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
  hintText: {
    fontSize: 12,
    color: '#5B5B5B',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
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
    marginBottom: 20,
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    color: '#5B5B5B',
    fontSize: 14,
  },
  loginLink: {
    color: '#07A996',
    fontSize: 14,
    fontWeight: '600',
  },
});
