const validationService = require('../validation/service');

module.exports = {createLogin};

/**
 * Stores a username in the database
 *
 * @param {JSON} body The request body
 * @return {Promise} If successful or not
 */
function createLogin(body) {
  return new Promise((resolve, reject) => {
    validationService
        .validateCreateLoginsRequest(body.username, body.password, body.email)
        .then(() => resolve({'msg': 'User created successfully'}))
        .catch((err) => reject(err));
  });
}
