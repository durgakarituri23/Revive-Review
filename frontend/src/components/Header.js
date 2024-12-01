import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getActiveClass = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <header className="bg-primary text-white p-3">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center">
          <h1>Revive & Rewear</h1>
          <nav>
            <ul className="nav">
              {!user ? (
                // Public navigation
                <>
                  <li className="nav-item">
                    <Link className="nav-link text-white" to="/register">Register</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link text-white" to="/seller-register">Register Seller</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link text-white" to="/admin-register">Register Admin</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link text-white" to="/login">Login</Link>
                  </li>
                </>
              ) : user.role === 'buyer' ? (
                // Buyer navigation
                <>
                  <li className="nav-item">
                    <Link className="nav-link text-white" to="/">Home</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link text-white" to="/cart">Cart</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link text-white" to="/manage-payments">Payment Methods</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link text-white" to="/vieworders">My Orders</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link text-white" to="/complaints">Complaints</Link>
                  </li>
                </>
              ) : user.role === 'seller' ? (
                // Seller navigation
                <>
                  <li className="nav-item">
                    <Link className="nav-link text-white" to="/">Home</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link text-white" to="/uploadProducts">Upload Products</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link text-white" to="/manage-products">Manage Products</Link>
                  </li>
                </>
              ) : user.role === 'admin' ? (
                // Admin navigation
                <>
                  <li className="nav-item">
                    <Link className="nav-link text-white" to="/">Home</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link text-white" to="/unapproved-products">Approve Products</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link text-white" to="/manage-categories">
                      Manage Categories
                    </Link>
                  </li>
                </>
              ) : null}

              {/* Show user info and logout if logged in */}
              {user && (
                <>
                  <li className="nav-item">
                    <span className="nav-link text-white">
                      Welcome, {user.first_name}
                    </span>
                  </li>
                  <li className="nav-item">
                    <button
                      onClick={handleLogout}
                      className="btn btn-outline-light"
                    >
                      Logout
                    </button>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;