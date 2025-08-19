/**
 * Utility functions for error handling and serialization
 */

export interface SerializedError {
  message: string;
  name?: string;
  stack?: string;
  value?: string;
  [key: string]: unknown;
}

/**
 * Serialize an error object to a safe format for logging and transmission
 * @param error - The error to serialize
 * @returns SerializedError - A safe representation of the error
 */
export function serializeError(error: unknown): SerializedError {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack,
    };
  }

  return {
    message: String(error),
    value: String(error),
  };
}

/**
 * Create a standardized error details object for API responses
 * @param error - The error to serialize
 * @returns object - A safe error details object
 */
export function createErrorDetails(error: unknown): Record<string, unknown> {
  return serializeError(error);
}
