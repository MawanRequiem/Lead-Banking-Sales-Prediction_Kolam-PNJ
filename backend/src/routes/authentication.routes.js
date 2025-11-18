const express = require('express');
const authenticationController = require('../controllers/authentication.controller');
const { validate } = require('../middlewares/validation.middleware');
const { postAuthenticationSchema } = require('../validators/authentication.validator');

const router = express.Router();

router.post(
  '/login',
  validate(postAuthenticationSchema),
  authenticationController.login,
);
// router.post('/logout');

module.exports = router;
