// src/controllers/userController.js
import { User, Company } from '../models/index.js';
import { NotFoundError, ValidationError } from '../utils/helpers.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';

/**
 * Créer un nouvel utilisateur
 */
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;
    const companyId = req.user.companyId;

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can create users'
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({
      where: { 
        email, 
        company_id: companyId 
      }
    });

    if (existingUser) {
      throw new ValidationError('Email already exists in your company');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const user = await User.create({
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      role: role || 'cashier',
      phone,
      company_id: companyId,
      is_active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _export_date: new Date()
    });

    // Ne pas renvoyer le mot de passe
    const userResponse = user.toJSON();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      data: userResponse,
      message: 'User created successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer tous les utilisateurs avec pagination et filtres
 */
export const getUsers = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const { page = 1, limit = 20, search, role, isActive } = req.query;
    const offset = (page - 1) * limit;

    // Construire la requête
    const whereClause = { company_id: companyId };
    
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (role) {
      whereClause.role = role;
    }
    
    if (isActive !== undefined) {
      whereClause.is_active = isActive === 'true';
    }

    // Exécuter la requête avec pagination
    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: users,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer un utilisateur par ID
 */
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    const user = await User.findOne({
      where: { 
        id,
        company_id: companyId 
      },
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name']
        }
      ]
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
};

/**
 * Mettre à jour un utilisateur
 */
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;
    const { name, email, role, phone } = req.body;

    // Vérifier les permissions
    if (req.user.role !== 'admin' && req.user.userId !== id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own profile or be an admin'
      });
    }

    // Trouver l'utilisateur
    const user = await User.findOne({
      where: { 
        id,
        company_id: companyId 
      }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Vérifier si l'email est déjà pris (si changement d'email)
    if (email && email !== user.email) {
      const existingUser = await User.findOne({
        where: { 
          email, 
          company_id: companyId,
          id: { [Op.ne]: id }
        }
      });
      
      if (existingUser) {
        throw new ValidationError('Email already exists in your company');
      }
    }

    // Préparer les données de mise à jour
    const updateData = {
      updatedAt: new Date().toISOString()
    };
    
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    
    // Seul un admin peut changer le rôle
    if (req.user.role === 'admin' && role !== undefined) {
      updateData.role = role;
    }

    // Mettre à jour
    await user.update(updateData);

    // Récupérer l'utilisateur mis à jour
    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name']
        }
      ]
    });

    res.json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Désactiver un utilisateur
 */
export const deactivateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can deactivate users'
      });
    }

    if (req.user.userId === id) {
      throw new ValidationError('Cannot deactivate your own account');
    }

    const user = await User.findOne({
      where: { 
        id,
        company_id: companyId 
      }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    await user.update({
      is_active: false,
      updatedAt: new Date().toISOString()
    });

    // Récupérer l'utilisateur mis à jour
    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      data: updatedUser,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Activer un utilisateur
 */
export const activateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can activate users'
      });
    }

    const user = await User.findOne({
      where: { 
        id,
        company_id: companyId 
      }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    await user.update({
      is_active: true,
      updatedAt: new Date().toISOString()
    });

    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      data: updatedUser,
      message: 'User activated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprimer un utilisateur
 */
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can delete users'
      });
    }

    if (req.user.userId === id) {
      throw new ValidationError('Cannot delete your own account');
    }

    const user = await User.findOne({
      where: { 
        id,
        company_id: companyId 
      }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    await user.destroy();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer le profil de l'utilisateur connecté
 */
export const getCurrentUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'email', 'phone', 'address']
        }
      ]
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
};

/**
 * Changer le mot de passe
 */
export const changePassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;
    const companyId = req.user.companyId;

    // Vérifier les permissions
    if (req.user.userId !== id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only change your own password or be an admin'
      });
    }

    const user = await User.findOne({
      where: { 
        id,
        company_id: companyId 
      }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Si c'est l'utilisateur lui-même, vérifier l'ancien mot de passe
    if (req.user.userId === id) {
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        throw new ValidationError('Current password is incorrect');
      }
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour
    await user.update({
      password: hashedPassword,
      updatedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour le rôle d'un utilisateur
 */
export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const companyId = req.user.companyId;

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update user roles'
      });
    }

    if (req.user.userId === id) {
      throw new ValidationError('Cannot change your own role');
    }

    const user = await User.findOne({
      where: { 
        id,
        company_id: companyId 
      }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    await user.update({
      role,
      updatedAt: new Date().toISOString()
    });

    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      data: updatedUser,
      message: 'User role updated successfully'
    });
  } catch (error) {
    next(error);
  }
};