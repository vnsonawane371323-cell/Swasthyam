import { Platform } from 'react-native';

// Conditionally import FileSystem only for native platforms
let FileSystem: any = null;
if (Platform.OS !== 'web') {
  FileSystem = require('expo-file-system/legacy');
}

// OpenRouter API Configuration
const OPENROUTER_API_KEY = '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';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Add console logging for debugging
console.log('[BarcodeService] Module loaded successfully');
console.log('[BarcodeService] Using OpenRouter AI for oil/product scanning');
console.log('[BarcodeService] Platform:', Platform.OS);

interface BarcodeResponse {
  success: boolean;
  data?: {
    barcode: string;
    product_name: string;
    brand: string;
    quantity: string;
    categories: string;
    ingredients_text: string;
    image_url: string;
    nutritional_info: {
      energy_kcal: number | null;
      fat: number | null;
      saturated_fat: number | null;
      trans_fat: number | null;
      cholesterol: number | null;
      carbohydrates: number | null;
      sugars: number | null;
      fiber: number | null;
      proteins: number | null;
      salt: number | null;
      sodium: number | null;
      unit: string;
      polyunsaturated_fat?: number | null;
    } | null;
    oil_content: string;
    additives: string[];
    nutriscore_grade: string | null;
    nova_group: number | null;
    labels: string;
    fatty_acids?: {
      sfa: string | null;
      tfa: string | null;
      pfa: string | null;
      is_food_product?: boolean;
    };
  };
  error?: string;
  message?: string;
  tips?: string[];
  suggestion?: string;
}

interface SearchResult {
  barcode: string;
  product_name: string;
  brand: string;
  image_url: string;
  nutriscore_grade: string | null;
}

interface SearchResponse {
  success: boolean;
  data?: {
    query: string;
    count: number;
    results: SearchResult[];
  };
  error?: string;
}

/**
 * Scan barcode and get product details from OpenRouter AI
 */
const analyzeProductWithAI = async (base64Image: string): Promise<any> => {
  const prompt = `You are a Product Information Expert with barcode scanning capabilities.

Analyze this product image carefully:
1. FIRST: Look for any barcode (EAN-13, UPC, QR code, etc.) and read the numbers
2. THEN: Identify the product from the image, packaging, and any visible text

Return ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:
{
  "barcode": "the barcode number if visible (13 digits for EAN-13, 12 for UPC) or null if not readable",
  "product_name": "full product name",
  "brand": "brand/manufacturer name",
  "quantity": "e.g., 1L, 500ml, 1kg",
  "product_type": "e.g., Sunflower Oil, Mustard Oil, Refined Oil, Cooking Oil",
  "categories": "e.g., Edible Oil, Cooking Oil, Food Product",
  "ingredients": "list of ingredients if visible or known",
  "nutritional_info": {
    "energy_kcal": number or null,
    "fat": number or null,
    "saturated_fat": number or null,
    "trans_fat": number or null,
    "polyunsaturated_fat": number or null,
    "carbohydrates": number or null,
    "proteins": number or null,
    "sodium": number or null
  },
  "sfa": "saturated fat value with unit (e.g., '12g') or null",
  "tfa": "trans fat value with unit (e.g., '0g') or null", 
  "pfa": "polyunsaturated fat value with unit (e.g., '25g') or null",
  "health_tips": ["tip1", "tip2", "tip3"],
  "is_food_product": true
}

RULES:
- Try to read the barcode numbers from the image
- Extract nutritional values per 100g/100ml from the label if visible
- If you recognize the product from the image, provide accurate info
- For Indian products, include common brand knowledge
- If unsure about values, make reasonable estimates based on product type
- Return ONLY the JSON object, no extra text`;

  try {
    console.log('[BarcodeService] -------- OPENROUTER API CALL --------');
    console.log('[BarcodeService] Image data size:', base64Image.length, 'chars');
    
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://swasthtel.app',
        'X-Title': 'SwasthTel Oil Scanner',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 1024,
        temperature: 0.3,
      }),
    });

    console.log('[BarcodeService] OpenRouter response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('[BarcodeService] OpenRouter API error:', errorData.substring(0, 300));
      throw new Error(`OpenRouter API error ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content;
    
    if (!generatedText) {
      throw new Error('No response from OpenRouter AI');
    }
    
    console.log('[BarcodeService] OpenRouter response preview:', generatedText.substring(0, 200));

    // Parse JSON from response
    let jsonText = generatedText.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }
    const firstBrace = jsonText.indexOf('{');
    const lastBrace = jsonText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      jsonText = jsonText.slice(firstBrace, lastBrace + 1);
    }

    const parsedData = JSON.parse(jsonText);
    console.log('[BarcodeService] OpenRouter parsed successfully');
    console.log('[BarcodeService] Detected barcode:', parsedData.barcode);
    console.log('[BarcodeService] Product name:', parsedData.product_name);
    return parsedData;
  } catch (error: any) {
    console.error('[BarcodeService] OpenRouter analysis error:', error.message);
    throw error;
  }
};

/**
 * Scan barcode from image using OpenRouter AI
 */
export const scanBarcodeImage = async (imageUri: string): Promise<BarcodeResponse> => {
  try {
    console.log('[BarcodeService] ========== SCAN START ==========');
    console.log('[BarcodeService] scanBarcodeImage called with:', imageUri);
    console.log('[BarcodeService] Platform:', Platform.OS);
    console.log('[BarcodeService] Using OpenRouter AI for barcode detection and product analysis');
    
    // Read image as base64
    let base64Image: string;
    
    if (Platform.OS === 'web') {
      console.log('[BarcodeService] Reading image for WEB platform...');
      // For web, fetch the blob and convert to base64
      const response = await fetch(imageUri);
      console.log('[BarcodeService] Fetch response status:', response.status);
      const blob = await response.blob();
      console.log('[BarcodeService] Blob size:', blob.size, 'type:', blob.type);
      base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          console.log('[BarcodeService] Base64 result length:', result?.length || 0);
          resolve(result);
        };
        reader.onerror = (err) => {
          console.error('[BarcodeService] FileReader error:', err);
          reject(err);
        };
        reader.readAsDataURL(blob);
      });
    } else {
      console.log('[BarcodeService] Reading image for NATIVE platform...');
      // For native platforms, use FileSystem
      if (!FileSystem) {
        throw new Error('FileSystem not available');
      }
      const base64Data = await FileSystem.readAsStringAsync(imageUri, {
        encoding: 'base64',
      });
      console.log('[BarcodeService] Base64 length:', base64Data?.length || 0);
      // Add data URL prefix
      base64Image = `data:image/jpeg;base64,${base64Data}`;
    }
    
    if (!base64Image || base64Image.length === 0) {
      throw new Error('Failed to read image - empty base64 data');
    }
    
    console.log('[BarcodeService] Image read successfully, total size:', base64Image.length);
    
    // Extract raw base64 data (remove data URL prefix)
    const rawBase64 = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
    
    // Use OpenRouter AI to detect barcode and get product details
    console.log('[BarcodeService] Sending to OpenRouter AI for analysis...');
    
    try {
      const aiData = await analyzeProductWithAI(rawBase64);
      console.log('[BarcodeService] ✓ OpenRouter AI analysis complete');
      
      const detectedBarcode = aiData.barcode || 'UNKNOWN';
      
      // If AI couldn't identify the product
      if (!aiData.product_name || aiData.product_name === 'Unknown Product') {
        return {
          success: false,
          error: 'Could not identify the product',
          message: 'Unable to identify the product from the image. Please try again or use manual entry.',
          tips: [
            'Ensure the product label is clearly visible',
            'Make sure the barcode is in focus',
            'Try taking the photo from a different angle',
            'Use manual entry as an alternative',
          ],
          suggestion: 'manual_entry',
        };
      }
      
      return {
        success: true,
        data: {
          barcode: detectedBarcode,
          product_name: aiData.product_name || 'Unknown Product',
          brand: aiData.brand || 'Unknown Brand',
          quantity: aiData.quantity || 'N/A',
          categories: aiData.categories || aiData.product_type || 'Food Product',
          ingredients_text: aiData.ingredients || 'Not specified',
          image_url: imageUri,
          nutritional_info: aiData.nutritional_info ? {
            energy_kcal: aiData.nutritional_info.energy_kcal || null,
            fat: aiData.nutritional_info.fat || null,
            saturated_fat: aiData.nutritional_info.saturated_fat || null,
            trans_fat: aiData.nutritional_info.trans_fat || null,
            cholesterol: null,
            carbohydrates: aiData.nutritional_info.carbohydrates || null,
            sugars: null,
            fiber: null,
            proteins: aiData.nutritional_info.proteins || null,
            salt: null,
            sodium: aiData.nutritional_info.sodium || null,
            unit: '100g',
            polyunsaturated_fat: aiData.nutritional_info.polyunsaturated_fat || null,
          } : null,
          oil_content: aiData.nutritional_info?.fat ? `${aiData.nutritional_info.fat}g` : 'Unknown',
          additives: [],
          nutriscore_grade: null,
          nova_group: null,
          labels: aiData.product_type || 'Edible Product',
          fatty_acids: {
            sfa: aiData.sfa || null,
            tfa: aiData.tfa || null,
            pfa: aiData.pfa || null,
            is_food_product: aiData.is_food_product !== false,
          },
        },
        message: 'Product scanned successfully with AI analysis',
        tips: aiData.health_tips || [
          'Track your oil consumption daily',
          'Choose healthier oil alternatives',
          'Monitor your SwasthaIndex score',
        ],
      };
    } catch (aiError: any) {
      console.warn('[BarcodeService] OpenRouter AI failed:', aiError.message);
      
      return {
        success: false,
        error: 'AI analysis failed',
        message: 'Could not analyze the product image. Please try again or use manual entry.',
        tips: [
          'Ensure good lighting when taking the photo',
          'Make sure the product is in focus',
          'Try a different angle',
          'Use manual entry as an alternative',
        ],
        suggestion: 'manual_entry',
      };
    }
    
  } catch (error: any) {
    console.error('[BarcodeService] Barcode scan failed:', error);
    return {
      success: false,
      error: error.message || 'Failed to scan barcode',
      tips: [
        'Ensure the barcode is clearly visible and well-lit',
        'Avoid glare and reflections on the packaging',
        'Try to capture the barcode in the center of the frame',
        'Use manual entry if scanning fails repeatedly',
      ],
    };
  }
};

/**
 * Look up product by barcode number using OpenFoodFacts API
 */
export const lookupBarcode = async (barcode: string): Promise<BarcodeResponse> => {
  try {
    console.log('[BarcodeService] lookupBarcode called with:', barcode);
    console.log('[BarcodeService] Searching OpenFoodFacts database...');
    
    // Use OpenFoodFacts API directly
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    const data = await response.json();
    
    if (data.status === 1 && data.product) {
      const product = data.product;
      console.log('[BarcodeService] Product found in OpenFoodFacts:', product.product_name);
      
      return {
        success: true,
        data: {
          barcode: barcode,
          product_name: product.product_name || 'Unknown Product',
          brand: product.brands || 'Unknown Brand',
          quantity: product.quantity || 'N/A',
          categories: product.categories || 'Food Product',
          ingredients_text: product.ingredients_text || 'Not specified',
          image_url: product.image_url || 'https://via.placeholder.com/300',
          nutritional_info: {
            energy_kcal: product.nutriments?.['energy-kcal_100g'] || null,
            fat: product.nutriments?.fat_100g || null,
            saturated_fat: product.nutriments?.['saturated-fat_100g'] || null,
            trans_fat: product.nutriments?.['trans-fat_100g'] || null,
            cholesterol: product.nutriments?.cholesterol_100g || null,
            carbohydrates: product.nutriments?.carbohydrates_100g || null,
            sugars: product.nutriments?.sugars_100g || null,
            fiber: product.nutriments?.fiber_100g || null,
            proteins: product.nutriments?.proteins_100g || null,
            salt: product.nutriments?.salt_100g || null,
            sodium: product.nutriments?.sodium_100g || null,
            unit: '100g',
          },
          oil_content: product.nutriments?.fat_100g ? `${product.nutriments.fat_100g}g` : 'Unknown',
          additives: product.additives_tags || [],
          nutriscore_grade: product.nutriscore_grade || null,
          nova_group: product.nova_group || null,
          labels: product.labels || 'N/A',
        },
        message: 'Product found in database',
        tips: [
          'Check the nutritional information',
          'Track your daily oil consumption',
          'Compare with healthier alternatives',
        ],
      };
    }
    
    // If not found in OpenFoodFacts, return a helpful message
    console.log('[BarcodeService] Product not found in database');
    return {
      success: false,
      error: 'Product not found. Try scanning the product image instead or enter details manually.',
    };

  } catch (error: any) {
    console.error('[BarcodeService] Barcode lookup error:', error);
    return {
      success: false,
      error: error.message || 'Failed to lookup barcode',
    };
  }
};

/**
 * Search products by name using OpenFoodFacts
 */
export const searchProducts = async (
  query: string,
  page: number = 1,
  pageSize: number = 10
): Promise<SearchResponse> => {
  try {
    console.log('[BarcodeService] searchProducts called with:', query);
    
    // Use OpenFoodFacts search API
    const searchResponse = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page=${page}&page_size=${pageSize}`
    );
    const searchData = await searchResponse.json();
    
    const results: SearchResult[] = (searchData.products || []).map((product: any) => ({
      barcode: product.code || '',
      product_name: product.product_name || 'Unknown Product',
      brand: product.brands || 'Unknown Brand',
      image_url: product.image_url || 'https://via.placeholder.com/150',
      nutriscore_grade: product.nutriscore_grade || null,
    }));
    
    console.log('[BarcodeService] Search results from OpenFoodFacts:', results.length);
    
    return {
      success: true,
      data: {
        query: query,
        count: results.length,
        results: results,
      },
    };
  } catch (error: any) {
    console.error('Product search error:', error);
    return {
      success: false,
      error: error.message || 'Failed to search products',
    };
  }
};

export const barcodeService = {
  scanBarcodeImage,
  lookupBarcode,
  searchProducts,
};

export default barcodeService;
