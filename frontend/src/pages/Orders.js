import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api';

export default function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return navigate('/login');
    API.get('/orders/my').then(r => setOrders(r.data.data)).finally(() => setLoading(false));
  }, [user, navigate]);

  const cancelOrder = async (order_id) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      await API.patch(`/orders/${order_id}/cancel`);
      setOrders(orders.map(o => o.order_id === order_id ? { ...o, status: 'Cancelled' } : o));
    } catch (err) {
      alert(err.response?.data?.message || 'Cannot cancel this order');
    }
  };

  const statusClass = (s) => `badge badge-${s?.toLowerCase()}`;

  if (loading) return <div className="loading"><div className="spinner" />Loading orders...</div>;

  return (
    <div className="page">
      <div className="page-header"><h1>My Orders</h1><p>Track your order history</p></div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <h3>No orders yet</h3>
          <p>Your orders will appear here once you place one</p>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/products')}>
            Start Shopping
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orders.map(order => (
            <div key={order.order_id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Order #{order.order_id}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{order.order_date}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span className={statusClass(order.status)}>{order.status}</span>
                  {['Pending', 'Processing'].includes(order.status) && (
                    <button className="btn btn-danger btn-sm" onClick={() => cancelOrder(order.order_id)}>Cancel</button>
                  )}
                </div>
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.order_item?.map(item => (
                      <tr key={item.product_id}>
                        <td>{item.product?.name || `Product #${item.product_id}`}</td>
                        <td>{item.quantity}</td>
                        <td>${parseFloat(item.purchase_price).toFixed(2)}</td>
                        <td>${(item.quantity * parseFloat(item.purchase_price)).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}