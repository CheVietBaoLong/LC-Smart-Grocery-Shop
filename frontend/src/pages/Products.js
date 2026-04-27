import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api';
import './Products.css';

export default function Products() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [cartMsg, setCartMsg] = useState('');

  useEffect(() => {
    API.get('/products').then(res => {
      setProducts(res.data.data);
      setFiltered(res.data.data);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = products;
    if (search) result = result.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase())
    );
    if (category) result = result.filter(p => p.category === category);
    setFiltered(result);
  }, [search, category, products]);

  const categories = [...new Set(products.map(p => p.category))];

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(i => i.product_id === product.product_id);
    if (existing) {
      existing.quantity += 1;
    } else {
      const price = product.product_price?.[0]?.sell_price || 0;
      cart.push({ product_id: product.product_id, name: product.name, price, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    setCartMsg(`"${product.name}" added to cart!`);
    setTimeout(() => setCartMsg(''), 2500);
  };

  const getPrice = (product) => {
    const price = product.product_price?.[0]?.sell_price;
    return price ? `$${parseFloat(price).toFixed(2)}` : 'N/A';
  };

  if (loading) return <div className="loading"><div className="spinner" />Loading products...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Our Products</h1>
        <p>Browse our full catalog</p>
      </div>

      {cartMsg && <div className="alert alert-success">{cartMsg}</div>}

      <div className="products-filters">
        <input
          className="search-input"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select value={category} onChange={e => setCategory(e.target.value)} className="category-select">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <h3>No products found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="products-grid">
          {filtered.map(product => (
            <div key={product.product_id} className="product-card card">
              <div className="product-category">{product.category}</div>
              <h3 className="product-name">{product.name}</h3>
              {product.brand && <p className="product-brand">{product.brand}</p>}
              {product.description && <p className="product-desc">{product.description}</p>}
              <div className="product-meta">
                {product.size && <span className="meta-tag">Size: {product.size}</span>}
                {product.type && <span className="meta-tag">{product.type}</span>}
              </div>
              <div className="product-footer">
                <span className="product-price">{getPrice(product)}</span>
                {user?.role === 'customer' && (
                  <button className="btn btn-primary btn-sm" onClick={() => addToCart(product)}>
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}