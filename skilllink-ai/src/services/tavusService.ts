import { supabase } from './supabase';

export interface TavusConversation {
  conversation_id: string;
  replica_id: string;
  persona_id: string;
  conversation_name: string;
  conversational_context: string;
  custom_greeting: string;
  status: 'active' | 'ended' | 'pending';
  created_at: string;
  ended_at?: string;
  recording_url?: string;
  participant_count: number;
  duration?: number;
  conversation_url?: string; // <-- Add this line for Tavus conversation_url
}

export interface TavusConversationRequest {
  replica_id: string;
  persona_id: string;
  conversation_name: string;
  conversational_context: string;
  custom_greeting: string;
  callback_url?: string;
  properties?: {
    max_call_duration?: number;
    participant_left_timeout?: number;
    participant_absent_timeout?: number;
    enable_recording?: boolean;
    enable_closed_captions?: boolean;
    apply_greenscreen?: boolean;
    language?: string;
    recording_s3_bucket_name?: string;
    recording_s3_bucket_region?: string;
    aws_assume_role_arn?: string;
  };
}

export class TavusService {
  private apiKey: string;
  private baseUrl = 'https://tavusapi.com/v2';

  constructor() {
    this.apiKey = import.meta.env.VITE_TAVUS_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Tavus API key not found. Please add VITE_TAVUS_API_KEY to your environment variables.');
    }
  }

  private getHeaders() {
    return {
      'x-api-key': this.apiKey,
      'Content-Type': 'application/json',
    };
  }

  async createConversation(request: TavusConversationRequest): Promise<TavusConversation> {
    try {
      const response = await fetch(`${this.baseUrl}/conversations`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Tavus API error: ${response.status} ${response.statusText}`);
      }

      const conversation = await response.json();
      
      // Save conversation to Supabase
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        await supabase.from('tavus_conversations').insert({
          user_id: user.user.id,
          conversation_id: conversation.conversation_id,
          conversation_name: request.conversation_name,
          conversational_context: request.conversational_context,
          replica_id: request.replica_id,
          persona_id: request.persona_id,
          status: 'active',
          created_at: new Date().toISOString(),
        });
      }

      return conversation;
    } catch (error) {
      console.error('Error creating Tavus conversation:', error);
      throw error;
    }
  }

  async getConversation(conversationId: string): Promise<TavusConversation> {
    try {
      const response = await fetch(`${this.baseUrl}/conversations/${conversationId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Tavus API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching Tavus conversation:', error);
      throw error;
    }
  }

  async listConversations(): Promise<TavusConversation[]> {
    try {
      const response = await fetch(`${this.baseUrl}/conversations`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Tavus API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.conversations || [];
    } catch (error) {
      console.error('Error listing Tavus conversations:', error);
      throw error;
    }
  }

  async endConversation(conversationId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/conversations/${conversationId}/end`, {
        method: 'POST',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Tavus API error: ${response.status} ${response.statusText}`);
      }

      // Update conversation status in Supabase
      await supabase
        .from('tavus_conversations')
        .update({ 
          status: 'ended',
          ended_at: new Date().toISOString()
        })
        .eq('conversation_id', conversationId);

    } catch (error) {
      console.error('Error ending Tavus conversation:', error);
      throw error;
    }
  }

  // Get user's conversations from Supabase
  async getUserConversations(): Promise<any[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('tavus_conversations')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user conversations:', error);
      return [];
    }
  }

  // Create teaching session conversation
  async createTeachingSession(skillName: string, teacherPersona: string, studentLevel: 'beginner' | 'intermediate' | 'advanced'): Promise<TavusConversation> {
    const conversationName = `${skillName} Teaching Session`;
    const conversationalContext = this.generateTeachingContext(skillName, teacherPersona, studentLevel);
    const customGreeting = this.generateTeachingGreeting(skillName, studentLevel);

    return this.createConversation({
      replica_id: import.meta.env.VITE_TAVUS_REPLICA_ID || 'default_replica',
      persona_id: import.meta.env.VITE_TAVUS_PERSONA_ID || 'default_persona',
      conversation_name: conversationName,
      conversational_context: conversationalContext,
      custom_greeting: customGreeting,
      callback_url: `${window.location.origin}/api/tavus/webhook`,
      properties: {
        max_call_duration: 3600, // 1 hour
        participant_left_timeout: 60,
        participant_absent_timeout: 300,
        enable_recording: true,
        enable_closed_captions: true,
        apply_greenscreen: false,
        language: 'english',
      },
    });
  }

  // Create coaching session conversation
  async createCoachingSession(coachingType: string): Promise<TavusConversation> {
    const conversationName = `${coachingType.replace('-', ' ')} Coaching Session`;
    const conversationalContext = this.generateCoachingContext(coachingType);
    const customGreeting = this.generateCoachingGreeting(coachingType);

    return this.createConversation({
      replica_id: import.meta.env.VITE_TAVUS_COACH_REPLICA_ID || 'default_replica',
      persona_id: import.meta.env.VITE_TAVUS_COACH_PERSONA_ID || 'default_persona',
      conversation_name: conversationName,
      conversational_context: conversationalContext,
      custom_greeting: customGreeting,
      callback_url: `${window.location.origin}/api/tavus/webhook`,
      properties: {
        max_call_duration: 1800, // 30 minutes
        participant_left_timeout: 60,
        participant_absent_timeout: 300,
        enable_recording: true,
        enable_closed_captions: true,
        apply_greenscreen: false,
        language: 'english',
      },
    });
  }

  private generateTeachingContext(skillName: string, teacherPersona: string, studentLevel: string): string {
    return `You are an expert ${skillName} teacher with the persona of ${teacherPersona}. 
    You are teaching a ${studentLevel} level student. 
    Your goal is to be encouraging, patient, and provide clear explanations. 
    Break down complex concepts into digestible parts and provide practical examples. 
    Ask questions to check understanding and adapt your teaching style to the student's responses. 
    Keep the session interactive and engaging.`;
  }

  private generateCoachingContext(coachingType: string): string {
    const contexts: Record<string, string> = {
      'public-speaking': `You are a professional public speaking coach with years of experience helping people overcome stage fright and improve their presentation skills. 
      You are supportive, encouraging, and provide actionable feedback. 
      Help the user practice their speech, work on their delivery, and build confidence. 
      Provide specific tips on body language, voice modulation, and audience engagement.`,
      'interview-prep': `You are an experienced career coach specializing in interview preparation. 
      You help candidates practice common interview questions, improve their responses, and build confidence. 
      Provide constructive feedback on their answers and suggest improvements. 
      Focus on helping them articulate their experiences and skills effectively.`,
      'presentation-skills': `You are a presentation skills expert who helps professionals create and deliver compelling presentations. 
      You focus on structure, storytelling, visual aids, and delivery techniques. 
      Help the user organize their content, practice their delivery, and engage their audience effectively.`
    };
    return contexts[coachingType] || `You are an expert coach for ${coachingType}. Help the user practice and improve their skills in this area. Provide actionable feedback, encouragement, and practical tips.`;
  }

  private generateTeachingGreeting(skillName: string, studentLevel: string): string {
    return `Hello! I'm excited to help you learn ${skillName} today. I understand you're at a ${studentLevel} level, so we'll start from where you are and build up your skills step by step. What specific aspect of ${skillName} would you like to focus on in our session?`;
  }

  private generateCoachingGreeting(coachingType: string): string {
    const greetings: Record<string, string> = {
      'public-speaking': "Welcome to your public speaking coaching session! I'm here to help you become a more confident and effective speaker. What would you like to work on today - perhaps practicing a specific speech or working on general presentation skills?",
      'interview-prep': "Hello! I'm your interview coach, and I'm here to help you ace your upcoming interviews. Whether you want to practice common questions, work on your storytelling, or build confidence, I'm here to support you. What type of interview are you preparing for?",
      'presentation-skills': "Welcome to your presentation skills coaching session! I'm here to help you create and deliver presentations that truly engage your audience. What presentation are you working on, or what specific skills would you like to improve?"
    };
    return greetings[coachingType] || `Welcome to your ${coachingType} coaching session! I'm here to help you improve and achieve your goals. What would you like to focus on today?`;
  }
}

export const tavusService = new TavusService();