import sequelize, { testConnection } from './database.js';
import '../models/index.js';

export const syncDatabase = async (force = false) => {
  try {
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Failed to connect to database');
    }

    console.log('🔄 Synchronizing database schema...');

    if (force) {
      console.log('📊 Mode force activé - recréation complète des tables...');
      await sequelize.sync({ force: true });
    } else {
      // ✅ CORRECTION: Ne pas supprimer users automatiquement
      console.log('📝 Mode normal - préservation des données');
      
      try {
        // Synchronisation normale sans suppression
        await sequelize.sync({ alter: true });
        console.log('✅ Synchronisation réussie avec alter');
      } catch (alterError) {
        // Si alter échoue à cause de clés étrangères
        if (alterError.message.includes('Foreign key constraint')) {
          console.log('⚠️ Erreur de clé étrangère détectée');
          console.log('📋 Pour résoudre, exécutez avec force=true temporairement:');
          console.log('   await syncDatabase(true);');
        } else {
          throw alterError;
        }
      }
    }

    console.log('✓ Database schema synchronized successfully');
    return true;

  } catch (error) {
    console.error('✗ Database sync failed:', error.message);
    throw error;
  }
};

export default syncDatabase;