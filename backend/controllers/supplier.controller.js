const supplierService = require('../services/supplier.service');

async function getAllSuppliers(req, res, next) {
  try {
    const suppliers = await supplierService.getAllSuppliers();
    res.status(200).json({ status: 'success', data: suppliers });
  } catch (err) {
    next(err);
  }
}

async function getSupplierById(req, res, next) {
  try {
    const supplier_id = parseInt(req.params.id);
    const supplier = await supplierService.getSupplierById(supplier_id);
    res.status(200).json({ status: 'success', data: supplier });
  } catch (err) {
    next(err);
  }
}

async function createSupplier(req, res, next) {
  try {
    const supplier = await supplierService.createSupplier(req.body);
    res.status(201).json({ status: 'success', data: supplier });
  } catch (err) {
    next(err);
  }
}

async function updateSupplier(req, res, next) {
  try {
    const supplier_id = parseInt(req.params.id);
    const supplier = await supplierService.updateSupplier(supplier_id, req.body);
    res.status(200).json({ status: 'success', data: supplier });
  } catch (err) {
    next(err);
  }
}

async function deleteSupplier(req, res, next) {
  try {
    const supplier_id = parseInt(req.params.id);
    await supplierService.deleteSupplier(supplier_id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function addSupply(req, res, next) {
  try {
    const supplier_id = parseInt(req.params.id);
    const { product_id, ...data } = req.body;
    const supply = await supplierService.addSupply(product_id, supplier_id, data);
    res.status(201).json({ status: 'success', data: supply });
  } catch (err) {
    next(err);
  }
}

async function getSuppliesByProduct(req, res, next) {
  try {
    const product_id = parseInt(req.params.productId);
    const supplies = await supplierService.getSuppliesByProduct(product_id);
    res.status(200).json({ status: 'success', data: supplies });
  } catch (err) {
    next(err);
  }
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