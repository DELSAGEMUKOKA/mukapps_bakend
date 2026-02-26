// src/middleware/userFilter.js

/**
 * Middleware pour filtrer les requêtes par utilisateur
 * Ajoute automatiquement les conditions de filtrage dans req.userFilter
 */

/**
 * Middleware de base pour filtrer selon le rôle
 * - Caissier: ne voit que ses propres données
 * - Admin/Supervisor: voit toutes les données de l'entreprise
 */
export const userFilter = (req, res, next) => {
  try {
    // Initialiser les filtres
    req.userFilter = {
      where: {}
    };

    const userRole = req.user.role;
    const userId = req.user.id;

    // Si caissier, filtrer par son propre ID
    if (userRole === 'cashier') {
      req.userFilter.where.userId = userId;
      
      // Ajouter un flag pour indiquer que le filtrage est actif
      req.userFilter.isFiltered = true;
      req.userFilter.filterType = 'self';
    } else {
      // Admin et supervisor voient tout
      req.userFilter.isFiltered = false;
      req.userFilter.filterType = 'all';
    }

    // Ajouter des métadonnées pour le logging
    req.userFilter.metadata = {
      role: userRole,
      userId: userId,
      timestamp: new Date().toISOString()
    };

    next();
  } catch (error) {
    console.error('❌ Error in userFilter middleware:', error);
    next(error);
  }
};

/**
 * Middleware spécifique pour les factures
 * Filtre les factures par utilisateur selon le rôle
 */
export const invoiceUserFilter = (req, res, next) => {
  try {
    req.invoiceFilter = {
      where: {}
    };

    const userRole = req.user.role;
    const userId = req.user.id;

    // Filtrer par entreprise (toujours)
    req.invoiceFilter.where.companyId = req.user.companyId;

    // Si caissier, filtrer par ses propres factures
    if (userRole === 'cashier') {
      req.invoiceFilter.where.userId = userId;
      req.invoiceFilter.isFiltered = true;
    } else {
      req.invoiceFilter.isFiltered = false;
    }

    next();
  } catch (error) {
    console.error('❌ Error in invoiceUserFilter middleware:', error);
    next(error);
  }
};

/**
 * Middleware pour les rapports
 * Filtre les données des rapports selon le rôle
 */
export const reportUserFilter = (req, res, next) => {
  try {
    req.reportFilter = {
      where: {}
    };

    const userRole = req.user.role;
    const userId = req.user.id;

    // Toujours filtrer par entreprise
    req.reportFilter.where.companyId = req.user.companyId;

    // Si caissier, filtrer par ses propres données
    if (userRole === 'cashier') {
      req.reportFilter.where.userId = userId;
      req.reportFilter.isFiltered = true;
      req.reportFilter.filterDescription = 'Données personnelles uniquement';
    } else {
      req.reportFilter.isFiltered = false;
      req.reportFilter.filterDescription = 'Toutes les données de l\'entreprise';
    }

    next();
  } catch (error) {
    console.error('❌ Error in reportUserFilter middleware:', error);
    next(error);
  }
};

/**
 * Middleware pour les dépenses
 * Filtre les dépenses selon le rôle
 */
export const expenseUserFilter = (req, res, next) => {
  try {
    req.expenseFilter = {
      where: {}
    };

    const userRole = req.user.role;

    // Toujours filtrer par entreprise
    req.expenseFilter.where.companyId = req.user.companyId;

    // Les dépenses peuvent être configurées différemment selon les besoins
    // Par exemple: les caissiers peuvent voir toutes les dépenses ou seulement les leurs
    if (userRole === 'cashier') {
      // Option 1: Les caissiers voient toutes les dépenses (lecture seule)
      req.expenseFilter.isFiltered = false;
      
      // Option 2: Les caissiers voient seulement leurs dépenses
      // req.expenseFilter.where.userId = req.user.id;
      // req.expenseFilter.isFiltered = true;
    } else {
      req.expenseFilter.isFiltered = false;
    }

    next();
  } catch (error) {
    console.error('❌ Error in expenseUserFilter middleware:', error);
    next(error);
  }
};

/**
 * Middleware pour les clients
 * Les clients sont généralement partagés dans l'entreprise
 */
export const customerUserFilter = (req, res, next) => {
  try {
    req.customerFilter = {
      where: {}
    };

    // Les clients sont toujours partagés dans l'entreprise
    req.customerFilter.where.companyId = req.user.companyId;
    req.customerFilter.isFiltered = false;

    next();
  } catch (error) {
    console.error('❌ Error in customerUserFilter middleware:', error);
    next(error);
  }
};

/**
 * Middleware pour les produits
 * Les produits sont toujours partagés dans l'entreprise
 */
export const productUserFilter = (req, res, next) => {
  try {
    req.productFilter = {
      where: {}
    };

    // Les produits sont toujours partagés
    req.productFilter.where.companyId = req.user.companyId;
    req.productFilter.isFiltered = false;

    next();
  } catch (error) {
    console.error('❌ Error in productUserFilter middleware:', error);
    next(error);
  }
};

/**
 * Middleware pour vérifier la propriété d'une ressource
 * À utiliser pour les routes individuelles (GET /:id, PUT /:id, etc.)
 */
export const checkResourceOwnership = (resourceModel) => {
  return async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Admin et supervisor peuvent tout faire
      if (userRole !== 'cashier') {
        return next();
      }

      // Pour les caissiers, vérifier qu'ils sont propriétaires de la ressource
      const resource = await resourceModel.findByPk(id);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }

      if (resource.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to access this resource'
        });
      }

      next();
    } catch (error) {
      console.error('❌ Error in checkResourceOwnership middleware:', error);
      next(error);
    }
  };
};

/**
 * Middleware pour ajouter des statistiques de filtrage à la réponse
 * Utile pour le débogage
 */
export const addFilterStats = (req, res, next) => {
  // Sauvegarder la fonction json originale
  const originalJson = res.json;

  // Surcharger res.json
  res.json = function(data) {
    // Ajouter des métadonnées de filtrage si en développement
    if (process.env.NODE_ENV === 'development' && req.userFilter) {
      data._filterStats = {
        applied: req.userFilter.isFiltered,
        filterType: req.userFilter.filterType,
        userRole: req.user.role,
        userId: req.user.id
      };
    }
    
    // Appeler la fonction json originale
    return originalJson.call(this, data);
  };

  next();
};

// Exporter un objet par défaut avec tous les middlewares
export default {
  userFilter,
  invoiceUserFilter,
  reportUserFilter,
  expenseUserFilter,
  customerUserFilter,
  productUserFilter,
  checkResourceOwnership,
  addFilterStats
};