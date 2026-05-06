const orderRepo = require('../repositories/order.repository');
const productRepo = require('../repositories/product.repository');
const warehouseRepo = require('../repositories/warehouse.repository');
const { NotFoundError, BadRequestError, ForbiddenError } = require('../utils/errors');
const { Prisma } = require('@prisma/client');

async function getAllOrders() {
  return orderRepo.findAll();
}

async function getOrderById(order_id, requesterId, requesterRole) {
  const order = await orderRepo.findById(order_id);
  if (!order) throw new NotFoundError(`Order ${order_id} not found`);

  // Customers can only view their own orders
  if (requesterRole === 'customer' && order.user_id !== requesterId) {
    throw new ForbiddenError('Access denied');
  }

  return order;
}

async function getMyOrders(user_id) {
  return orderRepo.findByCustomer(user_id);
}

const DELIVERY_OPTIONS = {
  Express:  { cost: 25.00, shipDays: 1,  deliverDays: 3  },
  Standard: { cost: 10.00, shipDays: 3,  deliverDays: 10 },
};

async function createOrder({ user_id, card_id, delivery_id, delivery_type, order_date, items, address_id }) {
  if (!items || items.length === 0) {
    throw new BadRequestError('Order must contain at least one item');
  }

  // For each item, get current price and attach it as purchase_price
  const enrichedItems = await Promise.all(
    items.map(async ({ product_id, quantity }) => {
      const product = await productRepo.findById(product_id);
      if (!product) throw new NotFoundError(`Product ${product_id} not found`);

      const price = await productRepo.getCurrentPrice(product_id);
      if (!price) throw new BadRequestError(`No active price for product ${product_id}`);

      return { product_id, quantity, purchase_price: price.sell_price };
    })
  );

  const itemsTotal = enrichedItems.reduce(
    (sum, { quantity, purchase_price }) => sum + quantity * Number(purchase_price),
    0
  );

  let deliveryPlanData = null;
  let deliveryCost = 0;

  if (delivery_type) {
    const option = DELIVERY_OPTIONS[delivery_type];
    if (!option) throw new BadRequestError(`Invalid delivery type: ${delivery_type}`);
    const orderDateObj = new Date(order_date);
    const ship_date = new Date(orderDateObj);
    ship_date.setDate(ship_date.getDate() + option.shipDays);
    const delivery_date = new Date(orderDateObj);
    delivery_date.setDate(delivery_date.getDate() + option.deliverDays);
    deliveryPlanData = {
      delivery_type,
      delivery_cost: new Prisma.Decimal(option.cost),
      ship_date,
      delivery_date,
    };
    deliveryCost = option.cost;
  }

  const total = itemsTotal + deliveryCost;

  return orderRepo.create({
    orderData: { user_id, card_id, delivery_id, order_date: new Date(order_date), status: 'Pending' },
    deliveryPlanData,
    items: enrichedItems,
    address_id,
    total,
  });
}

async function updateOrderStatus(order_id, status) {
  const order = await orderRepo.findById(order_id);
  if (!order) throw new NotFoundError(`Order ${order_id} not found`);

  const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Return'];
  if (!validStatuses.includes(status)) {
    throw new BadRequestError(`Invalid status: ${status}`);
  }

  return orderRepo.updateStatus(order_id, status);
}

async function cancelOrder(order_id, requesterId, requesterRole) {
  const order = await orderRepo.findById(order_id);
  if (!order) throw new NotFoundError(`Order ${order_id} not found`);

  if (requesterRole === 'customer' && order.user_id !== requesterId) {
    throw new ForbiddenError('Access denied');
  }

  if (!['Pending', 'Processing'].includes(order.status)) {
    throw new BadRequestError('Only Pending or Processing orders can be cancelled');
  }

  const refundAmount = order.order_item.reduce(
    (sum, item) => sum + item.quantity * Number(item.purchase_price),
    0
  );

  return orderRepo.cancelAndRefund(order_id, order.user_id, refundAmount);
}

module.exports = {
  getAllOrders,
  getOrderById,
  getMyOrders,
  createOrder,
  updateOrderStatus,
  cancelOrder,
};