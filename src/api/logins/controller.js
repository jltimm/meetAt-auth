const express = require('express');
const loginsRouter = new express.Router();
const loginsService = require('./service');

loginsRouter.post('/create', createLogin);
loginsRouter.post('/login', login);
module.exports = loginsRouter;

/**
 * Creates a login by calling the logins service
 *
 * @param {JSON} req The request
 * @param {JSON} res The response
 */
function createLogin(req, res) {
  loginsService.createLogin(req.body)
      .then((msg) => res.send(msg))
      .catch((err) => res.status(400).send({'msg': err.message}));
}

/**
 * Authenticates the user. Following params must be provided:
 * username OR email
 * password
 *
 * @param {JSON} req The request
 * @param {JSON} res The response
 */
function login(req, res) {
  loginsService.login(req.body)
      .then((id) => res.send({'id': id}))
      .catch((err) => res.status(400).send({'msg': err.message}));
}
