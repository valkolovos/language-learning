/**
 * Utility functions for error handling and serialization
 */

import { ExtendedError } from "../types/lesson";

export interface SerializedError {
  message: string;
  name?: string;
  stack?: string;
  value?: string;
  userMessage?: string;
  technicalDetails?: string;
  helpUrl: string; // Help URL for user guidance (required for consistency)
  [key: string]: unknown;
}

/**
 * Create an ExtendedError with user-friendly messaging
 * @param message - Technical error message
 * @param userMessage - User-friendly error message
 * @param technicalDetails - Detailed technical information (optional, defaults to message)
 * @param helpUrl - URL for help documentation (optional, defaults to empty string)
 * @returns ExtendedError - Enhanced error with user-friendly properties
 */
export function createExtendedError(
  message: string,
  userMessage: string,
  technicalDetails?: string,
  helpUrl?: string,
): ExtendedError {
  const error = new Error(message);
  return Object.assign(error, {
    userMessage,
    technicalDetails: technicalDetails || message, // Fallback to message if no technical details
    helpUrl: helpUrl || "https://help.example.com/troubleshooting", // Default help URL for consistent guidance
  }) as ExtendedError;
}

/**
 * Create an ExtendedError with minimal required information
 * @param message - Technical error message
 * @param userMessage - User-friendly error message
 * @returns ExtendedError - Enhanced error with default technical details
 */
export function createSimpleExtendedError(
  message: string,
  userMessage: string,
): ExtendedError {
  return createExtendedError(
    message,
    userMessage,
    undefined,
    "https://help.example.com/troubleshooting",
  );
}

/**
 * Create an ExtendedError without help URL for internal/development errors
 * @param message - Technical error message
 * @param userMessage - User-friendly error message
 * @param technicalDetails - Detailed technical information (optional)
 * @returns ExtendedError - Enhanced error without help URL
 */
export function createInternalError(
  message: string,
  userMessage: string,
  technicalDetails?: string,
): ExtendedError {
  return createExtendedError(
    message,
    userMessage,
    technicalDetails,
    "https://help.example.com/internal-errors",
  );
}

/**
 * Wrap an existing Error object into an ExtendedError
 * @param error - The original error to wrap
 * @param userMessage - User-friendly error message
 * @param helpUrl - URL for help documentation (optional)
 * @returns ExtendedError - Enhanced error wrapping the original
 */
export function wrapError(
  error: Error,
  userMessage: string,
  helpUrl?: string,
): ExtendedError {
  return createExtendedError(
    error.message,
    userMessage,
    error.stack || error.message,
    helpUrl || "https://help.example.com/troubleshooting",
  );
}

/**
 * Check if an error is an ExtendedError
 * @param error - The error to check
 * @returns boolean - True if the error has ExtendedError properties
 */
export function isExtendedError(error: unknown): error is ExtendedError {
  return (
    error instanceof Error &&
    typeof (error as unknown as Record<string, unknown>).userMessage ===
      "string" &&
    typeof (error as unknown as Record<string, unknown>).technicalDetails ===
      "string" &&
    typeof (error as unknown as Record<string, unknown>).helpUrl === "string"
  );
}

/**
 * Get user-friendly error message, falling back to technical message
 * @param error - The error to extract message from
 * @returns string - User-friendly message if available, otherwise technical message
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (isExtendedError(error)) {
    return error.userMessage;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

/**
 * Serialize an error object to a safe format for logging and transmission
 * @param error - The error to serialize
 * @returns SerializedError - A safe representation of the error
 */
export function serializeError(error: unknown): SerializedError {
  if (isExtendedError(error)) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack,
      userMessage: error.userMessage,
      technicalDetails: error.technicalDetails,
      helpUrl: error.helpUrl, // This is now always defined
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack,
      helpUrl: "https://help.example.com/troubleshooting", // Default help URL for regular errors
    };
  }

  return {
    message: String(error),
    value: String(error),
    helpUrl: "https://help.example.com/troubleshooting", // Default help URL for unknown errors
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
