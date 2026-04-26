const prisma = require('../prisma/client');

async function findAll() {
  return prisma.users.findMany({
    select: {
      user_id: true,
      first_name: true,
      middle_name: true,
      last_name: true,
      email: true,
    },
  });
}

async function findById(user_id) {
  return prisma.users.findUnique({
    where: { user_id },
    select: {
      user_id: true,
      first_name: true,
      middle_name: true,
      last_name: true,
      email: true,
    },
  });
}

async function findByEmail(email) {
  // Includes password — only for auth use, never send to client
  return prisma.users.findUnique({ where: { email } });
}

async function create(data) {
  return prisma.users.create({
    data,
    select: {
      user_id: true,
      first_name: true,
      middle_name: true,
      last_name: true,
      email: true,
    },
  });
}

async function update(user_id, data) {
  return prisma.users.update({
    where: { user_id },
    data,
    select: {
      user_id: true,
      first_name: true,
      middle_name: true,
      last_name: true,
      email: true,
    },
  });
}

async function remove(user_id) {
  return prisma.users.delete({ where: { user_id } });
}

module.exports = { findAll, findById, findByEmail, create, update, remove };