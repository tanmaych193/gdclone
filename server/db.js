const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres', // PostgreSQL user
  host: 'localhost', // Database host
  database: 'drive', // Name of the database
  password: '1234', // Database user password
  port: 5432, // Default PostgreSQL port
});

module.exports = pool;
