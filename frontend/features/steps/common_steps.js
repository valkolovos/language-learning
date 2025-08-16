const { Given } = require('@cucumber/cucumber');
const { expect } = require('chai');

// Mock data for the "Meet & Greet" lesson
const mockLesson = {
  id: "meet-greet-001",
  title: "Meet & Greet",
  mainLine: {
    nativeText: "Γειά σου, πώς είσαι;",
    gloss: "Hello, how are you?",
    audio: {
      type: "tts",
      id: "main-line-audio",
      text: "Γειά σου, πώς είσαι;",
      duration: 2.3,
      volume: 0.8,
      language: "el-GR",
    },
  },
  phrases: [
    {
      id: "phrase-1",
      nativeText: "Γειά σου",
      gloss: "Hello",
      audio: {
        type: "tts",
        id: "phrase-1-audio",
        text: "Γειά σου",
        duration: 1.0,
        volume: 0.8,
        language: "el-GR",
      },
    },
    {
      id: "phrase-2",
      nativeText: "πώς είσαι;",
      gloss: "how are you?",
      audio: {
        type: "tts",
        id: "phrase-2-audio",
        text: "πώς είσαι;",
        duration: 1.3,
        volume: 0.8,
        language: "el-GR",
      },
    },
    {
      id: "phrase-3",
      nativeText: "Καλά, ευχαριστώ",
      gloss: "Good, thank you",
      audio: {
        type: "tts",
        id: "phrase-3-audio",
        text: "Καλά, ευχαριστώ",
        duration: 1.4,
        volume: 0.8,
        language: "el-GR",
      },
    },
  ],
  metadata: {
    difficulty: "beginner",
    estimatedDuration: 5,
    tags: ["greetings", "greek", "beginner"],
  },
};

// Global test state that can be shared between features
global.testState = {
  lesson: null,
  playbackState: {
    isPlaying: false,
    currentAudioId: null,
    playCount: 0,
    canReveal: false,
    error: null,
  },
  textRevealed: false,
  currentPlayingPhrase: null,
  phrasePlayStates: {},
  audioService: {
    isPlaying: false,
    currentAudioId: null,
  },
  progressIndicator: {
    isComplete: false,
    progressPercentage: 0,
  },
  xpCounters: {
    lessonXP: 0,
    totalXP: 0,
    streakCount: 0,
  },
};

Given('a new learner opens the "Meet & Greet" micro-lesson', function() {
  // Simulate opening the lesson
  global.testState.lesson = mockLesson;
  global.testState.playbackState.playCount = 0;
  global.testState.playbackState.canReveal = false;
  global.testState.textRevealed = false;
  global.testState.progressIndicator.isComplete = false;
  global.testState.progressIndicator.progressPercentage = 0;
  global.testState.xpCounters.lessonXP = 0;
  global.testState.currentPlayingPhrase = null;
  global.testState.phrasePlayStates = {
    "phrase-1": false,
    "phrase-2": false,
    "phrase-3": false,
  };
});

Given('the lesson loads successfully', function() {
  // Verify lesson data is available
  expect(global.testState.lesson).to.not.be.null;
  expect(global.testState.lesson.title).to.equal('Meet & Greet');
  expect(global.testState.lesson.phrases).to.have.lengthOf(3);
});
