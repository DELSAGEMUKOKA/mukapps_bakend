// scripts/convertSimple.js
import mysql from 'mysql2/promise';
import 'dotenv/config';

async function convert() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  const tables = [
    'companies', 'users', 'categories', 'products', 
    'invoices', 'customers', 'expenses', 'loginAttempts',
    'roles', 'settings', 'stockMovements', 'subscriptions',
    'userPins', 'adminActions'
  ];

  for (const table of tables) {
    try {
      console.log(`Converting ${table}...`);
      await connection.execute(`ALTER TABLE ${table} ENGINE = InnoDB`);
    } catch (err) {
      console.log(`Error on ${table}:`, err.message);
    }
  }

  await connection.end();
  console.log('Done!');
}

convert();