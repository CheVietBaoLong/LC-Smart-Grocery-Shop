const { verifyToken, isOwner } = require('../middleware/auth');

const express = require('express');
const prisma = require('../prisma/client');

const router = express.Router();

// Test route
console.log('Customer routes loaded!');
router.get('/test', (req, res) => {
  res.json({ message: 'Customer routes working!' });
});

// ============ ADDRESSES ============

// Get all addresses for a customer
router.get('/:user_id/addresses', verifyToken, isOwner, async (req, res) => {
  try {
    const { user_id } = req.params;

    const addresses = await prisma.customer_address.findMany({
      where: { user_id: parseInt(user_id) },
      include: { address: true }
    });

    res.json(addresses);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ error: 'Failed to fetch addresses' });
  }
});

// Add new address for a customer
router.post('/:user_id/addresses', verifyToken, isOwner, async (req, res) => {
  try {
    const { user_id } = req.params;
    const { country, street, city, state, zip_code } = req.body;

    // Get next address_id
    const lastAddress = await prisma.address.findFirst({
      orderBy: { address_id: 'desc' }
    });
    const nextAddressId = (lastAddress?.address_id || 0) + 1;

    // Create address
    const address = await prisma.address.create({
      data: {
        address_id: nextAddressId,
        country,
        street,
        city,
        state,
        zip_code
      }
    });

    // Link address to customer
    await prisma.customer_address.create({
      data: {
        user_id: parseInt(user_id),
        address_id: nextAddressId
      }
    });

    res.status(201).json({ message: 'Address added', address });
  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({ error: 'Failed to add address' });
  }
});

// Update an address
router.put('/:user_id/addresses/:address_id', verifyToken, isOwner, async (req, res) => {
  try {
    const { address_id } = req.params;
    const { country, street, city, state, zip_code } = req.body;

    const address = await prisma.address.update({
      where: { address_id: parseInt(address_id) },
      data: { country, street, city, state, zip_code }
    });

    res.json({ message: 'Address updated', address });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ error: 'Failed to update address' });
  }
});

// Delete an address
router.delete('/:user_id/addresses/:address_id', verifyToken, isOwner, async (req, res) => {
  try {
    const { user_id, address_id } = req.params;

    // Remove link first
    await prisma.customer_address.delete({
      where: {
        user_id_address_id: {
          user_id: parseInt(user_id),
          address_id: parseInt(address_id)
        }
      }
    });

    // Delete address
    await prisma.address.delete({
      where: { address_id: parseInt(address_id) }
    });

    res.json({ message: 'Address deleted' });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ error: 'Failed to delete address' });
  }
});

// ============ CREDIT CARDS ============

// Get all credit cards for a customer
router.get('/:user_id/cards', verifyToken, isOwner, async (req, res) => {
  try {
    const { user_id } = req.params;

    const cards = await prisma.payment_card.findMany({
      where: { user_id: parseInt(user_id) },
      include: { address: true }
    });

    res.json(cards);
  } catch (error) {
    console.error('Error fetching cards:', error);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
});

// Add new credit card
router.post('/:user_id/cards', verifyToken, isOwner, async (req, res) => {
  try {
    const { user_id } = req.params;
    const { card_type, card_number, expiry_date, cvv, address_id } = req.body;

    // Get next card_id
    const lastCard = await prisma.payment_card.findFirst({
      orderBy: { card_id: 'desc' }
    });
    const nextCardId = (lastCard?.card_id || 0) + 1;

    const card = await prisma.payment_card.create({
      data: {
        card_id: nextCardId,
        user_id: parseInt(user_id),
        card_type,
        card_number,
        expiry_date: new Date(expiry_date),
        cvv,
        address_id: address_id || null
      }
    });

    res.status(201).json({ message: 'Card added', card });
  } catch (error) {
    console.error('Error adding card:', error);
    res.status(500).json({ error: 'Failed to add card' });
  }
});

// Update a credit card
router.put('/:user_id/cards/:card_id', verifyToken, isOwner, async (req, res) => {
  try {
    const { card_id } = req.params;
    const { card_type, card_number, expiry_date, cvv, address_id } = req.body;

    const card = await prisma.payment_card.update({
      where: { card_id: parseInt(card_id) },
      data: {
        card_type,
        card_number,
        expiry_date: new Date(expiry_date),
        cvv,
        address_id: address_id || null
      }
    });

    res.json({ message: 'Card updated', card });
  } catch (error) {
    console.error('Error updating card:', error);
    res.status(500).json({ error: 'Failed to update card' });
  }
});

// Delete a credit card
router.delete('/:user_id/cards/:card_id', verifyToken, isOwner, async (req, res) => {
  try {
    const { card_id } = req.params;

    await prisma.payment_card.delete({
      where: { card_id: parseInt(card_id) }
    });

    res.json({ message: 'Card deleted' });
  } catch (error) {
    console.error('Error deleting card:', error);
    res.status(500).json({ error: 'Failed to delete card' });
  }
});

module.exports = router;