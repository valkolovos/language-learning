import { Lesson } from "../types/lesson";
import { AUDIO_IDS } from "../constants/audio";

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

export const AVAILABLE_LESSON_IDS = ["meet-greet-001"];
