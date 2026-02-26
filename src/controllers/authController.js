// src/controllers/authController.js
import { User, Company } from '../models/index.js';
import { ValidationError, NotFoundError } from '../utils/helpers.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendEmail } from '../services/emailService.js';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';

const authController = {
  /**
   * Inscription d'un nouvel utilisateur
   */
  async register(req, res, next) {
    try {
      const { name, email, password, companyName } = req.body;

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new ValidationError('User already exists');
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);

      // Créer l'entreprise
      const companyId = uuidv4();
      const company = await Company.create({
        id: companyId,
        name: companyName,
        ownerId: null,
        createdAt: new Date().toISOString(),
        _export_date: new Date()
      });

      // Créer l'utilisateur
      const userId = uuidv4();
      const user = await User.create({
        id: userId,
        name,
        email,
        password: hashedPassword,
        role: 'admin',
        company_id: company.id,
        is_active: true,
        email_verified: false,
        email_verification_token: crypto.randomBytes(32).toString('hex'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _export_date: new Date()
      });

      // Mettre à jour le propriétaire de l'entreprise
      await company.update({ ownerId: user.id });

      // Générer le token JWT
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role, 
          companyId: user.company_id 
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Générer le refresh token
      const refreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '30d' }
      );

      await user.update({ refresh_token: refreshToken });

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            company_id: user.company_id
          },
          company: {
            id: company.id,
            name: company.name
          },
          token,
          refreshToken
        },
        message: 'Registration successful'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Connexion
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ 
        where: { email },
        include: [{ model: Company, as: 'company' }]
      });

      if (!user) {
        throw new ValidationError('Invalid credentials');
      }

      if (!user.is_active) {
        throw new ValidationError('Account is disabled');
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        // Incrémenter les tentatives échouées
        await user.increment('failed_login_attempts');
        throw new ValidationError('Invalid credentials');
      }

      // Réinitialiser les tentatives échouées
      await user.update({
        failed_login_attempts: 0,
        last_login: new Date(),
        locked_until: null
      });

      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role, 
          companyId: user.company_id 
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      const refreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '30d' }
      );

      await user.update({ refresh_token: refreshToken });

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            company_id: user.company_id
          },
          company: user.company,
          token,
          refreshToken
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Rafraîchir le token
   */
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      const user = await User.findOne({
        where: {
          id: decoded.id,
          refresh_token: refreshToken
        }
      });

      if (!user) {
        throw new ValidationError('Invalid refresh token');
      }

      const newToken = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role, 
          companyId: user.company_id 
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      const newRefreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '30d' }
      );

      await user.update({ refresh_token: newRefreshToken });

      res.json({
        success: true,
        data: {
          token: newToken,
          refreshToken: newRefreshToken
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Mot de passe oublié
   */
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ where: { email } });
      
      if (!user) {
        return res.json({
          success: true,
          message: 'If your email exists in our system, you will receive a password reset link'
        });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpires = new Date(Date.now() + 3600000); // 1 heure

      await user.update({
        password_reset_token: resetToken,
        password_reset_expires: resetTokenExpires
      });

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

      await sendEmail({
        to: user.email,
        subject: 'Password Reset Request',
        html: `
          <h2>Password Reset Request</h2>
          <p>Hi ${user.name},</p>
          <p>Click the link below to reset your password (valid for 1 hour):</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
        `
      });

      res.json({
        success: true,
        message: 'If your email exists in our system, you will receive a password reset link'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Réinitialiser le mot de passe - CORRIGÉ
   */
  async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;

      // Validation du mot de passe
      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'Le mot de passe est requis'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Le mot de passe doit contenir au moins 6 caractères'
        });
      }

      const user = await User.findOne({
        where: {
          password_reset_token: token,
          password_reset_expires: { [Op.gt]: new Date() }
        }
      });

      if (!user) {
        throw new ValidationError('Invalid or expired reset token');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await user.update({
        password: hashedPassword,
        password_reset_token: null,
        password_reset_expires: null,
        last_password_change: new Date(),
        updatedAt: new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Vérifier le token de réinitialisation
   */
  async verifyResetToken(req, res, next) {
    try {
      const { token } = req.params;

      const user = await User.findOne({
        where: {
          password_reset_token: token,
          password_reset_expires: { [Op.gt]: new Date() }
        },
        attributes: ['id', 'email']
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token'
        });
      }

      res.json({
        success: true,
        message: 'Token is valid',
        data: { email: user.email }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Vérifier l'email
   */
  async verifyEmail(req, res, next) {
    try {
      const { token } = req.body;

      const user = await User.findOne({
        where: { email_verification_token: token }
      });

      if (!user) {
        throw new ValidationError('Invalid verification token');
      }

      await user.update({
        email_verified: true,
        email_verification_token: null
      });

      res.json({
        success: true,
        message: 'Email verified successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Renvoyer l'email de vérification
   */
  async resendVerification(req, res, next) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.json({
          success: true,
          message: 'If your email exists, a verification email will be sent'
        });
      }

      if (user.email_verified) {
        throw new ValidationError('Email already verified');
      }

      const verificationToken = crypto.randomBytes(32).toString('hex');
      
      await user.update({
        email_verification_token: verificationToken
      });

      const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

      await sendEmail({
        to: user.email,
        subject: 'Verify Your Email',
        html: `
          <h2>Email Verification</h2>
          <p>Hi ${user.name},</p>
          <p>Click the link below to verify your email:</p>
          <p><a href="${verifyUrl}">${verifyUrl}</a></p>
        `
      });

      res.json({
        success: true,
        message: 'If your email exists, a verification email will be sent'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Profil de l'utilisateur connecté
   */
  async me(req, res, next) {
    try {
      const user = await User.findByPk(req.user.userId, {
        attributes: { exclude: ['password'] },
        include: [{ model: Company, as: 'company' }]
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Mettre à jour le profil
   */
  async updateProfile(req, res, next) {
    try {
      const { name, phone, avatar } = req.body;
      const userId = req.user.userId;

      const user = await User.findByPk(userId);

      if (!user) {
        throw new NotFoundError('User not found');
      }

      const updateData = { updatedAt: new Date().toISOString() };
      if (name) updateData.name = name;
      if (phone !== undefined) updateData.phone = phone;
      if (avatar !== undefined) updateData.avatar = avatar;

      await user.update(updateData);

      res.json({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        },
        message: 'Profile updated successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Changer le mot de passe
   */
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.userId;

      const user = await User.findByPk(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        throw new ValidationError('Current password is incorrect');
      }

      if (currentPassword === newPassword) {
        throw new ValidationError('New password must be different from current password');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await user.update({
        password: hashedPassword,
        last_password_change: new Date(),
        updatedAt: new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Déconnexion
   */
  async logout(req, res, next) {
    try {
      const userId = req.user.userId;

      await User.update(
        { refresh_token: null },
        { where: { id: userId } }
      );

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  }
};

export default authController;