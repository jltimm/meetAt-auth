const express = require('express');
const loginsRouter = new express.Router();
const loginsService = require('./service');

loginsRouter.post('/create', createLogin);
module.exports = loginsRouter;

/**
 * Creates a login by calling the logins service
 *
 * @param {JSON} req The request
 * @param {JSON} res The response
 */
function createLogin(req, res) {
  console.log(req.body);
  res.send(loginsService.createLogin(req.body));
}
