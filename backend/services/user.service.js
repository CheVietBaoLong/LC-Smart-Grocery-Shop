const bcrypt = require('bcrypt');
const userRepo = require('../repositories/user.repository');
const { NotFoundError, ForbiddenError } = require('../utils/errors');

const SALT_ROUNDS = 10;

async function getAllUsers() {
  return userRepo.findAll();
}

async function getUserById(user_id) {
  const user = await userRepo.findById(user_id);
  if (!user) throw new NotFoundError(`User ${user_id} not found`);
  return user;
}

async function updateUser(requesterId, requesterRole, targetId, data) {
  // A customer can only update their own account
  // Staff can update any account
  if (requesterRole === 'customer' && requesterId !== targetId) {
    throw new ForbiddenError('Customers can only update their own account');
  }

  const user = await userRepo.findById(targetId);
  if (!user) throw new NotFoundError(`User ${targetId} not found`);

  // If updating password, hash it
  if (data.password) {
    data.password = await bcrypt.hash(data.password, SALT_ROUNDS);
  }

  return userRepo.update(targetId, data);
}

async function deleteUser(user_id) {
  const user = await userRepo.findById(user_id);
  if (!user) throw new NotFoundError(`User ${user_id} not found`);
  return userRepo.remove(user_id);
}

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };