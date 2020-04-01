const express = require('express');
const app = express();

if (process.argv.includes('--start')) {
  const port = process.env.PORT || 8081;
  console.log('Starting server on port ' + port);
  app.listen(port);
}

module.exports = app;
