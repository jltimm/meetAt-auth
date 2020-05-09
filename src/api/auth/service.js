const validationService = require('../validation/service');
const db = require('../../db');
const crypto = require('crypto');

module.exports = {createLogin, login};

/**
 * Authenticates the user
 *
 * @param {JSON} body The request body.
 * @return {String} The id of the user
 */
function login(body) {
  const username = body.username;
  const password = body.password;
  const email = body.email;
  return new Promise((resolve, reject) => {
    if (validationService.validateLoginRequest(username, password, email)) {
      getLoginId(username, password, email)
          .then((id) => resolve(id))
          .catch((err) => reject(err));
    } else {
      reject(new Error('Values missing from request'));
    }
  });
}

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
    if (
      validationService.validateCreateLoginsRequest(username, password, email)
    ) {
      insertLogin(username, password, email)
          .then(() => resolve({'msg': 'User created successfully'}))
          .catch((err) => reject(validationService.parseError(err)));
    } else {
      reject(new Error('The username, password, or email is missing'));
    }
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

/**
 * Grabs the id from the database, if its not found
 * then reject the promise.
 *
 * @param {String} username The username
 * @param {String} password The password
 * @param {String} email The email
 * @return {Promise} The promise
 */
function getLoginId(username, password, email) {
  const usernameQuery = 'SELECT id FROM logins ' +
                'WHERE username = $1 ' +
                'AND password = $2';
  const emailQuery = 'SELECT id FROM logins ' +
                'WHERE email = $1 ' +
                'AND password = $2';
  return new Promise((resolve, reject) => {
    db
        .query(!!username ? usernameQuery : emailQuery,
            [!!username ? username : email, password])
        .then((res) => {
          if (res.rows.length === 1) {
            resolve(res.rows[0].id);
          } else {
            reject(new Error('Invalid credentials'));
          }
        })
        .catch((err) => reject(err));
  });
}
