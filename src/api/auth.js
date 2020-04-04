require('dotenv').config();
const express = require('express');
const app = express();
const {Client} = require('pg');

if (process.argv.includes('--start')) {
  const port = process.env.PORT;
  console.log('Starting server on port ' + port);
  const client = new Client({
    connectionString: process.env.PGCONNSTRING,
  });
  client.connect();
  app.listen(port);
}

module.exports = app;
