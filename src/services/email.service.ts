import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';
import { config } from '../config/config';

export class EmailService {
  private static transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
    debug: true,
    logger: true
  });

  private static async getTemplate(templateName: string): Promise<string> {
    const templatePath = path.join(__dirname, '../templates', `${templateName}.html`);
    return await fs.readFile(templatePath, 'utf-8');
  }

  private static replaceTemplateVariables(template: string, variables: Record<string, string>): string {
    return Object.entries(variables).reduce(
      (acc, [key, value]) => acc.replace(new RegExp(`{{${key}}}`, 'g'), value),
      template
    );
  }

  static async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('SMTP connection verified successfully');
      return true;
    } catch (error) {
      console.error('SMTP connection verification failed:', error);
      return false;
    }
  }

  static async sendVerificationEmail(
    to: string,
    name: string,
    verificationToken: string
  ): Promise<void> {
    try {
      const template = await this.getTemplate('verifyEmail');
      const verificationLink = `${config.frontend.url}/verify-email?token=${verificationToken}`;
      
      const html = this.replaceTemplateVariables(template, {
        name,
        verificationLink,
      });

      const mailOptions = {
        from: `"Your App" <${config.email.user}>`,
        to,
        subject: 'Verify Your Email',
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Verification email sent successfully:', info.messageId);
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  static async sendPasswordResetEmail(
    to: string,
    name: string,
    resetToken: string
  ): Promise<void> {
    try {
      const template = await this.getTemplate('resetPassword');
      const resetLink = `${config.frontend.url}/reset-password?token=${resetToken}`;
      
      const html = this.replaceTemplateVariables(template, {
        name,
        resetLink,
      });

      const mailOptions = {
        from: `"Your App" <${config.email.user}>`,
        to,
        subject: 'Reset Your Password',
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent successfully:', info.messageId);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }
}
