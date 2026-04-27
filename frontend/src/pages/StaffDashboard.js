import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api';
import './StaffDashboard.css';

export default function StaffDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('products');

  useEffect(() => {
    if (!user) return navigate('/login');
    if (user.role !== 'staff') return navigate('/');
  }, [user, navigate]);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Staff Dashboard</h1>
        <p>Manage products, orders, and warehouses</p>
      </div>

      <div className="staff-tabs">
        {['products', 'orders', 'warehouses', 'suppliers'].map(t => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'products' && <ProductsTab />}
      {tab === 'orders' && <OrdersTab />}
      {tab === 'warehouses' && <WarehousesTab />}
      {tab === 'suppliers' && <SuppliersTab />}
    </div>
  );
}

// ── Products Tab ───────────────────────────────────────────────────────────────

function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [priceModal, setPriceModal] = useState(null);
  const [form, setForm] = useState({ name: '', category: '', description: '', type: '', size: '', brand: '' });
  const [priceForm, setPriceForm] = useState({ sell_price: '', start_date: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = () => {
    setLoading(true);
    API.get('/products').then(r => setProducts(r.data.data)).finally(() => setLoading(false));
  };

  const notify = (msg, isError = false) => {
    isError ? setError(msg) : setSuccess(msg);
    setTimeout(() => { setError(''); setSuccess(''); }, 3000);
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setForm({ name: product.name, category: product.category, description: product.description || '', type: product.type || '', size: product.size || '', brand: product.brand || '' });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditProduct(null);
    setForm({ name: '', category: '', description: '', type: '', size: '', brand: '' });
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editProduct) {
        await API.patch(`/products/${editProduct.product_id}`, form);
        notify('Product updated');
      } else {
        await API.post('/products', form);
        notify('Product created');
      }
      resetForm();
      fetchProducts();
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to save product', true);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await API.delete(`/products/${id}`);
      notify('Product deleted');
      fetchProducts();
    } catch (err) {
      notify('Failed to delete product', true);
    }
  };

  const setPrice = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/products/${priceModal.product_id}/price`, {
        sell_price: parseFloat(priceForm.sell_price),
        start_date: priceForm.start_date,
      });
      notify('Price updated');
      setPriceModal(null);
      setPriceForm({ sell_price: '', start_date: '' });
      fetchProducts();
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to set price', true);
    }
  };

  const getPrice = (product) => {
    const sell = product.product_price?.[0]?.sell_price != null ? parseFloat(product.product_price[0].sell_price) : null;
    const supplier = product.supplies?.[0]?.supplier_price != null ? parseFloat(product.supplies[0].supplier_price) : null;
    const price = sell === null ? supplier : supplier === null ? sell : Math.min(sell, supplier);
    return price != null ? `$${price.toFixed(2)}` : '—';
  };

  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="tab-actions">
        <h2>Products</h2>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm && !editProduct ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      {showForm && (
        <form className="card staff-form" onSubmit={saveProduct}>
          <h3>{editProduct ? 'Edit Product' : 'New Product'}</h3>
          <div className="form-row">
            <div className="form-group"><label>Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="form-group"><label>Category</label><input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Brand</label><input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} /></div>
            <div className="form-group"><label>Type</label><input value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Size</label><input value={form.size} onChange={e => setForm({ ...form, size: e.target.value })} /></div>
          </div>
          <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} /></div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="submit" className="btn btn-primary">{editProduct ? 'Update' : 'Create'}</button>
            <button type="button" className="btn btn-outline" onClick={resetForm}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? <div className="loading"><div className="spinner" />Loading...</div> : (
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Name</th><th>Category</th><th>Brand</th><th>Price</th><th>Actions</th></tr></thead>
            <tbody>
              {products.map(p => (
                <tr key={p.product_id}>
                  <td><strong>{p.name}</strong></td>
                  <td>{p.category}</td>
                  <td>{p.brand || '—'}</td>
                  <td>{getPrice(p)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)}>Edit</button>
                      <button className="btn btn-outline btn-sm" onClick={() => setPriceModal(p)}>Set Price</button>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteProduct(p.product_id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {priceModal && (
        <div className="modal-overlay" onClick={() => setPriceModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Set Price — {priceModal.name}</h2>
              <button className="modal-close" onClick={() => setPriceModal(null)}>×</button>
            </div>
            <form onSubmit={setPrice}>
              <div className="form-group"><label>Price ($)</label><input type="number" step="0.01" value={priceForm.sell_price} onChange={e => setPriceForm({ ...priceForm, sell_price: e.target.value })} required /></div>
              <div className="form-group"><label>Start Date</label><input type="date" value={priceForm.start_date} onChange={e => setPriceForm({ ...priceForm, start_date: e.target.value })} required /></div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Set Price</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Orders Tab ─────────────────────────────────────────────────────────────────

function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/orders').then(r => setOrders(r.data.data)).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (order_id, status) => {
    try {
      await API.patch(`/orders/${order_id}/status`, { status });
      setOrders(orders.map(o => o.order_id === order_id ? { ...o, status } : o));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Return'];

  if (loading) return <div className="loading"><div className="spinner" />Loading...</div>;

  return (
    <div>
      <div className="tab-actions"><h2>All Orders</h2></div>
      <div className="table-wrapper">
        <table>
          <thead><tr><th>Order #</th><th>Customer</th><th>Date</th><th>Items</th><th>Status</th><th>Update</th></tr></thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.order_id}>
                <td><strong>#{o.order_id}</strong></td>
                <td>{o.customer?.users?.first_name} {o.customer?.users?.last_name}</td>
                <td>{o.order_date?.split('T')[0]}</td>
                <td>{o.order_item?.length || 0} items</td>
                <td><span className={`badge badge-${o.status?.toLowerCase()}`}>{o.status}</span></td>
                <td>
                  <select
                    value={o.status}
                    onChange={e => updateStatus(o.order_id, e.target.value)}
                    style={{ padding: '0.3rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                  >
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Warehouses Tab ─────────────────────────────────────────────────────────────

function WarehousesTab() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [stockModal, setStockModal] = useState(null);
  const [form, setForm] = useState({ capacity: '', street: '', city: '', state: '', zip_code: '', country: '' });
  const [stockForm, setStockForm] = useState({ product_id: '', quantity: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { fetchWarehouses(); }, []);

  const fetchWarehouses = () => {
    setLoading(true);
    API.get('/warehouses').then(r => setWarehouses(r.data.data)).finally(() => setLoading(false));
  };

  const notify = (msg, isError = false) => {
    isError ? setError(msg) : setSuccess(msg);
    setTimeout(() => { setError(''); setSuccess(''); }, 3000);
  };

  const createWarehouse = async (e) => {
    e.preventDefault();
    try {
      await API.post('/warehouses', {
        capacity: parseInt(form.capacity),
        street: form.street,
        city: form.city,
        state: form.state,
        zip_code: form.zip_code,
        country: form.country,
      });
      setShowForm(false);
      setForm({ capacity: '', street: '', city: '', state: '', zip_code: '', country: '' });
      fetchWarehouses();
      notify('Warehouse created');
    } catch (err) {
      notify('Failed to create warehouse', true);
    }
  };

  const setStock = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/warehouses/${stockModal.warehouse_id}/stock`, {
        product_id: parseInt(stockForm.product_id),
        quantity: parseInt(stockForm.quantity),
      });
      setStockModal(null);
      setStockForm({ product_id: '', quantity: '' });
      fetchWarehouses();
      notify('Stock updated');
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to update stock', true);
    }
  };

  if (loading) return <div className="loading"><div className="spinner" />Loading...</div>;

  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="tab-actions">
        <h2>Warehouses</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Warehouse'}
        </button>
      </div>

      {showForm && (
        <form className="card staff-form" onSubmit={createWarehouse}>
          <h3>New Warehouse</h3>
          <div className="form-group"><label>Capacity</label><input type="number" min="1" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} placeholder="e.g. 1000" required /></div>
          <div className="form-group"><label>Street</label><input value={form.street} onChange={e => setForm({ ...form, street: e.target.value })} required /></div>
          <div className="form-row">
            <div className="form-group"><label>City</label><input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} required /></div>
            <div className="form-group"><label>State</label><input value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} required /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Zip Code</label><input value={form.zip_code} onChange={e => setForm({ ...form, zip_code: e.target.value })} required /></div>
            <div className="form-group"><label>Country</label><input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} required /></div>
          </div>
          <button type="submit" className="btn btn-primary">Create Warehouse</button>
        </form>
      )}

      <div className="grid-3">
        {warehouses.map(w => (
          <div key={w.warehouse_id} className="card warehouse-card">
            <div className="warehouse-header">
              <h3>Warehouse #{w.warehouse_id}</h3>
              {w.capacity && <span className="meta-tag">Cap: {w.capacity}</span>}
            </div>
            <p className="warehouse-stock-count">{w.stock?.length || 0} product types in stock</p>
            {w.stock?.length > 0 && (
              <div className="stock-list">
                {w.stock.slice(0, 3).map(s => (
                  <div key={s.product_id} className="stock-row">
                    <span>{s.products?.name || `Product #${s.product_id}`}</span>
                    <span className="stock-qty">{s.quantity}</span>
                  </div>
                ))}
                {w.stock.length > 3 && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>+{w.stock.length - 3} more</p>}
              </div>
            )}
            <button className="btn btn-outline btn-sm" style={{ marginTop: '1rem', width: '100%' }} onClick={() => setStockModal(w)}>
              Manage Stock
            </button>
          </div>
        ))}
      </div>

      {stockModal && (
        <div className="modal-overlay" onClick={() => setStockModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Set Stock — Warehouse #{stockModal.warehouse_id}</h2>
              <button className="modal-close" onClick={() => setStockModal(null)}>×</button>
            </div>
            <form onSubmit={setStock}>
              <div className="form-group"><label>Product ID</label><input type="number" value={stockForm.product_id} onChange={e => setStockForm({ ...stockForm, product_id: e.target.value })} required /></div>
              <div className="form-group"><label>Quantity</label><input type="number" min="0" value={stockForm.quantity} onChange={e => setStockForm({ ...stockForm, quantity: e.target.value })} required /></div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Update Stock</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Suppliers Tab ──────────────────────────────────────────────────────────────

function SuppliersTab() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', street: '', city: '', state: '', zip_code: '', country: '' });
  const [receiveModal, setReceiveModal] = useState(null);
  const [form, setForm] = useState({ product_id: '', supplier_price: '', quantity: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { fetchSuppliers(); }, []);

  const fetchSuppliers = () => {
    setLoading(true);
    API.get('/suppliers').then(r => setSuppliers(r.data.data)).finally(() => setLoading(false));
  };

  const notify = (msg, isError = false) => {
    isError ? setError(msg) : setSuccess(msg);
    setTimeout(() => { setError(''); setSuccess(''); }, 3000);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await API.post('/suppliers', createForm);
      setShowCreateForm(false);
      setCreateForm({ name: '', street: '', city: '', state: '', zip_code: '', country: '' });
      fetchSuppliers();
      notify('Supplier created');
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to create supplier', true);
    }
  };

  const handleReceive = async (e) => {
    e.preventDefault();
    try {
      const result = await API.post(`/suppliers/${receiveModal.supplier_id}/receive`, {
        product_id: parseInt(form.product_id),
        supplier_price: parseFloat(form.supplier_price),
        quantity: parseInt(form.quantity),
      });
      const { warehouse_id, quantity_added } = result.data.data;
      setReceiveModal(null);
      setForm({ product_id: '', supplier_price: '', quantity: '' });
      notify(`Added ${quantity_added} units to Warehouse #${warehouse_id}`);
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to receive supply', true);
    }
  };

  if (loading) return <div className="loading"><div className="spinner" />Loading...</div>;

  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="tab-actions">
        <h2>Suppliers</h2>
        <button className="btn btn-primary" onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? 'Cancel' : '+ Add Supplier'}
        </button>
      </div>

      {showCreateForm && (
        <form className="card staff-form" onSubmit={handleCreate}>
          <h3>New Supplier</h3>
          <div className="form-group"><label>Name</label><input value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} required /></div>
          <div className="form-group"><label>Street</label><input value={createForm.street} onChange={e => setCreateForm({ ...createForm, street: e.target.value })} required /></div>
          <div className="form-row">
            <div className="form-group"><label>City</label><input value={createForm.city} onChange={e => setCreateForm({ ...createForm, city: e.target.value })} required /></div>
            <div className="form-group"><label>State</label><input value={createForm.state} onChange={e => setCreateForm({ ...createForm, state: e.target.value })} required /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Zip Code</label><input value={createForm.zip_code} onChange={e => setCreateForm({ ...createForm, zip_code: e.target.value })} required /></div>
            <div className="form-group"><label>Country</label><input value={createForm.country} onChange={e => setCreateForm({ ...createForm, country: e.target.value })} required /></div>
          </div>
          <button type="submit" className="btn btn-primary">Create Supplier</button>
        </form>
      )}

      <div className="grid-3">
        {suppliers.map(s => (
          <div key={s.supplier_id} className="card warehouse-card">
            <div className="warehouse-header">
              <h3>{s.name}</h3>
            </div>
            {s.address
              ? <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  {s.address.street}, {s.address.city}, {s.address.country}
                </p>
              : <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>No address</p>
            }
            <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
              {s.supplies?.length || 0} product{s.supplies?.length !== 1 ? 's' : ''} supplied
            </p>
            <button
              className="btn btn-primary btn-sm"
              style={{ width: '100%' }}
              onClick={() => { setReceiveModal(s); setForm({ product_id: '', supplier_price: '', quantity: '' }); }}
            >
              Receive Supply
            </button>
          </div>
        ))}
        {suppliers.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No suppliers found.</p>}
      </div>

      {receiveModal && (
        <div className="modal-overlay" onClick={() => setReceiveModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Receive Supply — {receiveModal.name}</h2>
              <button className="modal-close" onClick={() => setReceiveModal(null)}>×</button>
            </div>
            <form onSubmit={handleReceive}>
              <div className="form-group">
                <label>Product ID</label>
                <input type="number" min="1" value={form.product_id} onChange={e => setForm({ ...form, product_id: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Supplier Price ($)</label>
                <input type="number" min="0" step="0.01" value={form.supplier_price} onChange={e => setForm({ ...form, supplier_price: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input type="number" min="1" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Confirm Receipt</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}