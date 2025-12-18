import * as authService from './auth.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';

/**
 * Register new user
 * POST /api/v1/auth/register
 */
export const registerController = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phoneNumber } = req.body;

    const result = await authService.register({
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
    });

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return ApiResponse.created(
      res,
      {
        user: result.user,
        accessToken: result.accessToken,
      },
      'User registered successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * POST /api/v1/auth/login
 */
export const loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw ApiError.badRequest('Email and password are required');
    }

    const result = await authService.login(email, password);

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return ApiResponse.success(
      res,
      {
        user: result.user,
        accessToken: result.accessToken,
      },
      'Logged in successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token
 * POST /api/v1/auth/refresh
 */
export const refreshTokenController = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      throw ApiError.unauthorized('Refresh token is required');
    }

    const result = await authService.refreshAccessToken(refreshToken);

    return ApiResponse.success(res, result, 'Token refreshed successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 * POST /api/v1/auth/logout
 */
export const logoutController = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const userId = req.user?.id;

    if (userId && refreshToken) {
      await authService.logout(userId, refreshToken);
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    return ApiResponse.success(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user
 * GET /api/v1/auth/me
 */
export const getCurrentUserController = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw ApiError.unauthorized('Not authenticated');
    }

    const user = await authService.getCurrentUser(userId);

    return ApiResponse.success(res, user, 'User profile retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 * PATCH /api/v1/auth/profile
 */
export const updateProfileController = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw ApiError.unauthorized('Not authenticated');
    }

    const updateData = req.body;
    const user = await authService.updateUserProfile(userId, updateData);

    return ApiResponse.success(res, user, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};
