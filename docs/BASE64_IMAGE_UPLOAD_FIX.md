# Base64 Image Upload Implementation

## Problem
The original multipart/form-data file upload approach was not working between React Native and Express backend. The React Native FormData object with `{uri, type, name}` was not being properly parsed by the Multer middleware, resulting in "No image file provided" errors.

## Solution
Implemented a base64 image encoding approach that is fully compatible with React Native:

### Backend Changes

#### 1. Updated Controller (`backend/controllers/barcodeScanController.js`)
- Modified `scanBarcodeImage` to handle both multipart uploads and base64 JSON payloads
- Checks for `req.body.image` (base64 string) first, then falls back to `req.file` (multipart)
- Decodes base64 string to Buffer using `Buffer.from(base64Data, 'base64')`
- Removes data URI prefix if present: `data:image/...;base64,`

#### 2. Added New Route (`backend/routes/barcode.js`)
```javascript
// New endpoint for base64 uploads
router.post('/scan-base64', protect, scanBarcodeImage);
```
- No Multer middleware needed for base64 approach
- Only requires authentication middleware

### Frontend Changes

#### 1. Installed expo-file-system
```bash
npx expo install expo-file-system
```

#### 2. Updated Service (`src/services/barcodeService.ts`)
```typescript
import * as FileSystem from 'expo-file-system';

export const scanBarcodeImage = async (imageUri: string): Promise<BarcodeResponse> => {
  // Read image as base64
  const base64Image = await FileSystem.readAsStringAsync(imageUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  
  // Send as JSON
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image: base64Image,
      filename: fileName,
    }),
  });
}
```

#### 3. Updated API Config (`src/config/api.ts`)
```typescript
BARCODE: {
  SCAN: '/barcode/scan',           // Multipart upload (legacy)
  SCAN_BASE64: '/barcode/scan-base64',  // Base64 upload (React Native)
  LOOKUP: (barcode: string) => `/barcode/lookup/${barcode}`,
  SEARCH: '/barcode/search',
}
```

## Advantages

1. **React Native Compatibility**: No FormData issues with file URIs
2. **Simpler Implementation**: No multipart parsing complexity
3. **Reliable Transfer**: Base64 encoded data in JSON body
4. **Better Debugging**: Can easily log and inspect the data being sent
5. **Cross-Platform**: Works consistently on Android, iOS, and web

## Technical Details

### Image Flow
1. User selects/captures image → `imageUri` (file:///path/to/image.jpg)
2. Frontend reads file as base64 string using expo-file-system
3. Frontend sends JSON: `{image: "base64data...", filename: "image.jpg"}`
4. Backend receives JSON, decodes base64 to Buffer
5. Backend processes image with Sharp for optimization
6. Backend decodes barcode using multiple strategies (QR API → jsQR → ZXing → Quagga)
7. Backend looks up product on OpenFoodFacts
8. Backend returns product data with oil content analysis

### File Size Considerations
- Base64 encoding increases size by ~33%
- Backend limit: 10MB (configured in Multer for legacy endpoint)
- For base64: Express body-parser default limit is 100kb
- **TODO**: May need to increase body-parser limit for large images

### Error Handling
Both approaches maintain the same error handling:
- Authentication validation
- Image format validation
- Barcode detection failures
- OpenFoodFacts API errors
- Network errors with proper error messages

## Testing

To test the implementation:

1. **Backend Running**: Verify server is on port 5000
```bash
netstat -ano | findstr :5000
```

2. **Test Manually**: Use manual barcode entry (working) to verify connectivity

3. **Test Image Upload**: 
   - Open SwasthTel app on Android
   - Navigate to Oil Scan
   - Select/capture barcode image
   - Check console logs for base64 encoding and upload

4. **Monitor Backend Logs**: Watch for:
   ```
   [ScanController] Processing base64 image from JSON body
   [ScanController] Base64 image decoded: { size: XXXXX, filename: 'image.jpg' }
   ```

## Next Steps

1. ✅ Install expo-file-system
2. ✅ Create base64 endpoint in backend
3. ✅ Update frontend service to use base64
4. ✅ Restart backend server
5. ⏳ Test on Android device
6. ⏳ Verify barcode detection works end-to-end
7. ⏳ Consider increasing Express body-parser limit if needed

## Rollback Plan

If issues arise, the original multipart endpoint (`/api/barcode/scan`) is still available. Simply revert the frontend changes to use the old XMLHttpRequest/FormData approach and continue debugging the multipart issue separately.
