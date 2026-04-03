require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const demoEmails = [
  'priya.sharma@demo.com',
  'rahul.patel@demo.com',
  'anjali.reddy@demo.com',
  'vikram.singh@demo.com',
  'meera.iyer@demo.com'
];

async function verifyAndResetPasswords() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('MongoDB connected\n');

    const newPassword = 'demo1234';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    console.log('Resetting passwords for demo accounts...\n');

    for (const email of demoEmails) {
      const user = await User.findOne({ email });
      
      if (user) {
        // Set the plain password - the pre-save hook will hash it
        user.password = newPassword;
        await user.save();
        
        // Verify the password works
        const isValid = await user.comparePassword(newPassword);
        console.log(`✓ ${user.name} (${email})`);
        console.log(`  Email: ${email}`);
        console.log(`  Password: demo1234`);
        console.log(`  Status: ${isValid ? '✅ Working' : '❌ Failed'}`);
        console.log('');
      } else {
        console.log(`✗ User not found: ${email}\n`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('All passwords have been reset to: demo1234');
    console.log('='.repeat(60));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

verifyAndResetPasswords();
