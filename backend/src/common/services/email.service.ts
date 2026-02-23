import nodemailer from "nodemailer";
import { getEmailTransporter } from "../../config/email.js";
import { config } from "../../config/index.js";
import { logger } from "../../config/logger.js";

async function sendEmail(to: string, subject: string, html: string) {
  try {
    const transporter = await getEmailTransporter();
    const info = await transporter.sendMail({
      from: config.EMAIL_FROM,
      to,
      subject,
      html,
    });

    if (config.NODE_ENV === "development") {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        logger.info({ previewUrl }, "Email preview available");
      }
    }

    logger.debug({ to, subject, messageId: info.messageId }, "Email sent");
    return info;
  } catch (err) {
    logger.error({ to, subject, err }, "Failed to send email");
  }
}

export const emailService = {
  async sendEnrollmentConfirmation(
    studentEmail: string,
    studentName: string,
    courseTitle: string,
  ) {
    const subject = `Enrollment Confirmed: ${courseTitle}`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 0;">
        <h2 style="color: #1a1a1a; margin-bottom: 16px;">You're enrolled!</h2>
        <p style="color: #525252; font-size: 15px; line-height: 1.6;">
          Hi ${studentName},
        </p>
        <p style="color: #525252; font-size: 15px; line-height: 1.6;">
          You've been successfully enrolled in <strong>${courseTitle}</strong>.
          Head over to your dashboard to start learning.
        </p>
        <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/student/courses"
           style="display: inline-block; background: #2d6a4f; color: white; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 500; margin-top: 12px;">
          Go to My Courses
        </a>
        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0;" />
        <p style="color: #a3a3a3; font-size: 12px;">
          This is an automated message from the LMS platform.
        </p>
      </div>
    `;
    return sendEmail(studentEmail, subject, html);
  },

  async sendCourseCompletionEmail(
    studentEmail: string,
    studentName: string,
    courseTitle: string,
  ) {
    const subject = `Congratulations! You completed ${courseTitle}`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 0;">
        <h2 style="color: #1a1a1a; margin-bottom: 16px;">Course Completed! 🎉</h2>
        <p style="color: #525252; font-size: 15px; line-height: 1.6;">
          Hi ${studentName},
        </p>
        <p style="color: #525252; font-size: 15px; line-height: 1.6;">
          Congratulations on completing <strong>${courseTitle}</strong>!
          Keep up the great work - check out more courses to continue your learning journey.
        </p>
        <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/courses"
           style="display: inline-block; background: #2d6a4f; color: white; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 500; margin-top: 12px;">
          Browse More Courses
        </a>
        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0;" />
        <p style="color: #a3a3a3; font-size: 12px;">
          This is an automated message from the LMS platform.
        </p>
      </div>
    `;
    return sendEmail(studentEmail, subject, html);
  },

  async sendNewEnrollmentNotification(
    instructorEmail: string,
    instructorName: string,
    studentName: string,
    courseTitle: string,
  ) {
    const subject = `New Enrollment: ${studentName} joined ${courseTitle}`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 0;">
        <h2 style="color: #1a1a1a; margin-bottom: 16px;">New Student Enrolled</h2>
        <p style="color: #525252; font-size: 15px; line-height: 1.6;">
          Hi ${instructorName},
        </p>
        <p style="color: #525252; font-size: 15px; line-height: 1.6;">
          <strong>${studentName}</strong> has enrolled in your course <strong>${courseTitle}</strong>.
        </p>
        <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/instructor/courses"
           style="display: inline-block; background: #2d6a4f; color: white; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 500; margin-top: 12px;">
          View Your Courses
        </a>
        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0;" />
        <p style="color: #a3a3a3; font-size: 12px;">
          This is an automated message from the LMS platform.
        </p>
      </div>
    `;
    return sendEmail(instructorEmail, subject, html);
  },
};
