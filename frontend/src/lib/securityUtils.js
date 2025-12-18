/**
 * Frontend Security Utilities
 * 
 * Client-side security enhancements:
 * - Input sanitization
 * - XSS prevention
 * - CSRF protection
 * - Secure storage
 */

import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHTML(dirty) {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target']
  });
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePassword(password) {
  const errors = [];
  
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
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Calculate password strength (0-100)
 */
export function calculatePasswordStrength(password) {
  let strength = 0;
  
  if (password.length >= 8) strength += 20;
  if (password.length >= 12) strength += 10;
  if (password.length >= 16) strength += 10;
  if (/[a-z]/.test(password)) strength += 15;
  if (/[A-Z]/.test(password)) strength += 15;
  if (/[0-9]/.test(password)) strength += 15;
  if (/[^A-Za-z0-9]/.test(password)) strength += 15;
  
  return Math.min(strength, 100);
}

/**
 * Secure localStorage wrapper
 * Encrypts sensitive data before storage
 */
export const secureStorage = {
  set(key, value) {
    try {
      const encrypted = btoa(JSON.stringify(value)); // Simple encoding, use proper encryption in production
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Failed to store data:', error);
    }
  },
  
  get(key) {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;
      return JSON.parse(atob(encrypted));
    } catch (error) {
      console.error('Failed to retrieve data:', error);
      return null;
    }
  },
  
  remove(key) {
    localStorage.removeItem(key);
  },
  
  clear() {
    localStorage.clear();
  }
};

/**
 * Generate CSRF token
 */
export function generateCSRFToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate input against common injection patterns
 */
export function detectInjection(input) {
  const injectionPatterns = [
    /(\b)(union|select|insert|update|delete|drop|create|alter)(\b)/gi,
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /eval\(/gi,
    /expression\(/gi
  ];
  
  return injectionPatterns.some(pattern => pattern.test(input));
}

/**
 * Rate limiting helper for frontend
 */
export class ClientRateLimiter {
  constructor(maxRequests, timeWindow) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.requests = [];
  }
  
  canMakeRequest() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }
  
  reset() {
    this.requests = [];
  }
  
  getWaitTime() {
    if (this.requests.length < this.maxRequests) return 0;
    
    const oldestRequest = Math.min(...this.requests);
    const waitTime = this.timeWindow - (Date.now() - oldestRequest);
    return Math.max(0, waitTime);
  }
}

/**
 * Validate file before upload
 */
export function validateFile(file, options = {}) {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif']
  } = options;
  
  const errors = [];
  
  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size must not exceed ${maxSize / (1024 * 1024)}MB`);
  }
  
  // Check MIME type
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`);
  }
  
  // Check file extension
  const extension = '.' + file.name.split('.').pop().toLowerCase();
  if (!allowedExtensions.includes(extension)) {
    errors.push(`File extension ${extension} is not allowed`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Debounce for security-sensitive operations
 */
export function secureDebounce(func, wait) {
  let timeout;
  let lastCallTime = 0;
  
  return function executedFunction(...args) {
    const now = Date.now();
    
    // Prevent rapid-fire calls
    if (now - lastCallTime < 100) {
      console.warn('Rapid-fire detected, ignoring call');
      return;
    }
    
    lastCallTime = now;
    
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * Prevent clickjacking
 */
export function preventClickjacking() {
  if (window.top !== window.self) {
    // Page is in an iframe, might be clickjacking attempt
    console.warn('Potential clickjacking detected');
    window.top.location = window.self.location;
  }
}

/**
 * Validate coordinates
 */
export function validateCoordinates(lat, lng) {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  
  return (
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .substring(0, 255);
}

/**
 * Check if content contains profanity/inappropriate content
 * (Simple word list check - use a proper library in production)
 */
const profanityList = ['badword1', 'badword2']; // Add actual words

export function containsProfanity(text) {
  const lowerText = text.toLowerCase();
  return profanityList.some(word => lowerText.includes(word));
}

/**
 * Auto-logout on inactivity
 */
export function setupInactivityLogout(timeout = 30 * 60 * 1000, onLogout) {
  let inactivityTimer;
  
  const resetTimer = () => {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      console.log('Auto-logout due to inactivity');
      onLogout();
    }, timeout);
  };
  
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
  events.forEach(event => {
    document.addEventListener(event, resetTimer, true);
  });
  
  resetTimer();
  
  return () => {
    clearTimeout(inactivityTimer);
    events.forEach(event => {
      document.removeEventListener(event, resetTimer, true);
    });
  };
}

export default {
  sanitizeHTML,
  sanitizeInput,
  isValidEmail,
  validatePassword,
  calculatePasswordStrength,
  secureStorage,
  generateCSRFToken,
  detectInjection,
  ClientRateLimiter,
  validateFile,
  secureDebounce,
  preventClickjacking,
  validateCoordinates,
  sanitizeFilename,
  containsProfanity,
  setupInactivityLogout
};
