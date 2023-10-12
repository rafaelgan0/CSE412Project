const { Pool } = require('pg');

const pool = new Pool({
  user: 'your_db_username',
  host: 'your_db_host',
  database: 'your_db_name',
  password: 'your_db_password',
  port: 5432, // PostgreSQL default port
});

pool.connect((err) => {
  if (err) {
    console.error('Error connecting to the database', err);
  } else {
    console.log('Connected to the database');
  }
});
