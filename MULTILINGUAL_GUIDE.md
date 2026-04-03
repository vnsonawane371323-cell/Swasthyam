# Multilingual Implementation Guide

## ✅ Completed Setup

Your app now has a complete multilingual foundation with English and Hindi support.

### 1. **i18n Library Installed**
- Package: `i18n-js`
- Location: `node_modules/i18n-js`

### 2. **Translation Files Created**
- **English**: `src/i18n/locales/en.ts` (200+ translation keys)
- **Hindi**: `src/i18n/locales/hi.ts` (200+ translation keys)

Translation structure covers:
- `common`: Basic UI elements (welcome, loading, error, buttons, language)
- `auth`: Login, signup, passwords
- `navigation`: All main tabs (home, oil tracker, profile, etc.)
- `home`: Dashboard, mascot messages
- `oilTracker`: Oil consumption tracking
- `profile`: User profile and settings
- `onboarding`: All 3 onboarding steps (awareness, basic info, eating habits, oil preferences)
- `groups`: Group features
- `partners`: Partner listings and comparison
- `barcode`: Barcode scanning
- `education`, `community`, `rewards`: Feature-specific translations
- `notifications`, `errors`: System messages

### 3. **i18n Configuration**
File: `src/i18n/index.ts`

Available helper functions:
```typescript
import { t, changeLanguage, getCurrentLanguage, getAvailableLanguages } from './i18n';

// Translate a key
const welcomeText = t('common.welcome'); // Returns "Welcome" or "स्वागत है"

// Change language
changeLanguage('hi'); // Switch to Hindi
changeLanguage('en'); // Switch to English

// Get current language
const current = getCurrentLanguage(); // Returns 'en' or 'hi'

// Get all available languages
const languages = getAvailableLanguages();
// Returns: [
//   { code: 'en', name: 'English', nativeName: 'English' },
//   { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' }
// ]
```

### 4. **AuthContext Integration**
File: `src/context/AuthContext.tsx`

Language now syncs with user authentication:
- ✅ Language stored in AsyncStorage (`@swasthtel_language`)
- ✅ Language loaded on app startup
- ✅ Language synced on login/signup
- ✅ Language updated when user changes preference
- ✅ Language reset to 'en' on logout

### 5. **Language Selector Component**
File: `src/components/native/LanguageSelector.tsx`

Features:
- ✅ Shows current language with native name
- ✅ Modal with list of available languages
- ✅ Updates i18n system
- ✅ Persists to user profile via API
- ✅ Saves to AsyncStorage
- ✅ Integrated in Profile Settings tab

## 🚀 How to Use i18n in Components

### Step 1: Import Translation Function
```typescript
import { t } from '../../i18n';
```

### Step 2: Replace Hardcoded Text
**Before:**
```typescript
const text = {
  en: { title: 'Welcome', subtitle: 'Track your oil' },
  hi: { title: 'स्वागत है', subtitle: 'अपने तेल को ट्रैक करें' }
};

<Text>{text[language].title}</Text>
<Text>{text[language].subtitle}</Text>
```

**After:**
```typescript
import { t } from '../../i18n';

<Text>{t('common.welcome')}</Text>
<Text>{t('home.trackYourOil')}</Text>
```

### Step 3: Using Dynamic Values
```typescript
// With interpolation
<Text>{t('home.greeting', { name: user.name })}</Text>

// Translation file should have:
// greeting: 'Hello, {{name}}!'
```

### Step 4: Handling Nested Keys
```typescript
<Text>{t('onboarding.awareness.screen1.title')}</Text>
<Text>{t('onboarding.basicInfo.name')}</Text>
<Text>{t('oilTracker.todayConsumption')}</Text>
```

## 📝 Component Migration Examples

### Example 1: Simple Component
```typescript
// Before
const LoginScreen = ({ language }) => {
  const text = {
    en: { 
      title: 'Login', 
      email: 'Email', 
      password: 'Password',
      submit: 'Login'
    },
    hi: { 
      title: 'लॉगिन', 
      email: 'ईमेल', 
      password: 'पासवर्ड',
      submit: 'लॉगिन'
    }
  };
  
  return (
    <View>
      <Text>{text[language].title}</Text>
      <TextInput placeholder={text[language].email} />
      <TextInput placeholder={text[language].password} />
      <Button title={text[language].submit} />
    </View>
  );
};

// After
import { t } from '../../i18n';

const LoginScreen = () => {
  return (
    <View>
      <Text>{t('auth.login')}</Text>
      <TextInput placeholder={t('auth.email')} />
      <TextInput placeholder={t('auth.password')} />
      <Button title={t('auth.login')} />
    </View>
  );
};
```

### Example 2: Component with Props
```typescript
// You no longer need to pass language as prop
// Before
<MobileHome language={language} />

// After
<MobileHome /> // Language handled by i18n automatically
```

### Example 3: Conditional Text
```typescript
// Before
const statusText = status === 'success' 
  ? language === 'en' ? 'Success!' : 'सफलता!'
  : language === 'en' ? 'Error!' : 'त्रुटि!';

// After
import { t } from '../../i18n';

const statusText = status === 'success' 
  ? t('common.success')
  : t('common.error');
```

## 🔧 Migration Checklist

### Priority Components to Migrate:

1. **Authentication Screens** ✅
   - Login
   - Signup
   - Forgot Password

2. **Onboarding Screens** ✅
   - Awareness carousel
   - Basic info
   - Eating habits
   - Your oil

3. **Main Tabs** ⏳
   - [ ] MobileHome
   - [ ] MobileOilTracker
   - [ ] MobileProfile (Language selector added ✅)
   - [ ] MobilePartners
   - [ ] MobileGroups
   - [ ] MobileEducation
   - [ ] MobileCommunity
   - [ ] MobileRewards

4. **Feature Components** ⏳
   - [ ] Barcode Scanner
   - [ ] Recipe screens
   - [ ] Goal setting
   - [ ] Notifications

### Migration Steps for Each Component:

1. **Remove language prop** from component interface
2. **Import i18n**: `import { t } from '../../i18n';`
3. **Remove text const objects** (en/hi text objects)
4. **Replace text references**: `text.en.title` → `t('section.title')`
5. **Remove language destructuring** from props
6. **Test in both languages** using Language Selector

## 📱 Testing Language Switching

1. Run the app
2. Navigate to Profile → Settings tab
3. Click on Language selector
4. Choose Hindi (हिन्दी)
5. Navigate through the app to verify translations
6. Switch back to English to test switching

## 🌍 Adding More Languages (Future)

To add a new language (e.g., Marathi, Tamil):

1. **Create translation file**:
   ```typescript
   // src/i18n/locales/mr.ts (Marathi)
   export default {
     common: {
       welcome: 'स्वागत',
       loading: 'लोड होत आहे...',
       // ... copy structure from en.ts
     },
     // ... all other sections
   };
   ```

2. **Register in i18n config**:
   ```typescript
   // src/i18n/index.ts
   import mr from './locales/mr';
   
   const i18n = new I18n({ en, hi, mr });
   
   export const getAvailableLanguages = () => [
     { code: 'en', name: 'English', nativeName: 'English' },
     { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
     { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
   ];
   ```

3. **Language automatically appears** in Language Selector

## 🎯 Best Practices

1. **Always use translation keys**: Never hardcode text in components
2. **Consistent key naming**: Use dot notation (section.subsection.key)
3. **Add new keys to all language files**: Maintain parity across translations
4. **Use fallback**: Missing keys will fallback to English automatically
5. **Test both languages**: Always verify text displays correctly in all languages
6. **Keep translations updated**: When adding new features, add translations immediately

## 📚 Translation Key Reference

Quick reference for common keys:

### Common
- `common.welcome`, `common.loading`, `common.error`, `common.success`
- `common.save`, `common.cancel`, `common.confirm`, `common.delete`
- `common.language`, `common.selectLanguage`

### Navigation
- `navigation.home`, `navigation.oilTracker`, `navigation.profile`
- `navigation.groups`, `navigation.partners`, `navigation.education`

### Oil Tracker
- `oilTracker.title`, `oilTracker.todayConsumption`, `oilTracker.weeklyAverage`
- `oilTracker.addEntry`, `oilTracker.viewHistory`

### Profile
- `profile.editProfile`, `profile.myGoals`, `profile.settings`
- `profile.logout`, `profile.privacySettings`

### Onboarding
- `onboarding.awareness.screen1.title`
- `onboarding.basicInfo.name`, `onboarding.basicInfo.age`
- `onboarding.eatingHabits.vegetarian`

### Errors
- `errors.networkError`, `errors.serverError`, `errors.invalidInput`

## ✅ Current Status

**Foundation**: ✅ Complete
- i18n library installed
- Translation files created (English & Hindi)
- i18n configuration set up
- AuthContext integrated
- Language Selector component created
- Language persisted in AsyncStorage

**Integration**: ⏳ In Progress
- Profile screen updated with Language Selector
- Remaining components need migration from hardcoded text

**Next Steps**:
1. Migrate MobileHome component
2. Migrate MobileOilTracker component
3. Migrate remaining tab components
4. Migrate feature components
5. Test thoroughly in both languages
6. Consider adding more regional languages

Your app is now fully equipped for multilingual support! 🎉
