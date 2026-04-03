const mongoose = require('mongoose');

const healthReportSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    file_name: {
      type: String,
      required: true,
    },
    file_type: {
      type: String,
      enum: ['image', 'pdf'],
      required: true,
    },
    extracted_metrics: {
      lipid_profile: {
        total_cholesterol: Number,
        hdl: Number,
        ldl: Number,
        triglycerides: Number,
      },
      diabetes: {
        fasting_glucose: Number,
        postprandial_glucose: Number,
        hba1c: Number,
      },
      liver_function: {
        alt_sgpt: Number,
        ast_sgot: Number,
        bilirubin: Number,
      },
      kidney_function: {
        creatinine: Number,
        urea: Number,
        uric_acid: Number,
      },
      nutrition: {
        protein: Number,
        albumin: Number,
      },
      cbc: {
        hemoglobin: Number,
        rbc: Number,
        wbc: Number,
        platelets: Number,
      },
      thyroid: {
        t3: Number,
        t4: Number,
        tsh: Number,
      },
      vitamins: {
        vitamin_d: Number,
        vitamin_b12: Number,
      },
      electrolytes: {
        sodium: Number,
        potassium: Number,
      },
      vitals: {
        bmi: Number,
        weight: Number,
      },
    },
    health_score: {
      type: Number,
      min: 0,
      max: 100,
    },
    oil_limit: {
      type: Number,
      default: 40, // ml per day
    },
    risk_flags: [
      {
        type: String,
        enum: [
          'High Cholesterol',
          'High LDL',
          'High Triglycerides',
          'Diabetes Risk',
          'Fatty Liver Risk',
          'Low Protein',
          'Anemia',
          'Thyroid Disorder',
          'Kidney Dysfunction',
          'Electrolyte Imbalance',
        ],
      },
    ],
    nutrition_targets: {
      protein: Number,
      fat: Number,
      carbs: Number,
    },
    recommendations: [String],
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HealthReport', healthReportSchema);
