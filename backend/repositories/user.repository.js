const prisma = require('../prisma/client');

async function findAll() {
  return prisma.users.findMany({
    select: {
      user_id: true,
      first_name: true,
      middle_name: true,
      last_name: true,
      email: true,
      customer: { select: { balance: true } },
      staff: { select: { job_title: true, salary: true } },
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
      customer: { select: { balance: true } },
      staff: { select: { job_title: true, salary: true } },
    },
  });
}

async function findByEmail(email) {
  return prisma.users.findUnique({ where: { email } });
}

async function findByIdFull(user_id) {
  return prisma.users.findUnique({ where: { user_id } });
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

async function deposit(user_id, amount) {
  return prisma.customer.update({
    where: { user_id },
    data: { balance: { increment: amount } },
  });
}

module.exports = { findAll, findById, findByIdFull, findByEmail, create, update, remove, deposit };