const validationService = require('../validation/service');
const db = require('../../db');
const crypto = require('crypto');

module.exports = {createLogin};

/**
 * Stores a username in the database
 *
 * @param {JSON} body The request body
 * @return {Promise} If successful or not
 */
function createLogin(body) {
  const username = body.username;
  const password = body.password;
  const email = body.email;
  return new Promise((resolve, reject) => {
    validationService
        .validateCreateLoginsRequest(username, password, email)
        .then(() => {
          insertLogin(username, password, email)
              .then(() => resolve({'msg': 'User created successfully'}))
              .catch((err) => reject(err));
        })
        .catch((err) => reject(err));
  });
}

/**
 * Generates a random string as an ID, and then inserts
 * the information into the database
 *
 * @param {string} username The username
 * @param {string} password The password
 * @param {string} email The email
 * @return {Promise} The promise
 */
function insertLogin(username, password, email) {
  const id = crypto.createHash('md5').update(username).digest('hex');
  const query = 'INSERT INTO logins(id, username, password, email) ' +
                'VALUES ($1, $2, $3, $4)';
  const values = [id, username, password, email];
  return new Promise((resolve, reject) => {
    db
        .query(query, values)
        .then(() => resolve())
        .catch((e) => reject(e));
  });
}
