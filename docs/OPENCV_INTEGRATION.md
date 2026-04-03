# OpenCV Barcode Scanner Integration

## Overview

This integration brings the OpenCV barcode scanning functionality from the standalone Python project into the SwasthTel app backend. Users can now scan product barcodes to get detailed nutritional information and oil content analysis directly within the app.

## Features Integrated

1. **Barcode Image Scanning** - Upload images and automatically detect/decode barcodes
2. **Product Lookup** - Query OpenFoodFacts database by barcode number
3. **Nutritional Analysis** - Display comprehensive nutritional information
4. **Oil Content Detection** - Analyze and categorize oil content in products
5. **Product Search** - Search products by name

## Architecture

### Backend Components

```
swasthtel-app/backend/
├── controllers/
│   └── barcodeScanController.js  # Barcode scanning logic
├── routes/
│   └── barcode.js                 # API routes for barcode operations
└── server.js                      # Updated with barcode routes
```

### Frontend Components

```
swasthtel-app/src/
├── services/
│   └── barcodeService.ts          # API client for barcode operations
├── config/
│   └── api.ts                     # Updated with barcode endpoints
└── components/native/screens/
    └── BarcodeScannerScreen.tsx   # Updated to use new backend
```

## API Endpoints

### 1. Scan Barcode Image
```
POST /api/barcode/scan
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body:
  file: <image_file>

Response:
{
  "success": true,
  "data": {
    "barcode": "5449000000996",
    "product_name": "Coca-Cola",
    "brand": "Coca-Cola",
    "quantity": "330ml",
    "oil_content": "Very low oil content: 0g per 100g",
    "nutritional_info": {
      "energy_kcal": 42,
      "fat": 0,
      "saturated_fat": 0,
      "carbohydrates": 10.6,
      "sugars": 10.6,
      "proteins": 0,
      "salt": 0,
      "sodium": 0,
      "unit": "100g"
    },
    "nutriscore_grade": "e",
    "nova_group": 4,
    ...
  }
}
```

### 2. Lookup by Barcode Number
```
GET /api/barcode/lookup/:barcode
Authorization: Bearer <token>

Response: Same as scan endpoint
```

### 3. Search Products
```
GET /api/barcode/search?q=coca&page=1&page_size=10
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "query": "coca",
    "count": 10,
    "results": [
      {
        "barcode": "5449000000996",
        "product_name": "Coca-Cola",
        "brand": "Coca-Cola",
        "image_url": "...",
        "nutriscore_grade": "e"
      },
      ...
    ]
  }
}
```

## Installation

### Backend Setup

1. **Install Dependencies**
   ```bash
   cd swasthtel-app/backend
   npm install
   ```

   New packages added:
   - `axios` - HTTP client for OpenFoodFacts API
   - `multer` - File upload middleware
   - `sharp` - High-performance image processing
   - `jimp` - JavaScript image manipulation
   - `jsqr` - QR code decoder
   - `quagga` - Barcode decoder for EAN/UPC
   - `form-data` - FormData implementation

2. **Environment Variables** (optional)
   Add to `.env`:
   ```
   # No additional env vars required
   # Uses OpenFoodFacts public API
   ```

3. **Start Backend Server**
   ```bash
   npm run dev
   # or
   npm start
   ```

### Frontend Setup

1. **Dependencies Already Installed**
   - `expo-image-picker` - Already in project
   - `@react-native-async-storage/async-storage` - Already in project

2. **No Additional Setup Required**
   - Service and API configuration already updated
   - Screen component already connected

## Usage Flow

1. User opens SwasthTel app
2. Taps "Oil Scan" card on home screen
3. Navigates to Barcode Scanner screen
4. User can:
   - Take photo of product barcode
   - Upload image from gallery
   - Manually enter barcode number
5. App sends image/barcode to backend
6. Backend processes:
   - Decodes barcode from image (if image)
   - Looks up product in OpenFoodFacts
   - Analyzes nutritional info and oil content
7. App displays:
   - Product name and brand
   - Barcode number
   - Oil content analysis
   - Complete nutritional information
   - Health scores (Nutriscore, NOVA)
8. User can use product data in oil tracking

## Technical Details

### Barcode Decoding Strategy

The backend uses multiple decoding libraries in sequence:

1. **jsQR** - Fast QR code decoder
2. **Quagga** - Robust EAN-13, UPC-A/E, EAN-8 decoder
3. **Image Preprocessing** - Sharp for optimization before decoding

### OpenFoodFacts Integration

- Public API (no key required)
- User-Agent: "SwasthTel - Oil Tracking App - Version 1.0"
- Rate limiting respected (0.5s between requests)
- Comprehensive product database
- Multilingual support

### Oil Content Analysis

Categorizes products based on fat content per 100g:
- **High**: >50g (cooking oils, ghee)
- **Moderate**: 20-50g (nuts, chips)
- **Low**: 5-20g (dairy, baked goods)
- **Very Low**: 0-5g (most other products)

## Error Handling

### Common Errors

1. **No barcode detected**
   - Ensure barcode is clearly visible
   - Good lighting
   - In focus

2. **Product not found**
   - Barcode may not be in OpenFoodFacts database
   - Try manual entry to verify barcode number

3. **Network errors**
   - Check internet connection
   - OpenFoodFacts API might be temporarily unavailable

4. **Authentication required**
   - User must be logged in
   - Token automatically included from AsyncStorage

## Future Enhancements

1. **Offline Mode**
   - Cache frequently scanned products
   - SQLite local database

2. **Additional Barcode Formats**
   - QR codes with product URLs
   - DataMatrix codes

3. **Enhanced Analysis**
   - Additives risk assessment
   - Allergen detection
   - Custom dietary restrictions

4. **Batch Scanning**
   - Scan multiple products
   - Shopping list integration

5. **Nutritional Recommendations**
   - Based on user's oil consumption goals
   - Healthier alternatives suggestions

## Testing

### Backend Testing
```bash
cd swasthtel-app/backend

# Test scan endpoint (with image file)
curl -X POST http://localhost:5000/api/barcode/scan \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@barcode_image.jpg"

# Test lookup endpoint
curl http://localhost:5000/api/barcode/lookup/5449000000996 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test search endpoint
curl "http://localhost:5000/api/barcode/search?q=coca" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Frontend Testing

1. Run app: `npm start` or `expo start`
2. Navigate to Barcode Scanner
3. Test with sample barcodes:
   - Coca-Cola: 5449000000996
   - Nutella: 3017620422003
   - Maggi: 7613034626844

## Troubleshooting

### Issue: "Module not found: quagga"
**Solution**: The quagga library has dependencies on canvas which may not work in all Node.js environments. If you encounter issues:

1. Remove quagga from package.json
2. Use jsQR only
3. Consider Python microservice for advanced barcode decoding

### Issue: Sharp installation fails
**Solution**: Sharp requires native binaries. Try:
```bash
npm install --platform=darwin --arch=x64 sharp  # macOS
npm install --platform=win32 --arch=x64 sharp   # Windows
npm install --platform=linux --arch=x64 sharp   # Linux
```

### Issue: Images not uploading from mobile
**Solution**: 
1. Check permissions in app
2. Verify file size (<10MB)
3. Check network connectivity
4. Review API_BASE_URL in config/api.ts

## Credits

- **OpenFoodFacts** - Product database and API
- **OpenCV Project** - Original barcode scanning implementation
- **SwasthTel Team** - Integration and app development

## License

This integration maintains the same license as the SwasthTel project.
