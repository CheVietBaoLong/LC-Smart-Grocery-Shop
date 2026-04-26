const supplierRepo = require('../repositories/supplier.repository');
const { NotFoundError } = require('../utils/errors');

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

module.exports = {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  addSupply,
  getSuppliesByProduct,
};