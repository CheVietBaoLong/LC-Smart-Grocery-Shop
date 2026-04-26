const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma/client');
const userRepo = require('../repositories/user.repository');
const { ConflictError, UnauthorizedError, BadRequestError } = require('../utils/errors');

const SALT_ROUNDS = 10;

async function registerCustomer({ first_name, middle_name, last_name, email, password }) {
  const existing = await userRepo.findByEmail(email);
  if (existing) throw new ConflictError('Email already in use');

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);

  return prisma.$transaction(async (tx) => {
    const newUser = await tx.users.create({
      data: { user_id: userId, first_name, middle_name, last_name, email, password: hashed },
    });

    await tx.customer.create({
      data: { user_id: newUser.user_id, balance: 0 },
    });

    return {
      user_id: newUser.user_id,
      first_name: newUser.first_name,
      middle_name: newUser.middle_name,
      last_name: newUser.last_name,
      email: newUser.email,
      role: 'customer',
    };
  });
}

async function registerStaff({ first_name, middle_name, last_name, email, password, job_title, salary, warehouse_id, address_id }) {
  const existing = await userRepo.findByEmail(email);
  if (existing) throw new ConflictError('Email already in use');

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);

  return prisma.$transaction(async (tx) => {
    const newUser = await tx.users.create({
      data: { user_id: userId, first_name, middle_name, last_name, email, password: hashed },
    });

    await tx.staff.create({
      data: {
        user_id: newUser.user_id,
        job_title,
        salary: salary ?? 0,
        warehouse_id: warehouse_id ?? null,
        address_id: address_id ?? null,
      },
    });

    return {
      user_id: newUser.user_id,
      first_name: newUser.first_name,
      middle_name: newUser.middle_name,
      last_name: newUser.last_name,
      email: newUser.email,
      role: 'staff',
    };
  });
}

async function login({ email, password }) {
  const user = await userRepo.findByEmail(email);
  if (!user) throw new UnauthorizedError('Invalid email or password');

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new UnauthorizedError('Invalid email or password');

  const customer = await prisma.customer.findUnique({ where: { user_id: user.user_id } });
  const role = customer ? 'customer' : 'staff';

  const token = jwt.sign(
    { user_id: user.user_id, email: user.email, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  return {
    token,
    user: {
      user_id: user.user_id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role,
    },
  };
}

module.exports = { registerCustomer, registerStaff, login };