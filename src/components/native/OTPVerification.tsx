import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Button } from './Button';

interface OTPVerificationProps {
  onComplete: () => void;
  language: string;
  phoneNumber?: string;
}

export function OTPVerification({ 
  onComplete, 
  language, 
  phoneNumber = '+91 98765 43210' 
}: OTPVerificationProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }

    if (/^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    if (otp.every(digit => digit !== '')) {
      onComplete();
    }
  };

  const handleResend = () => {
    setTimeLeft(30);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  const text = {
    en: {
      title: 'OTP Verification',
      subtitle: 'Enter the verification code we just sent to',
      verify: 'Verify',
      resendCode: 'Resend Code',
      resendIn: 'Resend in',
      seconds: 'seconds',
      didntReceive: "Didn't receive the code?",
    },
    hi: {
      title: 'OTP सत्यापन',
      subtitle: 'हमने अभी भेजा हुआ सत्यापन कोड दर्ज करें',
      verify: 'सत्यापित करें',
      resendCode: 'कोड पुनः भेजें',
      resendIn: 'पुनः भेजें',
      seconds: 'सेकंड में',
      didntReceive: 'कोड प्राप्त नहीं हुआ?',
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

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.titleText}>{t.title}</Text>
          <Text style={styles.subtitleText}>{t.subtitle}</Text>
          <Text style={styles.phoneText}>{phoneNumber}</Text>
        </View>

        {/* OTP Card */}
        <View style={styles.card}>
          {/* OTP Input Boxes */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={styles.otpInput}
                value={digit}
                onChangeText={(value) => handleChange(index, value)}
                onKeyPress={({ nativeEvent: { key } }) => handleKeyPress(index, key)}
                keyboardType="numeric"
                maxLength={1}
                autoFocus={index === 0}
                selectTextOnFocus
              />
            ))}
          </View>

          {/* Timer / Resend */}
          <View style={styles.timerContainer}>
            {!canResend ? (
              <Text style={styles.timerText}>
                {t.resendIn} {timeLeft} {t.seconds}
              </Text>
            ) : (
              <View>
                <Text style={styles.didntReceiveText}>{t.didntReceive}</Text>
                <TouchableOpacity onPress={handleResend}>
                  <Text style={styles.resendText}>{t.resendCode}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Verify Button */}
          <Button
            onPress={handleVerify}
            disabled={otp.some(digit => digit === '')}
            style={styles.verifyButton}
          >
            {t.verify}
          </Button>
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
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  titleText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitleText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  phoneText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
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
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
    gap: 6,
    flexWrap: 'wrap',
  },
  otpInput: {
    width: 48,
    minWidth: 40,
    maxWidth: 64,
    height: 56,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    fontSize: 24,
    textAlign: 'center',
    color: '#040707',
    fontWeight: '600',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timerText: {
    color: '#5B5B5B',
    fontSize: 14,
  },
  didntReceiveText: {
    color: '#5B5B5B',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  resendText: {
    color: '#1b4a5a',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  verifyButton: {
    backgroundColor: '#07A996',
    height: 48,
  },
});
