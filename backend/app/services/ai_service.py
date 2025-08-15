"""
AI service integration for language learning features.
"""

import json
from datetime import datetime
from typing import Any, Dict, List, Optional

# OpenAI imports
import openai
import structlog
from google.auth import default

# Google Cloud imports
from google.cloud import aiplatform, speech, texttospeech, translate

from app.core.config import settings
from app.core.logging import log_ai_interaction

logger = structlog.get_logger(__name__)


class AIService:
    """AI service for language learning features."""

    def __init__(self) -> None:
        """Initialize AI service with credentials."""
        self.google_project = settings.GOOGLE_CLOUD_PROJECT
        self.openai_client: Optional[openai.AsyncOpenAI] = None
        self.translate_client: Optional[translate.TranslationServiceClient] = None
        self.tts_client: Optional[texttospeech.TextToSpeechClient] = None
        self.speech_client: Optional[speech.SpeechClient] = None

        # Initialize Google Cloud clients
        try:
            credentials, project = default()
            logger.info("Google Cloud credentials obtained successfully")
        except Exception as e:
            logger.error("Failed to obtain Google Cloud credentials", error=str(e))
            self.translate_client = None
            self.tts_client = None
            self.speech_client = None
            return

        # Initialize Translation Service
        try:
            self.translate_client = translate.TranslationServiceClient()
            logger.info("Google Cloud Translation service initialized successfully")
        except Exception as e:
            logger.error("Failed to initialize Google Cloud Translation service", error=str(e))
            self.translate_client = None

        # Initialize Text-to-Speech Service
        try:
            self.tts_client = texttospeech.TextToSpeechClient()
            logger.info("Google Cloud Text-to-Speech service initialized successfully")
        except Exception as e:
            logger.error("Failed to initialize Google Cloud Text-to-Speech service", error=str(e))
            self.tts_client = None

        # Initialize Speech-to-Text Service
        try:
            self.speech_client = speech.SpeechClient()
            logger.info("Google Cloud Speech-to-Text service initialized successfully")
        except Exception as e:
            logger.error("Failed to initialize Google Cloud Speech-to-Text service", error=str(e))
            self.speech_client = None

        # Initialize Vertex AI
        try:
            aiplatform.init(project=self.google_project, location="us-central1")
            logger.info("Google Cloud Vertex AI initialized successfully")
        except Exception as e:
            logger.error("Failed to initialize Google Cloud Vertex AI", error=str(e))

        # Log summary of initialization status
        services_status = {
            "translation": self.translate_client is not None,
            "text_to_speech": self.tts_client is not None,
            "speech_to_text": self.speech_client is not None,
        }
        logger.info("Google Cloud services initialization summary", services_status=services_status)

        # Initialize OpenAI client
        if settings.OPENAI_API_KEY:
            try:
                self.openai_client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
                logger.info("OpenAI client initialized successfully")
            except Exception as e:
                logger.error("Failed to initialize OpenAI client", error=str(e))

    async def translate_text(self, text: str, source_language: str, target_language: str) -> Dict[str, Any]:
        """Translate text using Google Cloud Translate."""
        if not self.translate_client:
            return {"error": "Translation service not available"}

        try:
            start_time = datetime.now()

            # Perform translation
            response = self.translate_client.translate_text(
                request={
                    "parent": f"projects/{self.google_project}/locations/global",
                    "contents": [text],
                    "mime_type": "text/plain",
                    "source_language_code": source_language,
                    "target_language_code": target_language,
                }
            )

            translation = response.translations[0].translated_text
            processing_time = (datetime.now() - start_time).total_seconds()

            log_ai_interaction(
                interaction_type="translation",
                model="google_translate",
                source_language=source_language,
                target_language=target_language,
                text_length=len(text),
                processing_time=processing_time,
            )

            return {
                "translated_text": translation,
                "source_language": source_language,
                "target_language": target_language,
                "confidence": 0.95,  # Google Translate doesn't provide confidence scores
                "processing_time": processing_time,
            }

        except Exception as e:
            logger.error("Translation failed", error=str(e), text=text)
            return {"error": f"Translation failed: {str(e)}"}

    async def text_to_speech(self, text: str, language_code: str, voice_name: Optional[str] = None) -> Dict[str, Any]:
        """Convert text to speech using Google Cloud Text-to-Speech."""
        if not self.tts_client:
            return {"error": "Text-to-speech service not available"}

        try:
            start_time = datetime.now()

            # Set up voice selection
            if not voice_name:
                # Default voice selection based on language
                voice_name = self._get_default_voice(language_code)

            # Configure synthesis input
            synthesis_input = texttospeech.SynthesisInput(text=text)

            # Configure voice
            voice = texttospeech.VoiceSelectionParams(
                language_code=language_code,
                name=voice_name,
                ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL,
            )

            # Configure audio
            audio_config = texttospeech.AudioConfig(
                audio_encoding=texttospeech.AudioEncoding.MP3,
                speaking_rate=0.8,  # Slightly slower for language learning
                pitch=0.0,
            )

            # Perform synthesis
            response = self.tts_client.synthesize_speech(input=synthesis_input, voice=voice, audio_config=audio_config)

            processing_time = (datetime.now() - start_time).total_seconds()

            log_ai_interaction(
                interaction_type="text_to_speech",
                model="google_tts",
                language_code=language_code,
                voice_name=voice_name,
                text_length=len(text),
                processing_time=processing_time,
            )

            return {
                "audio_content": response.audio_content,
                "language_code": language_code,
                "voice_name": voice_name,
                "processing_time": processing_time,
                "audio_format": "mp3",
            }

        except Exception as e:
            logger.error("Text-to-speech failed", error=str(e), text=text)
            return {"error": f"Text-to-speech failed: {str(e)}"}

    async def speech_to_text(self, audio_content: bytes, language_code: str) -> Dict[str, Any]:
        """Convert speech to text using Google Cloud Speech-to-Text."""
        if not self.speech_client:
            return {"error": "Speech-to-text service not available"}

        try:
            start_time = datetime.now()

            # Configure audio
            audio = speech.RecognitionAudio(content=audio_content)

            # Configure recognition
            config = speech.RecognitionConfig(
                encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
                sample_rate_hertz=16000,
                language_code=language_code,
                enable_automatic_punctuation=True,
                enable_word_time_offsets=True,
                model="latest_long",  # Better for longer audio
            )

            # Perform recognition
            response = self.speech_client.recognize(config=config, audio=audio)

            processing_time = (datetime.now() - start_time).total_seconds()

            # Extract results
            transcriptions = []
            for result in response.results:
                transcriptions.append(
                    {
                        "transcript": result.alternatives[0].transcript,
                        "confidence": result.alternatives[0].confidence,
                        "words": (
                            [
                                {
                                    "word": word.word,
                                    "start_time": word.start_time.total_seconds(),
                                    "end_time": word.end_time.total_seconds(),
                                }
                                for word in result.alternatives[0].words
                            ]
                            if hasattr(result.alternatives[0], "words")
                            else []
                        ),
                    }
                )

            log_ai_interaction(
                interaction_type="speech_to_text",
                model="google_speech",
                language_code=language_code,
                audio_length=len(audio_content),
                processing_time=processing_time,
            )

            return {
                "transcriptions": transcriptions,
                "language_code": language_code,
                "processing_time": processing_time,
                "best_transcript": (transcriptions[0]["transcript"] if transcriptions else ""),
            }

        except Exception as e:
            logger.error("Speech-to-text failed", error=str(e))
            return {"error": f"Speech-to-text failed: {str(e)}"}

    async def generate_lesson_content(
        self,
        topic: str,
        difficulty_level: str,
        target_language: str,
        native_language: str = "en",
    ) -> Dict[str, Any]:
        """Generate lesson content using OpenAI."""
        if not self.openai_client:
            return {"error": "OpenAI service not available"}

        try:
            start_time = datetime.now()

            # Create prompt for lesson generation
            prompt = self._create_lesson_prompt(topic, difficulty_level, target_language, native_language)

            # Generate content using OpenAI
            response = await self.openai_client.chat.completions.create(
                model=settings.AI_MODEL_NAME,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are an expert language teacher specializing in creating "
                            "engaging, research-based language learning content."
                        ),
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.7,
                max_tokens=2000,
            )

            # Parse response
            content = response.choices[0].message.content
            if not content:
                return {"error": "No content generated by AI model"}

            processing_time = (datetime.now() - start_time).total_seconds()

            # Parse the generated content
            lesson_content = self._parse_lesson_content(content)

            log_ai_interaction(
                interaction_type="lesson_generation",
                model=settings.AI_MODEL_NAME,
                topic=topic,
                difficulty_level=difficulty_level,
                target_language=target_language,
                processing_time=processing_time,
            )

            return {
                "lesson_content": lesson_content,
                "topic": topic,
                "difficulty_level": difficulty_level,
                "target_language": target_language,
                "processing_time": processing_time,
            }

        except Exception as e:
            logger.error("Lesson generation failed", error=str(e), topic=topic)
            return {"error": f"Lesson generation failed: {str(e)}"}

    async def generate_exercises(self, lesson_content: Dict[str, Any], exercise_count: int = 5) -> Dict[str, Any]:
        """Generate exercises based on lesson content."""
        if not self.openai_client:
            return {"error": "OpenAI service not available"}

        try:
            start_time = datetime.now()

            # Create prompt for exercise generation
            prompt = self._create_exercise_prompt(lesson_content, exercise_count)

            # Generate exercises
            response = await self.openai_client.chat.completions.create(
                model=settings.AI_MODEL_NAME,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are an expert language teacher creating engaging " "exercises for language learning."
                        ),
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.8,
                max_tokens=1500,
            )

            content = response.choices[0].message.content
            if not content:
                return {"error": "No content generated by AI model"}

            processing_time = (datetime.now() - start_time).total_seconds()

            # Parse exercises
            exercises = self._parse_exercises(content)

            log_ai_interaction(
                interaction_type="exercise_generation",
                model=settings.AI_MODEL_NAME,
                exercise_count=exercise_count,
                processing_time=processing_time,
            )

            return {
                "exercises": exercises,
                "exercise_count": len(exercises),
                "processing_time": processing_time,
            }

        except Exception as e:
            logger.error("Exercise generation failed", error=str(e))
            return {"error": f"Exercise generation failed: {str(e)}"}

    def _get_default_voice(self, language_code: str) -> str:
        """Get default voice for language."""
        voice_mapping = {
            "en-US": "en-US-Standard-A",
            "es-ES": "es-ES-Standard-A",
            "fr-FR": "fr-FR-Standard-A",
            "de-DE": "de-DE-Standard-A",
            "it-IT": "it-IT-Standard-A",
            "pt-BR": "pt-BR-Standard-A",
            "ja-JP": "ja-JP-Standard-A",
            "ko-KR": "ko-KR-Standard-A",
            "zh-CN": "cmn-CN-Standard-A",
        }
        return voice_mapping.get(language_code, "en-US-Standard-A")

    def _create_lesson_prompt(
        self,
        topic: str,
        difficulty_level: str,
        target_language: str,
        native_language: str,
    ) -> str:
        """Create prompt for lesson generation."""
        return f"""
        Create a comprehensive language lesson in {target_language} for {native_language} speakers.

        Topic: {topic}
        Difficulty Level: {difficulty_level}

        Please provide the lesson in the following JSON format:
        {{
            "title": "Lesson title",
            "description": "Brief description",
            "learning_objectives": ["objective1", "objective2"],
            "vocabulary": [
                {{
                    "word": "word_in_target_language",
                    "translation": "translation_in_native_language",
                    "example_sentence": "example_sentence",
                    "pronunciation": "phonetic_pronunciation"
                }}
            ],
            "grammar_points": [
                {{
                    "concept": "grammar_concept",
                    "explanation": "explanation_in_native_language",
                    "examples": ["example1", "example2"],
                    "practice_sentences": ["sentence1", "sentence2"]
                }}
            ],
            "conversation_practice": [
                {{
                    "scenario": "conversation_scenario",
                    "dialogue": [
                        {{
                            "speaker": "speaker_name",
                            "text": "text_in_target_language",
                            "translation": "translation_in_native_language"
                        }}
                    ]
                }}
            ],
            "cultural_notes": ["note1", "note2"],
            "estimated_duration": "estimated_time_in_minutes"
        }}

        Make the content engaging, practical, and appropriate for {difficulty_level} level learners.
        """

    def _create_exercise_prompt(self, lesson_content: Dict[str, Any], exercise_count: int) -> str:
        """Create prompt for exercise generation."""
        return f"""
        Based on this lesson content, create {exercise_count} diverse exercises:

        Lesson: {lesson_content.get('title', 'Unknown')}

        Please create exercises in this JSON format:
        {{
            "exercises": [
                {{
                    "title": "Exercise title",
                    "type": "multiple_choice|fill_blank|matching|speaking|listening",
                    "description": "Exercise description",
                    "content": {{
                        "question": "Question or instruction",
                        "options": ["option1", "option2", "option3", "option4"],  # for multiple choice
                        "correct_answer": "correct_answer_or_index",
                        "hints": ["hint1", "hint2"],
                        "explanation": "Explanation of correct answer"
                    }},
                    "difficulty_score": 1.0,
                    "base_xp": 25
                }}
            ]
        }}

        Include a mix of exercise types and ensure they test different aspects of the lesson content.
        """

    def _parse_lesson_content(self, content: str) -> Dict[str, Any]:
        """Parse generated lesson content."""
        try:
            # Try to extract JSON from the response
            if "```json" in content:
                json_start = content.find("```json") + 7
                json_end = content.find("```", json_start)
                json_content = content[json_start:json_end].strip()
            else:
                # Try to find JSON in the content
                json_start = content.find("{")
                json_end = content.rfind("}") + 1
                json_content = content[json_start:json_end]

            result: Dict[str, Any] = json.loads(json_content)
            return result
        except Exception as e:
            logger.error("Failed to parse lesson content", error=str(e), content=content)
            return {"error": "Failed to parse generated content"}

    def _parse_exercises(self, content: str) -> List[Dict[str, Any]]:
        """Parse generated exercises."""
        try:
            # Similar parsing logic for exercises
            if "```json" in content:
                json_start = content.find("```json") + 7
                json_end = content.find("```", json_start)
                json_content = content[json_start:json_end].strip()
            else:
                json_start = content.find("{")
                json_end = content.rfind("}") + 1
                json_content = content[json_start:json_end]

            parsed: Dict[str, Any] = json.loads(json_content)
            exercises: List[Dict[str, Any]] = parsed.get("exercises", [])
            return exercises
        except Exception as e:
            logger.error("Failed to parse exercises", error=str(e), content=content)
            return []


# Global AI service instance
ai_service = AIService()
