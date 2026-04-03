/**
 * Email validation regex
 */
const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return emailRegex.test(email.trim());
};

/**
 * Validate password strength
 * Requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * @param {string} password - Password to validate
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
const validatePassword = (password) => {
  const errors = [];
  
  if (!password || typeof password !== 'string') {
    return { isValid: false, errors: ['Password is required'] };
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate signup data
 * @param {Object} data - Signup data
 * @returns {Object} { isValid: boolean, errors: Object }
 */
const validateSignup = (data) => {
  const errors = {};
  
  // Email validation
  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  // Password validation
  if (!data.password) {
    errors.password = 'Password is required';
  } else {
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors.join('. ');
    }
  }
  
  // Name validation (optional during signup)
  if (data.name && data.name.length > 100) {
    errors.name = 'Name cannot exceed 100 characters';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate login data
 * @param {Object} data - Login data
 * @returns {Object} { isValid: boolean, errors: Object }
 */
const validateLogin = (data) => {
  const errors = {};
  
  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (!data.password) {
    errors.password = 'Password is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate onboarding data
 * @param {Object} data - Onboarding data
 * @returns {Object} { isValid: boolean, errors: Object }
 */
const validateOnboarding = (data) => {
  const errors = {};
  
  // Age validation
  if (data.age !== undefined && data.age !== null && data.age !== '') {
    const age = Number(data.age);
    if (isNaN(age) || age < 1 || age > 150) {
      errors.age = 'Age must be between 1 and 150';
    }
  }
  
  // Height validation
  if (data.height !== undefined && data.height !== null && data.height !== '') {
    const height = Number(data.height);
    if (isNaN(height) || height < 30 || height > 300) {
      errors.height = 'Height must be between 30 and 300 cm';
    }
  }
  
  // Weight validation
  if (data.weight !== undefined && data.weight !== null && data.weight !== '') {
    const weight = Number(data.weight);
    if (isNaN(weight) || weight < 1 || weight > 500) {
      errors.weight = 'Weight must be between 1 and 500 kg';
    }
  }
  
  // Gender validation
  const validGenders = ['male', 'female', 'other', 'prefer-not-to-say', ''];
  if (data.gender && !validGenders.includes(data.gender)) {
    errors.gender = 'Invalid gender value';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Sanitize string input
 * @param {string} str - String to sanitize
 * @returns {string}
 */
const sanitizeString = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.trim().replace(/[<>]/g, '');
};

module.exports = {
  isValidEmail,
  validatePassword,
  validateSignup,
  validateLogin,
  validateOnboarding,
  sanitizeString
};
