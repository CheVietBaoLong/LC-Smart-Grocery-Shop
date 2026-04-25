import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api';

function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await API.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await API.get(`/products/search?q=${search}`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  const addToCart = async (productId) => {
    if (!user) {
      setMessage('Please login to add items to cart');
      return;
    }

    try {
      await API.post(`/orders/cart/${user.userId}`, {
        product_id: productId,
        quantity: 1
      });
      setMessage('Added to cart!');
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to add to cart');
    }
  };

  const getPrice = (product) => {
    if (product.product_price && product.product_price.length > 0) {
      return parseFloat(product.product_price[0].sell_price).toFixed(2);
    }
    return 'N/A';
  };

  return (
    <div style={styles.container}>
      <h1>Products</h1>
      
      {message && <p style={styles.message}>{message}</p>}
      
      <form onSubmit={handleSearch} style={styles.searchForm}>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
        <button type="submit" style={styles.searchButton}>Search</button>
        <button type="button" onClick={fetchProducts} style={styles.resetButton}>Reset</button>
      </form>

      <div style={styles.productsGrid}>
        {products.map((product) => (
          <div key={product.product_id} style={styles.productCard}>
            <h3>{product.name}</h3>
            <p style={styles.category}>{product.category}</p>
            <p>{product.description}</p>
            <p style={styles.brand}>{product.brand}</p>
            <p style={styles.price}>${getPrice(product)}</p>
            {user?.role === 'customer' && (
              <button 
                onClick={() => addToCart(product.product_id)}
                style={styles.addButton}
              >
                Add to Cart
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px'
  },
  message: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '10px',
    borderRadius: '5px',
    textAlign: 'center'
  },
  searchForm: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px'
  },
  searchInput: {
    flex: 1,
    padding: '10px',
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid #ccc'
  },
  searchButton: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  resetButton: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px'
  },
  productCard: {
    border: '1px solid #ddd',
    borderRadius: '10px',
    padding: '15px',
    backgroundColor: '#fff'
  },
  category: {
    color: '#666',
    fontSize: '14px'
  },
  brand: {
    color: '#888',
    fontStyle: 'italic'
  },
  price: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#28a745'
  },
  addButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '10px'
  }
};

export default Products;