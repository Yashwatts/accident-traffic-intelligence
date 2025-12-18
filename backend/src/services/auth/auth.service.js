import jwt from 'jsonwebtoken';
import { User } from '../user/user.model.js';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';

/**
 * Generate JWT access token
 */
const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

/**
 * Generate JWT refresh token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });
};

/**
 * Register a new user
 */
export const register = async (userData) => {
  const { email, password, firstName, lastName, phoneNumber } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw ApiError.conflict('User with this email already exists');
  }

  // Create new user
  const user = new User({
    email: email.toLowerCase(),
    passwordHash: password,
    firstName,
    lastName,
    phoneNumber,
    role: 'citizen',
    status: 'active',
  });

  await user.save();

  // Generate tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Update user with refresh token
  user.refreshTokens = [{ token: refreshToken }];
  await user.save();

  logger.info('User registered successfully', {
    userId: user._id,
    email: user.email,
  });

  // Return user without sensitive data
  const userObj = user.toObject();
  delete userObj.passwordHash;
  delete userObj.refreshTokens;

  return {
    user: userObj,
    accessToken,
    refreshToken,
  };
};

/**
 * Login user
 */
export const login = async (email, password) => {
  // Find user with password field
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');

  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Check if account is active
  if (user.status !== 'active') {
    throw ApiError.forbidden(`Account is ${user.status}`);
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    // Update failed login attempts
    user.security.failedLoginAttempts += 1;
    user.security.lastFailedLogin = new Date();
    
    if (user.security.failedLoginAttempts >= 5) {
      user.status = 'suspended';
      await user.save();
      throw ApiError.forbidden('Account suspended due to multiple failed login attempts');
    }
    
    await user.save();
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Reset failed login attempts on successful login
  user.security.failedLoginAttempts = 0;
  user.security.lastLogin = new Date();

  // Generate tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Update refresh tokens (keep last 5)
  user.refreshTokens = user.refreshTokens || [];
  user.refreshTokens.push({ token: refreshToken });
  if (user.refreshTokens.length > 5) {
    user.refreshTokens = user.refreshTokens.slice(-5);
  }

  await user.save();

  logger.info('User logged in successfully', {
    userId: user._id,
    email: user.email,
  });

  // Return user without sensitive data
  const userObj = user.toObject();
  delete userObj.passwordHash;
  delete userObj.refreshTokens;

  return {
    user: userObj,
    accessToken,
    refreshToken,
  };
};

/**
 * Refresh access token
 */
export const refreshAccessToken = async (refreshToken) => {
  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);

    // Find user and check if refresh token exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    const tokenExists = user.refreshTokens?.some((rt) => rt.token === refreshToken);
    if (!tokenExists) {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user._id);

    logger.info('Access token refreshed', { userId: user._id });

    return {
      accessToken: newAccessToken,
    };
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }
    throw error;
  }
};

/**
 * Logout user (invalidate refresh token)
 */
export const logout = async (userId, refreshToken) => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Remove the refresh token
  user.refreshTokens = user.refreshTokens?.filter((rt) => rt.token !== refreshToken) || [];
  await user.save();

  logger.info('User logged out', { userId });

  return { message: 'Logged out successfully' };
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const userObj = user.toObject();
  delete userObj.passwordHash;
  delete userObj.refreshTokens;

  return userObj;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId, updateData) => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Allow updating only specific fields
  const allowedFields = ['firstName', 'lastName', 'phoneNumber', 'notificationPreferences'];
  const updates = {};

  allowedFields.forEach(field => {
    if (updateData[field] !== undefined) {
      updates[field] = updateData[field];
    }
  });

  // Handle notification preferences specially
  if (updateData.pushNotifications !== undefined || 
      updateData.emailNotifications !== undefined || 
      updateData.smsNotifications !== undefined ||
      updateData.alertRadius !== undefined) {
    updates.notificationPreferences = {
      ...user.notificationPreferences,
      push: updateData.pushNotifications ?? user.notificationPreferences?.push ?? true,
      email: updateData.emailNotifications ?? user.notificationPreferences?.email ?? true,
      sms: updateData.smsNotifications ?? user.notificationPreferences?.sms ?? false,
      alertRadius: updateData.alertRadius ?? user.notificationPreferences?.alertRadius ?? 10,
    };
  }

  Object.assign(user, updates);
  await user.save();

  logger.info('User profile updated', { userId: user._id });

  const userObj = user.toObject();
  delete userObj.passwordHash;
  delete userObj.refreshTokens;

  return userObj;
};
