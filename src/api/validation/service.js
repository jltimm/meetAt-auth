const db = require('../../db');

module.exports = {validateCreateLoginsRequest};

/**
 * Validates the request
 *
 * @param {String} username The username to validate
 * @param {String} password The password to validate
 * @param {String} email The email to validate
 * @return {Promise} The promise
 */
function validateCreateLoginsRequest(username, password, email) {
  return new Promise((resolve, reject) => {
    if (!username || !password || !email) {
      reject(new Error('The username, password, or email is missing'));
    } else {
      doesLoginExist(username, email)
          .then((loginExists) =>
              loginExists ?
                reject(new Error('Login information already exists')) :
                resolve())
          .catch((err) => reject(err));
    }
  });
}

/**
 * Checks if a login exists in the database by checking if the
 * username exists or if the email exists
 *
 * @param {String} username The username to check
 * @param {String} email The email to check
 * @return {Promise} The promise
 */
function doesLoginExist(username, email) {
  return new Promise((resolve, reject) => {
    db.query('SELECT COUNT(*) FROM logins ' +
             'WHERE username = $1 ' +
             'OR email = $2', [username, email])
        .then((res) => resolve(res.rows[0].count !== '0'))
        .catch((err) => reject(err));
  });
}
