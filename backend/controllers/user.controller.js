const userService = require('../services/user.service');

async function getAllUsers(req, res, next) {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json({ status: 'success', data: users });
  } catch (err) {
    next(err);
  }
}

async function getUserById(req, res, next) {
  try {
    const user_id = parseInt(req.params.id);
    const user = await userService.getUserById(user_id);
    res.status(200).json({ status: 'success', data: user });
  } catch (err) {
    next(err);
  }
}

async function updateUser(req, res, next) {
  try {
    const targetId = parseInt(req.params.id);
    const { user_id: requesterId, role: requesterRole } = req.user;
    const user = await userService.updateUser(requesterId, requesterRole, targetId, req.body);
    res.status(200).json({ status: 'success', data: user });
  } catch (err) {
    next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    const user_id = parseInt(req.params.id);
    await userService.deleteUser(user_id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };