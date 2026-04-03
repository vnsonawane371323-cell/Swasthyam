import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface AwarenessScreenProps {
  onStart: () => void;
  language: string;
}

const { width, height } = Dimensions.get('window');

export function AwarenessScreen({ onStart, language }: AwarenessScreenProps) {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [imageError, setImageError] = useState(false);
  
  console.log('AwarenessScreen mounted, currentScreen:', currentScreen);

  // Simplified approach - just use static images without complex highlights
  const handleNextScreen = () => {
    console.log('handleNextScreen called, current:', currentScreen);
    if (currentScreen < 4) {
      setCurrentScreen(currentScreen + 1);
      setImageError(false); // Reset error state for next image
    } else {
      console.log('Calling onStart');
      onStart();
    }
  };

  // Define images inline for better mobile compatibility
  const getImage = (index: number) => {
    switch(index) {
      case 0: return require('../../../../assets/onboarding/awareness1.jpg');
      case 1: return require('../../../../assets/onboarding/awareness2.jpg');
      case 2: return require('../../../../assets/onboarding/awareness3.jpg');
      case 3: return require('../../../../assets/onboarding/awareness4.jpg');
      case 4: return require('../../../../assets/onboarding/awareness5.jpg');
      default: return require('../../../../assets/onboarding/awareness1.jpg');
    }
  };

  const screens = [
    {
      imageIndex: 0,
      title: '',
      caption: "India once cooked with local natural oils, mustard, coconut, sesame, and groundnut, used for centuries in our traditional diets",
      captionHighlights: [
        { text: "mustard, coconut, sesame, and groundnut", color: '#8bc34a' }
      ],
      subCaption: "Till the 1970–80s, consumption stayed low at 5–7 kg per person",
      subCaptionHighlights: [
        { text: "5–7 kg per person", color: '#8bc34a' }
      ],
    },
    {
      imageIndex: 1,
      title: '',
      caption: "Refined oils and vanaspati entered Indian kitchens in the 1990s. Frying culture increased... so did dependence on packaged oils",
      captionHighlights: [
        { text: "Refined oils", color: '#ff7043' },
        { text: "vanaspati", color: '#ff7043' }
      ],
      subCaption: null,
      subCaptionHighlights: [],
    },
    {
      imageIndex: 2,
      title: "Today's Reality",
      caption: "India now consumes 19–20 kg per person – nearly 3× more than before",
      captionHighlights: [
        { text: "19–20 kg per person", color: '#f44336' },
        { text: "3× more", color: '#f44336' }
      ],
      subCaption: "This massive rise has led to heart disease, obesity, and diabetes becoming India's biggest health challenges",
      subCaptionHighlights: [
        { text: "heart disease, obesity, and diabetes", color: '#f44336' }
      ],
    },
    {
      imageIndex: 3,
      title: "The Solution",
      caption: "Switching back to natural oils can help reduce the risk of these diseases",
      captionHighlights: [
        { text: "Switching back to natural oils", color: '#4caf50' }
      ],
      subCaption: "Mustard, coconut, sesame, and groundnut are healthier alternatives to refined oils",
      subCaptionHighlights: [
        { text: "Mustard, coconut, sesame, and groundnut", color: '#4caf50' }
      ],
    },
    {
      imageIndex: 4,
      title: "Join the Movement",
      caption: "Join us in promoting the use of natural oils for a healthier India",
      captionHighlights: [
        { text: "Join us", color: '#2196f3' }
      ],
      subCaption: "Together, we can make a difference",
      subCaptionHighlights: [
        { text: "Together", color: '#2196f3' }
      ],
    },
  ];

  const currentSlide = screens[currentScreen];

  const renderHighlightedText = (text: string, highlights: any[], baseStyle: any) => {
    if (!highlights || highlights.length === 0) {
      return <Text style={baseStyle}>{text}</Text>;
    }

    const parts = [];
    let lastIndex = 0;

    highlights.forEach((highlight, idx) => {
      const startIndex = text.indexOf(highlight.text, lastIndex);
      if (startIndex !== -1) {
        // Add text before highlight
        if (startIndex > lastIndex) {
          parts.push(
            <Text key={`normal-${idx}`}>
              {text.substring(lastIndex, startIndex)}
            </Text>
          );
        }
        // Add highlighted text
        parts.push(
          <Text key={`highlight-${idx}`} style={{ color: highlight.color, fontWeight: '600' }}>
            {highlight.text}
          </Text>
        );
        lastIndex = startIndex + highlight.text.length;
      }
    });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(
        <Text key="remaining">
          {text.substring(lastIndex)}
        </Text>
      );
    }

    return <Text style={baseStyle}>{parts}</Text>;
  };

  if (!currentSlide) {
    console.error('No slide found for index:', currentScreen);
    return (
      <View style={styles.container}>
        <Text style={{ color: '#fff', fontSize: 20 }}>Error loading screen</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity 
      style={styles.container} 
      activeOpacity={1}
      onPress={handleNextScreen}
    >
      {/* Full Screen Image */}
      {imageError ? (
        <View style={[styles.backgroundImage, { backgroundColor: '#1b4a5a' }]}>
          <Text style={{ color: '#fff', textAlign: 'center', marginTop: height / 2 }}>
            Loading...
          </Text>
        </View>
      ) : (
        <Image
          source={getImage(currentSlide.imageIndex)}
          style={styles.backgroundImage}
          resizeMode="cover"
          onError={(error) => {
            console.error('Image load error:', error.nativeEvent?.error);
            setImageError(true);
          }}
          onLoad={() => {
            console.log('Image loaded successfully for screen:', currentScreen);
            setImageError(false);
          }}
        />
      )}

      {/* Gradient Overlay at Bottom */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.6)']}
        style={styles.gradientOverlay}
      >
        {/* Content Container */}
        <View style={styles.contentContainer}>
          {/* Title */}
          {currentSlide.title ? (
            <Text style={styles.title}>{currentSlide.title}</Text>
          ) : null}
          
          {/* Caption */}
          {renderHighlightedText(currentSlide.caption, currentSlide.captionHighlights, styles.caption)}
          
          {/* Sub Caption */}
          {currentSlide.subCaption ? (
            renderHighlightedText(currentSlide.subCaption, currentSlide.subCaptionHighlights, styles.subCaption)
          ) : null}
        </View>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          {/* Progress Indicators */}
          <View style={styles.progressContainer}>
            {screens.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  currentScreen === index && styles.progressDotActive,
                ]}
              />
            ))}
          </View>
        </View>
      </LinearGradient>

      {/* Skip Button */}
      {currentScreen < 4 && (
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => {
            console.log('Skip button pressed');
            onStart();
          }}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    width: width,
    height: height,
    position: 'absolute',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.5,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  contentContainer: {
    marginBottom: 30,
  },
  title: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  caption: {
    color: '#ffffff',
    fontSize: 18,
    lineHeight: 26,
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subCaption: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressDotActive: {
    width: 32,
    backgroundColor: '#ffffff',
  },
  skipButton: {
    position: 'absolute',
    top: 40,
    right: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  skipText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  highlightGreen: {
    color: '#8bc34a',
    fontWeight: '600',
  },
  highlightOrange: {
    color: '#ff7043',
    fontWeight: '600',
  },
  highlightRed: {
    color: '#f44336',
    fontWeight: '600',
  },
  highlightGreenDark: {
    color: '#4caf50',
    fontWeight: '600',
  },
  highlightBlue: {
    color: '#2196f3',
    fontWeight: '600',
  },
});
