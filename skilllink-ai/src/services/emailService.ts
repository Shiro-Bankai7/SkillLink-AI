import { supabase } from './supabase';

export interface EmailNotification {
  to: string;
  subject: string;
  html: string;
  type: 'welcome' | 'session_reminder' | 'session_completed' | 'skill_match' | 'general';
}

export class EmailService {
  static async sendEmail(notification: EmailNotification): Promise<boolean> {
    try {
      // In a real implementation, you would use a service like:
      // - Supabase Edge Functions with Resend
      // - SendGrid
      // - Mailgun
      // - AWS SES
      
      // For now, we'll use Supabase Edge Functions (you'll need to create this)
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: notification
      });

      if (error) {
        console.error('Email sending error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Email service error:', error);
      return false;
    }
  }

  static async sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
    const notification: EmailNotification = {
      to: userEmail,
      subject: 'Welcome to SkillLink AI! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4f46e5;">Welcome to SkillLink AI, ${userName}!</h1>
          <p>We're excited to have you join our community of learners and teachers.</p>
          <p>Here's what you can do next:</p>
          <ul>
            <li>Complete your profile to get better skill matches</li>
            <li>Start your first AI coaching session</li>
            <li>Connect with other learners in your area</li>
            <li>Explore our skill exchange marketplace</li>
          </ul>
          <a href="${window.location.origin}/dashboard" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0;">
            Get Started
          </a>
          <p>Happy learning!</p>
          <p>The SkillLink AI Team</p>
        </div>
      `,
      type: 'welcome'
    };

    return this.sendEmail(notification);
  }

  static async sendSessionReminder(userEmail: string, sessionDetails: any): Promise<boolean> {
    const notification: EmailNotification = {
      to: userEmail,
      subject: `Reminder: Your ${sessionDetails.title} starts soon`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4f46e5;">Session Reminder</h1>
          <p>Your session is starting soon!</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>${sessionDetails.title}</h3>
            <p><strong>Date:</strong> ${new Date(sessionDetails.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${new Date(sessionDetails.date).toLocaleTimeString()}</p>
            <p><strong>Duration:</strong> ${sessionDetails.duration} minutes</p>
            <p><strong>Type:</strong> ${sessionDetails.type.replace('_', ' ')}</p>
          </div>
          <a href="${window.location.origin}/dashboard" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Join Session
          </a>
          <p>See you there!</p>
        </div>
      `,
      type: 'session_reminder'
    };

    return this.sendEmail(notification);
  }

  static async sendSessionCompletedEmail(userEmail: string, sessionDetails: any, feedback?: any): Promise<boolean> {
    const notification: EmailNotification = {
      to: userEmail,
      subject: `Session completed: ${sessionDetails.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4f46e5;">Session Completed! 🎉</h1>
          <p>Great job completing your session!</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>${sessionDetails.title}</h3>
            <p><strong>Duration:</strong> ${sessionDetails.duration} minutes</p>
            <p><strong>Completed:</strong> ${new Date().toLocaleDateString()}</p>
            ${feedback ? `
              <p><strong>Overall Score:</strong> ${feedback.overallScore}%</p>
              <p><strong>Key Achievements:</strong></p>
              <ul>
                ${feedback.achievements?.map((achievement: string) => `<li>${achievement}</li>`).join('') || ''}
              </ul>
            ` : ''}
          </div>
          <a href="${window.location.origin}/dashboard?tab=progress" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
            View Progress
          </a>
          <p>Keep up the great work!</p>
        </div>
      `,
      type: 'session_completed'
    };

    return this.sendEmail(notification);
  }

  static async sendSkillMatchEmail(userEmail: string, matchDetails: any): Promise<boolean> {
    const notification: EmailNotification = {
      to: userEmail,
      subject: 'New skill match found! 🎯',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4f46e5;">New Skill Match Found!</h1>
          <p>We found someone who's a great match for your learning goals!</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>${matchDetails.name}</h3>
            <p><strong>Match Score:</strong> ${matchDetails.matchScore}%</p>
            <p><strong>Skills they teach:</strong> ${matchDetails.skills?.join(', ')}</p>
            <p><strong>Looking to learn:</strong> ${matchDetails.wantsToLearn?.join(', ')}</p>
            <p><strong>Location:</strong> ${matchDetails.location}</p>
          </div>
          <a href="${window.location.origin}/dashboard?tab=community" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Connect Now
          </a>
          <p>Happy learning!</p>
        </div>
      `,
      type: 'skill_match'
    };

    return this.sendEmail(notification);
  }

  // Schedule session reminders
  static async scheduleSessionReminder(sessionId: string, sessionDate: string): Promise<void> {
    try {
      // Calculate reminder time (24 hours and 1 hour before session)
      const sessionDateTime = new Date(sessionDate);
      const oneDayBefore = new Date(sessionDateTime.getTime() - 24 * 60 * 60 * 1000);
      const oneHourBefore = new Date(sessionDateTime.getTime() - 60 * 60 * 1000);

      // Store reminder schedules in database
      await supabase.from('email_reminders').insert([
        {
          session_id: sessionId,
          reminder_type: '24_hours',
          scheduled_for: oneDayBefore.toISOString(),
          status: 'pending'
        },
        {
          session_id: sessionId,
          reminder_type: '1_hour',
          scheduled_for: oneHourBefore.toISOString(),
          status: 'pending'
        }
      ]);
    } catch (error) {
      console.error('Error scheduling reminders:', error);
    }
  }
}