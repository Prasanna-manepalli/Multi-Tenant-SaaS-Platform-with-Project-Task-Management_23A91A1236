const { body } = require('express-validator');

exports.registerTenantValidator = [
  body('tenantName').notEmpty(),
  body('subdomain').isAlphanumeric(),
  body('adminEmail').isEmail(),
  body('adminPassword').isLength({ min: 8 }),
  body('adminFullName').notEmpty(),
];

exports.loginValidator = [
  body('email').isEmail(),
  body('password').notEmpty(),
  body('tenantSubdomain').notEmpty(),
];
