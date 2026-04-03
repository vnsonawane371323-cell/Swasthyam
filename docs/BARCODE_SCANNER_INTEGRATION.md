# Barcode Scanner Integration

## Overview
The app now integrates with the Swasthyam OpenCV barcode scanner API to scan product barcodes and extract nutritional information, particularly oil content.

## API Details
- **Base URL**: `https://swasthyam-opencv.onrender.com`
- **Endpoint**: `POST /upload`
- **GitHub Repository**: https://github.com/Ankit-khandelwal04/Swasthyam_OpenCV.git

## Implementation

### 1. New Screen: `BarcodeScannerScreen.tsx`
Located at: `src/components/native/screens/BarcodeScannerScreen.tsx`

#### Features:
- **Camera Integration**: Take photos using device camera
- **Gallery Upload**: Select existing photos from gallery
- **API Integration**: Uploads images to Swasthyam OpenCV API
- **Result Display**: Shows barcode data, nutritional info, and oil content
- **Navigation**: Direct navigation to Oil Tracker with scanned product data

#### User Flow:
1. User taps "Oil Scan" card on home screen
2. Opens Barcode Scanner screen
3. User can either:
   - Take a photo with camera
   - Choose from gallery
4. Image is uploaded to API endpoint
5. Results are displayed with:
   - Product name and brand
   - Barcode number
   - Oil content (highlighted)
   - Full nutritional information grid
6. User can "Use This Product" to navigate to Oil Tracker with pre-filled data
7. Or "Scan Another Product" to retry

### 2. Navigation Updates

#### Types (`src/navigation/types.ts`):
```typescript
OilTracker: {
  targetDate?: string;
  scannedProduct?: {
    name: string;
    brand?: string;
    oilContent?: string;
    nutritionalInfo?: any;
  };
};
BarcodeScanner: undefined;
```

#### Routes (`src/navigation/AppNavigator.tsx`):
- Added import for `BarcodeScannerScreen`
- Added route: `<MainStack.Screen name="BarcodeScanner" component={BarcodeScannerScreen} />`

#### Home Screen Integration (`src/components/native/MobileHome.tsx`):
```typescript
const handleScanFood = () => {
  navigation.navigate('BarcodeScanner');
};
```

### 3. API Request/Response

#### Request Format:
```typescript
const formData = new FormData();
formData.append('file', {
  uri: imageUri,
  type: 'image/jpeg',
  name: 'barcode.jpg',
});

fetch('https://swasthyam-opencv.onrender.com/upload', {
  method: 'POST',
  body: formData,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});
```

#### Expected Response:
```typescript
{
  barcode: string;              // e.g., "8901030785306"
  product_name: string;         // e.g., "Fortune Sunflower Oil"
  brand: string;                // e.g., "Fortune"
  quantity: string;             // e.g., "1L"
  oil_content?: string;         // e.g., "100ml per serving"
  nutritional_info?: {
    energy?: string;            // e.g., "900 kcal"
    protein?: string;           // e.g., "0g"
    carbohydrates?: string;     // e.g., "0g"
    fat?: string;               // e.g., "100g"
    saturated_fat?: string;     // e.g., "12g"
    trans_fat?: string;         // e.g., "0g"
    cholesterol?: string;       // e.g., "0mg"
    sodium?: string;            // e.g., "0mg"
  }
}
```

### 4. Permissions Required
- **Camera**: `expo-image-picker` camera permissions
- **Gallery**: `expo-image-picker` media library permissions

Both permissions are requested on screen mount.

### 5. Error Handling
- Camera/gallery access errors
- Network errors during upload
- API errors (invalid barcode, server issues)
- User-friendly error messages displayed
- Retry option available

## UI/UX Features

### Pre-Scan State:
- Instructions with icon
- Two action buttons: "Take Photo" and "Choose from Gallery"
- Tips section for best scanning results

### Scanning State:
- Loading indicator
- Progress text ("Opening camera..." or "Scanning barcode...")

### Success State:
- Green success badge
- Product information card
- Highlighted oil content card (if available)
- Nutritional information grid (2-column layout)
- "Use This Product" button (primary action)
- "Scan Another Product" button (secondary action)

### Error State:
- Red error icon
- Error message
- Retry button

## Integration with Oil Tracker

When user taps "Use This Product", they are navigated to the Oil Tracker screen with the following params:

```typescript
navigation.navigate('OilTracker', {
  scannedProduct: {
    name: scannedData.product_name,
    brand: scannedData.brand,
    oilContent: scannedData.oil_content,
    nutritionalInfo: scannedData.nutritional_info,
  },
});
```

The Oil Tracker screen can then use this data to:
- Pre-fill the food name field
- Display brand information
- Calculate oil content automatically
- Show nutritional information

## Testing Checklist

- [ ] Camera opens correctly
- [ ] Gallery picker works
- [ ] Image uploads successfully to API
- [ ] Barcode is detected and parsed
- [ ] Product information displays correctly
- [ ] Nutritional info grid renders properly
- [ ] Oil content is highlighted
- [ ] Navigation to Oil Tracker works
- [ ] Data is passed correctly to Oil Tracker
- [ ] Error handling works for failed scans
- [ ] Retry functionality works
- [ ] Permissions are properly requested

## Future Enhancements

1. **Offline Caching**: Store frequently scanned products locally
2. **History**: Keep track of previously scanned products
3. **Favorites**: Save commonly used products
4. **Manual Entry**: Allow manual barcode number input
5. **Product Database**: Build internal database of Indian food products
6. **Batch Scanning**: Scan multiple products in one session
7. **Comparison**: Compare oil content across similar products
8. **QR Code Support**: Extend to QR codes for recipes

## Dependencies

```json
{
  "expo-image-picker": "~14.x.x",
  "@react-navigation/native": "^6.x.x",
  "@react-navigation/native-stack": "^6.x.x"
}
```

## API Server Information

The Swasthyam OpenCV API is hosted on Render. If experiencing slow response times (cold starts), the API may take 30-60 seconds to wake up on first request.

For production use, consider:
- Implementing retry logic with exponential backoff
- Adding request timeout handling
- Displaying loading states during cold starts
- Caching API responses

## Credits

Barcode scanning powered by: [Swasthyam OpenCV](https://github.com/Ankit-khandelwal04/Swasthyam_OpenCV)
