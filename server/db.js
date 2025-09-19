const { Pool } = require('pg');

const pool = new Pool({
  user: 'neondb', // PostgreSQL user
  host: 'ep-bold-smoke-ad0pqel1-pooler.c-2.us-east-1.aws.neon.tech', // Database host
  database: 'drive', // Name of the database
  password: 'npg_BZ0g9lcpiToj', // Database user password
  port: 5432, // Default PostgreSQL port
    sslmode: 'require' // Require SSL connection
});

module.exports = pool;

