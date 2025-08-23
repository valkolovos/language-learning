import { Lesson, PracticePhrase, MicroTip } from "../types/lesson";
import { AUDIO_IDS } from "../constants/audio";

// Micro-tips for each phrase (≤ 60 characters each, phrase-specific)
export const MICRO_TIPS: MicroTip[] = [
  // Phrase 1: Γειά σου (Hello)
  {
    id: "tip-1-1",
    text: "Say 'ya soo' - the 'γ' is silent",
    phraseId: "phrase-1",
  },
  {
    id: "tip-1-2",
    text: "Stress the second syllable 'soo'",
    phraseId: "phrase-1",
  },
  {
    id: "tip-1-3",
    text: "Keep it casual and friendly",
    phraseId: "phrase-1",
  },

  // Phrase 2: πώς είσαι; (how are you?)
  {
    id: "tip-2-1",
    text: "πώς sounds like 'pos' with 'o' as in 'go'",
    phraseId: "phrase-2",
  },
  {
    id: "tip-2-2",
    text: "είσαι is 'ee-seh' - stress the first syllable",
    phraseId: "phrase-2",
  },
  {
    id: "tip-2-3",
    text: "The question mark goes at the end",
    phraseId: "phrase-2",
  },

  // Phrase 3: Καλά, ευχαριστώ (Good, thank you)
  {
    id: "tip-3-1",
    text: "Καλά is 'ka-la' - both 'a's like in 'father'",
    phraseId: "phrase-3",
  },
  {
    id: "tip-3-2",
    text: "ευχαριστώ is 'ef-ha-ree-sto' - stress 'sto'",
    phraseId: "phrase-3",
  },
  {
    id: "tip-3-3",
    text: "Comma separates the two parts",
    phraseId: "phrase-3",
  },
];

export const SAMPLE_LESSON: Lesson = {
  id: "meet-greet-001",
  title: "Meet & Greet",
  mainLine: {
    nativeText: "Γειά σου, πώς είσαι;",
    gloss: "Hello, how are you?",
    tips: "A friendly greeting in Greek",
    audio: {
      type: "tts",
      id: AUDIO_IDS.MAIN_LINE,
      text: "Γειά σου, πώς είσαι;",
      duration: 2.3,
      volume: 0.8,
      language: "el-GR", // Greek language code
    },
  },
  phrases: [
    {
      id: "phrase-1",
      nativeText: "Γειά σου",
      gloss: "Hello",
      tips: 'Informal greeting, pronounced "ya soo"',
      audio: {
        type: "tts",
        id: AUDIO_IDS.PHRASE_1,
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
      tips: 'Question form, literally "how are you?"',
      audio: {
        type: "tts",
        id: AUDIO_IDS.PHRASE_2,
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
      tips: 'Common response to "how are you?"',
      audio: {
        type: "tts",
        id: AUDIO_IDS.PHRASE_3,
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

// Enhanced lesson with practice configuration for D2
export const SAMPLE_PRACTICE_LESSON: Lesson & {
  practicePhrases: PracticePhrase[];
} = {
  ...SAMPLE_LESSON,
  practicePhrases: [
    {
      id: "phrase-1",
      nativeText: "Γειά σου",
      gloss: "Hello",
      tips: 'Informal greeting, pronounced "ya soo"',
      audio: {
        type: "tts",
        id: AUDIO_IDS.PHRASE_1,
        text: "Γειά σου",
        duration: 1.0,
        volume: 0.8,
        language: "el-GR",
      },
      microTips: MICRO_TIPS.filter((tip) => tip.phraseId === "phrase-1"),
      maxAttempts: 5,
      skipAfterAttempts: 3,
    },
    {
      id: "phrase-2",
      nativeText: "πώς είσαι;",
      gloss: "how are you?",
      tips: 'Question form, literally "how are you?"',
      audio: {
        type: "tts",
        id: AUDIO_IDS.PHRASE_2,
        text: "πώς είσαι;",
        duration: 1.3,
        volume: 0.8,
        language: "el-GR",
      },
      microTips: MICRO_TIPS.filter((tip) => tip.phraseId === "phrase-2"),
      maxAttempts: 5,
      skipAfterAttempts: 3,
    },
    {
      id: "phrase-3",
      nativeText: "Καλά, ευχαριστώ",
      gloss: "Good, thank you",
      tips: 'Common response to "how are you?"',
      audio: {
        type: "tts",
        id: AUDIO_IDS.PHRASE_3,
        text: "Καλά, ευχαριστώ",
        duration: 1.4,
        volume: 0.8,
        language: "el-GR",
      },
      microTips: MICRO_TIPS.filter((tip) => tip.phraseId === "phrase-3"),
      maxAttempts: 5,
      skipAfterAttempts: 3,
    },
  ],
};

export const AVAILABLE_LESSON_IDS = ["meet-greet-001"];
