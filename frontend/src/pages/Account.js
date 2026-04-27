import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api';
import './Account.css';

export default function Account() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [cards, setCards] = useState([]);
  const [balance, setBalance] = useState(0);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [addrForm, setAddrForm] = useState({ country: '', street: '', city: '', state: '', zip_code: '' });
  const [cardForm, setCardForm] = useState({ card_type: 'VISA', card_number: '', expiry_date: '', cvv: '' });
  const [cardAddressId, setCardAddressId] = useState('');
  const [useNewCardAddress, setUseNewCardAddress] = useState(false);
  const [newCardAddress, setNewCardAddress] = useState({ country: '', street: '', city: '', state: '', zip_code: '' });
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editForm, setEditForm] = useState({ first_name: '', middle_name: '', last_name: '', email: '' });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ old_password: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [showDeposit, setShowDeposit] = useState(false);

  useEffect(() => {
    if (!user) return navigate('/login');
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    const userRes = await API.get(`/users/${user.user_id}`);
    const userData = userRes.data.data;
    setProfileUser(userData);

    if (user.role === 'customer') {
      const [addrRes, cardRes] = await Promise.all([
        API.get('/me/addresses'),
        API.get('/me/cards'),
      ]);
      setAddresses(addrRes.data.data);
      setCards(cardRes.data.data);
      setBalance(parseFloat(userData?.customer?.balance || 0));
    } else {
      const addrRes = await API.get('/me/addresses');
      setAddresses(addrRes.data.data);
    }
  };

  const notify = (msg, isError = false) => {
    isError ? setError(msg) : setSuccess(msg);
    setTimeout(() => { setError(''); setSuccess(''); }, 3000);
  };

  // ── Profile ────────────────────────────────────────────────────────────────

  const openEditProfile = () => {
    setEditForm({
      first_name: profileUser?.first_name || '',
      middle_name: profileUser?.middle_name || '',
      last_name: profileUser?.last_name || '',
      email: profileUser?.email || '',
    });
    setShowEditProfile(true);
    setShowPasswordForm(false);
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();
    try {
      await API.patch(`/users/${user.user_id}`, {
        first_name: editForm.first_name,
        middle_name: editForm.middle_name || undefined,
        last_name: editForm.last_name,
        email: editForm.email,
      });
      setShowEditProfile(false);
      fetchData();
      notify('Profile updated');
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to update profile', true);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.password !== passwordForm.confirm) {
      return notify('New passwords do not match', true);
    }
    try {
      await API.patch(`/users/${user.user_id}`, {
        old_password: passwordForm.old_password,
        password: passwordForm.password,
      });
      setPasswordForm({ old_password: '', password: '', confirm: '' });
      setShowPasswordForm(false);
      notify('Password updated');
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to update password', true);
    }
  };

  // ── Addresses ──────────────────────────────────────────────────────────────

  const addAddress = async (e) => {
    e.preventDefault();
    try {
      await API.post('/me/addresses', addrForm);
      setShowAddrForm(false);
      setAddrForm({ country: '', street: '', city: '', state: '', zip_code: '' });
      fetchData();
      notify('Address added');
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to add address', true);
    }
  };

  const removeAddress = async (address_id) => {
    if (!window.confirm('Remove this address?')) return;
    try {
      await API.delete(`/me/addresses/${address_id}`);
      fetchData();
      notify('Address removed');
    } catch (err) {
      notify('Failed to remove address', true);
    }
  };

  // ── Cards ──────────────────────────────────────────────────────────────────

  const addCard = async (e) => {
    e.preventDefault();
    try {
      let address_id = cardAddressId ? parseInt(cardAddressId) : undefined;

      if (useNewCardAddress) {
        const addrRes = await API.post('/me/addresses', newCardAddress);
        address_id = addrRes.data.data.address_id;
      }

      await API.post('/me/cards', {
        ...cardForm,
        card_number: parseInt(cardForm.card_number),
        address_id,
      });

      setShowCardForm(false);
      setCardForm({ card_type: 'VISA', card_number: '', expiry_date: '', cvv: '' });
      setCardAddressId('');
      setUseNewCardAddress(false);
      setNewCardAddress({ country: '', street: '', city: '', state: '', zip_code: '' });
      fetchData();
      notify('Card added');
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to add card', true);
    }
  };

  const removeCard = async (card_id) => {
    if (!window.confirm('Remove this card?')) return;
    try {
      await API.delete(`/me/cards/${card_id}`);
      fetchData();
      notify('Card removed');
    } catch (err) {
      notify('Failed to remove card', true);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/users/deposit', { amount: parseFloat(depositAmount) });
      setDepositAmount('');
      setShowDeposit(false);
      fetchData();
      notify('Balance updated successfully');
    } catch (err) {
      notify(err.response?.data?.message || 'Deposit failed', true);
    }
  };

  const fullName = [profileUser?.first_name, profileUser?.middle_name, profileUser?.last_name]
    .filter(Boolean).join(' ');

  return (
    <div className="page">
      <div className="page-header">
        <h1>My Account</h1>
        <p>Manage your profile and settings</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* ── Profile ── */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem' }}>{fullName}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{profileUser?.email}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                if (showEditProfile) { setShowEditProfile(false); }
                else { openEditProfile(); setShowPasswordForm(false); }
              }}
            >
              {showEditProfile ? 'Cancel' : 'Edit Profile'}
            </button>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => { setShowPasswordForm(!showPasswordForm); setShowEditProfile(false); }}
            >
              {showPasswordForm ? 'Cancel' : 'Change Password'}
            </button>
          </div>
        </div>
      </div>

      {showEditProfile && (
        <form className="card" style={{ marginBottom: '1.5rem' }} onSubmit={handleEditProfile}>
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input value={editForm.first_name} onChange={e => setEditForm({ ...editForm, first_name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Middle Name</label>
              <input value={editForm.middle_name} onChange={e => setEditForm({ ...editForm, middle_name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input value={editForm.last_name} onChange={e => setEditForm({ ...editForm, last_name: e.target.value })} required />
            </div>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} required />
          </div>
          <button type="submit" className="btn btn-primary btn-sm">Save Changes</button>
        </form>
      )}

      {showPasswordForm && (
        <form className="card" style={{ marginBottom: '1.5rem' }} onSubmit={handleChangePassword}>
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              value={passwordForm.old_password}
              onChange={e => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={passwordForm.password}
                onChange={e => setPasswordForm({ ...passwordForm, password: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirm}
                onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-sm">Update Password</button>
        </form>
      )}

      {user?.role === 'customer' && <>
        {/* Balance */}
        <div className="balance-banner card">
          <div>
            <p className="balance-label">Account Balance</p>
            <p className="balance-amount">${balance.toFixed(2)}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
            <div className="balance-icon">💳</div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowDeposit(!showDeposit)}>
              {showDeposit ? 'Cancel' : '+ Deposit'}
            </button>
          </div>
        </div>

        {showDeposit && (
          <form className="card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-end' }} onSubmit={handleDeposit}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>Amount ($)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={depositAmount}
                onChange={e => setDepositAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">Deposit</button>
          </form>
        )}
      </>}

      <div className="account-grid">

        {/* ── Addresses ── */}
        <div>
          <div className="section-header">
            <h2>Addresses</h2>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddrForm(!showAddrForm)}>
              {showAddrForm ? 'Cancel' : '+ Add Address'}
            </button>
          </div>

          {showAddrForm && (
            <form className="card" style={{ marginBottom: '1rem' }} onSubmit={addAddress}>
              <div className="form-group"><label>Street</label><input value={addrForm.street} onChange={e => setAddrForm({ ...addrForm, street: e.target.value })} required /></div>
              <div className="form-row">
                <div className="form-group"><label>City</label><input value={addrForm.city} onChange={e => setAddrForm({ ...addrForm, city: e.target.value })} required /></div>
                <div className="form-group"><label>State</label><input value={addrForm.state} onChange={e => setAddrForm({ ...addrForm, state: e.target.value })} required /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Zip Code</label><input value={addrForm.zip_code} onChange={e => setAddrForm({ ...addrForm, zip_code: e.target.value })} required /></div>
                <div className="form-group"><label>Country</label><input value={addrForm.country} onChange={e => setAddrForm({ ...addrForm, country: e.target.value })} required /></div>
              </div>
              <button type="submit" className="btn btn-primary btn-sm">Save Address</button>
            </form>
          )}

          {addresses.length === 0
            ? <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No addresses saved yet.</p>
            : addresses.map(a => (
              <div key={a.address?.address_id} className="list-item card">
                <div>
                  <p className="list-item-title">{a.address?.street}</p>
                  <p className="list-item-sub">{a.address?.city}, {a.address?.state} {a.address?.zip_code} · {a.address?.country}</p>
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => removeAddress(a.address?.address_id)}>Remove</button>
              </div>
            ))
          }
        </div>

        {/* ── Cards (customer only) ── */}
        {user?.role === 'customer' && (
          <div>
            <div className="section-header">
              <h2>Payment Cards</h2>
              <button className="btn btn-primary btn-sm" onClick={() => setShowCardForm(!showCardForm)}>
                {showCardForm ? 'Cancel' : '+ Add Card'}
              </button>
            </div>

            {showCardForm && (
              <form className="card" style={{ marginBottom: '1rem' }} onSubmit={addCard}>
                <div className="form-group">
                  <label>Card Type</label>
                  <select value={cardForm.card_type} onChange={e => setCardForm({ ...cardForm, card_type: e.target.value })}>
                    {['VISA', 'MASTERCARD', 'AMEX', 'DEBIT', 'CREDIT'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Card Number</label>
                  <input type="number" value={cardForm.card_number} onChange={e => setCardForm({ ...cardForm, card_number: e.target.value })} placeholder="Card number" required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input type="date" value={cardForm.expiry_date} onChange={e => setCardForm({ ...cardForm, expiry_date: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <input value={cardForm.cvv} onChange={e => setCardForm({ ...cardForm, cvv: e.target.value })} maxLength={3} placeholder="123" required />
                  </div>
                </div>

                <div className="form-group">
                  <label>Billing Address</label>
                  <div className="address-toggle">
                    <button type="button" className={`toggle-btn ${!useNewCardAddress ? 'active' : ''}`} onClick={() => setUseNewCardAddress(false)}>Existing</button>
                    <button type="button" className={`toggle-btn ${useNewCardAddress ? 'active' : ''}`} onClick={() => setUseNewCardAddress(true)}>New Address</button>
                  </div>

                  {!useNewCardAddress ? (
                    <select value={cardAddressId} onChange={e => setCardAddressId(e.target.value)}>
                      <option value="">None</option>
                      {addresses.map(a => (
                        <option key={a.address?.address_id} value={a.address?.address_id}>
                          {a.address?.street}, {a.address?.city}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="new-address-form">
                      <input placeholder="Street" value={newCardAddress.street} onChange={e => setNewCardAddress({ ...newCardAddress, street: e.target.value })} />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <input placeholder="City" value={newCardAddress.city} onChange={e => setNewCardAddress({ ...newCardAddress, city: e.target.value })} />
                        <input placeholder="State" value={newCardAddress.state} onChange={e => setNewCardAddress({ ...newCardAddress, state: e.target.value })} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <input placeholder="Zip Code" value={newCardAddress.zip_code} onChange={e => setNewCardAddress({ ...newCardAddress, zip_code: e.target.value })} />
                        <input placeholder="Country" value={newCardAddress.country} onChange={e => setNewCardAddress({ ...newCardAddress, country: e.target.value })} />
                      </div>
                    </div>
                  )}
                </div>

                <button type="submit" className="btn btn-primary btn-sm">Save Card</button>
              </form>
            )}

            {cards.length === 0
              ? <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No cards saved yet.</p>
              : cards.map(c => (
                <div key={c.card_id} className="list-item card">
                  <div>
                    <p className="list-item-title">{c.card_type} •••• {String(c.card_number).slice(-4)}</p>
                    <p className="list-item-sub">Expires {c.expiry_date?.split('T')[0]}</p>
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={() => removeCard(c.card_id)}>Remove</button>
                </div>
              ))
            }
          </div>
        )}
      </div>
    </div>
  );
}
