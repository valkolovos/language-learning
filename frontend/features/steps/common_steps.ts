import { Given } from '@cucumber/cucumber';
import { expect } from 'chai';

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
declare global {
  var testState: {
    lesson: any;
    playbackState: {
      isPlaying: boolean;
      currentAudioId: string | null;
      playCount: number;
      canReveal: boolean;
      error: string | null;
    };
    textRevealed: boolean;
    currentPlayingPhrase: string | null;
    phrasePlayStates: Record<string, boolean>;
    audioService: {
      isPlaying: boolean;
      currentAudioId: string | null;
    };
    progressIndicator: {
      isComplete: boolean;
      progressPercentage: number;
    };
    xpCounters: {
      lessonXP: number;
      totalXP: number;
      streakCount: number;
    };
  };
  var transcriptState: {
    isVisible: boolean;
    controlAvailable: boolean;
    glossTextVisible: boolean;
  };
  var telemetryState: {
    events: {
      lessonStarted: boolean;
      audioPlay: boolean;
      textRevealed: boolean;
      phraseReplay: string[];
    };
  };
}

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
  global.testState.phrasePlayStates = {};
  global.testState.xpCounters.lessonXP = 0;
  
  // Initialize new state variables for transcript and telemetry
  if (global.transcriptState) {
    global.transcriptState.controlAvailable = false;
    global.transcriptState.glossTextVisible = false;
  }
  if (global.telemetryState) {
    global.telemetryState.events.lessonStarted = true; // Lesson started when opened
    global.telemetryState.events.audioPlay = false;
    global.telemetryState.events.textRevealed = false;
    global.telemetryState.events.phraseReplay = [];
  }
  
  // Ensure canReveal is false for new lessons
  global.testState.playbackState.canReveal = false;
  
  expect(global.testState.lesson).to.not.be.null;
  expect(global.testState.lesson.id).to.equal("meet-greet-001");
});

Given('the lesson has loaded successfully', function() {
  expect(global.testState.lesson).to.not.be.null;
  expect(global.testState.lesson.mainLine).to.exist;
  expect(global.testState.lesson.phrases).to.have.length(3);
});

Given('the lesson loads successfully', function() {
  expect(global.testState.lesson).to.not.be.null;
  expect(global.testState.lesson.mainLine).to.exist;
  expect(global.testState.lesson.phrases).to.have.length(3);
});

Given('the text is hidden initially', function() {
  expect(global.testState.textRevealed).to.be.false;
});

Given('the main line audio is ready to play', function() {
  expect(global.testState.lesson.mainLine.audio).to.exist;
  expect(global.testState.lesson.mainLine.audio.type).to.equal("tts");
});

Given('the learner has not played any audio yet', function() {
  global.testState.playbackState.playCount = 0;
  global.testState.playbackState.canReveal = false;
  global.testState.progressIndicator.progressPercentage = 0;
  global.testState.xpCounters.lessonXP = 0;
  expect(global.testState.playbackState.playCount).to.equal(0);
  expect(global.testState.playbackState.canReveal).to.be.false;
});

Given('the text reveal gate is locked', function() {
  expect(global.testState.playbackState.canReveal).to.be.false;
  expect(global.testState.textRevealed).to.be.false;
});

Given('the learner has played the main line once', function() {
  global.testState.playbackState.playCount = 1;
  expect(global.testState.playbackState.playCount).to.equal(1);
});

Given('the learner has played the main line twice', function() {
  global.testState.playbackState.playCount = 2;
  global.testState.playbackState.canReveal = true;
  expect(global.testState.playbackState.playCount).to.equal(2);
  expect(global.testState.playbackState.canReveal).to.be.true;
});

Given('the text has been revealed', function() {
  global.testState.textRevealed = true;
  global.testState.playbackState.canReveal = true; // Set canReveal when text is revealed
  
  // Initialize transcript state when text is revealed
  if (global.transcriptState) {
    global.transcriptState.controlAvailable = true;
    global.transcriptState.glossTextVisible = true;
  }
  
  expect(global.testState.textRevealed).to.be.true;
});

Given('the learner can see the practice phrases', function() {
  expect(global.testState.textRevealed).to.be.true;
  expect(global.testState.lesson.phrases).to.have.length(3);
});

Given('no phrases have been played yet', function() {
  expect(global.testState.phrasePlayStates).to.be.empty;
});

Given('the learner has played at least one phrase', function() {
  global.testState.phrasePlayStates["phrase-1"] = true;
  expect(Object.keys(global.testState.phrasePlayStates)).to.have.length(1);
});

Given('the lesson is complete', function() {
  global.testState.progressIndicator.isComplete = true;
  global.testState.progressIndicator.progressPercentage = 100;
  expect(global.testState.progressIndicator.isComplete).to.be.true;
  expect(global.testState.progressIndicator.progressPercentage).to.equal(100);
});
