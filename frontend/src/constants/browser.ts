/**
 * Browser compatibility and requirements configuration
 * Centralized location for browser-specific requirements to avoid hardcoding
 * throughout the codebase and simplify maintenance.
 */

export const BROWSER_REQUIREMENTS = {
  SPEECH_SYNTHESIS: {
    MINIMUM_VERSIONS: {
      CHROME: "33",
      SAFARI: "7",
      EDGE: "79",
      FIREFOX: "49",
    },
    SUPPORTED_BROWSERS: ["Chrome 33+", "Safari 7+", "Edge 79+", "Firefox 49+"],
    FEATURE_NAME: "Web Speech API - Speech Synthesis",
    DOCUMENTATION_URL:
      "https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API#browser_compatibility",
  },
} as const;

export const BROWSER_MESSAGES = {
  SPEECH_SYNTHESIS_UNSUPPORTED: {
    USER_FRIENDLY: "Speech synthesis is not supported in your browser.",
    DETAILED:
      "This feature requires a modern browser with speech synthesis support. Supported browsers include Chrome 33+, Safari 7+, Edge 79+, and Firefox 49+. Consider updating your browser or using a supported browser for the best experience.",
  },
} as const;
