module.exports = {
  validateCreateLoginsRequest,
  validateLoginRequest,
  parseError,
};

/**
 * Validates the request
 *
 * @param {String} username The username to validate
 * @param {String} password The password to validate
 * @param {String} email The email to validate
 * @return {Promise} The promise
 */
function validateCreateLoginsRequest(username, password, email) {
  return (!username || !password || !email) ? false : true;
}

/**
 * Checks the presence of the required params.
 * Username or email must be present, and password must be present.
 *
 * @param {String} username The username
 * @param {String} password The password
 * @param {String} email The email
 * @return {Boolean} If the request is okay or not
 */
function validateLoginRequest(username, password, email) {
  return ((!!username || !!email) && !!password);
}

/**
 * Parses the postgres error
 *
 * @param {JSON} error The error
 * @return {Error} The error, without exposing too much
 */
function parseError(error) {
  if (error.message.includes('logins_pkey')) {
    return new Error('Username already exists');
  }
  if (error.message.includes('logins_email_key')) {
    return new Error('Email already exists');
  }
  return new Error('Error creating login');
}
