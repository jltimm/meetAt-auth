const validationService = require('../validation/service');

module.exports = {createLogin};

/**
 * Stores a username in the database
 *
 * @param {JSON} body The request body
 * @return {Promise} If successful or not
 */
function createLogin(body) {
  validationService
      .validateCreateLoginsRequest(body.username, body.password, body.email)
      .then(() => console.log('Nice!'))
      .catch((err) => console.log(err));
  // TODO: create the login
  return body.username + ' ' + body.password + ' ' + body.email;
}
