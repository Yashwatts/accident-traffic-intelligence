/**
 * Helper class for sending consistent API responses
 */
export class ApiResponse {
  /**
   * Send success response
   */
  static success(res, data, message, statusCode = 200, meta = {}) {
    const response = {
      success: true,
      data,
      message,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: res.locals.requestId,
        ...meta,
      },
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Send created response (201)
   */
  static created(res, data, message = 'Resource created successfully') {
    return this.success(res, data, message, 201);
  }

  /**
   * Send no content response (204)
   */
  static noContent(res) {
    return res.status(204).send();
  }

  /**
   * Send paginated response
   */
  static paginated(res, data, page, limit, total, message) {
    const totalPages = Math.ceil(total / limit);

    return this.success(
      res,
      data,
      message,
      200,
      {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      }
    );
  }

  /**
   * Send error response
   */
  static error(res, statusCode, message, code, details) {
    const response = {
      success: false,
      error: {
        code: code || 'ERROR',
        message,
        details,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: res.locals.requestId,
      },
    };

    return res.status(statusCode).json(response);
  }
}
