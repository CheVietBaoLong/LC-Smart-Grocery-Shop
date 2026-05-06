import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api';
import './Cart.css';

export default function Cart() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [cards, setCards] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [balance, setBalance] = useState(0);
  const [form, setForm] = useState({ card_id: '', address_id: '', delivery_type: 'Standard' });
  const [newAddress, setNewAddress] = useState({ country: '', street: '', city: '', state: '', zip_code: '' });
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return navigate('/login');
    setCart(JSON.parse(localStorage.getItem('cart') || '[]'));
    Promise.all([
      API.get('/me/cards'),
      API.get('/me/addresses'),
      API.get(`/users/${user.user_id}`),
    ]).then(([cardsRes, addrRes, userRes]) => {
      setCards(cardsRes.data.data);
      setAddresses(addrRes.data.data);
      const customerBalance = userRes.data.data?.customer?.balance || 0;
      setBalance(parseFloat(customerBalance));
    });
  }, [user, navigate]);

  const updateQty = (product_id, qty) => {
    const updated = qty <= 0
      ? cart.filter(i => i.product_id !== product_id)
      : cart.map(i => i.product_id === product_id ? { ...i, quantity: qty } : i);
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const DELIVERY_COSTS = { Standard: 10.00, Express: 25.00 };
  const itemsTotal = cart.reduce((sum, i) => sum + (parseFloat(i.price) * i.quantity), 0);
  const deliveryCost = DELIVERY_COSTS[form.delivery_type] || 0;
  const total = itemsTotal + deliveryCost;

  const placeOrder = async () => {
    setError('');
    if (cart.length === 0) return setError('Your cart is empty');
    if (!form.card_id) return setError('Please select a payment card');
    if (!form.delivery_type) return setError('Please select a delivery type');
    if (!useNewAddress && !form.address_id) return setError('Please select a shipping address');
    if (useNewAddress && !newAddress.street) return setError('Please fill in the shipping address');
    if (!form.card_id && balance < total) return setError(`Insufficient balance. Your balance is $${balance.toFixed(2)} but order total is $${total.toFixed(2)}`);

    setLoading(true);
    try {
      let address_id = form.address_id ? parseInt(form.address_id) : undefined;

      if (useNewAddress) {
        const addrRes = await API.post('/me/addresses', newAddress);
        address_id = addrRes.data.data.address_id;
      }

      await API.post('/orders', {
        card_id: parseInt(form.card_id),
        address_id,
        delivery_type: form.delivery_type,
        order_date: new Date().toISOString().split('T')[0],
        items: cart.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
      });

      localStorage.removeItem('cart');
      navigate('/orders');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) return (
    <div className="page">
      <div className="empty-state">
        <h3>Your cart is empty</h3>
        <p>Add some products to get started</p>
        <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/products')}>
          Browse Products
        </button>
      </div>
    </div>
  );

  return (
    <div className="page">
      <div className="page-header"><h1>Shopping Cart</h1></div>
      <div className="cart-layout">

        {/* Items */}
        <div className="cart-items">
          {cart.map(item => (
            <div key={item.product_id} className="cart-item card">
              <div className="cart-item-info">
                <h3>{item.name}</h3>
                <p>${parseFloat(item.price).toFixed(2)} each</p>
              </div>
              <div className="cart-item-controls">
                <button className="qty-btn" onClick={() => updateQty(item.product_id, item.quantity - 1)}>−</button>
                <span className="qty-value">{item.quantity}</span>
                <button className="qty-btn" onClick={() => updateQty(item.product_id, item.quantity + 1)}>+</button>
                <span className="item-subtotal">${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                <button className="btn btn-danger btn-sm" onClick={() => updateQty(item.product_id, 0)}>Remove</button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="cart-summary card">
          <h2>Order Summary</h2>
          {error && <div className="alert alert-error">{error}</div>}

          {/* Balance */}
          <div className="balance-row">
            <span>Account Balance</span>
            <span className={balance < total ? 'balance-low' : 'balance-ok'}>
              ${balance.toFixed(2)}
            </span>
          </div>

          {/* Card */}
          <div className="form-group">
            <label>Payment Card *</label>
            <select value={form.card_id} onChange={e => setForm({ ...form, card_id: e.target.value })} required>
              <option value="">Select a card</option>
              {cards.map(c => (
                <option key={c.card_id} value={c.card_id}>
                  {c.card_type} •••• {String(c.card_number).slice(-4)}
                </option>
              ))}
            </select>
            {cards.length === 0 && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                No cards saved. <a href="/account" style={{ color: 'var(--accent)' }}>Add one in Account</a>
              </p>
            )}
          </div>

          {/* Delivery type */}
          <div className="form-group">
            <label>Delivery Type *</label>
            <select value={form.delivery_type} onChange={e => setForm({ ...form, delivery_type: e.target.value })} required>
              <option value="Standard">Standard — $10.00 (7–10 days)</option>
              <option value="Express">Express — $25.00 (2–3 days)</option>
            </select>
          </div>

          {/* Shipping address */}
          <div className="form-group">
            <label>Shipping Address *</label>
            <div className="address-toggle">
              <button type="button" className={`toggle-btn ${!useNewAddress ? 'active' : ''}`} onClick={() => setUseNewAddress(false)}>
                Existing
              </button>
              <button type="button" className={`toggle-btn ${useNewAddress ? 'active' : ''}`} onClick={() => setUseNewAddress(true)}>
                New Address
              </button>
            </div>

            {!useNewAddress ? (
              <select value={form.address_id} onChange={e => setForm({ ...form, address_id: e.target.value })}>
                <option value="">Select address</option>
                {addresses.map(a => (
                  <option key={a.address?.address_id} value={a.address?.address_id}>
                    {a.address?.street}, {a.address?.city}, {a.address?.state}
                  </option>
                ))}
              </select>
            ) : (
              <div className="new-address-form">
                <input placeholder="Street *" value={newAddress.street} onChange={e => setNewAddress({ ...newAddress, street: e.target.value })} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input placeholder="City *" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} />
                  <input placeholder="State *" value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input placeholder="Zip Code *" value={newAddress.zip_code} onChange={e => setNewAddress({ ...newAddress, zip_code: e.target.value })} />
                  <input placeholder="Country *" value={newAddress.country} onChange={e => setNewAddress({ ...newAddress, country: e.target.value })} />
                </div>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="summary-total">
            <span>Items</span>
            <span>${itemsTotal.toFixed(2)}</span>
          </div>
          <div className="summary-total">
            <span>Delivery ({form.delivery_type})</span>
            <span>${deliveryCost.toFixed(2)}</span>
          </div>
          <div className="summary-total" style={{ fontWeight: 'bold', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          {!form.card_id && balance < total && (
            <p style={{ fontSize: '0.8rem', color: 'var(--danger)', marginTop: '0.5rem' }}>
              ⚠ Insufficient balance — select a card to pay by card instead
            </p>
          )}

          <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}
            onClick={placeOrder} disabled={loading || (!form.card_id && balance < total)}>
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
}