import log from "loglevel";

// Configure loglevel based on environment
if (process.env.NODE_ENV === "production") {
  log.setLevel(log.levels.ERROR); // Only show errors in production
} else {
  log.setLevel(log.levels.DEBUG); // Show all logs in development
}

// Override with environment variable if set
const envLogLevel = process.env.REACT_APP_LOG_LEVEL;
if (envLogLevel) {
  const levelMap: { [key: string]: log.LogLevelDesc } = {
    trace: log.levels.TRACE,
    debug: log.levels.DEBUG,
    info: log.levels.INFO,
    warn: log.levels.WARN,
    error: log.levels.ERROR,
    silent: log.levels.SILENT,
  };

  if (envLogLevel in levelMap) {
    log.setLevel(levelMap[envLogLevel]);
  }
}

// Export configured logger
export default log;

// Export convenience functions for common logging patterns
export const logUserAction = (
  action: string,
  context?: Record<string, unknown>,
) => {
  log.info("User action:", { action, ...context });
};

export const logLearningProgress = (
  lessonId: string,
  progress: number,
  context?: Record<string, unknown>,
) => {
  log.info("Learning progress:", { lessonId, progress, ...context });
};

export const logAudioPlayback = (
  audioId: string,
  action: string,
  context?: Record<string, unknown>,
) => {
  log.debug("Audio playback:", { audioId, action, ...context });
};

export const logLessonLoad = (
  lessonId: string,
  success: boolean,
  context?: Record<string, unknown>,
) => {
  if (success) {
    log.info("Lesson loaded successfully:", { lessonId, ...context });
  } else {
    log.error("Failed to load lesson:", { lessonId, ...context });
  }
};
