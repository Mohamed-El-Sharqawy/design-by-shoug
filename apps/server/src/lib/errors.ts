import { Elysia } from "elysia";

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, 403, "FORBIDDEN");
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, "VALIDATION_ERROR");
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, "CONFLICT");
  }
}

export const errorHandler = new Elysia({ name: "error-handler" }).onError(
  ({ error, set }) => {
    if (error instanceof AppError) {
      set.status = error.statusCode;
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
        },
      };
    }

    if (error instanceof Error) {
      if (error.name === "ValidationError") {
        set.status = 400;
        return {
          success: false,
          error: {
            message: error.message,
            code: "VALIDATION_ERROR",
          },
        };
      }

      console.error("Unhandled error:", error);
      set.status = 500;
      return {
        success: false,
        error: {
          message: "Internal server error",
          code: "INTERNAL_ERROR",
        },
      };
    }

    set.status = 500;
    return {
      success: false,
      error: {
        message: "Unknown error",
        code: "UNKNOWN_ERROR",
      },
    };
  }
);
