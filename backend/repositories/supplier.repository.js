const prisma = require('../prisma/client');

async function findAll() {
  return prisma.supplier.findMany({
    include: { address: true, supplies: { include: { product: true } } },
  });
}

async function findById(supplier_id) {
  return prisma.supplier.findUnique({
    where: { supplier_id },
    include: { address: true, supplies: { include: { product: true } } },
  });
}

async function create({ name, street, city, state, zip_code, country }) {
  return prisma.supplier.create({
    data: {
      name,
      ...(street && { address: { create: { street, city, state, zip_code, country } } }),
    },
    include: { address: true },
  });
}

async function update(supplier_id, data) {
  return prisma.supplier.update({ where: { supplier_id }, data });
}

async function remove(supplier_id) {
  return prisma.supplier.delete({ where: { supplier_id } });
}

// ── Supplies (junction) ────────────────────────────────────────────────────────

async function addSupply(data) {
  return prisma.supplies.create({ data });
}

async function getSuppliesByProduct(product_id) {
  return prisma.supplies.findMany({
    where: { product_id },
    include: { supplier: true },
    orderBy: { start_date: 'desc' },
  });
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
  addSupply,
  getSuppliesByProduct,
};