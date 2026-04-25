import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api';

function StaffDashboard() {
  const [products, setProducts] = useState([]);
  const [stock, setStock] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showStockForm, setShowStockForm] = useState(false);
  const [message, setMessage] = useState('');
  const { user } = useAuth();

  const [newProduct, setNewProduct] = useState({
    name: '', category: '', description: '', brand: '', price: ''
  });

  const [newStock, setNewStock] = useState({
    warehouse_id: '', product_id: '', quantity: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchStock();
    fetchWarehouses();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await API.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchStock = async () => {
    try {
      const response = await API.get('/staff/stock');
      setStock(response.data);
    } catch (error) {
      console.error('Error fetching stock:', error);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await API.get('/staff/warehouses');
      setWarehouses(response.data);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    }
  };

  const addProduct = async (e) => {
    e.preventDefault();
    try {
      await API.post('/products', newProduct);
      setMessage('Product added!');
      setShowProductForm(false);
      setNewProduct({ name: '', category: '', description: '', brand: '', price: '' });
      fetchProducts();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to add product');
    }
  };

  const deleteProduct = async (productId) => {
    try {
      await API.delete(`/products/${productId}`);
      setMessage('Product deleted!');
      fetchProducts();
    } catch (error) {
      setMessage('Failed to delete product');
    }
  };

  const addStock = async (e) => {
    e.preventDefault();
    try {
      await API.post('/staff/stock', {
        warehouse_id: parseInt(newStock.warehouse_id),
        product_id: parseInt(newStock.product_id),
        quantity: parseInt(newStock.quantity)
      });
      setMessage('Stock added!');
      setShowStockForm(false);
      setNewStock({ warehouse_id: '', product_id: '', quantity: '' });
      fetchStock();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to add stock');
    }
  };

  if (!user || user.role !== 'staff') {
    return (
      <div style={styles.container}>
        <h1>Staff Dashboard</h1>
        <p>Access denied. Staff only.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1>Staff Dashboard</h1>
      {message && <p style={styles.message}>{message}</p>}

      <section style={styles.section}>
        <h2>Manage Products</h2>
        <button onClick={() => setShowProductForm(!showProductForm)} style={styles.addButton}>
          + Add Product
        </button>

        {showProductForm && (
          <form onSubmit={addProduct} style={styles.form}>
            <input placeholder="Name" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} style={styles.input} required />
            <input placeholder="Category" value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} style={styles.input} required />
            <input placeholder="Description" value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} style={styles.input} />
            <input placeholder="Brand" value={newProduct.brand} onChange={(e) => setNewProduct({...newProduct, brand: e.target.value})} style={styles.input} />
            <input placeholder="Price" type="number" step="0.01" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} style={styles.input} required />
            <button type="submit" style={styles.submitButton}>Save Product</button>
          </form>
        )}

        <table style={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Brand</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.product_id}>
                <td>{product.product_id}</td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>{product.brand}</td>
                <td>
                  <button onClick={() => deleteProduct(product.product_id)} style={styles.deleteButton}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={styles.section}>
        <h2>Manage Stock</h2>
        <button onClick={() => setShowStockForm(!showStockForm)} style={styles.addButton}>
          + Add Stock
        </button>

        {showStockForm && (
          <form onSubmit={addStock} style={styles.form}>
            <select value={newStock.warehouse_id} onChange={(e) => setNewStock({...newStock, warehouse_id: e.target.value})} style={styles.input} required>
              <option value="">Select Warehouse</option>
              {warehouses.map((w) => (
                <option key={w.warehouse_id} value={w.warehouse_id}>Warehouse {w.warehouse_id} - {w.address?.city}</option>
              ))}
            </select>
            <select value={newStock.product_id} onChange={(e) => setNewStock({...newStock, product_id: e.target.value})} style={styles.input} required>
              <option value="">Select Product</option>
              {products.map((p) => (
                <option key={p.product_id} value={p.product_id}>{p.name}</option>
              ))}
            </select>
            <input placeholder="Quantity" type="number" value={newStock.quantity} onChange={(e) => setNewStock({...newStock, quantity: e.target.value})} style={styles.input} required />
            <button type="submit" style={styles.submitButton}>Add Stock</button>
          </form>
        )}

        <table style={styles.table}>
          <thead>
            <tr>
              <th>Warehouse</th>
              <th>Product</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {stock.map((s, index) => (
              <tr key={index}>
                <td>Warehouse {s.warehouse_id}</td>
                <td>{s.products?.name}</td>
                <td>{s.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

const styles = {
  container: { maxWidth: '1000px', margin: '0 auto', padding: '20px' },
  section: { marginBottom: '40px' },
  message: { backgroundColor: '#d4edda', color: '#155724', padding: '10px', borderRadius: '5px', textAlign: 'center', marginBottom: '20px' },
  addButton: { padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginBottom: '15px' },
  form: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' },
  input: { padding: '10px', fontSize: '14px', borderRadius: '5px', border: '1px solid #ccc' },
  submitButton: { padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse' },
  deleteButton: { padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }
};

export default StaffDashboard;