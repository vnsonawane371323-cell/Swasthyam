// Help & Support Content - Multilingual Strings
// Location: src/i18n/locales/help.ts
// Usage: import { helpContent } from './help'; then use t('help.xyz')

export const helpContentEn = {
  'help.title': 'Help & Support',
  'help.searchPlaceholder': 'Search help topics...',
  'help.backToCategories': '← Back to Categories',
  'help.topics': '{count} topics',

  // Getting Started
  'help.gettingStarted.title': 'Getting Started',
  'help.gettingStarted.what.title': 'What is SwasthTel?',
  'help.gettingStarted.what.subtitle': 'Learn about the app',
  'help.gettingStarted.what.content': 'SwasthTel is a personalized health tracking application designed to monitor and optimize cooking oil consumption. Track daily oil, monitor health through medical reports, and get culturally relevant cooking suggestions.',
  'help.gettingStarted.setup.title': 'Initial Setup',
  'help.gettingStarted.setup.subtitle': '5 steps to get started',
  'help.gettingStarted.setup.content': '1. Download & Install\n2. Create Account\n3. Complete 3-step onboarding\n4. Grant Permissions\n5. Start Tracking oil',

  // Oil Tracking System
  'help.oilTracking.title': 'Oil Tracking System',
  'help.oilTracking.how.title': 'How Oil Tracking Works',
  'help.oilTracking.how.subtitle': 'Understanding the system',
  'help.oilTracking.how.content': '1. Enter oil consumption\n2. Oil properties retrieved\n3. Health analyzed\n4. Calculations determine calories\n5. Feedback provided',
  'help.oilTracking.methods.title': 'Logging Methods',
  'help.oilTracking.methods.subtitle': '4 ways to log',
  'help.oilTracking.methods.content': '• Manual: Weight (g) or Volume (ml)\n• Barcode: Scan oil bottle\n• Dish: Log by meal\n• IoT: Smart scale',

  // Cooking Methods
  'help.cooking.title': 'Cooking Methods',
  'help.cooking.deepFry.title': 'Deep Fry',
  'help.cooking.deepFry.subtitle': 'Factor: 1.25 - Most oil absorbed',
  'help.cooking.deepFry.content': 'Food fully immersed in oil at 160-190°C. Examples: Samosa, Pakora. Oil absorption +25% more.',
  'help.cooking.shallowFry.title': 'Shallow Fry',
  'help.cooking.shallowFry.subtitle': 'Factor: 1.15 - Moderate absorption',
  'help.cooking.shallowFry.content': 'Food partially immersed, 150-170°C oil. Examples: Paneer tikka, Vegetables. Oil absorption +15%.',
  'help.cooking.saute.title': 'Saute',
  'help.cooking.saute.subtitle': 'Factor: 1.05 - Minimal absorption',
  'help.cooking.saute.content': 'Quick cooking, small oil amount, 110-140°C, frequent stirring. Oil absorption +5% only. HEALTHIEST.',
  'help.cooking.boil.title': 'Boil',
  'help.cooking.boil.subtitle': 'Factor: 1.0 - No extra absorption',
  'help.cooking.boil.content': 'Cooking in boiling water, 100°C. Oil used for flavor only. Most heart-healthy option.',

  // Oil Types
  'help.oils.title': 'Oil Types & Properties',
  'help.oils.mustard.title': 'Mustard Oil - RECOMMENDED',
  'help.oils.mustard.subtitle': 'Health Score: 7/10',
  'help.oils.mustard.content': 'Density: 0.91 g/ml. 60% monounsaturated fat. Best for daily cooking. Anti-inflammatory.',
  'help.oils.sunflower.title': 'Sunflower Oil',
  'help.oils.sunflower.subtitle': 'Health Score: 6/10',
  'help.oils.sunflower.content': 'Density: 0.92 g/ml. 68% PUFA. Good for general cooking. Maximum 2-3 reuses safe.',
  'help.oils.olive.title': 'Olive Oil - PREMIUM',
  'help.oils.olive.subtitle': 'Health Score: 8/10',
  'help.oils.olive.content': 'Density: 0.91 g/ml. 71% monounsaturated fat. Highest quality. Use fresh, avoid high-heat.',
  'help.oils.coconut.title': 'Coconut Oil',
  'help.oils.coconut.subtitle': 'Health Score: 5/10',
  'help.oils.coconut.content': 'Density: 0.92 g/ml. 92% saturated fat. Use sparingly. 15-20ml/week max. 1-2 times/week only.',
  'help.oils.ghee.title': 'Ghee',
  'help.oils.ghee.subtitle': 'Health Score: 4/10',
  'help.oils.ghee.content': 'Density: 0.96 g/ml. 62% saturated fat. Special occasions only. 5-10ml/week max.',

  // Calculations
  'help.calculations.title': 'Calculations & Formulas',
  'help.calculations.rawCalories.title': 'Raw Oil Calories',
  'help.calculations.rawCalories.subtitle': 'Basic = Weight × 9',
  'help.calculations.rawCalories.content': 'Formula: Raw Calories = Weight (g) × 9\nExample: 20g oil = 180 kcal\nAll oils: 9 kcal/gram standard',
  'help.calculations.dailyBudget.title': 'Daily Oil Budget',
  'help.calculations.dailyBudget.subtitle': 'TDEE × 0.07 (ICMR)',
  'help.calculations.dailyBudget.content': 'Formula: Oil Budget = TDEE × 0.07\nExample: 2600 × 0.07 = 182 kcal/day ≈ 20g ≈ 22ml',
  'help.calculations.tdee.title': 'TDEE Calculation',
  'help.calculations.tdee.subtitle': 'Your daily calorie needs',
  'help.calculations.tdee.content': 'TDEE = BMR × Activity Factor\nBMR: Mifflin-St Jeor equation from age, height, weight, gender\nActivity: 1.2 (sedentary) to 1.9 (extra active)',

  // IoT Tracker
  'help.iot.title': 'IoT Tracker & Connection',
  'help.iot.what.title': 'What is IoT Tracking?',
  'help.iot.what.subtitle': 'Smart device integration',
  'help.iot.what.content': 'Uses WiFi-enabled smart scales to measure oil directly. Eliminates manual errors. Accurate to 0.1g.',
  'help.iot.setup.title': 'Connection Setup',
  'help.iot.setup.subtitle': 'Step-by-step',
  'help.iot.setup.content': '1. Prepare scale + WiFi\n2. Connect scale to WiFi\n3. App → Settings → IoT Devices\n4. Add Device → Enter IP\n5. Calibrate with 1kg weight',
  'help.iot.usage.title': 'Using IoT Tracker',
  'help.iot.usage.subtitle': 'Logging oil',
  'help.iot.usage.content': '1. Place oil container on scale\n2. Note reading\n3. Select cooking method\n4. Enter reuse count (0-3)\n5. Tap "Log"\n6. Review feedback',

  // Medical Reports
  'help.medical.title': 'Medical Report Analyzer',
  'help.medical.what.title': 'What It Does',
  'help.medical.what.subtitle': 'AI-powered analysis',
  'help.medical.what.content': 'Upload medical reports. Gemini AI extracts health metrics. Analyzes 10+ conditions. Provides personalized recommendations.',
  'help.medical.upload.title': 'How to Upload',
  'help.medical.upload.subtitle': '4 simple steps',
  'help.medical.upload.content': '1. Prepare report (photo/PDF)\n2. Profile → Medical Reports\n3. Upload New Report\n4. Analyze & Wait 30-60s\n5. Review results',
  'help.medical.understand.title': 'Understanding Results',
  'help.medical.understand.subtitle': 'Reading your scores',
  'help.medical.understand.content': 'Health Score: 90-100 (Excellent), 70-89 (Good), 50-69 (Fair), <50 (Serious)\nOil Recommendation: Based on conditions\nRisk Flags: Red/Yellow/Blue alerts',

  // FAQ
  'help.faq.title': 'Frequently Asked Questions',
  'help.faq.general.title': 'General Questions',
  'help.faq.general.subtitle': 'App & Account',
  'help.faq.general.content': 'Is it free? Yes, basic is free with ads.\nUpdate profile? After checkup or 6 months.\nPrivacy? Yes, encrypted & local storage.',
  'help.faq.oil.title': 'Oil Questions',
  'help.faq.oil.subtitle': 'Consumption & Types',
  'help.faq.oil.content': 'Exceed daily goal? Occasional okay. 7-day average matters.\nStop oil? No! Need 15-30ml daily.\nReuse oil? Max 2-3 times. 5% loss/reuse.',
  'help.faq.cooking.title': 'Cooking Methods',
  'help.faq.cooking.subtitle': 'Methods & Techniques',
  'help.faq.cooking.content': 'Healthiest? Boil (1.0) or Saute (1.05).\nDeep vs Shallow? Deep = full immersion, more oil.\nFactors? More contact = more absorption.',
};

export const helpContentHi = {
  'help.title': 'सहायता और समर्थन',
  'help.searchPlaceholder': 'सहायता विषय खोजें...',
  'help.backToCategories': '← श्रेणियों पर वापस जाएं',
  'help.topics': '{count} विषय',

  // Getting Started
  'help.gettingStarted.title': 'शुरुआत करें',
  'help.gettingStarted.what.title': 'SwasthTel क्या है?',
  'help.gettingStarted.what.subtitle': 'ऐप के बारे में जानें',
  'help.gettingStarted.what.content': 'SwasthTel एक व्यक्तिगत स्वास्थ्य ट्रैकिंग अनुप्रयोग है जो खाना पकाने के तेल के सेवन को मॉनिटर और अनुकूल करने के लिए डिज़ाइन किया गया है।',
  'help.gettingStarted.setup.title': 'प्रारंभिक सेटअप',
  'help.gettingStarted.setup.subtitle': '5 सरल चरण',
  'help.gettingStarted.setup.content': '1. डाउनलोड करें और इंस्टॉल करें\n2. खाता बनाएं\n3. 3-चरणीय ऑनबोर्डिंग पूरी करें\n4. अनुमतियां दें\n5. तेल ट्रैकिंग शुरू करें',

  // Oil Tracking System
  'help.oilTracking.title': 'तेल ट्रैकिंग सिस्टम',
  'help.oilTracking.how.title': 'तेल ट्रैकिंग कैसे काम करती है',
  'help.oilTracking.how.subtitle': 'सिस्टम को समझें',
  'help.oilTracking.how.content': '1. तेल की खपत दर्ज करें\n2. तेल के गुण प्राप्त करें\n3. स्वास्थ्य विश्लेषण करें\n4. कैलोरी की गणना करें\n5. प्रतिक्रिया प्रदान करें',
  'help.oilTracking.methods.title': 'लॉगिंग विधियां',
  'help.oilTracking.methods.subtitle': '4 तरीके',
  'help.oilTracking.methods.content': '• मैनुअल: वजन (g) या वॉल्यूम (ml)\n• बारकोड: तेल की बोतल स्कैन करें\n• डिश: भोजन के नाम से लॉग करें\n• IoT: स्मार्ट स्केल',

  // Cooking Methods
  'help.cooking.title': 'खाना पकाने की विधियां',
  'help.cooking.deepFry.title': 'गहरी तलाई',
  'help.cooking.deepFry.subtitle': 'कारक: 1.25 - सबसे ज्यादा तेल सोख लिया जाता है',
  'help.cooking.deepFry.content': 'खाने को 160-190°C पर पूरी तरह तेल में डुबोया जाता है। उदाहरण: समोसा, पकौड़े। तेल में 25% ज्यादा वृद्धि।',
  'help.cooking.shallowFry.title': 'उथली तलाई',
  'help.cooking.shallowFry.subtitle': 'कारक: 1.15 - मध्यम सोखना',
  'help.cooking.shallowFry.content': 'खाना आधा डूबा, 150-170°C तेल। उदाहरण: पनीर टिक्का, सब्जियां। तेल में 15% वृद्धि।',
  'help.cooking.saute.title': 'तेल डालकर पकाना',
  'help.cooking.saute.subtitle': 'कारक: 1.05 - न्यूनतम सोखना',
  'help.cooking.saute.content': 'तेजी से खाना बनाना, कम तेल, 110-140°C, लगातार हिलाना। तेल में केवल 5% वृद्धि। सबसे स्वस्थ विकल्प।',
  'help.cooking.boil.title': 'उबालना',
  'help.cooking.boil.subtitle': 'कारक: 1.0 - कोई अतिरिक्त नहीं',
  'help.cooking.boil.content': 'उबलते पानी में खाना पकाना, 100°C। तेल केवल स्वाद के लिए। सबसे दिल के अनुकूल विकल्प।',

  // Oil Types
  'help.oils.title': 'तेल के प्रकार और गुण',
  'help.oils.mustard.title': 'सरसों का तेल - अनुशंसित',
  'help.oils.mustard.subtitle': 'स्वास्थ्य स्कोर: 7/10',
  'help.oils.mustard.content': 'घनत्व: 0.91 g/ml। 60% एकलअसंतृप्त वसा। दैनिक खाना पकाने के लिए सर्वश्रेष्ठ। विरोधी भड़काऊ।',
  'help.oils.sunflower.title': 'सूरजमुखी का तेल',
  'help.oils.sunflower.subtitle': 'स्वास्थ्य स्कोर: 6/10',
  'help.oils.sunflower.content': 'घनत्व: 0.92 g/ml। 68% PUFA। सामान्य खाना पकाने के लिए अच्छा। अधिकतम 2-3 बार पुनः उपयोग सुरक्षित।',
  'help.oils.olive.title': 'जैतून का तेल - प्रीमियम',
  'help.oils.olive.subtitle': 'स्वास्थ्य स्कोर: 8/10',
  'help.oils.olive.content': 'घनत्व: 0.91 g/ml। 71% एकलअसंतृप्त वसा। सर्वोच्च गुणवत्ता। ताज़ा उपयोग करें, उच्च तापमान से बचें।',
  'help.oils.coconut.title': 'नारियल का तेल',
  'help.oils.coconut.subtitle': 'स्वास्थ्य स्कोर: 5/10',
  'help.oils.coconut.content': 'घनत्व: 0.92 g/ml। 92% संतृप्त वसा। बहुत कम उपयोग करें। प्रति सप्ताह अधिकतम 15-20ml। हफ्ते में केवल 1-2 बार।',
  'help.oils.ghee.title': 'घी',
  'help.oils.ghee.subtitle': 'स्वास्थ्य स्कोर: 4/10',
  'help.oils.ghee.content': 'घनत्व: 0.96 g/ml। 62% संतृप्त वसा। विशेष अवसरों के लिए ही। प्रति सप्ताह अधिकतम 5-10ml।',

  // Calculations
  'help.calculations.title': 'गणनाएं और सूत्र',
  'help.calculations.rawCalories.title': 'कच्चा तेल कैलोरी',
  'help.calculations.rawCalories.subtitle': 'मूल = वजन × 9',
  'help.calculations.rawCalories.content': 'सूत्र: कच्चा कैलोरी = वजन (g) × 9\nउदाहरण: 20g तेल = 180 kcal\nसभी तेल: मानक 9 kcal/gram',
  'help.calculations.dailyBudget.title': 'दैनिक तेल बजट',
  'help.calculations.dailyBudget.subtitle': 'TDEE × 0.07 (ICMR)',
  'help.calculations.dailyBudget.content': 'सूत्र: तेल बजट = TDEE × 0.07\nउदाहरण: 2600 × 0.07 = 182 kcal/दिन ≈ 20g ≈ 22ml',
  'help.calculations.tdee.title': 'TDEE गणना',
  'help.calculations.tdee.subtitle': 'आपकी दैनिक कैलोरी की जरूरत',
  'help.calculations.tdee.content': 'TDEE = BMR × गतिविधि कारक\nBMR: उम्र, ऊंचाई, वजन, लिंग से\nगतिविधि: 1.2 (गतिविहीन) से 1.9 (अत्यधिक सक्रिय)',

  // IoT Tracker
  'help.iot.title': 'IoT ट्रैकर और कनेक्शन',
  'help.iot.what.title': 'IoT ट्रैकिंग क्या है?',
  'help.iot.what.subtitle': 'स्मार्ट डिवाइस एकीकरण',
  'help.iot.what.content': 'WiFi-सक्षम स्मार्ट स्केल का उपयोग करके तेल को सीधे माप सकते हैं। मैनुअल त्रुटियों को समाप्त करता है। 0.1g तक सटीक।',
  'help.iot.setup.title': 'कनेक्शन सेटअप',
  'help.iot.setup.subtitle': 'चरण दर चरण',
  'help.iot.setup.content': '1. स्केल + WiFi तैयार करें\n2. WiFi से स्केल कनेक्ट करें\n3. ऐप → सेटिंग्स → IoT डिवाइस\n4. डिवाइस जोड़ें → IP दर्ज करें\n5. 1kg वजन से कैलिब्रेट करें',
  'help.iot.usage.title': 'IoT ट्रैकर का उपयोग',
  'help.iot.usage.subtitle': 'तेल लॉगिंग',
  'help.iot.usage.content': '1. स्केल पर तेल का कंटेनर रखें\n2. पढ़ना नोट करें\n3. खाना पकाने की विधि चुनें\n4. पुनः उपयोग संख्या दर्ज करें (0-3)\n5. "लॉग" टैप करें\n6. प्रतिक्रिया देखें',

  // Medical Reports
  'help.medical.title': 'चिकित्सा रिपोर्ट विश्लेषक',
  'help.medical.what.title': 'यह क्या करता है',
  'help.medical.what.subtitle': 'AI-संचालित विश्लेषण',
  'help.medical.what.content': 'चिकित्सा रिपोर्ट अपलोड करें। Gemini AI स्वास्थ्य मेट्रिक्स निकालता है। 10+ स्थितियों का विश्लेषण करता है। व्यक्तिगत सिफारिशें प्रदान करता है।',
  'help.medical.upload.title': 'कैसे अपलोड करें',
  'help.medical.upload.subtitle': '4 सरल चरण',
  'help.medical.upload.content': '1. रिपोर्ट तैयार करें (फोटो/PDF)\n2. प्रोफाइल → चिकित्सा रिपोर्ट\n3. नई रिपोर्ट अपलोड करें\n4. विश्लेषण करें और 30-60s प्रतीक्षा करें\n5. परिणाम देखें',
  'help.medical.understand.title': 'परिणामों को समझना',
  'help.medical.understand.subtitle': 'आपके स्कोर पढ़ना',
  'help.medical.understand.content': 'स्वास्थ्य स्कोर: 90-100 (उत्कृष्ट), 70-89 (अच्छा), 50-69 (निष्पक्ष), <50 (गंभीर)\nतेल सिफारिश: स्थितियों के आधार पर\nजोखिम झंडे: लाल/पीले/नीले सतर्कताएं',

  // FAQ
  'help.faq.title': 'अक्सर पूछे जाने वाले सवाल',
  'help.faq.general.title': 'सामान्य प्रश्न',
  'help.faq.general.subtitle': 'ऐप और खाता',
  'help.faq.general.content': 'क्या यह निःशुल्क है? हां, मूल विज्ञापन के साथ निःशुल्क है।\nप्रोफाइल अपडेट करें? चेकअप के बाद या 6 महीने।\nगोपनीयता? हां, एन्क्रिप्ट किया गया और स्थानीय।',
  'help.faq.oil.title': 'तेल प्रश्न',
  'help.faq.oil.subtitle': 'खपत और प्रकार',
  'help.faq.oil.content': 'दैनिक लक्ष्य पार करें? कभी-कभी ठीक है। 7-दिन का औसत मायने रखता है।\nतेल बंद करें? नहीं! दैनिक 15-30ml की जरूरत है।\nतेल पुनः उपयोग करें? अधिकतम 2-3 बार। 5% हानि/पुनः उपयोग।',
  'help.faq.cooking.title': 'खाना पकाने की विधियां',
  'help.faq.cooking.subtitle': 'विधियां और तकनीकें',
  'help.faq.cooking.content': 'सबसे स्वस्थ? उबालना (1.0) या तेल डालकर पकाना (1.05)।\nगहरी बनाम उथली? गहरी = पूरी तरह डुबोए हुए, अधिक तेल।\nकारक? अधिक संपर्क = अधिक सोखना।',
};

// Export combined help content
export const helpContent = {
  en: helpContentEn,
  hi: helpContentHi,
};
