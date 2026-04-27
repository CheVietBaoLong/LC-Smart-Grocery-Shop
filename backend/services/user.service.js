const bcrypt = require('bcrypt');
const userRepo = require('../repositories/user.repository');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../utils/errors');

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

  if (data.password) {
    if (!data.old_password) {
      throw new BadRequestError('Current password is required to change password');
    }
    const fullUser = await userRepo.findByIdFull(targetId);
    const isMatch = await bcrypt.compare(data.old_password, fullUser.password);
    if (!isMatch) throw new BadRequestError('Current password is incorrect');
    data.password = await bcrypt.hash(data.password, SALT_ROUNDS);
    delete data.old_password;
  }

  return userRepo.update(targetId, data);
}

async function deleteUser(user_id) {
  const user = await userRepo.findById(user_id);
  if (!user) throw new NotFoundError(`User ${user_id} not found`);
  return userRepo.remove(user_id);
}

async function deposit(user_id, amount) {
  if (amount <= 0) throw new BadRequestError('Amount must be positive');
  return userRepo.deposit(user_id, amount);
}

module.exports = { getAllUsers, getUserById, updateUser, deleteUser, deposit };