import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>
        <Link to="/" style={styles.logoLink}>🛒 Grocery Store</Link>
      </div>
      
      <div style={styles.links}>
        <Link to="/products" style={styles.link}>Products</Link>
        
        {user?.role === 'customer' && (
          <>
            <Link to="/cart" style={styles.link}>Cart</Link>
            <Link to="/orders" style={styles.link}>My Orders</Link>
            <Link to="/account" style={styles.link}>Account</Link>
          </>
        )}
        
        {user?.role === 'staff' && (
          <Link to="/staff" style={styles.link}>Staff Dashboard</Link>
        )}
        
        {user ? (
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.link}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 30px',
    backgroundColor: '#343a40',
    color: 'white'
  },
  logo: {
    fontSize: '24px',
    fontWeight: 'bold'
  },
  logoLink: {
    color: 'white',
    textDecoration: 'none'
  },
  links: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center'
  },
  link: {
    color: 'white',
    textDecoration: 'none'
  },
  logoutButton: {
    padding: '8px 15px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  }
};

export default Navbar;