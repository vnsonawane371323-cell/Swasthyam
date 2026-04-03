const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  signup,
  login,
  getMe,
  updateProfile,
  completeOnboarding,
  changePassword,
  deleteAccount,
  socialAuth,
  searchUsers,
  addFamilyMember,
  removeFamilyMember,
  getFamilyMembers
} = require('../controllers/authController');

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/social', socialAuth);

// Protected routes (require authentication)
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/complete-onboarding', protect, completeOnboarding);
router.put('/change-password', protect, changePassword);
router.delete('/account', protect, deleteAccount);

// Family member routes
router.get('/search-users', protect, searchUsers);
router.get('/family', protect, getFamilyMembers);
router.post('/family', protect, addFamilyMember);
router.delete('/family/:userId', protect, removeFamilyMember);

module.exports = router;
