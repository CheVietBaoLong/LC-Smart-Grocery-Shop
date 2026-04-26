const prisma = require('../prisma/client');

async function findAll() {
  return prisma.orders.findMany({
    include: {
      order_items: { include: { product: true } },
      delivery_plan: true,
      order_shipping: { include: { address: true } },
    },
  });
}

async function findById(order_id) {
  return prisma.orders.findUnique({
    where: { order_id },
    include: {
      order_items: { include: { product: true } },
      delivery_plan: true,
      order_shipping: { include: { address: true } },
      payment_card: true,
    },
  });
}

async function findByCustomer(user_id) {
  return prisma.orders.findMany({
    where: { user_id },
    include: {
      order_items: { include: { product: true } },
      delivery_plan: true,
      order_shipping: { include: { address: true } },
    },
  });
}

// Creates order + order_items + order_shipping in one transaction
async function create({ orderData, items, address_id }) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.orders.create({ data: orderData });

    await tx.order_item.createMany({
      data: items.map((item) => ({ ...item, order_id: order.order_id })),
    });

    if (address_id) {
      await tx.order_shipping.create({
        data: { order_id: order.order_id, address_id },
      });
    }

    return order;
  });
}

async function updateStatus(order_id, status) {
  return prisma.orders.update({ where: { order_id }, data: { status } });
}

async function remove(order_id) {
  return prisma.orders.delete({ where: { order_id } });
}

module.exports = { findAll, findById, findByCustomer, create, updateStatus, remove };