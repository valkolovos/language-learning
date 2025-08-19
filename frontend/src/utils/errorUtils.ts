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
  helpUrl?: string;
  [key: string]: unknown;
}

/**
 * Create an ExtendedError with user-friendly messaging
 * @param message - Technical error message
 * @param userMessage - User-friendly error message
 * @param technicalDetails - Detailed technical information
 * @param helpUrl - URL for help documentation
 * @returns ExtendedError - Enhanced error with user-friendly properties
 */
export function createExtendedError(
  message: string,
  userMessage: string,
  technicalDetails: string,
  helpUrl: string,
): ExtendedError {
  const error = new Error(message) as ExtendedError;
  error.userMessage = userMessage;
  error.technicalDetails = technicalDetails;
  error.helpUrl = helpUrl;
  return error;
}

/**
 * Check if an error is an ExtendedError
 * @param error - The error to check
 * @returns boolean - True if the error has ExtendedError properties
 */
export function isExtendedError(error: unknown): error is ExtendedError {
  return (
    error instanceof Error &&
    "userMessage" in error &&
    "technicalDetails" in error &&
    "helpUrl" in error
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
      helpUrl: error.helpUrl,
    };
  }

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
