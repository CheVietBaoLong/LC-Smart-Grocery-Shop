const warehouseService = require('../services/warehouse.service');

async function getAllWarehouses(req, res, next) {
  try {
    const warehouses = await warehouseService.getAllWarehouses();
    res.status(200).json({ status: 'success', data: warehouses });
  } catch (err) {
    next(err);
  }
}

async function getWarehouseById(req, res, next) {
  try {
    const warehouse_id = parseInt(req.params.id);
    const warehouse = await warehouseService.getWarehouseById(warehouse_id);
    res.status(200).json({ status: 'success', data: warehouse });
  } catch (err) {
    next(err);
  }
}

async function createWarehouse(req, res, next) {
  try {
    const warehouse = await warehouseService.createWarehouse(req.body);
    res.status(201).json({ status: 'success', data: warehouse });
  } catch (err) {
    next(err);
  }
}

async function updateWarehouse(req, res, next) {
  try {
    const warehouse_id = parseInt(req.params.id);
    const warehouse = await warehouseService.updateWarehouse(warehouse_id, req.body);
    res.status(200).json({ status: 'success', data: warehouse });
  } catch (err) {
    next(err);
  }
}

async function deleteWarehouse(req, res, next) {
  try {
    const warehouse_id = parseInt(req.params.id);
    await warehouseService.deleteWarehouse(warehouse_id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function setStock(req, res, next) {
  try {
    const warehouse_id = parseInt(req.params.id);
    const { product_id, quantity } = req.body;
    const stock = await warehouseService.setStock(product_id, warehouse_id, quantity);
    res.status(200).json({ status: 'success', data: stock });
  } catch (err) {
    next(err);
  }
}

async function adjustStock(req, res, next) {
  try {
    const warehouse_id = parseInt(req.params.id);
    const { product_id, delta } = req.body;
    const stock = await warehouseService.adjustStock(product_id, warehouse_id, delta);
    res.status(200).json({ status: 'success', data: stock });
  } catch (err) {
    next(err);
  }
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