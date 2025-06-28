export interface GeminiResponse {
  text: string;
  confidence: number;
  model: string;
}

export class GeminiService {
  private static apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  private static baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';

  static async generateResponse(
    prompt: string,
    context?: string,
    model: string = 'gemini-1.5-flash'
  ): Promise<GeminiResponse> {
    try {
      if (!this.apiKey) {
        console.warn('Gemini API key not found, using mock responses');
        return this.getMockResponse(prompt);
      }

      const fullPrompt = context 
        ? `Context: ${context}\n\nUser: ${prompt}\n\nAssistant:`
        : prompt;

      const response = await fetch(
        `${this.baseUrl}/${model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: fullPrompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            },
            safetySettings: [
              {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              },
              {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              },
              {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              },
              {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              }
            ]
          }),
        }
      );

      if (!response.ok) {
        console.error(`Gemini API error: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.error('Error details:', errorText);
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        console.error('Unexpected Gemini API response structure:', data);
        throw new Error('Invalid response structure from Gemini API');
      }

      const text = data.candidates[0].content.parts[0]?.text || 'I apologize, but I couldn\'t generate a response.';

      return {
        text: text.trim(),
        confidence: 0.9,
        model: model
      };
    } catch (error) {
      console.error('Gemini API error:', error);
      return this.getMockResponse(prompt);
    }
  }

  private static getMockResponse(prompt: string): GeminiResponse {
    const lowerPrompt = prompt.toLowerCase();
    
    // Learning and skill-related responses
    if (lowerPrompt.includes('learn') || lowerPrompt.includes('skill')) {
      const responses = [
        "Learning is a journey, not a destination! What specific skill would you like to focus on today?",
        "I'd love to help you learn! The key to mastering any skill is consistent practice and breaking it down into smaller, manageable steps.",
        "That's exciting that you want to learn something new! What's your current experience level with this topic?",
        "Learning new skills is one of the most rewarding experiences. I can help you create a structured learning plan if you'd like!"
      ];
      return {
        text: responses[Math.floor(Math.random() * responses.length)],
        confidence: 0.8,
        model: 'gemini-mock'
      };
    }

    // Practice and coaching responses
    if (lowerPrompt.includes('practice') || lowerPrompt.includes('coach') || lowerPrompt.includes('improve')) {
      const responses = [
        "Practice makes progress! What would you like to work on today? I can provide tips and encouragement.",
        "Great mindset! Regular practice is the key to improvement. How can I support your practice session?",
        "I'm here to help you improve! What specific area would you like to focus on during your practice?",
        "Coaching is all about identifying strengths and areas for growth. What challenges are you facing?"
      ];
      return {
        text: responses[Math.floor(Math.random() * responses.length)],
        confidence: 0.8,
        model: 'gemini-mock'
      };
    }

    // Public speaking responses
    if (lowerPrompt.includes('speak') || lowerPrompt.includes('presentation') || lowerPrompt.includes('confidence')) {
      const responses = [
        "Public speaking can be nerve-wracking, but with practice it becomes much easier! What aspect of speaking would you like to work on?",
        "Confidence comes from preparation and practice. Would you like some tips for your next presentation?",
        "Remember: your audience wants you to succeed! What's your biggest concern about speaking in public?",
        "Great speakers aren't born, they're made through practice. How can I help you improve your speaking skills?"
      ];
      return {
        text: responses[Math.floor(Math.random() * responses.length)],
        confidence: 0.8,
        model: 'gemini-mock'
      };
    }

    // General helpful responses
    if (lowerPrompt.includes('help') || lowerPrompt.includes('how')) {
      const responses = [
        "I'm here to help! I can assist with learning strategies, skill development, practice techniques, and more. What would you like to work on?",
        "Absolutely! I love helping people grow and learn. What specific challenge can I help you tackle?",
        "I'm your AI learning companion! Whether it's skill practice, learning strategies, or just motivation, I'm here for you.",
        "Of course! I can help with study techniques, skill practice, goal setting, and much more. What's on your mind?"
      ];
      return {
        text: responses[Math.floor(Math.random() * responses.length)],
        confidence: 0.8,
        model: 'gemini-mock'
      };
    }

    // Greeting responses
    if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi') || lowerPrompt.includes('hey')) {
      const responses = [
        "Hello! I'm your AI learning assistant. I'm here to help you practice skills, learn new things, and achieve your goals. What would you like to work on today?",
        "Hi there! Welcome to SkillLink AI. I can help you with skill practice, learning strategies, and personal development. How can I assist you?",
        "Hey! Great to meet you. I'm here to support your learning journey. Whether you want to practice speaking, learn a new skill, or get coaching tips, I'm ready to help!",
        "Hello! I'm excited to help you grow and learn. What skill or topic interests you most right now?"
      ];
      return {
        text: responses[Math.floor(Math.random() * responses.length)],
        confidence: 0.9,
        model: 'gemini-mock'
      };
    }

    // Default response
    const defaultResponses = [
      "That's an interesting question! I'm here to help you with learning, skill development, and practice. Could you tell me more about what you'd like to work on?",
      "I'd love to help you with that! As your AI learning assistant, I can provide guidance on skill practice, learning strategies, and personal development.",
      "Thanks for sharing that with me! How can I help you turn this into a learning opportunity or skill-building exercise?",
      "I'm here to support your growth and learning. What specific area would you like to focus on or improve?"
    ];

    return {
      text: defaultResponses[Math.floor(Math.random() * defaultResponses.length)],
      confidence: 0.7,
      model: 'gemini-mock'
    };
  }

  // Specialized methods for different use cases
  static async generateLearningPlan(skill: string, level: string, timeCommitment: string): Promise<GeminiResponse> {
    const prompt = `Create a personalized learning plan for ${skill} at ${level} level with ${timeCommitment} time commitment. Include specific steps, milestones, and practice exercises.`;
    
    return this.generateResponse(prompt, 'You are an expert learning coach creating personalized learning plans.');
  }

  static async provideFeedback(activity: string, performance: string): Promise<GeminiResponse> {
    const prompt = `Provide constructive feedback for this ${activity}: ${performance}. Focus on strengths and specific areas for improvement.`;
    
    return this.generateResponse(prompt, 'You are a supportive coach providing constructive feedback.');
  }

  static async generatePracticeExercise(skill: string, difficulty: string): Promise<GeminiResponse> {
    const prompt = `Create a ${difficulty} practice exercise for ${skill}. Make it engaging and include clear instructions.`;
    
    return this.generateResponse(prompt, 'You are a creative instructor designing practice exercises.');
  }

  static async answerLearningQuestion(question: string, context?: string): Promise<GeminiResponse> {
    const contextPrompt = context 
      ? `Given this context about the user's learning: ${context}\n\nAnswer this question: ${question}`
      : question;
    
    return this.generateResponse(contextPrompt, 'You are a knowledgeable tutor answering learning-related questions.');
  }

  static async generateMotivation(goal: string, progress?: string): Promise<GeminiResponse> {
    const prompt = progress 
      ? `Provide motivation for someone working toward ${goal}. Their current progress: ${progress}`
      : `Provide motivation for someone working toward ${goal}`;
    
    return this.generateResponse(prompt, 'You are an encouraging mentor providing motivation and support.');
  }
}