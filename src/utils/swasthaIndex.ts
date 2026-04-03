// Swastha Index Calculator for Edible Oils (0-100)
// Scoring model based on nutritional profile, processing, and safety

export interface SwasthaIndexResult {
  oil_name: string;
  swastha_index: number;
  rating_category: 'Excellent' | 'Good' | 'Moderate' | 'Risky' | 'Harmful';
  explanation: string;
  color: string;
}

interface OilProfile {
  mufa: number; // Monounsaturated fats %
  pufa: number; // Polyunsaturated fats %
  saturated: number; // Saturated fats %
  transfat: number; // Trans fats %
  smokePoint: number; // In Celsius
  isRefined: boolean;
  oxidationRisk: 'low' | 'medium' | 'high';
}

const oilProfiles: Record<string, OilProfile> = {
  'mustard oil': {
    mufa: 60,
    pufa: 21,
    saturated: 11,
    transfat: 0,
    smokePoint: 250,
    isRefined: false,
    oxidationRisk: 'low',
  },
  'mustard_oil': {
    mufa: 60,
    pufa: 21,
    saturated: 11,
    transfat: 0,
    smokePoint: 250,
    isRefined: false,
    oxidationRisk: 'low',
  },
  'olive oil': {
    mufa: 73,
    pufa: 11,
    saturated: 14,
    transfat: 0,
    smokePoint: 190,
    isRefined: false,
    oxidationRisk: 'low',
  },
  'olive_oil': {
    mufa: 73,
    pufa: 11,
    saturated: 14,
    transfat: 0,
    smokePoint: 190,
    isRefined: false,
    oxidationRisk: 'low',
  },
  'extra virgin olive oil': {
    mufa: 73,
    pufa: 11,
    saturated: 14,
    transfat: 0,
    smokePoint: 190,
    isRefined: false,
    oxidationRisk: 'low',
  },
  'sunflower oil': {
    mufa: 20,
    pufa: 66,
    saturated: 11,
    transfat: 0,
    smokePoint: 225,
    isRefined: true,
    oxidationRisk: 'medium',
  },
  'sunflower_oil': {
    mufa: 20,
    pufa: 66,
    saturated: 11,
    transfat: 0,
    smokePoint: 225,
    isRefined: true,
    oxidationRisk: 'medium',
  },
  'groundnut oil': {
    mufa: 46,
    pufa: 32,
    saturated: 17,
    transfat: 0,
    smokePoint: 225,
    isRefined: true,
    oxidationRisk: 'medium',
  },
  'groundnut_oil': {
    mufa: 46,
    pufa: 32,
    saturated: 17,
    transfat: 0,
    smokePoint: 225,
    isRefined: true,
    oxidationRisk: 'medium',
  },
  'peanut oil': {
    mufa: 46,
    pufa: 32,
    saturated: 17,
    transfat: 0,
    smokePoint: 225,
    isRefined: true,
    oxidationRisk: 'medium',
  },
  'sesame oil': {
    mufa: 40,
    pufa: 42,
    saturated: 14,
    transfat: 0,
    smokePoint: 210,
    isRefined: false,
    oxidationRisk: 'low',
  },
  'sesame_oil': {
    mufa: 40,
    pufa: 42,
    saturated: 14,
    transfat: 0,
    smokePoint: 210,
    isRefined: false,
    oxidationRisk: 'low',
  },
  'coconut oil': {
    mufa: 6,
    pufa: 2,
    saturated: 90,
    transfat: 0,
    smokePoint: 177,
    isRefined: false,
    oxidationRisk: 'low',
  },
  'coconut_oil': {
    mufa: 6,
    pufa: 2,
    saturated: 90,
    transfat: 0,
    smokePoint: 177,
    isRefined: false,
    oxidationRisk: 'low',
  },
  'ghee': {
    mufa: 25,
    pufa: 4,
    saturated: 65,
    transfat: 0,
    smokePoint: 250,
    isRefined: false,
    oxidationRisk: 'low',
  },
  'butter': {
    mufa: 21,
    pufa: 3,
    saturated: 68,
    transfat: 0,
    smokePoint: 175,
    isRefined: false,
    oxidationRisk: 'low',
  },
  'rice bran oil': {
    mufa: 39,
    pufa: 35,
    saturated: 20,
    transfat: 0,
    smokePoint: 230,
    isRefined: true,
    oxidationRisk: 'medium',
  },
  'vegetable oil': {
    mufa: 24,
    pufa: 58,
    saturated: 13,
    transfat: 0.5,
    smokePoint: 220,
    isRefined: true,
    oxidationRisk: 'medium',
  },
  'vegetable_oil': {
    mufa: 24,
    pufa: 58,
    saturated: 13,
    transfat: 0.5,
    smokePoint: 220,
    isRefined: true,
    oxidationRisk: 'medium',
  },
  'soybean oil': {
    mufa: 23,
    pufa: 58,
    saturated: 15,
    transfat: 0,
    smokePoint: 230,
    isRefined: true,
    oxidationRisk: 'medium',
  },
  'canola oil': {
    mufa: 63,
    pufa: 28,
    saturated: 7,
    transfat: 0,
    smokePoint: 240,
    isRefined: true,
    oxidationRisk: 'low',
  },
  'palm oil': {
    mufa: 40,
    pufa: 10,
    saturated: 49,
    transfat: 0,
    smokePoint: 230,
    isRefined: true,
    oxidationRisk: 'medium',
  },
  'palmolein oil': {
    mufa: 43,
    pufa: 11,
    saturated: 45,
    transfat: 0,
    smokePoint: 235,
    isRefined: true,
    oxidationRisk: 'medium',
  },
  'cottonseed oil': {
    mufa: 19,
    pufa: 52,
    saturated: 26,
    transfat: 0,
    smokePoint: 215,
    isRefined: true,
    oxidationRisk: 'high',
  },
  'corn oil': {
    mufa: 28,
    pufa: 55,
    saturated: 13,
    transfat: 0,
    smokePoint: 230,
    isRefined: true,
    oxidationRisk: 'medium',
  },
  'safflower oil': {
    mufa: 75,
    pufa: 13,
    saturated: 9,
    transfat: 0,
    smokePoint: 265,
    isRefined: true,
    oxidationRisk: 'low',
  },
  'avocado oil': {
    mufa: 70,
    pufa: 13,
    saturated: 12,
    transfat: 0,
    smokePoint: 270,
    isRefined: false,
    oxidationRisk: 'low',
  },
  'flaxseed oil': {
    mufa: 18,
    pufa: 68,
    saturated: 9,
    transfat: 0,
    smokePoint: 107,
    isRefined: false,
    oxidationRisk: 'high',
  },
  'reused oil': {
    mufa: 15,
    pufa: 30,
    saturated: 20,
    transfat: 8,
    smokePoint: 180,
    isRefined: true,
    oxidationRisk: 'high',
  },
  'vanaspati': {
    mufa: 20,
    pufa: 15,
    saturated: 45,
    transfat: 12,
    smokePoint: 200,
    isRefined: true,
    oxidationRisk: 'high',
  },
};

export function calculateSwasthaIndex(oilName: string): SwasthaIndexResult {
  const normalizedName = oilName.toLowerCase().trim();
  const profile = oilProfiles[normalizedName];

  if (!profile) {
    // Default moderate score for unknown oils
    return {
      oil_name: oilName,
      swastha_index: 60,
      rating_category: 'Moderate',
      explanation: 'Oil profile not found. Consult nutritionist for detailed analysis.',
      color: '#FFA500',
    };
  }

  let score = 0;

  // 1. MUFA & PUFA Profile (30%)
  const healthyFatScore = Math.min(100, ((profile.mufa + profile.pufa) / 90) * 100);
  score += healthyFatScore * 0.30;

  // 2. Saturated Fat Risk (20%)
  const saturatedScore = Math.max(0, 100 - (profile.saturated * 1.5));
  score += saturatedScore * 0.20;

  // 3. Trans-fat Content (15%)
  const transfatScore = Math.max(0, 100 - (profile.transfat * 10));
  score += transfatScore * 0.15;

  // 4. Smoke Point & Cooking Stability (15%)
  const smokePointScore = Math.min(100, (profile.smokePoint / 270) * 100);
  score += smokePointScore * 0.15;

  // 5. Industrial Processing Level (10%)
  const processingScore = profile.isRefined ? 60 : 90;
  score += processingScore * 0.10;

  // 6. Reuse Risk / Oxidation Tendency (10%)
  const oxidationScore = profile.oxidationRisk === 'low' ? 90 : profile.oxidationRisk === 'medium' ? 65 : 30;
  score += oxidationScore * 0.10;

  // Round to nearest integer
  const finalScore = Math.round(score);

  // Determine rating category
  let ratingCategory: 'Excellent' | 'Good' | 'Moderate' | 'Risky' | 'Harmful';
  let color: string;

  if (finalScore >= 90) {
    ratingCategory = 'Excellent';
    color = '#10B981';
  } else if (finalScore >= 75) {
    ratingCategory = 'Good';
    color = '#3B82F6';
  } else if (finalScore >= 60) {
    ratingCategory = 'Moderate';
    color = '#FFA500';
  } else if (finalScore >= 40) {
    ratingCategory = 'Risky';
    color = '#F59E0B';
  } else {
    ratingCategory = 'Harmful';
    color = '#EF4444';
  }

  // Generate explanation
  const explanation = generateExplanation(profile, finalScore, oilName);

  return {
    oil_name: oilName,
    swastha_index: finalScore,
    rating_category: ratingCategory,
    explanation,
    color,
  };
}

function generateExplanation(profile: OilProfile, score: number, oilName: string): string {
  const factors: string[] = [];

  // Positive factors
  if (profile.mufa >= 50) factors.push('high in healthy MUFA');
  if (profile.saturated <= 15) factors.push('low saturated fat');
  if (profile.transfat === 0) factors.push('no trans-fats');
  if (!profile.isRefined) factors.push('minimally processed');
  if (profile.smokePoint >= 230) factors.push('high smoke point');

  // Negative factors
  if (profile.saturated >= 50) factors.push('very high saturated fat');
  if (profile.transfat > 0) factors.push(`contains ${profile.transfat}% trans-fats`);
  if (profile.oxidationRisk === 'high') factors.push('prone to oxidation');
  if (profile.isRefined) factors.push('heavily refined');

  if (factors.length === 0) {
    return `${oilName} has a balanced fatty acid profile suitable for moderate use.`;
  }

  if (score >= 75) {
    return `${oilName} scores well due to: ${factors.slice(0, 2).join(', ')}.`;
  } else if (score >= 60) {
    return `${oilName} is acceptable with: ${factors[0]}, but monitor intake.`;
  } else {
    return `${oilName} has concerns: ${factors.slice(-2).join(', ')}. Use sparingly.`;
  }
}

// Helper function to get all oil names
export function getSupportedOils(): string[] {
  return Object.keys(oilProfiles).filter(name => !name.includes('_'));
}

// Helper function for color-coded display
export function getSwasthaColor(index: number): string {
  if (index >= 90) return '#10B981';
  if (index >= 75) return '#3B82F6';
  if (index >= 60) return '#FFA500';
  if (index >= 40) return '#F59E0B';
  return '#EF4444';
}
