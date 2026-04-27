const supplierRepo = require('../repositories/supplier.repository');
const warehouseRepo = require('../repositories/warehouse.repository');
const { NotFoundError, BadRequestError } = require('../utils/errors');

async function getAllSuppliers() {
  return supplierRepo.findAll();
}

async function getSupplierById(supplier_id) {
  const supplier = await supplierRepo.findById(supplier_id);
  if (!supplier) throw new NotFoundError(`Supplier ${supplier_id} not found`);
  return supplier;
}

async function createSupplier(data) {
  return supplierRepo.create(data);
}

async function updateSupplier(supplier_id, data) {
  const supplier = await supplierRepo.findById(supplier_id);
  if (!supplier) throw new NotFoundError(`Supplier ${supplier_id} not found`);
  return supplierRepo.update(supplier_id, data);
}

async function deleteSupplier(supplier_id) {
  const supplier = await supplierRepo.findById(supplier_id);
  if (!supplier) throw new NotFoundError(`Supplier ${supplier_id} not found`);
  return supplierRepo.remove(supplier_id);
}

async function addSupply(product_id, supplier_id, data) {
  return supplierRepo.addSupply({ product_id, supplier_id, ...data });
}

async function getSuppliesByProduct(product_id) {
  return supplierRepo.getSuppliesByProduct(product_id);
}

async function receiveSupply(supplier_id, { product_id, supplier_price, quantity, start_date }) {
  const supplier = await supplierRepo.findById(supplier_id);
  if (!supplier) throw new NotFoundError(`Supplier ${supplier_id} not found`);

  const warehouses = await warehouseRepo.findAll();
  const target = warehouses.find(w => {
    const used = w.stock.reduce((sum, s) => sum + (s.quantity ?? 0), 0);
    const available = w.capacity != null ? w.capacity - used : Infinity;
    return available >= quantity;
  });

  if (!target) throw new BadRequestError('No warehouse has enough capacity for this supply');

  await supplierRepo.addSupply({
    product_id,
    supplier_id,
    supplier_price,
    start_date: start_date ? new Date(start_date) : new Date(),
  });

  const existing = target.stock.find(s => s.product_id === product_id);
  const newQty = (existing?.quantity ?? 0) + quantity;
  await warehouseRepo.upsertStock(product_id, target.warehouse_id, newQty);

  return { warehouse_id: target.warehouse_id, product_id, quantity_added: quantity };
}

module.exports = {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  addSupply,
  getSuppliesByProduct,
  receiveSupply,
};