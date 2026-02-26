// src/services/emailService.js
import nodemailer from 'nodemailer';

// Configuration du transporteur d'email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Envoyer un email
 */
export const sendEmail = async ({ to, subject, html }) => {
  try {
    // En développement, simuler l'envoi
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email would be sent:', { to, subject });
      console.log('📝 Content:', html);
      return { success: true, message: 'Email simulated' };
    }

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Inventory System" <noreply@inventory.com>',
      to,
      subject,
      html
    });

    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email error:', error);
    throw error;
  }
};

/**
 * Envoyer un email de bienvenue
 */
export const sendWelcomeEmail = async (user) => {
  const html = `
    <h2>Welcome to Inventory Management System!</h2>
    <p>Hi ${user.name},</p>
    <p>Your account has been created successfully.</p>
    <p>You can now log in with your email: ${user.email}</p>
  `;

  return sendEmail({
    to: user.email,
    subject: 'Welcome to Inventory System',
    html
  });
};

export default {
  sendEmail,
  sendWelcomeEmail
};