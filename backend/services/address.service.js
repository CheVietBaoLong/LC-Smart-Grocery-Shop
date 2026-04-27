const e = require('express');
const addressRepo = require('../repositories/address.repository');
const { NotFoundError, ForbiddenError } = require('../utils/errors');

async function createAddress(data) {
  return addressRepo.create(data);
}

async function updateAddress(address_id, data) {
  const address = await addressRepo.findById(address_id);
  if (!address) throw new NotFoundError(`Address ${address_id} not found`);
  return addressRepo.update(address_id, data);
}

async function deleteAddress(address_id) {
  const address = await addressRepo.findById(address_id);
  if (!address) throw new NotFoundError(`Address ${address_id} not found`);
  return addressRepo.remove(address_id);
}

// ── Customer Addresses ─────────────────────────────────────────────────────────

async function getMyAddresses(user_id) {
  return addressRepo.getCustomerAddresses(user_id);
}

async function addAddressToCustomer(user_id, addressData) {
  const address = await addressRepo.create(addressData);
  await addressRepo.addCustomerAddress(user_id, address.address_id);
  return address;
}

async function removeAddressFromCustomer(requesterId, requesterRole, user_id, address_id) {
  if (requesterRole === 'customer' && requesterId !== user_id) {
    throw new ForbiddenError('Access denied');
  }
  return addressRepo.removeCustomerAddress(user_id, address_id);
}

// ── Payment Cards ──────────────────────────────────────────────────────────────

async function getMyCards(user_id) {
  return addressRepo.findCardsByCustomer(user_id);
}

async function addCard(user_id, data) {
  // NOTE: Storing raw card data is insecure. Use a payment provider in production.
  return addressRepo.createCard({ ...data, user_id, expiry_date: new Date(data.expiry_date) });
}

async function removeCard(requesterId, requesterRole, card_id) {
  const card = await addressRepo.findCardById(card_id);
  if (!card) throw new NotFoundError(`Card ${card_id} not found`);

  if (requesterRole === 'customer' && card.user_id !== requesterId) {
    throw new ForbiddenError('Access denied');
  }

  return addressRepo.removeCard(card_id);
}

module.exports = {
  createAddress,
  updateAddress,
  deleteAddress,
  getMyAddresses,
  addAddressToCustomer,
  removeAddressFromCustomer,
  getMyCards,
  addCard,
  removeCard,
};