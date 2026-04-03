const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// User Schema (simplified)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: String,
  phoneNumber: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function seedUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if user already exists
    const existingUser = await User.findOne({ email: process.env.TEST_USER_EMAIL });
    
    if (existingUser) {
      console.log('⚠️  User already exists:', existingUser.email);
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(process.env.TEST_USER_PASSWORD, 10);

    // Create user
    const user = await User.create({
      email: process.env.TEST_USER_EMAIL,
      password: hashedPassword,
      name: 'Aditya Ahirrao',
      phoneNumber: ''
    });

    console.log('✅ Test user created successfully!');
    console.log('📧 Email:', user.email);
    console.log('🔑 Password:', process.env.TEST_USER_PASSWORD);
    console.log('\nYou can now login with these credentials.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedUser();
