import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// OpenRouter API Configuration
const OPENROUTER_API_KEY = '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';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface SuperNaniProps {
  isOpen: boolean;
  onClose: () => void;
  language?: string;
}

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'nani';
  timestamp: Date;
}

const quickActions = [
  { id: 'recipes', label: 'Recipes', icon: 'restaurant' as const, colors: ['#fcaf56', '#f59e0b'] },
  { id: 'report', label: 'My Report', icon: 'bar-chart' as const, colors: ['#1b4a5a', '#0f3a47'] },
];

const suggestedPrompts = [
  "How can I reduce oil in dal tadka?",
  "Best oil for heart health?",
  "Air fryer recipe suggestions",
  "My weekly oil consumption analysis",
];

export function SuperNani({ isOpen, onClose, language = 'en' }: SuperNaniProps) {
  const [currentScreen, setCurrentScreen] = useState<'onboarding' | 'home' | 'chat'>('chat');
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      text: "Namaste! I'm Super Nani, your trusted companion for healthy cooking and oil management. I can help you with:\n\n• Oil usage tips & healthy cooking\n• Low-oil recipes\n• Nutrition advice\n• Eating habits guidance\n\nHow can I help you today?", 
      sender: 'nani', 
      timestamp: new Date() 
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(true); // Skip onboarding for now
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string; content: string}>>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  // Keywords for topic filtering
  const oilFoodKeywords = [
    // Oil related
    'oil', 'oils', 'तेल', 'तेला', 'तेलात', 'ତେଲ', 'cooking oil', 'vegetable oil', 'sunflower', 'mustard oil',
    'olive oil', 'coconut oil', 'ghee', 'butter', 'fat', 'fats', 'fatty', 'saturated', 'trans fat',
    'cholesterol', 'frying', 'deep fry', 'shallow fry', 'sauté', 'sautee',
    // Food related  
    'food', 'foods', 'खाना', 'भोजन', 'ଖାଦ୍ୟ', 'recipe', 'recipes', 'cook', 'cooking', 'dish', 'dishes',
    'meal', 'meals', 'breakfast', 'lunch', 'dinner', 'snack', 'snacks',
    'vegetable', 'vegetables', 'fruit', 'fruits', 'protein', 'carbs', 'nutrition', 'nutritious',
    'healthy', 'health', 'diet', 'dietary', 'calorie', 'calories',
    // Indian food
    'dal', 'daal', 'curry', 'sabzi', 'roti', 'chapati', 'paratha', 'samosa', 'pakora', 'pakoda',
    'biryani', 'pulao', 'khichdi', 'tadka', 'tempering', 'masala',
    // Eating habits
    'eating', 'eat', 'eating habits', 'portion', 'portions', 'consumption', 'consume',
    'intake', 'daily', 'weekly', 'reduce', 'reduction', 'less', 'low', 'lower',
    // Cooking methods
    'air fryer', 'bake', 'baking', 'grill', 'grilling', 'steam', 'steaming', 'roast', 'roasting',
    'boil', 'boiling', 'stir fry',
    // Health
    'heart', 'cardiac', 'diabetes', 'weight', 'obesity', 'cholesterol', 'blood pressure',
    // Greetings and general queries about the bot
    'hello', 'hi', 'namaste', 'help', 'what can you do', 'who are you', 'your name',
    'thanks', 'thank you', 'bye', 'goodbye',
  ];

  const isTopicAllowed = (message: string): boolean => {
    const lowerMessage = message.toLowerCase();
    return oilFoodKeywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()));
  };

  const getAIResponse = async (userMessage: string): Promise<string> => {
    console.log('[SuperNani] getAIResponse called with:', userMessage);
    
    // Check if topic is allowed
    if (!isTopicAllowed(userMessage)) {
      console.log('[SuperNani] Topic not allowed');
      return "🙏 Namaste! I appreciate your question, but I'm Super Nani - your dedicated companion for oil and food-related guidance only.\n\nI can help you with:\n• Healthy cooking tips & oil usage\n• Low-oil recipes\n• Nutrition advice\n• Eating habits improvement\n• Oil consumption tracking\n\nPlease ask me something about cooking, food, oil, or healthy eating habits!";
    }

    console.log('[SuperNani] Topic is allowed, proceeding with API call');

    try {
      const systemPrompt = `You are Super Nani, a warm, caring, and knowledgeable AI grandmother figure who is an expert in:
- Healthy cooking and oil management
- Indian cooking traditions and recipes
- Nutrition and healthy eating habits
- Oil consumption guidance and reduction tips
- Heart-healthy cooking practices

Your personality:
- Speak warmly like a loving grandmother (Nani)
- Use simple, easy-to-understand language
- Occasionally use Hindi/Indian terms with explanations
- Give practical, actionable advice
- Be encouraging and supportive
- Keep responses concise but helpful (2-3 short paragraphs max)
- Use bullet points for tips and lists
- Add relevant emojis sparingly for warmth

IMPORTANT: You ONLY discuss topics related to:
- Oil, fats, and cooking oils
- Food, recipes, and cooking methods
- Nutrition and healthy eating
- Eating habits and dietary guidance

If asked about unrelated topics, politely redirect to your expertise areas.`;

      const newHistory = [
        ...conversationHistory,
        { role: 'user', content: userMessage }
      ];

      // Gemini models via OpenRouter need the system prompt as a user message or the first message
      const messagesForAPI = [
        { role: 'user', content: systemPrompt + "\n\nPlease acknowledge and respond in character." },
        { role: 'assistant', content: "Namaste, beta! I'm Super Nani, ready to help you with healthy cooking and oil management. Ask me anything about cooking, recipes, or nutrition! 🙏" },
        ...newHistory.slice(-10).map((msg: {role: string; content: string}) => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
      ];

      console.log('[SuperNani] Sending request to OpenRouter...');
      
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://swasthtel.app',
          'X-Title': 'SwasthTel Super Nani',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-001',
          messages: messagesForAPI,
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      console.log('[SuperNani] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[SuperNani] API error response:', errorText);
        throw new Error(`API error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('[SuperNani] Response data:', JSON.stringify(data, null, 2));
      
      const aiResponse = data.choices?.[0]?.message?.content;

      if (!aiResponse) {
        throw new Error('No response from AI');
      }

      // Update conversation history
      setConversationHistory([
        ...newHistory,
        { role: 'assistant', content: aiResponse }
      ]);

      return aiResponse;
    } catch (error: any) {
      console.error('[SuperNani] AI error:', error);
      return "I'm having a little trouble right now, beta. Please try again in a moment. 🙏";
    }
  };

  useEffect(() => {
    if (isOpen && !hasSeenOnboarding) {
      setCurrentScreen('onboarding');
    } else if (isOpen && hasSeenOnboarding) {
      setCurrentScreen('home');
    }
  }, [isOpen, hasSeenOnboarding]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSendMessage = async () => {
    console.log('[SuperNani] handleSendMessage called');
    console.log('[SuperNani] inputMessage:', inputMessage);
    console.log('[SuperNani] isLoading:', isLoading);
    
    if (!inputMessage.trim() || isLoading) {
      console.log('[SuperNani] Exiting early - empty input or loading');
      return;
    }

    const userMessageId = Date.now();
    const userMessage: Message = {
      id: userMessageId,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    console.log('[SuperNani] Adding user message:', userMessage.text);
    setMessages(prev => [...prev, userMessage]);
    const userInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);
    console.log('[SuperNani] Set isLoading to true');

    try {
      console.log('[SuperNani] Calling getAIResponse...');
      const aiResponse = await getAIResponse(userInput);
      console.log('[SuperNani] Got AI response:', aiResponse?.substring(0, 100));
      
      const naniResponse: Message = {
        id: Date.now() + 1,
        text: aiResponse,
        sender: 'nani',
        timestamp: new Date(),
      };
      console.log('[SuperNani] Adding nani response to messages');
      setMessages(prevMessages => {
        console.log('[SuperNani] Previous messages count:', prevMessages.length);
        const newMessages = [...prevMessages, naniResponse];
        console.log('[SuperNani] New messages count:', newMessages.length);
        return newMessages;
      });
      console.log('[SuperNani] setMessages called for nani response');
    } catch (error) {
      console.error('[SuperNani] handleSendMessage error:', error);
      const errorResponse: Message = {
        id: Date.now() + 1,
        text: "I'm having trouble responding right now. Please try again, beta. 🙏",
        sender: 'nani',
        timestamp: new Date(),
      };
      setMessages(prevMessages => [...prevMessages, errorResponse]);
    } finally {
      setIsLoading(false);
      console.log('[SuperNani] Set isLoading to false');
    }
  };

  // Remove the old getNaniResponse function as we're using AI now

  const handleOnboardingComplete = () => {
    setHasSeenOnboarding(true);
    setCurrentScreen('home');
  };

  const handleQuickAction = async (actionId: string) => {
    if (actionId === 'tips') {
      setCurrentScreen('chat');
      const tipMessage: Message = {
        id: messages.length + 1,
        text: "Show me oil reduction tips",
        sender: 'user',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, tipMessage]);
      setIsLoading(true);
      
      try {
        const aiResponse = await getAIResponse("Show me oil reduction tips");
        const naniResponse: Message = {
          id: messages.length + 2,
          text: aiResponse,
          sender: 'nani',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, naniResponse]);
      } catch (error) {
        const errorResponse: Message = {
          id: messages.length + 2,
          text: "I'm having trouble responding right now, beta. Please try again. 🙏",
          sender: 'nani',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorResponse]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setCurrentScreen('chat');
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInputMessage(prompt);
    setCurrentScreen('chat');
  };

  const renderOnboarding = () => (
    <LinearGradient
      colors={['#ffeedd', '#fcf5e8', '#ffffff']}
      style={styles.onboardingContainer}
    >
      <View style={styles.naniAvatarContainer}>
        <LinearGradient
          colors={['#1b4a5a', '#0f3a47']}
          style={styles.naniAvatar}
        >
          <Ionicons name="restaurant" size={48} color="#fff" />
        </LinearGradient>
      </View>
      
      <Text style={styles.onboardingTitle}>Meet Super Nani</Text>
      <Text style={styles.onboardingSubtitle}>Your AI cooking companion</Text>
      
      <View style={styles.featuresContainer}>
        <View style={styles.featureItem}>
          <Ionicons name="bulb" size={24} color="#fcaf56" />
          <Text style={styles.featureText}>Smart cooking tips</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="restaurant" size={24} color="#fcaf56" />
          <Text style={styles.featureText}>Healthy recipes</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="analytics" size={24} color="#fcaf56" />
          <Text style={styles.featureText}>Oil tracking</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="chatbubbles" size={24} color="#fcaf56" />
          <Text style={styles.featureText}>24/7 chat support</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        onPress={handleOnboardingComplete}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#1b4a5a', '#0f3a47']}
          style={styles.getStartedButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.getStartedButtonText}>Get Started</Text>
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );

  const renderHome = () => (
    <ScrollView 
      style={styles.homeScrollView}
      contentContainerStyle={styles.homeContainer}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={['#ffeedd', '#fcf5e8', '#ffffff']}
        style={styles.homeGradient}
      >
        <LinearGradient
          colors={['#1b4a5a', '#0f3a47']}
          style={styles.naniAvatarSmall}
        >
          <Ionicons name="restaurant" size={32} color="#fff" />
        </LinearGradient>
        
        <Text style={styles.homeTitle}>Hi! I'm Super Nani</Text>
        <Text style={styles.homeSubtitle}>How can I help you today?</Text>
      </LinearGradient>
      
      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            onPress={() => handleQuickAction(action.id)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={action.colors}
              style={styles.quickActionButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name={action.icon} size={24} color="#fff" />
              <Text style={styles.quickActionText}>{action.label}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Suggested Prompts */}
      <View style={styles.suggestedPromptsContainer}>
        <Text style={styles.suggestedPromptsTitle}>Suggested Questions</Text>
        {suggestedPrompts.map((prompt, index) => (
          <TouchableOpacity
            key={index}
            style={styles.suggestedPromptButton}
            onPress={() => handleSuggestedPrompt(prompt)}
          >
            <Text style={styles.suggestedPromptText}>{prompt}</Text>
            <Ionicons name="arrow-forward" size={16} color="#1b4a5a" />
          </TouchableOpacity>
        ))}
      </View>
      
      <TouchableOpacity
        onPress={() => setCurrentScreen('chat')}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#1b4a5a', '#0f3a47']}
          style={styles.startChatButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Ionicons name="chatbubbles" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.startChatButtonText}>Start Chat</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderChat = () => {
    console.log('[SuperNani] renderChat called, messages count:', messages.length);
    console.log('[SuperNani] Last message:', messages[messages.length - 1]?.text?.substring(0, 50));
    
    return (
    <KeyboardAvoidingView 
      style={styles.chatContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.sender === 'user' ? styles.userMessage : styles.naniMessage
            ]}
          >
            {message.sender === 'nani' && (
              <LinearGradient
                colors={['#1b4a5a', '#0f3a47']}
                style={styles.naniMessageIcon}
              >
                <Ionicons name="restaurant" size={16} color="#fff" />
              </LinearGradient>
            )}
            <View style={styles.messageContent}>
              <Text style={[
                styles.messageText,
                message.sender === 'user' ? styles.userMessageText : styles.naniMessageText
              ]}>
                {message.text}
              </Text>
            </View>
          </View>
        ))}
        {isLoading && (
          <View style={[styles.messageBubble, styles.naniMessage]}>
            <LinearGradient
              colors={['#1b4a5a', '#0f3a47']}
              style={styles.naniMessageIcon}
            >
              <Ionicons name="restaurant" size={16} color="#fff" />
            </LinearGradient>
            <View style={styles.messageContent}>
              <View style={styles.typingIndicator}>
                <ActivityIndicator size="small" color="#1b4a5a" />
                <Text style={styles.typingText}>Super Nani is thinking...</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
      
      {/* Input Bar */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={inputMessage}
            onChangeText={setInputMessage}
            placeholder="Ask Super Nani..."
            placeholderTextColor="#999"
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputMessage.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
  };

  // If not open, don't render (for backward compatibility)
  if (!isOpen) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onClose}
        >
          <Ionicons name="chevron-back" size={24} color="#040707" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Super Nani</Text>
        <View style={styles.closeButton}>
          {/* Placeholder for alignment */}
        </View>
      </View>
      
      {/* Content - Always show chat */}
      {renderChat()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E7F2F1',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#040707',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Onboarding styles
  onboardingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  naniAvatarContainer: {
    marginBottom: 32,
    ...Platform.select({
      ios: {
        shadowColor: '#1b4a5a',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  naniAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onboardingTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#040707',
    marginBottom: 8,
  },
  onboardingSubtitle: {
    fontSize: 16,
    color: '#5B5B5B',
    marginBottom: 40,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureText: {
    fontSize: 16,
    color: '#040707',
    marginLeft: 16,
  },
  getStartedButton: {
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#1b4a5a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  getStartedButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Home styles
  homeScrollView: {
    flex: 1,
  },
  homeContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  homeGradient: {
    paddingTop: 40,
    paddingBottom: 32,
    alignItems: 'center',
    marginHorizontal: -20,
    paddingHorizontal: 20,
    marginBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  naniAvatarSmall: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#1b4a5a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  homeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#040707',
    textAlign: 'center',
    marginBottom: 8,
  },
  homeSubtitle: {
    fontSize: 16,
    color: '#5B5B5B',
    textAlign: 'center',
    marginBottom: 32,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  quickActionButton: {
    width: (320 - 60) / 2,
    aspectRatio: 1.5,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  quickActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  suggestedPromptsContainer: {
    marginBottom: 24,
  },
  suggestedPromptsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#040707',
    marginBottom: 12,
  },
  suggestedPromptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E7F2F1',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  suggestedPromptText: {
    fontSize: 14,
    color: '#040707',
    flex: 1,
  },
  startChatButton: {
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#1b4a5a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  startChatButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Chat styles
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  naniMessage: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
  },
  naniMessageIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  messageContent: {
    flex: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userMessageText: {
    backgroundColor: '#1b4a5a',
    color: '#fff',
    padding: 12,
    borderRadius: 16,
    borderTopRightRadius: 4,
  },
  naniMessageText: {
    backgroundColor: '#fff',
    color: '#040707',
    padding: 12,
    borderRadius: 16,
    borderTopLeftRadius: 4,
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E7F2F1',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fafbfa',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#040707',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1b4a5a',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  typingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});
