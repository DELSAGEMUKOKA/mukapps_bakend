// src/controllers/settingsController.js
import { Settings, Company } from '../models/index.js';
import { NotFoundError, ValidationError } from '../utils/helpers.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Récupérer tous les paramètres
 */
export const getSettings = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    let settings = await Settings.findOne({
      where: { companyId }
    });

    if (!settings) {
      // Créer des paramètres par défaut
      settings = await Settings.create({
        id: uuidv4(),
        companyId,
        currency: 'USD',
        timezone: 'UTC',
        dateFormat: 'DD/MM/YYYY',
        invoicePrefix: 'INV-',
        taxRate: 0,
        lowStockThreshold: 5,
        emailNotifications: true,
        smsNotifications: false,
        lowStockAlerts: true,
        dailyReports: false
      });
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour les paramètres
 */
export const updateSettings = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const updates = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update settings'
      });
    }

    let settings = await Settings.findOne({
      where: { companyId }
    });

    if (!settings) {
      settings = await Settings.create({
        id: uuidv4(),
        companyId
      });
    }

    await settings.update(updates);

    res.json({
      success: true,
      data: settings,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer les informations de l'entreprise
 */
export const getCompanyInfo = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    const company = await Company.findByPk(companyId, {
      attributes: ['id', 'name', 'email', 'phone', 'address', 'city', 'country', 'taxId', 'logo']
    });

    if (!company) {
      throw new NotFoundError('Company not found');
    }

    res.json({
      success: true,
      data: company
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour les informations de l'entreprise
 */
export const updateCompanyInfo = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const updates = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update company info'
      });
    }

    const company = await Company.findByPk(companyId);

    if (!company) {
      throw new NotFoundError('Company not found');
    }

    await company.update(updates);

    res.json({
      success: true,
      data: company,
      message: 'Company info updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer les paramètres de facturation
 */
export const getInvoiceSettings = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    let settings = await Settings.findOne({
      where: { companyId },
      attributes: ['invoicePrefix', 'invoiceFooter', 'taxRate', 'dateFormat', 'currency']
    });

    if (!settings) {
      settings = {
        invoicePrefix: 'INV-',
        invoiceFooter: '',
        taxRate: 0,
        dateFormat: 'DD/MM/YYYY',
        currency: 'USD'
      };
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour les paramètres de facturation
 */
export const updateInvoiceSettings = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const updates = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update invoice settings'
      });
    }

    let settings = await Settings.findOne({
      where: { companyId }
    });

    if (!settings) {
      settings = await Settings.create({
        id: uuidv4(),
        companyId
      });
    }

    await settings.update(updates);

    res.json({
      success: true,
      data: settings,
      message: 'Invoice settings updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer les paramètres de notifications
 */
export const getNotificationSettings = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    let settings = await Settings.findOne({
      where: { companyId },
      attributes: ['emailNotifications', 'smsNotifications', 'lowStockAlerts', 'dailyReports']
    });

    if (!settings) {
      settings = {
        emailNotifications: true,
        smsNotifications: false,
        lowStockAlerts: true,
        dailyReports: false
      };
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour les paramètres de notifications
 */
export const updateNotificationSettings = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const updates = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update notification settings'
      });
    }

    let settings = await Settings.findOne({
      where: { companyId }
    });

    if (!settings) {
      settings = await Settings.create({
        id: uuidv4(),
        companyId
      });
    }

    await settings.update(updates);

    res.json({
      success: true,
      data: settings,
      message: 'Notification settings updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Réinitialiser les paramètres (admin seulement)
 */
export const resetSettings = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can reset settings'
      });
    }

    let settings = await Settings.findOne({
      where: { companyId }
    });

    if (!settings) {
      settings = await Settings.create({
        id: uuidv4(),
        companyId
      });
    }

    await settings.update({
      currency: 'USD',
      timezone: 'UTC',
      dateFormat: 'DD/MM/YYYY',
      invoicePrefix: 'INV-',
      taxRate: 0,
      lowStockThreshold: 5,
      emailNotifications: true,
      smsNotifications: false,
      lowStockAlerts: true,
      dailyReports: false
    });

    res.json({
      success: true,
      data: settings,
      message: 'Settings reset successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Export all functions
export default {
  getSettings,
  updateSettings,
  getCompanyInfo,
  updateCompanyInfo,
  getInvoiceSettings,
  updateInvoiceSettings,
  getNotificationSettings,
  updateNotificationSettings,
  resetSettings
};