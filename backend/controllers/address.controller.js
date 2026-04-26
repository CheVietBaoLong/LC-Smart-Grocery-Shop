const addressService = require('../services/address.service');

async function getMyAddresses(req, res, next) {
  try {
    const addresses = await addressService.getMyAddresses(req.user.user_id);
    res.status(200).json({ status: 'success', data: addresses });
  } catch (err) {
    next(err);
  }
}

async function addAddress(req, res, next) {
  try {
    const address = await addressService.addAddressToCustomer(req.user.user_id, req.body);
    res.status(201).json({ status: 'success', data: address });
  } catch (err) {
    next(err);
  }
}

async function removeAddress(req, res, next) {
  try {
    const address_id = parseInt(req.params.addressId);
    await addressService.removeAddressFromCustomer(
      req.user.user_id,
      req.user.role,
      req.user.user_id,
      address_id
    );
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function getMyCards(req, res, next) {
  try {
    const cards = await addressService.getMyCards(req.user.user_id);
    res.status(200).json({ status: 'success', data: cards });
  } catch (err) {
    next(err);
  }
}

async function addCard(req, res, next) {
  try {
    const card = await addressService.addCard(req.user.user_id, req.body);
    res.status(201).json({ status: 'success', data: card });
  } catch (err) {
    next(err);
  }
}

async function removeCard(req, res, next) {
  try {
    const card_id = parseInt(req.params.cardId);
    await addressService.removeCard(req.user.user_id, req.user.role, card_id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getMyAddresses, addAddress, removeAddress, getMyCards, addCard, removeCard };