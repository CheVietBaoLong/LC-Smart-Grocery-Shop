const authService = require('../services/auth.service');

async function registerCustomer(req, res, next) {
  try {
    const user = await authService.registerCustomer(req.body);
    res.status(201).json({ status: 'success', data: user });
  } catch (err) {
    next(err);
  }
}

async function registerStaff(req, res, next) {
  try {
    const user = await authService.registerStaff(req.body);
    res.status(201).json({ status: 'success', data: user });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

module.exports = { registerCustomer, registerStaff, login };