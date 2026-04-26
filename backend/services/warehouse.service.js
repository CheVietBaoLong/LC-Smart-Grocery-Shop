const warehouseRepo = require('../repositories/warehouse.repository');
const { NotFoundError, BadRequestError } = require('../utils/errors');

async function getAllWarehouses() {
  return warehouseRepo.findAll();
}

async function getWarehouseById(warehouse_id) {
  const warehouse = await warehouseRepo.findById(warehouse_id);
  if (!warehouse) throw new NotFoundError(`Warehouse ${warehouse_id} not found`);
  return warehouse;
}

async function createWarehouse(data) {
  return warehouseRepo.create(data);
}

async function updateWarehouse(warehouse_id, data) {
  const warehouse = await warehouseRepo.findById(warehouse_id);
  if (!warehouse) throw new NotFoundError(`Warehouse ${warehouse_id} not found`);
  return warehouseRepo.update(warehouse_id, data);
}

async function deleteWarehouse(warehouse_id) {
  const warehouse = await warehouseRepo.findById(warehouse_id);
  if (!warehouse) throw new NotFoundError(`Warehouse ${warehouse_id} not found`);
  return warehouseRepo.remove(warehouse_id);
}

// ── Stock ──────────────────────────────────────────────────────────────────────

async function setStock(product_id, warehouse_id, quantity) {
  if (quantity < 0) throw new BadRequestError('Quantity cannot be negative');
  return warehouseRepo.upsertStock(product_id, warehouse_id, quantity);
}

async function adjustStock(product_id, warehouse_id, delta) {
  const current = await warehouseRepo.getStock(product_id, warehouse_id);
  if (!current) throw new NotFoundError('Stock record not found');

  if (current.quantity + delta < 0) {
    throw new BadRequestError('Insufficient stock');
  }

  return warehouseRepo.adjustStock(product_id, warehouse_id, delta);
}

module.exports = {
  getAllWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  setStock,
  adjustStock,
};