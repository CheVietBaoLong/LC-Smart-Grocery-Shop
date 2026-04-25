import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api';

function Cart() {
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      const response = await API.get(`/orders/cart/${user.userId}`);
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    try {
      if (newQuantity <= 0) {
        await API.delete(`/orders/cart/${user.userId}/${productId}`);
      } else {
        await API.put(`/orders/cart/${user.userId}/${productId}`, {
          quantity: newQuantity
        });
      }
      fetchCart();
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  const removeItem = async (productId) => {
    try {
      await API.delete(`/orders/cart/${user.userId}/${productId}`);
      fetchCart();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const placeOrder = async () => {
    try {
      const response = await API.post(`/orders/place/${user.userId}`, {});
      setMessage(`Order placed! Order #${response.data.order_id} - Total: $${response.data.total.toFixed(2)}`);
      setCart([]);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to place order');
    }
  };

  const getPrice = (item) => {
    if (item.product?.product_price && item.product.product_price.length > 0) {
      return parseFloat(item.product.product_price[0].sell_price);
    }
    return 0;
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => {
      return sum + (getPrice(item) * item.quantity);
    }, 0).toFixed(2);
  };

  if (!user) {
    return (
      <div style={styles.container}>
        <h1>Cart</h1>
        <p>Please <a href="/login">login</a> to view your cart.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1>Your Cart</h1>
      
      {message && <p style={styles.message}>{message}</p>}

      {cart.length === 0 ? (
        <div>
          <p>Your cart is empty.</p>
          <button onClick={() => navigate('/products')} style={styles.shopButton}>
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Subtotal</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.product_id}>
                  <td>{item.product?.name}</td>
                  <td>${getPrice(item).toFixed(2)}</td>
                  <td>
                    <button 
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      style={styles.qtyButton}
                    >
                      -
                    </button>
                    <span style={styles.quantity}>{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      style={styles.qtyButton}
                    >
                      +
                    </button>
                  </td>
                  <td>${(getPrice(item) * item.quantity).toFixed(2)}</td>
                  <td>
                    <button 
                      onClick={() => removeItem(item.product_id)}
                      style={styles.removeButton}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={styles.totalSection}>
            <h2>Total: ${getTotal()}</h2>
            <button onClick={placeOrder} style={styles.orderButton}>
              Place Order
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '20px'
  },
  message: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '10px',
    borderRadius: '5px',
    textAlign: 'center',
    marginBottom: '20px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '20px'
  },
  qtyButton: {
    width: '30px',
    height: '30px',
    fontSize: '18px',
    cursor: 'pointer'
  },
  quantity: {
    margin: '0 10px',
    fontSize: '16px'
  },
  removeButton: {
    padding: '5px 10px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  totalSection: {
    textAlign: 'right',
    marginTop: '20px'
  },
  orderButton: {
    padding: '15px 30px',
    fontSize: '18px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  shopButton: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  }
};

export default Cart;