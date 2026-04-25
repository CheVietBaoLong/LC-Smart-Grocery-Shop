import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api';

function Orders() {
  const [orders, setOrders] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const response = await API.get(`/orders/history/${user.userId}`);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getOrderTotal = (order) => {
    return order.order_item.reduce((sum, item) => {
      return sum + (parseFloat(item.purchase_price) * item.quantity);
    }, 0).toFixed(2);
  };

  if (!user) {
    return (
      <div style={styles.container}>
        <h1>My Orders</h1>
        <p>Please <a href="/login">login</a> to view your orders.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1>My Orders</h1>

      {orders.length === 0 ? (
        <p>You haven't placed any orders yet.</p>
      ) : (
        orders.map((order) => (
          <div key={order.order_id} style={styles.orderCard}>
            <div style={styles.orderHeader}>
              <h3>Order #{order.order_id}</h3>
              <span style={styles.status}>{order.status}</span>
            </div>
            <p>Date: {formatDate(order.order_date)}</p>
            
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.order_item.map((item) => (
                  <tr key={item.product_id}>
                    <td>{item.product?.name}</td>
                    <td>${parseFloat(item.purchase_price).toFixed(2)}</td>
                    <td>{item.quantity}</td>
                    <td>${(parseFloat(item.purchase_price) * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p style={styles.total}>Total: ${getOrderTotal(order)}</p>
          </div>
        ))
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
  orderCard: {
    border: '1px solid #ddd',
    borderRadius: '10px',
    padding: '20px',
    marginBottom: '20px',
    backgroundColor: '#fff'
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  status: {
    padding: '5px 10px',
    backgroundColor: '#ffc107',
    borderRadius: '5px',
    fontWeight: 'bold'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    margin: '15px 0'
  },
  total: {
    textAlign: 'right',
    fontSize: '18px',
    fontWeight: 'bold'
  }
};

export default Orders;