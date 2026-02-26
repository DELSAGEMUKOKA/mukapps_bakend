// src/middleware/auth.js
import { UnauthorizedError } from '../utils/helpers.js';
import { verifyToken } from '../utils/encryption.js';
import { User } from '../models/index.js';

/**
 * Middleware d'authentification
 * Vérifie le token JWT et charge l'utilisateur
 */
export const authenticate = async (req, res, next) => {
  try {
    // Récupérer le token du header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      throw new UnauthorizedError('Authentication required');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedError('Authentication required');
    }

    // Vérifier et décoder le token
    const decoded = verifyToken(token);
    
    // Le token peut avoir 'userId' ou 'id' selon la création
    const userId = decoded.id || decoded.userId;
    
    if (!userId) {
      console.error('❌ Structure de token invalide:', {
        decoded,
        keys: Object.keys(decoded)
      });
      throw new UnauthorizedError('Invalid token structure');
    }

    // Charger l'utilisateur depuis la base de données
    const user = await User.findByPk(userId);

    // Vérifier que l'utilisateur existe et est actif
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (!user.is_active) {
      throw new UnauthorizedError('User account is disabled');
    }

    // Ajouter l'utilisateur à la requête
    req.user = {
      userId: user.id,
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.company_id
    };

    // Log de débogage en développement
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Authentification réussie:', {
        userId: user.id,
        email: user.email,
        role: user.role
      });
    }

    next();
  } catch (error) {
    // Gestion des erreurs JWT spécifiques
    if (error.name === 'JsonWebTokenError') {
      console.error('❌ Token invalide:', error.message);
      return next(new UnauthorizedError('Invalid token'));
    }
    
    if (error.name === 'TokenExpiredError') {
      console.error('❌ Token expiré:', error.message);
      return next(new UnauthorizedError('Token expired'));
    }

    // Autres erreurs
    console.error('❌ Erreur d\'authentification:', error);
    next(error);
  }
};

// Alias pour compatibilité
export const authenticateToken = authenticate;

/**
 * Middleware optionnel (n'échoue pas si pas de token)
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      const decoded = verifyToken(token);
      const userId = decoded.id || decoded.userId;
      
      if (userId) {
        const user = await User.findByPk(userId);
        if (user && user.is_active) {
          req.user = {
            userId: user.id,
            id: user.id,
            email: user.email,
            role: user.role,
            companyId: user.company_id
          };
        }
      }
    }
    next();
  } catch (error) {
    // Ignorer les erreurs pour l'auth optionnelle
    next();
  }
};

/**
 * Middleware pour vérifier les rôles
 * @param {...string} roles - Rôles autorisés (ex: 'admin', 'supervisor', 'cashier')
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return next(new UnauthorizedError('Authentication required'));
      }

      if (!req.user.role) {
        return next(new UnauthorizedError('User has no role assigned'));
      }

      if (!roles.includes(req.user.role)) {
        // Log pour déboguer
        console.log('⛔ Accès refusé - Rôle insuffisant:', {
          userRole: req.user.role,
          requiredRoles: roles,
          userId: req.user.id,
          path: req.originalUrl
        });

        return next(new UnauthorizedError(
          `Accès refusé. Rôle requis: ${roles.join(' ou ')}. Votre rôle: ${req.user.role}`
        ));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware pour admin seulement
 */
export const requireAdmin = requireRole('admin');

/**
 * Middleware pour admin et supervisor
 */
export const requireSupervisor = requireRole('admin', 'supervisor');

/**
 * Middleware pour admin, supervisor et operator
 */
export const requireOperator = requireRole('admin', 'supervisor', 'operator');

/**
 * Middleware pour vérifier l'accès à une entreprise
 */
export const requireCompanyAccess = (req, res, next) => {
  try {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    const companyId = req.params.companyId || req.body.companyId || req.query.companyId;
    
    if (companyId && companyId !== req.user.companyId) {
      console.log('⛔ Accès refusé - Entreprise différente:', {
        requestedCompany: companyId,
        userCompany: req.user.companyId,
        userId: req.user.id
      });
      return next(new UnauthorizedError('Access denied to this company'));
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware pour vérifier que l'utilisateur est propriétaire de la ressource
 * @param {Function} getResourceUserId - Fonction pour récupérer l'ID utilisateur de la ressource
 */
export const requireResourceOwner = (getResourceUserId) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return next(new UnauthorizedError('Authentication required'));
      }

      // Admin peut tout faire
      if (req.user.role === 'admin') {
        return next();
      }

      const resourceUserId = await getResourceUserId(req);
      
      if (resourceUserId !== req.user.id) {
        return next(new UnauthorizedError('You do not own this resource'));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default {
  authenticate,
  authenticateToken,
  optionalAuth,
  requireRole,
  requireAdmin,
  requireSupervisor,
  requireOperator,
  requireCompanyAccess,
  requireResourceOwner
};