# Medical Report Analyzer - Implementation Guide

## Overview
The Medical Report Analyzer is a full-stack feature integrated into the SwasthTel application that uses Google Gemini AI to analyze medical reports and provide personalized health insights.

## ✅ Completed Components

### Backend Architecture

#### 1. **Gemini AI Integration** (`backend/services/geminiService.js`)
- Integrates with Google Gemini 1.5 Flash model
- Converts medical reports (images/PDFs) to base64
- Sends to Gemini with specialized medical analysis prompt
- Parses JSON response with structured health data
- Error handling and response cleaning

**Key Features:**
- File format detection (JPEG, PNG, GIF, WebP, PDF)
- Base64 encoding for API transmission
- Automatic JSON cleaning (removes markdown wrappers)
- 30-second timeout for API requests
- Comprehensive error logging

#### 2. **MongoDB Model** (`backend/models/HealthReport.js`)
- Stores complete health analysis records
- Fields include:
  - `extracted_metrics`: Raw data from Gemini
  - `health_score`: 0-100 rating
  - `oil_limit`: Personalized daily consumption limit
  - `risk_flags`: Array of identified health risks
  - `nutrition_targets`: Protein, fat, carbs recommendations
  - `recommendations`: Actionable health advice

#### 3. **Health Analysis Engine** (`backend/utils/healthAnalyzer.js`)
Sophisticated analysis logic that processes medical metrics:

**Lipid Profile Analysis:**
- High cholesterol (>200) → -15 points
- High LDL (>130) → -10 points + reduce oil limit
- High triglycerides (>150) → -10 points

**Diabetes Detection:**
- HbA1c > 6.5 → -20 points + reduce carbs to 150g
- Fasting glucose > 126 → -15 points
- Postprandial glucose > 200 → -10 points

**Liver Function:**
- ALT/AST > 40 → -12 points + flag "Fatty Liver Risk"
- Bilirubin > 1.2 → -8 points

**Kidney Function:**
- Creatinine > 1.3 → -15 points + increase water intake
- Urea > 45 → -10 points
- Uric acid > 6 → reduce purine-rich foods

**Nutrition & Blood Count:**
- Low protein → -8 to -10 points
- Low hemoglobin → -12 points + anemia flag
- Abnormal WBC/platelets → -8 points each

**Thyroid & Vitamins:**
- TSH abnormal → -10 points
- Low Vitamin D → -8 points + sunlight/supplement recommendations
- Low B12 → -8 points

**Dynamic Recommendations Generated:**
- Oil limit: 15-40 ml/day based on risk factors
- Protein target: 50-70g based on levels
- Fat target: 40-50g based on cholesterol
- Carbs target: 150-200g based on diabetes risk

#### 4. **Health Report Controller** (`backend/controllers/healthReportController.js`)
Endpoints implemented:
- `POST /api/health/analyze-report` - Upload and analyze
- `GET /api/health/reports/:userId` - List user's reports
- `GET /api/health/reports/latest/:userId` - Fetch latest
- `GET /api/health/report/:reportId` - Get single report
- `DELETE /api/health/report/:reportId` - Delete report

File upload handling:
- Uses multer for multipart/form-data
- 10 MB file size limit
- Supported formats: JPEG, PNG, GIF, WebP, PDF
- Automatic cleanup after processing

#### 5. **Health Routes** (`backend/routes/health.js`)
Complete REST API with:
- File upload middleware configuration
- Authentication middleware on all endpoints
- Proper error handling
- Response cleaning and validation

### Frontend Components

#### 1. **MedicalReportUpload Component** (`src/components/native/MedicalReportUpload.tsx`)
**Features:**
- Image picker and PDF picker UI
- File preview with file type detection
- Loading state with spinner
- Two-part interface: Upload → Results

**Upload Section:**
- Drag-and-drop style visual
- "Pick Image" and "Pick PDF" buttons
- Selected file preview
- "Change File" option
- Security info cards

**Dashboard Section (Results):**
- Health Score display (color-coded: red/yellow/blue/green)
- Oil consumption limit card with progress bar
- Risk flags as chip components
- Nutrition targets in 3-column grid
- Recommendations list with bullet points
- Back button to upload new file

#### 2. **Home Page Integration** (`src/components/native/MobileHome.tsx`)
- Imported MedicalReportUpload component
- Added medical report section after national campaign
- Styled with proper spacing and margins

#### 3. **API Service Extension** (`src/services/api.ts`)
Added generic `post()` method:
- Supports FormData for file uploads
- Automatic Content-Type detection
- Token/Authorization header handling
- 15-second timeout with AbortController
- Proper error handling and response parsing

## 🔌 API Endpoints

### Analysis Endpoint
```
POST /api/health/analyze-report
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body:
- report: File (image or PDF)
- userId: string

Response:
{
  "success": true,
  "data": {
    "report_id": "...",
    "metrics": { ...extracted metrics... },
    "health_score": 75,
    "oil_limit": 25,
    "risk_flags": ["High Cholesterol", "Fatty Liver Risk"],
    "nutrition_targets": {
      "protein": 60,
      "fat": 40,
      "carbs": 180
    },
    "recommendations": [...]
  }
}
```

### Retrieval Endpoints
```
GET /api/health/reports/:userId?limit=10&skip=0
GET /api/health/reports/latest/:userId
GET /api/health/report/:reportId
DELETE /api/health/report/:reportId
```

## 🔐 Environment Configuration

Add to `.env`:
```
GEMINI_API_KEY=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
```

## 📊 Data Flow

1. **User uploads medical report** (image/PDF)
2. **Frontend sends to backend** via multipart/form-data
3. **Backend converts file** to base64
4. **Gemini API analyzes** with specialized prompt
5. **Structured JSON extracted** from Gemini response
6. **Health analysis engine** processes metrics:
   - Calculates health score (0-100)
   - Determines oil limit
   - Identifies risk flags
   - Generates recommendations
7. **Data saved to MongoDB** for historical tracking
8. **Frontend dashboard displays** results:
   - Visual health score
   - Oil consumption guidance
   - Risk warnings
   - Nutrition targets
   - Actionable recommendations

## 🎯 Key Features

### Smart Health Scoring
- Multi-factor analysis
- Weighted scoring system
- Real-time calculation

### Personalized Recommendations
- Oil consumption limits (15-40 ml/day)
- Nutrition targets based on metrics
- Specific health action items
- Duplicate removal for clarity

### Risk Detection
- 10 categories of risk flags
- Color-coded severity
- Actionable warnings

### Data Privacy
- Secure file uploads (10 MB limit)
- Automatic cleanup after processing
- Encrypted transmission
- MongoDB storage with user association

## 🚀 Testing

### Manual Testing Steps

1. **Backend Testing:**
```bash
cd backend
npm install  # if needed
npm start
# Server runs on http://localhost:5000
```

2. **Upload a Medical Report:**
```bash
curl -X POST http://localhost:5000/api/health/analyze-report \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "report=@/path/to/medical_report.jpg" \
  -F "userId=USER_ID"
```

3. **Fetch Reports:**
```bash
curl http://localhost:5000/api/health/reports/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Frontend Testing:
1. Run the app: `npm run dev` or `expo start`
2. Navigate to home page
3. Scroll to "Upload Medical Report" section
4. Select an image or PDF of a medical report
5. Click "Analyze Report"
6. Review the health dashboard with scores and recommendations

## 📦 File Structure

```
backend/
├── models/
│   └── HealthReport.js          # MongoDB schema
├── controllers/
│   └── healthReportController.js # Request handlers
├── services/
│   └── geminiService.js         # Gemini AI integration
├── utils/
│   └── healthAnalyzer.js        # Health analysis logic
├── routes/
│   └── health.js                # API endpoints
└── cache/
    └── health-reports/          # Temporary upload directory

src/
├── components/native/
│   ├── MedicalReportUpload.tsx   # Main component
│   └── MobileHome.tsx             # Integration point
└── services/
    └── api.ts                     # API client with post()
```

## 🔄 Integration with SwasthTel

### How It Connects to Oil Tracking:
1. **Health Score** informs daily oil limit
2. **Risk Flags** provide context for consumption
3. **Recommendations** guide nutrition choices
4. **Nutrition Targets** linked to daily tracking
5. **Historical Reports** show health trends

### Future Enhancements:
- Trend tracking (compare multiple reports)
- Alert system for critical findings
- Integration with wearable devices
- Multi-language support for recommendations
- PDF report generation
- Sharing with healthcare providers
- Integration with food database

## ⚠️ Important Notes

1. **File Size Limit**: 10 MB per upload
2. **Supported Formats**: JPEG, PNG, GIF, WebP, PDF
3. **Processing Time**: 5-15 seconds per report
4. **API Timeout**: 30 seconds
5. **Authentication**: Required on all endpoints
6. **User Association**: Reports linked to user_id for privacy

## 🐛 Troubleshooting

### Common Issues:

**"Failed to analyze report" Error:**
- Check Gemini API key in .env
- Verify file format (image/PDF)
- Check file is not corrupted
- Ensure file size < 10 MB

**"Unauthorized" Response:**
- Verify Bearer token is valid
- Check token hasn't expired
- Ensure Authorization header format

**"No health reports found":**
- Verify userId is correct
- Check MongoDB connection
- Ensure user has uploaded reports

## 📄 Health Score Interpretation

- **90-100**: Excellent health profile
- **80-89**: Good health status
- **60-79**: Fair condition, monitor metrics
- **40-59**: Concerning findings, recommendations critical
- **0-39**: High risk, consult healthcare provider

---

**Implementation completed on**: March 30, 2026
**Status**: Ready for production testing
**Next steps**: Integration testing with live data
