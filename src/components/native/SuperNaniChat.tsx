import React, { useState, useRef, useCallback } from 'react';
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

interface SuperNaniChatProps {
  onClose: () => void;
}

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'nani';
}

const INITIAL_MESSAGE: Message = {
  id: 1,
  text: "Namaste! I'm Super Nani, your trusted companion for healthy cooking and oil management. I can help you with:\n\n• Oil usage tips & healthy cooking\n• Low-oil recipes\n• Nutrition advice\n• Eating habits guidance\n\nHow can I help you today?",
  sender: 'nani',
};

// Keywords for topic filtering
const oilFoodKeywords = [
  'oil', 'oils', 'cooking oil', 'vegetable oil', 'sunflower', 'mustard oil',
  'olive oil', 'coconut oil', 'ghee', 'butter', 'fat', 'fats', 'fatty',
  'food', 'foods', 'recipe', 'recipes', 'cook', 'cooking', 'dish', 'dishes',
  'meal', 'meals', 'breakfast', 'lunch', 'dinner', 'snack', 'snacks',
  'vegetable', 'vegetables', 'fruit', 'fruits', 'protein', 'nutrition',
  'healthy', 'health', 'diet', 'calorie', 'calories',
  'dal', 'curry', 'sabzi', 'roti', 'chapati', 'paratha', 'samosa', 'pakora',
  'biryani', 'pulao', 'khichdi', 'tadka', 'masala',
  'eating', 'eat', 'portion', 'reduce', 'less', 'low',
  'air fryer', 'bake', 'grill', 'steam', 'roast', 'boil', 'fry',
  'heart', 'diabetes', 'weight', 'cholesterol',
  'hello', 'hi', 'namaste', 'help', 'thanks', 'thank you', 'bye',
];

export function SuperNaniChat({ onClose }: SuperNaniChatProps) {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const isTopicAllowed = useCallback((message: string): boolean => {
    const lowerMessage = message.toLowerCase();
    return oilFoodKeywords.some(keyword => lowerMessage.includes(keyword));
  }, []);

  const callAPI = useCallback(async (userMessage: string): Promise<string> => {
    const systemPrompt = `You are Super Nani, a warm, caring AI grandmother who is an expert in healthy cooking and oil management. 
Keep responses concise (2-3 paragraphs max). Use bullet points for tips. Add emojis sparingly.
ONLY discuss: oil, cooking, food, recipes, nutrition, healthy eating.`;

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-001',
          messages: [
            { role: 'user', content: systemPrompt },
            { role: 'assistant', content: "Namaste beta! I'm Super Nani, ready to help with cooking and oil tips! 🙏" },
            { role: 'user', content: userMessage },
          ],
          max_tokens: 400,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || "Sorry beta, I couldn't understand. Please try again! 🙏";
    } catch (error) {
      console.error('API Error:', error);
      return "I'm having trouble right now, beta. Please try again in a moment. 🙏";
    }
  }, []);

  const handleSend = useCallback(async () => {
    const text = inputMessage.trim();
    if (!text || isLoading) return;

    // Add user message
    const userMsg: Message = { id: Date.now(), text, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    // Scroll to bottom
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    let responseText: string;

    if (!isTopicAllowed(text)) {
      responseText = "🙏 Namaste! I'm Super Nani - your companion for oil and food guidance only.\n\nI can help with:\n• Healthy cooking tips\n• Low-oil recipes\n• Nutrition advice\n\nPlease ask about cooking, food, or oil!";
    } else {
      responseText = await callAPI(text);
    }

    // Add AI response
    const naniMsg: Message = { id: Date.now() + 1, text: responseText, sender: 'nani' };
    setMessages(prev => [...prev, naniMsg]);
    setIsLoading(false);

    // Scroll to bottom again
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  }, [inputMessage, isLoading, isTopicAllowed, callAPI]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#040707" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Super Nani</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Chat Area */}
      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageBubble,
                msg.sender === 'user' ? styles.userBubble : styles.naniBubble,
              ]}
            >
              {msg.sender === 'nani' && (
                <LinearGradient
                  colors={['#1b4a5a', '#0f3a47']}
                  style={styles.avatar}
                >
                  <Ionicons name="restaurant" size={14} color="#fff" />
                </LinearGradient>
              )}
              <View style={[
                styles.messageBox,
                msg.sender === 'user' ? styles.userBox : styles.naniBox,
              ]}>
                <Text style={[
                  styles.messageText,
                  msg.sender === 'user' ? styles.userText : styles.naniText,
                ]}>
                  {msg.text}
                </Text>
              </View>
            </View>
          ))}

          {isLoading && (
            <View style={[styles.messageBubble, styles.naniBubble]}>
              <LinearGradient colors={['#1b4a5a', '#0f3a47']} style={styles.avatar}>
                <Ionicons name="restaurant" size={14} color="#fff" />
              </LinearGradient>
              <View style={[styles.messageBox, styles.naniBox, styles.loadingBox]}>
                <ActivityIndicator size="small" color="#1b4a5a" />
                <Text style={styles.loadingText}>Thinking...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
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
            onPress={handleSend}
            disabled={!inputMessage.trim() || isLoading}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E7F2F1',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#040707',
  },
  placeholder: {
    width: 32,
  },
  chatArea: {
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
    marginBottom: 12,
    maxWidth: '85%',
  },
  userBubble: {
    alignSelf: 'flex-end',
  },
  naniBubble: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  messageBox: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: '100%',
  },
  userBox: {
    backgroundColor: '#1b4a5a',
    borderBottomRightRadius: 4,
  },
  naniBox: {
    backgroundColor: '#f5f5f5',
    borderBottomLeftRadius: 4,
    flex: 1,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  naniText: {
    color: '#333',
  },
  loadingText: {
    marginLeft: 8,
    color: '#666',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E7F2F1',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#040707',
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1b4a5a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default SuperNaniChat;
