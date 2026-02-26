import { Sequelize, QueryTypes } from 'sequelize';
import env from './env.js';

const {
  DB_HOST,
  DB_PORT,
  DB_NAME,
  DB_USER,
  DB_PASSWORD
} = process.env;

if (!DB_HOST || !DB_NAME || !DB_USER) {
  console.error('ERROR: Database environment variables are not properly set');
  console.error('Please configure DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD in your .env file');
  process.exit(1);
}

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT || 3306,
  dialect: 'mysql',
  logging: env.isDevelopment ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: false,
    underscored: false
  }
});

export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ MySQL database connection established successfully');
    return true;
  } catch (error) {
    console.error('✗ Unable to connect to MySQL database:', error.message);
    console.error('Please check your database configuration in the .env file');
    return false;
  }
};

/**
 * Convertit toutes les tables MyISAM en InnoDB
 * Cette fonction résout le problème des clés étrangères
 */
export const convertToInnoDB = async () => {
  try {
    console.log('🔄 Vérification des moteurs de stockage...');
    
    // Récupérer toutes les tables MyISAM
    const tables = await sequelize.query(
      `SELECT table_name 
       FROM information_schema.tables 
       WHERE table_schema = :dbName 
       AND engine = 'MyISAM'`,
      {
        replacements: { dbName: DB_NAME },
        type: QueryTypes.SELECT
      }
    );

    if (tables.length === 0) {
      console.log('✅ Toutes les tables sont déjà en InnoDB');
      return true;
    }

    console.log(`📊 ${tables.length} table(s) MyISAM trouvée(s) :`);
    
    // Convertir chaque table
    for (const table of tables) {
      const tableName = table.table_name || table.TABLE_NAME;
      console.log(`  🔄 Conversion de ${tableName}...`);
      
      await sequelize.query(`ALTER TABLE ${tableName} ENGINE = InnoDB`);
      console.log(`  ✅ ${tableName} convertie en InnoDB`);
    }

    console.log('🎉 Toutes les tables ont été converties avec succès en InnoDB !');
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors de la conversion en InnoDB:', error.message);
    return false;
  }
};

export default sequelize;