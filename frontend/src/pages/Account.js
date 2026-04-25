import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api';

function Account() {
  const [addresses, setAddresses] = useState([]);
  const [cards, setCards] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [message, setMessage] = useState('');
  const { user } = useAuth();

  const [newAddress, setNewAddress] = useState({
    country: '', street: '', city: '', state: '', zip_code: ''
  });

  const [newCard, setNewCard] = useState({
    card_type: 'VISA', card_number: '', expiry_date: '', cvv: ''
  });

  useEffect(() => {
    if (user) {
      fetchAddresses();
      fetchCards();
    }
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const response = await API.get(`/customer/${user.userId}/addresses`);
      setAddresses(response.data);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const fetchCards = async () => {
    try {
      const response = await API.get(`/customer/${user.userId}/cards`);
      setCards(response.data);
    } catch (error) {
      console.error('Error fetching cards:', error);
    }
  };

  const addAddress = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/customer/${user.userId}/addresses`, newAddress);
      setMessage('Address added!');
      setShowAddressForm(false);
      setNewAddress({ country: '', street: '', city: '', state: '', zip_code: '' });
      fetchAddresses();
    } catch (error) {
      setMessage('Failed to add address');
    }
  };

  const deleteAddress = async (addressId) => {
    try {
      await API.delete(`/customer/${user.userId}/addresses/${addressId}`);
      fetchAddresses();
    } catch (error) {
      setMessage('Failed to delete address');
    }
  };

  const addCard = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/customer/${user.userId}/cards`, newCard);
      setMessage('Card added!');
      setShowCardForm(false);
      setNewCard({ card_type: 'VISA', card_number: '', expiry_date: '', cvv: '' });
      fetchCards();
    } catch (error) {
      setMessage('Failed to add card');
    }
  };

  const deleteCard = async (cardId) => {
    try {
      await API.delete(`/customer/${user.userId}/cards/${cardId}`);
      fetchCards();
    } catch (error) {
      setMessage('Failed to delete card');
    }
  };

  if (!user) {
    return (
      <div style={styles.container}>
        <h1>Account</h1>
        <p>Please <a href="/login">login</a> to view your account.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1>My Account</h1>
      {message && <p style={styles.message}>{message}</p>}

      <section style={styles.section}>
        <h2>Addresses</h2>
        <button onClick={() => setShowAddressForm(!showAddressForm)} style={styles.addButton}>
          + Add Address
        </button>

        {showAddressForm && (
          <form onSubmit={addAddress} style={styles.form}>
            <input placeholder="Country" value={newAddress.country} onChange={(e) => setNewAddress({...newAddress, country: e.target.value})} style={styles.input} required />
            <input placeholder="Street" value={newAddress.street} onChange={(e) => setNewAddress({...newAddress, street: e.target.value})} style={styles.input} required />
            <input placeholder="City" value={newAddress.city} onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} style={styles.input} required />
            <input placeholder="State" value={newAddress.state} onChange={(e) => setNewAddress({...newAddress, state: e.target.value})} style={styles.input} required />
            <input placeholder="Zip Code" value={newAddress.zip_code} onChange={(e) => setNewAddress({...newAddress, zip_code: e.target.value})} style={styles.input} required />
            <button type="submit" style={styles.submitButton}>Save Address</button>
          </form>
        )}

        {addresses.map((addr) => (
          <div key={addr.address_id} style={styles.card}>
            <p>{addr.address?.street}, {addr.address?.city}, {addr.address?.state} {addr.address?.zip_code}</p>
            <p>{addr.address?.country}</p>
            <button onClick={() => deleteAddress(addr.address_id)} style={styles.deleteButton}>Delete</button>
          </div>
        ))}
      </section>

      <section style={styles.section}>
        <h2>Payment Cards</h2>
        <button onClick={() => setShowCardForm(!showCardForm)} style={styles.addButton}>
          + Add Card
        </button>

        {showCardForm && (
          <form onSubmit={addCard} style={styles.form}>
            <select value={newCard.card_type} onChange={(e) => setNewCard({...newCard, card_type: e.target.value})} style={styles.input}>
              <option value="VISA">VISA</option>
              <option value="Mastercard">Mastercard</option>
              <option value="AMEX">AMEX</option>
            </select>
            <input placeholder="Card Number" value={newCard.card_number} onChange={(e) => setNewCard({...newCard, card_number: e.target.value})} style={styles.input} required />
            <input type="date" placeholder="Expiry Date" value={newCard.expiry_date} onChange={(e) => setNewCard({...newCard, expiry_date: e.target.value})} style={styles.input} required />
            <input placeholder="CVV" value={newCard.cvv} onChange={(e) => setNewCard({...newCard, cvv: e.target.value})} style={styles.input} maxLength="3" required />
            <button type="submit" style={styles.submitButton}>Save Card</button>
          </form>
        )}

        {cards.map((card) => (
          <div key={card.card_id} style={styles.card}>
            <p>{card.card_type} ending in {String(card.card_number).slice(-4)}</p>
            <p>Expires: {new Date(card.expiry_date).toLocaleDateString()}</p>
            <button onClick={() => deleteCard(card.card_id)} style={styles.deleteButton}>Delete</button>
          </div>
        ))}
      </section>
    </div>
  );
}

const styles = {
  container: { maxWidth: '800px', margin: '0 auto', padding: '20px' },
  section: { marginBottom: '40px' },
  message: { backgroundColor: '#d4edda', color: '#155724', padding: '10px', borderRadius: '5px', textAlign: 'center' },
  addButton: { padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginBottom: '15px' },
  form: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' },
  input: { padding: '10px', fontSize: '14px', borderRadius: '5px', border: '1px solid #ccc' },
  submitButton: { padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  card: { border: '1px solid #ddd', borderRadius: '5px', padding: '15px', marginBottom: '10px', backgroundColor: '#fff' },
  deleteButton: { padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' }
};

export default Account;