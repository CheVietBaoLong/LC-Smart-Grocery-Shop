const orderService = require('../services/order.service');

async function getAllOrders(req, res, next) {
  try {
    const orders = await orderService.getAllOrders();
    res.status(200).json({ status: 'success', data: orders });
  } catch (err) {
    next(err);
  }
}

async function getOrderById(req, res, next) {
  try {
    const order_id = parseInt(req.params.id);
    const { user_id, role } = req.user;
    const order = await orderService.getOrderById(order_id, user_id, role);
    res.status(200).json({ status: 'success', data: order });
  } catch (err) {
    next(err);
  }
}

async function getMyOrders(req, res, next) {
  try {
    const orders = await orderService.getMyOrders(req.user.user_id);
    res.status(200).json({ status: 'success', data: orders });
  } catch (err) {
    next(err);
  }
}

async function createOrder(req, res, next) {
  try {
    const order = await orderService.createOrder({
      ...req.body,
      user_id: req.user.user_id,
    });
    res.status(201).json({ status: 'success', data: order });
  } catch (err) {
    next(err);
  }
}

async function updateOrderStatus(req, res, next) {
  try {
    const order_id = parseInt(req.params.id);
    const { status } = req.body;
    const order = await orderService.updateOrderStatus(order_id, status);
    res.status(200).json({ status: 'success', data: order });
  } catch (err) {
    next(err);
  }
}

async function cancelOrder(req, res, next) {
  try {
    const order_id = parseInt(req.params.id);
    const { user_id, role } = req.user;
    const order = await orderService.cancelOrder(order_id, user_id, role);
    res.status(200).json({ status: 'success', data: order });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllOrders,
  getOrderById,
  getMyOrders,
  createOrder,
  updateOrderStatus,
  cancelOrder,
};