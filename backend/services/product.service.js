const productRepo = require('../repositories/product.repository');
const { NotFoundError } = require('../utils/errors');

async function getAllProducts() {
  return productRepo.findAll();
}

async function getProductById(product_id) {
  const product = await productRepo.findById(product_id);
  if (!product) throw new NotFoundError(`Product ${product_id} not found`);
  return product;
}

async function createProduct(data) {
  return productRepo.create(data);
}

async function updateProduct(product_id, data) {
  const product = await productRepo.findById(product_id);
  if (!product) throw new NotFoundError(`Product ${product_id} not found`);
  return productRepo.update(product_id, data);
}

async function deleteProduct(product_id) {
  const product = await productRepo.findById(product_id);
  if (!product) throw new NotFoundError(`Product ${product_id} not found`);
  return productRepo.remove(product_id);
}

// ── Pricing ────────────────────────────────────────────────────────────────────

async function getCurrentPrice(product_id) {
  const product = await productRepo.findById(product_id);
  if (!product) throw new NotFoundError(`Product ${product_id} not found`);
  return productRepo.getCurrentPrice(product_id);
}

async function setNewPrice(product_id, sell_price, start_date) {
  const product = await productRepo.findById(product_id);
  if (!product) throw new NotFoundError(`Product ${product_id} not found`);
  return productRepo.addPrice({ product_id, sell_price, start_date: new Date(start_date) });
}

async function getPriceHistory(product_id) {
  const product = await productRepo.findById(product_id);
  if (!product) throw new NotFoundError(`Product ${product_id} not found`);
  return productRepo.getPriceHistory(product_id);
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