const prisma = require('../prisma/client');

// ── Address ────────────────────────────────────────────────────────────────────

async function findById(address_id) {
  return prisma.address.findUnique({ where: { address_id } });
}

async function create(data) {
  return prisma.address.create({ data });
}

async function update(address_id, data) {
  return prisma.address.update({ where: { address_id }, data });
}

async function remove(address_id) {
  return prisma.address.delete({ where: { address_id } });
}

// ── Customer Address (junction) ────────────────────────────────────────────────

async function getCustomerAddresses(user_id) {
  return prisma.customer_address.findMany({
    where: { user_id },
    include: { address: true },
  });
}

async function addCustomerAddress(user_id, address_id) {
  return prisma.customer_address.create({ data: { user_id, address_id } });
}

async function removeCustomerAddress(user_id, address_id) {
  return prisma.customer_address.delete({
    where: { user_id_address_id: { user_id, address_id } },
  });
}

// ── Payment Card ───────────────────────────────────────────────────────────────

async function findCardsByCustomer(user_id) {
  return prisma.payment_card.findMany({ where: { user_id } });
}

async function findCardById(card_id) {
  return prisma.payment_card.findUnique({ where: { card_id } });
}

async function createCard(data) {
  return prisma.payment_card.create({ data });
}

async function removeCard(card_id) {
  return prisma.payment_card.delete({ where: { card_id } });
}

module.exports = {
  findById,
  create,
  update,
  remove,
  getCustomerAddresses,
  addCustomerAddress,
  removeCustomerAddress,
  findCardsByCustomer,
  findCardById,
  createCard,
  removeCard,
};