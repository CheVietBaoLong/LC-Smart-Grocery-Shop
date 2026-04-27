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
  if (!data.capacity || data.capacity <= 0) {
    throw new BadRequestError('Warehouse capacity is required and must be a positive number');
  }
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

  const warehouse = await warehouseRepo.findById(warehouse_id);
  if (!warehouse) throw new NotFoundError(`Warehouse ${warehouse_id} not found`);

  const totalStored = warehouse.stock.reduce((sum, s) => sum + (s.quantity ?? 0), 0);
  const existing = warehouse.stock.find(s => s.product_id === product_id);
  const existingQty = existing?.quantity ?? 0;
  const newTotal = totalStored - existingQty + quantity;

  if (newTotal > warehouse.capacity) {
    throw new BadRequestError(
      `Exceeds warehouse capacity. Available space: ${warehouse.capacity - totalStored + existingQty}`
    );
  }

  return warehouseRepo.upsertStock(product_id, warehouse_id, quantity);
}

async function adjustStock(product_id, warehouse_id, delta) {
  const current = await warehouseRepo.getStock(product_id, warehouse_id);
  if (!current) throw new NotFoundError('Stock record not found');

  if ((current.quantity ?? 0) + delta < 0) {
    throw new BadRequestError('Insufficient stock');
  }

  if (delta > 0) {
    const warehouse = await warehouseRepo.findById(warehouse_id);
    const totalStored = warehouse.stock.reduce((sum, s) => sum + (s.quantity ?? 0), 0);
    if (totalStored + delta > warehouse.capacity) {
      throw new BadRequestError(
        `Exceeds warehouse capacity. Available space: ${warehouse.capacity - totalStored}`
      );
    }
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