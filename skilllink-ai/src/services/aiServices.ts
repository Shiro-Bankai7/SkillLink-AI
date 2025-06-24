// AI Services Integration for SkillLink AI
// This file contains integrations with various AI services

interface ElevenLabsConfig {
  apiKey: string;
  voiceId: string;
}

interface OpenAIConfig {
  apiKey: string;
  model: string;
}

interface TavusConfig {
  apiKey: string;
}

// ElevenLabs Voice Analysis Service
export class ElevenLabsService {
  private config: ElevenLabsConfig;

  constructor(config: ElevenLabsConfig) {
    this.config = config;
  }

  async analyzeVoice(audioBlob: Blob): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);

      const response = await fetch('https://api.elevenlabs.io/v1/speech-to-speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('ElevenLabs API error');
      }

      return await response.json();
    } catch (error) {
      console.error('ElevenLabs analysis error:', error);
      throw error;
    }
  }

  async generateSpeechFeedback(text: string): Promise<Blob> {
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${this.config.voiceId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        })
      });

      if (!response.ok) {
        throw new Error('ElevenLabs TTS error');
      }

      return await response.blob();
    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
      throw error;
    }
  }
}

// OpenAI Service for Content Analysis
export class OpenAIService {
  private config: OpenAIConfig;

  constructor(config: OpenAIConfig) {
    this.config = config;
  }

  async analyzeTranscript(transcript: string): Promise<any> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert public speaking coach. Analyze the following speech transcript and provide detailed feedback on content, structure, clarity, and engagement. Return your analysis in JSON format with scores (0-100) for different aspects and specific feedback points.'
            },
            {
              role: 'user',
              content: transcript
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error('OpenAI API error');
      }

      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);
    } catch (error) {
      console.error('OpenAI analysis error:', error);
      throw error;
    }
  }

  async generateCoachingFeedback(metrics: any): Promise<string[]> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: 'You are a supportive AI coach. Based on the performance metrics provided, generate encouraging and actionable feedback. Return an array of 3-5 feedback messages.'
            },
            {
              role: 'user',
              content: JSON.stringify(metrics)
            }
          ],
          temperature: 0.8,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error('OpenAI API error');
      }

      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);
    } catch (error) {
      console.error('OpenAI feedback error:', error);
      throw error;
    }
  }
}

// Tavus Video Processing Service
export class TavusService {
  private config: TavusConfig;

  constructor(config: TavusConfig) {
    this.config = config;
  }

  async analyzeVideo(videoBlob: Blob): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('video', videoBlob);

      const response = await fetch('https://api.tavus.io/v1/analyze', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Tavus API error');
      }

      return await response.json();
    } catch (error) {
      console.error('Tavus analysis error:', error);
      throw error;
    }
  }

  async extractVideoMetrics(videoUrl: string): Promise<any> {
    try {
      const response = await fetch('https://api.tavus.io/v1/metrics', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_url: videoUrl,
          metrics: ['eye_contact', 'gestures', 'posture', 'facial_expressions']
        })
      });

      if (!response.ok) {
        throw new Error('Tavus metrics error');
      }

      return await response.json();
    } catch (error) {
      console.error('Tavus metrics error:', error);
      throw error;
    }
  }
}

// Tavus Conversational AI Video API Utility
export class TavusConversationAPI {
  private apiKey: string;
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async createConversation({
    replica_id,
    persona_id,
    callback_url,
    conversation_name,
    conversational_context,
    custom_greeting,
    properties
  }: any) {
    const response = await fetch('https://tavusapi.com/v2/conversations', {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        replica_id,
        persona_id,
        callback_url,
        conversation_name,
        conversational_context,
        custom_greeting,
        properties,
      })
    });
    if (!response.ok) throw new Error('Tavus create conversation failed');
    return response.json();
  }

  async getConversation(conversation_id: string) {
    const response = await fetch(`https://tavusapi.com/v2/conversations/${conversation_id}`, {
      method: 'GET',
      headers: { 'x-api-key': this.apiKey }
    });
    if (!response.ok) throw new Error('Tavus get conversation failed');
    return response.json();
  }

  async listConversations() {
    const response = await fetch('https://tavusapi.com/v2/conversations', {
      method: 'GET',
      headers: { 'x-api-key': this.apiKey }
    });
    if (!response.ok) throw new Error('Tavus list conversations failed');
    return response.json();
  }

  async endConversation(conversation_id: string) {
    const response = await fetch(`https://tavusapi.com/v2/conversations/${conversation_id}/end`, {
      method: 'POST',
      headers: { 'x-api-key': this.apiKey }
    });
    if (!response.ok) throw new Error('Tavus end conversation failed');
    return response.json();
  }
}

// Web Speech API Service for Real-time Transcription
export class SpeechRecognitionService {
  private recognition: any;
  private isListening: boolean = false;

  constructor() {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
    } else if ('SpeechRecognition' in window) {
      this.recognition = new (window as any).SpeechRecognition();
    }

    if (this.recognition) {
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
    }
  }

  startListening(onResult: (transcript: string) => void, onError?: (error: any) => void): void {
    if (!this.recognition) {
      console.error('Speech recognition not supported');
      return;
    }

    this.recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      onResult(transcript);
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (onError) onError(event.error);
    };

    this.recognition.start();
    this.isListening = true;
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  isSupported(): boolean {
    return !!this.recognition;
  }
}

// AI Services Factory
export class AIServicesFactory {
  static createElevenLabsService(): ElevenLabsService {
    return new ElevenLabsService({
      apiKey: import.meta.env.VITE_ELEVENLABS_API_KEY || '',
      voiceId: import.meta.env.VITE_ELEVENLABS_VOICE_ID || 'default'
    });
  }

  static createOpenAIService(): OpenAIService {
    return new OpenAIService({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
      model: 'gpt-4'
    });
  }

  static createTavusService(): TavusService {
    return new TavusService({
      apiKey: import.meta.env.VITE_TAVUS_API_KEY || ''
    });
  }

  static createSpeechRecognitionService(): SpeechRecognitionService {
    return new SpeechRecognitionService();
  }

  static createTavusConversationAPI(): TavusConversationAPI {
    return new TavusConversationAPI(import.meta.env.VITE_TAVUS_API_KEY || '');
  }
}

// Real-time Analysis Engine
export class RealTimeAnalysisEngine {
  private speechService: SpeechRecognitionService;
  private openAIService: OpenAIService;
  private isAnalyzing: boolean = false;

  constructor() {
    this.speechService = AIServicesFactory.createSpeechRecognitionService();
    this.openAIService = AIServicesFactory.createOpenAIService();
  }

  startRealTimeAnalysis(
    onMetricsUpdate: (metrics: any) => void,
    onFeedback: (feedback: any) => void
  ): void {
    if (this.isAnalyzing) return;

    this.isAnalyzing = true;
    let transcript = '';
    let wordCount = 0;
    let fillerWords = 0;
    const startTime = Date.now();

    this.speechService.startListening(
      (newTranscript) => {
        transcript = newTranscript;
        
        // Calculate real-time metrics
        const words = transcript.split(' ').filter(word => word.length > 0);
        wordCount = words.length;
        const timeElapsed = (Date.now() - startTime) / 1000 / 60; // minutes
        const wpm = timeElapsed > 0 ? Math.round(wordCount / timeElapsed) : 0;
        
        // Count filler words
        const fillerWordsList = ['um', 'uh', 'like', 'you know', 'so', 'actually'];
        fillerWords = words.filter(word => 
          fillerWordsList.includes(word.toLowerCase())
        ).length;

        // Update metrics
        onMetricsUpdate({
          wordsPerMinute: wpm,
          fillerWords,
          wordCount,
          transcript
        });

        // Generate periodic feedback
        if (wordCount > 0 && wordCount % 50 === 0) {
          this.generateRealTimeFeedback(transcript, { wpm, fillerWords })
            .then(feedback => onFeedback(feedback));
        }
      },
      (error) => {
        console.error('Speech recognition error:', error);
        this.stopRealTimeAnalysis();
      }
    );
  }

  stopRealTimeAnalysis(): void {
    this.speechService.stopListening();
    this.isAnalyzing = false;
  }

  private async generateRealTimeFeedback(transcript: string, metrics: any): Promise<any> {
    try {
      const feedback = await this.openAIService.generateCoachingFeedback({
        transcript: transcript.slice(-200), // Last 200 characters
        metrics
      });

      return {
        timestamp: Date.now(),
        type: 'tip',
        message: feedback[0] || 'Keep up the good work!',
        category: 'speech'
      };
    } catch (error) {
      console.error('Error generating real-time feedback:', error);
      return null;
    }
  }
}