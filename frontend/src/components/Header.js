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
              <li className="nav-item">
                <Link className="nav-link text-white" to="/">Home</Link>
              </li>

              {!user ? (
                // Show these items when user is not logged in
                <>
                  <li className="nav-item">
                    <Link className="nav-link text-white" to="/register">Register</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link text-white" to="/seller-register">Register Seller</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link text-white" to="/login">Login</Link>
                  </li>
                </>
              ) : user.role === 'buyer' ? (
                // Buyer-specific navigation items
                <>
                  <li className="nav-item">
                    <Link
                      className={`nav-link text-white ${getActiveClass('/cart')}`}
                      to="/cart"
                    >
                      Cart
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      className={`nav-link text-white ${getActiveClass('/manage-payments')}`}
                      to="/manage-payments"
                    >
                      Payment Methods
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      className={`nav-link text-white ${getActiveClass('/vieworders')}`}
                      to="/vieworders"
                    >
                      My Orders
                    </Link>
                  </li>
                </>
              ) : (
                // Seller-specific navigation items
                <>
                  <li className="nav-item">
                    <Link
                      className={`nav-link text-white ${getActiveClass('/uploadProducts')}`}
                      to="/uploadProducts"
                    >
                      Upload Products
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      className={`nav-link text-white ${getActiveClass('/manage-products')}`}
                      to="/manage-products"
                    >
                      Manage Products
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      className={`nav-link text-white ${getActiveClass('/unapproved-products')}`}
                      to="/unapproved-products"
                    >
                      Unapproved Products
                    </Link>
                  </li>
                </>
              )}

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