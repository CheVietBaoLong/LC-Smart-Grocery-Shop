const prisma = require('../prisma/client');

// ── Warehouse ──────────────────────────────────────────────────────────────────

async function findAll() {
  return prisma.warehouse.findMany({
    include: { address: true, stock: { include: { products: true } } },
  });
}

async function findById(warehouse_id) {
  return prisma.warehouse.findUnique({
    where: { warehouse_id },
    include: { address: true, stock: { include: { products: true } } },
  });
}

async function create({ capacity, street, city, state, zip_code, country }) {
  return prisma.warehouse.create({
    data: {
      capacity,
      address: { create: { street, city, state, zip_code, country } },
    },
    include: { address: true },
  });
}

async function update(warehouse_id, data) {
  return prisma.warehouse.update({ where: { warehouse_id }, data });
}

async function remove(warehouse_id) {
  return prisma.warehouse.delete({ where: { warehouse_id } });
}

// ── Stock ──────────────────────────────────────────────────────────────────────

async function getStock(product_id, warehouse_id) {
  return prisma.stock.findUnique({
    where: { product_id_warehouse_id: { product_id, warehouse_id } },
  });
}

async function upsertStock(product_id, warehouse_id, quantity) {
  return prisma.stock.upsert({
    where: { product_id_warehouse_id: { product_id, warehouse_id } },
    update: { quantity },
    create: { product_id, warehouse_id, quantity },
  });
}

async function adjustStock(product_id, warehouse_id, delta) {
  // delta can be positive (restock) or negative (sold/removed)
  return prisma.stock.update({
    where: { product_id_warehouse_id: { product_id, warehouse_id } },
    data: { quantity: { increment: delta } },
  });
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
  getStock,
  upsertStock,
  adjustStock,
};