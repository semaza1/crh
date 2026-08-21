// FILE: src/services/notificationService.js
// UPDATED: Now sends emails too!

import { supabase } from '../lib/supabaseClient';

class NotificationService {
  
  // Send email using Resend API
  async sendEmail({ to, subject, message }) {
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" max-width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); max-width: 600px; margin: 0 auto;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">
                        Career<span style="color: #38bdf8;">Connect</span>
                      </h1>
                      <p style="color: #94a3b8; margin: 10px 0 0; font-size: 14px; font-weight: 500;">Learning & Growth Hub</p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="color: #0f172a; margin: 0 0 20px; font-size: 22px; font-weight: 700; line-height: 1.3;">
                        ${subject}
                      </h2>
                      <p style="color: #475569; margin: 0 0 30px; font-size: 16px; line-height: 1.6;">
                        ${message.replace(/\n/g, '<br>')}
                      </p>
                      
                      <!-- Call to Action -->
                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td align="center">
                            <a href="${window.location.origin}/notifications" 
                               style="display: inline-block; background-color: #0284c7; background: linear-gradient(to right, #0284c7, #0369a1); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);">
                              View Dashboard
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center;">
                      <p style="color: #64748b; margin: 0; font-size: 13px; line-height: 1.5; font-weight: 500;">
                        This is an automated message from Career Connect Hub.<br>
                        © ${new Date().getFullYear()} Career Connect Hub. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

      console.log(`[NotificationService] Attempting to invoke Edge Function 'send-email' for: ${to}`);
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to,
          subject,
          html: htmlContent
        }
      });
      console.log(`[NotificationService] Edge Function response:`, { data, error });

      if (error) {
        throw new Error(error.message || 'Failed to send email');
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }
  }

  // Send notification to database AND email
  async sendNotification({ userId, subject, message, type = 'system', sendEmail = true }) {
    try {
      // Save to database
      const { data: notification, error: dbError } = await supabase
        .from('email_notifications')
        .insert([{
          user_id: userId,
          subject,
          message,
          notification_type: type,
          is_read: false
        }])
        .select()
        .single();

      if (dbError) throw dbError;

      // Get user email
      if (sendEmail) {
        const { data: user } = await supabase
          .from('users')
          .select('email')
          .eq('id', userId)
          .single();

        if (user?.email) {
          // Send email (non-blocking)
          this.sendEmail({
            to: user.email,
            subject,
            message
          }).catch(err => console.error('Email failed but notification saved:', err));
        }
      }

      return { success: true, data: notification };
    } catch (error) {
      console.error('Error sending notification:', error);
      return { success: false, error };
    }
  }

  // Send to multiple users
  async sendBulkNotifications({ userIds, subject, message, type = 'system', sendEmail = true }) {
    try {
      const notifications = userIds.map(userId => ({
        user_id: userId,
        subject,
        message,
        notification_type: type,
        is_read: false
      }));

      const { data, error } = await supabase
        .from('email_notifications')
        .insert(notifications);

      if (error) throw error;

      // Send emails to all users (non-blocking)
      if (sendEmail) {
        const { data: users } = await supabase
          .from('users')
          .select('email')
          .in('id', userIds);

        if (users) {
          users.forEach(user => {
            if (user.email) {
              this.sendEmail({
                to: user.email,
                subject,
                message
              }).catch(err => console.error('Email failed:', err));
            }
          });
        }
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error sending bulk notifications:', error);
      return { success: false, error };
    }
  }

  // Send to all users
  async sendToAllUsers({ subject, message, type = 'system', sendEmail = true }) {
    try {
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('id');

      if (userError) throw userError;

      const userIds = users.map(user => user.id);
      return await this.sendBulkNotifications({ userIds, subject, message, type, sendEmail });
    } catch (error) {
      console.error('Error sending to all users:', error);
      return { success: false, error };
    }
  }

  // Send to all admins
  async sendToAdmins({ subject, message, type = 'system', sendEmail = true }) {
    try {
      const { data: admins, error } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'admin');

      if (error) throw error;

      const adminIds = admins.map(admin => admin.id);
      return await this.sendBulkNotifications({ userIds: adminIds, subject, message, type, sendEmail });
    } catch (error) {
      console.error('Error sending to admins:', error);
      return { success: false, error };
    }
  }

  // ========== COURSE NOTIFICATIONS ==========

  async notifyEnrollment(userId, courseName) {
    return await this.sendNotification({
      userId,
      subject: `Successfully Enrolled in ${courseName}`,
      message: `Congratulations! You've successfully enrolled in "${courseName}". Start learning now and achieve your goals!`,
      type: 'course'
    });
  }

  async notifyNewLesson(userId, courseName, lessonTitle) {
    return await this.sendNotification({
      userId,
      subject: `New Lesson Available: ${lessonTitle}`,
      message: `A new lesson "${lessonTitle}" has been added to your course "${courseName}". Check it out now!`,
      type: 'course'
    });
  }

  async notifyLessonCompleted(userId, lessonTitle, courseName) {
    return await this.sendNotification({
      userId,
      subject: `Lesson Completed: ${lessonTitle}`,
      message: `Great job! You've completed "${lessonTitle}" in "${courseName}". Keep up the excellent work!`,
      type: 'achievement'
    });
  }

  async notifyCourseCompleted(userId, courseName) {
    return await this.sendNotification({
      userId,
      subject: `🎉 Course Completed: ${courseName}`,
      message: `Congratulations! You've successfully completed "${courseName}". You're one step closer to your goals!`,
      type: 'achievement'
    });
  }

  // ========== PAYMENT NOTIFICATIONS ==========

  async notifyPaymentSuccess(userId, courseName, amount) {
    return await this.sendNotification({
      userId,
      subject: `Payment Successful - ${courseName}`,
      message: `Your payment of $${amount} for "${courseName}" has been processed successfully. You now have full access to the course!`,
      type: 'payment'
    });
  }

  async notifyPaymentFailed(userId, courseName, reason) {
    return await this.sendNotification({
      userId,
      subject: `Payment Failed - ${courseName}`,
      message: `Unfortunately, your payment for "${courseName}" could not be processed. Reason: ${reason}. Please try again or contact support.`,
      type: 'payment'
    });
  }

  async notifyAdminNewPayment(amount, courseName, userName) {
    return await this.sendToAdmins({
      subject: `New Payment Received: $${amount}`,
      message: `${userName} has purchased "${courseName}" for $${amount}.`,
      type: 'payment'
    });
  }

  // ========== ACHIEVEMENT NOTIFICATIONS ==========

  async notifyAchievementUnlocked(userId, achievementName, description) {
    return await this.sendNotification({
      userId,
      subject: `🏆 Achievement Unlocked: ${achievementName}`,
      message: `Congratulations! You've unlocked the "${achievementName}" achievement. ${description}`,
      type: 'achievement'
    });
  }

  async notifyLearningStreak(userId, streakDays) {
    return await this.sendNotification({
      userId,
      subject: `🔥 ${streakDays}-Day Learning Streak!`,
      message: `Amazing! You're on a ${streakDays}-day learning streak. Keep it up and continue your journey to success!`,
      type: 'achievement'
    });
  }

  // ========== REMINDER NOTIFICATIONS ==========

  async remindContinueCourse(userId, courseName, lastLessonTitle) {
    return await this.sendNotification({
      userId,
      subject: `Continue Learning: ${courseName}`,
      message: `You left off at "${lastLessonTitle}" in "${courseName}". Come back and continue your learning journey!`,
      type: 'reminder'
    });
  }

  async remindIncompleteCourses(userId, courseNames) {
    return await this.sendNotification({
      userId,
      subject: `You Have Incomplete Courses`,
      message: `You have ${courseNames.length} incomplete course(s): ${courseNames.join(', ')}. Take a few minutes today to make progress!`,
      type: 'reminder'
    });
  }

  // ========== SYSTEM NOTIFICATIONS ==========

  async notifyWelcome(userId, userName) {
    return await this.sendNotification({
      userId,
      subject: `Welcome to Career Connect Hub, ${userName}!`,
      message: `We're excited to have you here! Start exploring our courses and resources to begin your learning journey.`,
      type: 'system'
    });
  }

  async notifyPasswordChanged(userId) {
    return await this.sendNotification({
      userId,
      subject: `Password Changed Successfully`,
      message: `Your password has been changed. If you didn't make this change, please contact support immediately.`,
      type: 'system'
    });
  }

  async notifyProfileUpdated(userId) {
    return await this.sendNotification({
      userId,
      subject: `Profile Updated`,
      message: `Your profile has been updated successfully.`,
      type: 'system'
    });
  }

  // ========== ADMIN NOTIFICATIONS ==========

  async notifyAdminNewUser(userName, userEmail) {
    return await this.sendToAdmins({
      subject: `New User Registration`,
      message: `${userName} (${userEmail}) has registered on the platform.`,
      type: 'system'
    });
  }

  async notifyAdminNewEnrollment(userName, courseName) {
    return await this.sendToAdmins({
      subject: `New Course Enrollment`,
      message: `${userName} has enrolled in "${courseName}".`,
      type: 'course'
    });
  }

  async notifyAdminSupportRequest(userName, subject, message) {
    return await this.sendToAdmins({
      subject: `New Support Request: ${subject}`,
      message: `${userName} submitted a support request: "${message}"`,
      type: 'system'
    });
  }

  // ========== RESOURCE NOTIFICATIONS ==========

  async notifyNewResource(userId, resourceTitle, resourceType) {
    return await this.sendNotification({
      userId,
      subject: `New Resource Available: ${resourceTitle}`,
      message: `A new ${resourceType} resource "${resourceTitle}" has been added. Check it out now!`,
      type: 'other'
    });
  }

  async notifyFeaturedResource(resourceTitle, description) {
    return await this.sendToAllUsers({
      subject: `Featured Resource: ${resourceTitle}`,
      message: `Don't miss our featured resource: "${resourceTitle}". ${description}`,
      type: 'other'
    });
  }
}

// Export singleton instance
const notificationService = new NotificationService();
export default notificationService;