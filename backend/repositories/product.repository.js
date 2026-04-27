const prisma = require('../prisma/client');

async function findAll() {
  return prisma.product.findMany({
    include: {
      product_price: {
        where: { end_date: null }, // current active price only
      },
    },
  });
}

async function findById(product_id) {
  return prisma.product.findUnique({
    where: { product_id },
    include: {
      product_price: {
        where: { end_date: null },
      },
      stock: {
        include: { warehouses: true },
      },
    },
  });
}

async function create(data) {
  return prisma.product.create({ data });
}

async function update(product_id, data) {
  return prisma.product.update({ where: { product_id }, data });
}

async function remove(product_id) {
  return prisma.product.delete({ where: { product_id } });
}

// ── Product Price ──────────────────────────────────────────────────────────────

async function getCurrentPrice(product_id) {
  return prisma.product_price.findFirst({
    where: { product_id, end_date: null },
    orderBy: { start_date: 'desc' },
  });
}

async function addPrice(data) {
  return prisma.$transaction(async (tx) => {
    // Close the previous active price
    await tx.product_price.updateMany({
      where: { product_id: data.product_id, end_date: null },
      data: { end_date: data.start_date },
    });
    // Insert the new price
    return tx.product_price.create({ data });
  });
}

async function getPriceHistory(product_id) {
  return prisma.product_price.findMany({
    where: { product_id },
    orderBy: { start_date: 'desc' },
  });
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
  getCurrentPrice,
  addPrice,
  getPriceHistory,
};