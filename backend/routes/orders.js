const express = require('express');
const prisma = require('../prisma/client');

const { verifyToken, isCustomer, isOwner } = require('../middleware/auth');
const router = express.Router();

// ============ SHOPPING CART (Database) ============

// Get cart for a customer
router.get('/cart/:user_id', verifyToken, isOwner, async (req, res) => {
  try {
    const { user_id } = req.params;
    
    const cart = await prisma.cart_item.findMany({
      where: { user_id: parseInt(user_id) },
      include: {
        product: {
          include: {
            product_price: {
              where: {
                OR: [
                  { end_date: null },
                  { end_date: { gte: new Date() } }
                ]
              },
              orderBy: { start_date: 'desc' },
              take: 1
            }
          }
        }
      }
    });

    res.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Add item to cart
router.post('/cart/:user_id', verifyToken, isOwner, async (req, res) => {
  try {
    const { user_id } = req.params;
    const { product_id, quantity } = req.body;

    // Check if item already in cart
    const existingItem = await prisma.cart_item.findUnique({
      where: {
        user_id_product_id: {
          user_id: parseInt(user_id),
          product_id: parseInt(product_id)
        }
      }
    });

    if (existingItem) {
      // Update quantity
      const updated = await prisma.cart_item.update({
        where: {
          user_id_product_id: {
            user_id: parseInt(user_id),
            product_id: parseInt(product_id)
          }
        },
        data: { quantity: existingItem.quantity + quantity }
      });
      res.json({ message: 'Cart updated', item: updated });
    } else {
      // Add new item
      const newItem = await prisma.cart_item.create({
        data: {
          user_id: parseInt(user_id),
          product_id: parseInt(product_id),
          quantity
        }
      });
      res.json({ message: 'Item added to cart', item: newItem });
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// Update item quantity in cart
router.put('/cart/:user_id/:product_id', verifyToken, isOwner, async (req, res) => {
  try {
    const { user_id, product_id } = req.params;
    const { quantity } = req.body;

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      await prisma.cart_item.delete({
        where: {
          user_id_product_id: {
            user_id: parseInt(user_id),
            product_id: parseInt(product_id)
          }
        }
      });
      res.json({ message: 'Item removed from cart' });
    } else {
      const updated = await prisma.cart_item.update({
        where: {
          user_id_product_id: {
            user_id: parseInt(user_id),
            product_id: parseInt(product_id)
          }
        },
        data: { quantity }
      });
      res.json({ message: 'Cart updated', item: updated });
    }
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

// Remove item from cart
router.delete('/cart/:user_id/:product_id', verifyToken, isOwner, async (req, res) => {
  try {
    const { user_id, product_id } = req.params;

    await prisma.cart_item.delete({
      where: {
        user_id_product_id: {
          user_id: parseInt(user_id),
          product_id: parseInt(product_id)
        }
      }
    });

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ error: 'Failed to remove from cart' });
  }
});

// Clear cart
router.delete('/cart/:user_id', verifyToken, isOwner, async (req, res) => {
  try {
    const { user_id } = req.params;
    
    await prisma.cart_item.deleteMany({
      where: { user_id: parseInt(user_id) }
    });

    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

// ============ ORDERS ============

// Place order (convert cart to order)
router.post('/place/:user_id', verifyToken, isOwner, async (req, res) => {
  try {
    const { user_id } = req.params;
    const { card_id, delivery_id, address_id } = req.body;

    // Get cart from database
    const cart = await prisma.cart_item.findMany({
      where: { user_id: parseInt(user_id) },
      include: {
        product: {
          include: {
            product_price: {
              where: {
                OR: [
                  { end_date: null },
                  { end_date: { gte: new Date() } }
                ]
              },
              orderBy: { start_date: 'desc' },
              take: 1
            }
          }
        }
      }
    });
    
    if (!cart || cart.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Get next order_id
    const lastOrder = await prisma.orders.findFirst({
      orderBy: { order_id: 'desc' }
    });
    const nextOrderId = (lastOrder?.order_id || 0) + 1;

    // Calculate total and create order items
    let totalCost = 0;
    const orderItems = [];

    for (const item of cart) {
      const price = item.product.product_price[0]?.sell_price || 0;
      totalCost += parseFloat(price) * item.quantity;

      orderItems.push({
        order_id: nextOrderId,
        product_id: item.product_id,
        quantity: item.quantity,
        purchase_price: price
      });
    }

    // Create order
    const order = await prisma.orders.create({
      data: {
        order_id: nextOrderId,
        user_id: parseInt(user_id),
        card_id: card_id || null,
        delivery_id: delivery_id || null,
        order_date: new Date(),
        status: 'Pending'
      }
    });

    // Create order items
    await prisma.order_item.createMany({
      data: orderItems
    });

    // Create order shipping if address provided
    if (address_id) {
      await prisma.order_shipping.create({
        data: {
          order_id: nextOrderId,
          address_id: address_id
        }
      });
    }

    // Update customer balance
    await prisma.customer.update({
      where: { user_id: parseInt(user_id) },
      data: {
        balance: { increment: totalCost }
      }
    });

    // Clear cart after order placed
    await prisma.cart_item.deleteMany({
      where: { user_id: parseInt(user_id) }
    });

    res.status(201).json({ 
      message: 'Order placed successfully', 
      order_id: nextOrderId,
      total: totalCost
    });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// Get customer's orders
router.get('/history/:user_id', verifyToken, isOwner, async (req, res) => {
  try {
    const { user_id } = req.params;

    const orders = await prisma.orders.findMany({
      where: { user_id: parseInt(user_id) },
      include: {
        order_item: {
          include: { product: true }
        },
        delivery_plan: true,
        payment_card: true,
        order_shipping: {
          include: { address: true }
        }
      },
      orderBy: { order_date: 'desc' }
    });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get single order details
router.get('/:order_id', async (req, res) => {
  try {
    const { order_id } = req.params;

    const order = await prisma.orders.findUnique({
      where: { order_id: parseInt(order_id) },
      include: {
        order_item: {
          include: { product: true }
        },
        delivery_plan: true,
        payment_card: true,
        order_shipping: {
          include: { address: true }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

module.exports = router;