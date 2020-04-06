require('dotenv').config();
const {Pool} = require('pg');

const pool = new Pool({
  connectionString: process.env.PGCONNSTRING,
});

module.exports = {
  query: (text, params, callback) => {
    return pool.query(text, params, callback);
  },
};
