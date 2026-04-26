const productService = require('../services/product.service');

async function getAllProducts(req, res, next) {
  try {
    const products = await productService.getAllProducts();
    res.status(200).json({ status: 'success', data: products });
  } catch (err) {
    next(err);
  }
}

async function getProductById(req, res, next) {
  try {
    const product_id = parseInt(req.params.id);
    const product = await productService.getProductById(product_id);
    res.status(200).json({ status: 'success', data: product });
  } catch (err) {
    next(err);
  }
}

async function createProduct(req, res, next) {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json({ status: 'success', data: product });
  } catch (err) {
    next(err);
  }
}

async function updateProduct(req, res, next) {
  try {
    const product_id = parseInt(req.params.id);
    const product = await productService.updateProduct(product_id, req.body);
    res.status(200).json({ status: 'success', data: product });
  } catch (err) {
    next(err);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const product_id = parseInt(req.params.id);
    await productService.deleteProduct(product_id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// ── Pricing ────────────────────────────────────────────────────────────────────

async function getCurrentPrice(req, res, next) {
  try {
    const product_id = parseInt(req.params.id);
    const price = await productService.getCurrentPrice(product_id);
    res.status(200).json({ status: 'success', data: price });
  } catch (err) {
    next(err);
  }
}

async function setNewPrice(req, res, next) {
  try {
    const product_id = parseInt(req.params.id);
    const { sell_price, start_date } = req.body;
    const price = await productService.setNewPrice(product_id, sell_price, start_date);
    res.status(201).json({ status: 'success', data: price });
  } catch (err) {
    next(err);
  }
}

async function getPriceHistory(req, res, next) {
  try {
    const product_id = parseInt(req.params.id);
    const history = await productService.getPriceHistory(product_id);
    res.status(200).json({ status: 'success', data: history });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCurrentPrice,
  setNewPrice,
  getPriceHistory,
};