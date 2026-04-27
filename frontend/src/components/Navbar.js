import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🛍</span>
          <span className="brand-name">ShopDB</span>
        </Link>

        <div className="navbar-links">
          {!user && <>
            <Link to="/products" className="nav-link">Products</Link>
            <Link to="/login" className="btn btn-primary btn-sm">Login</Link>
            <Link to="/register" className="btn btn-outline btn-sm">Register</Link>
          </>}

          {user?.role === 'customer' && <>
            <Link to="/products" className="nav-link">Products</Link>
            <Link to="/cart" className="nav-link">🛒 Cart</Link>
            <Link to="/orders" className="nav-link">Orders</Link>
            <Link to="/account" className="nav-link">Account</Link>
            <button onClick={handleLogout} className="btn btn-outline btn-sm">Logout</button>
          </>}

          {user?.role === 'staff' && <>
            <Link to="/staff" className="nav-link">Dashboard</Link>
            <Link to="/account" className="nav-link">Account</Link>
            <button onClick={handleLogout} className="btn btn-outline btn-sm">Logout</button>
          </>}
        </div>
      </div>
    </nav>
  );
}