const { Pool } = require('pg');
const pool = new Pool({
  user: 'neondb_owner', // PostgreSQL user
  host: 'ep-bold-smoke-ad0pqel1-pooler.c-2.us-east-1.aws.neon.tech', // Database host
  database: 'neondb', // Name of the database
  password: 'npg_BZ0g9lcpiToj', // Database user password
  port: 5432, // Default PostgreSQL port  
  ssl: {
    rejectUnauthorized: false // this is important to bypass unauthorized SSL certificates (useful in some cases)
  }
});
module.exports = pool;
