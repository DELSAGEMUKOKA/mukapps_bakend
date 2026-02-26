import sequelize from '../config/database.js';

export const convertToInnoDB = async () => {
  try {
    const [results] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND ENGINE = 'MyISAM'
    `);

    for (const row of results) {
      const tableName = row.TABLE_NAME || row.table_name;
      console.log(`🔄 Converting ${tableName} to InnoDB...`);
      await sequelize.query(`ALTER TABLE ${tableName} ENGINE = InnoDB`);
    }
    
    return results.length;
  } catch (error) {
    console.error('Conversion error:', error);
    throw error;
  }
};