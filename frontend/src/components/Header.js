import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useCart } from '../contexts/CartContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems } = useCart();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <style>
  {`
    .custom-navbar {
      padding: 0.5rem 0;
    }

    .navbar-brand {
      font-size: 1.8rem;
      font-weight: bold;
      color: #fff !important;
    }

    .navbar-nav .nav-link {
      font-size: 1.1rem;
      padding: 0.5rem 1rem;
      transition: color 0.3s ease, background-color 0.3s ease;
      color: #fff;
    }

    .navbar-nav .nav-link:hover {
      /*background-color: #120a8f;  Change to any color you want */
      color: #081a8d !important;
      
    }
      .navbar-nav .nav-item {
      margin-right: 10px; /* Adjust this value to increase/decrease gap */
    }
    .btn-primary:hover {
      background-color: initial;
      color: initial;
      color: #081a8d !important;
      border: none;
      outline: none;
    }
    .btn-primary {
      
      font-size: 1.1rem;
      padding: 0.5rem 1rem;
    }

    .cart-badge {
      position: absolute;
      top: -5px;
      right: -10px;
      font-size: 0.75rem;
      padding: 0.3rem 0.5rem;
      background-color: #dc3545;
      color: #fff;
    }

    @media (max-width: 992px) {
      .navbar-nav .nav-link {
        font-size: 1rem;
      }
      .navbar-brand {
        font-size: 1.5rem;
      }
    }
  `}
</style>


      <header className="custom-navbar bg-primary text-white">
        <div className="container">
          <nav className="navbar navbar-expand-lg">
            <Link className="navbar-brand text-primary fw-bold fs-3" to="/">
              Revive & Rewear
            </Link>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto">
                {!user ? (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/register">Register</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/seller-register">Register Seller</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/admin-register">Register Admin</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/login">Login</Link>
                    </li>
                  </>
                ) : user.role === 'buyer' ? (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/">Home</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/manage-profile">Manage Profile</Link>
                    </li>
                    <li className="nav-item position-relative">
                      <Link className="nav-link" to="/cart">
                        Cart
                        {cartItems.length > 0 && (
                          <span className="badge rounded-pill bg-danger cart-badge">
                            {cartItems.length}
                          </span>
                        )}
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/manage-payments">Payment Methods</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/vieworders">My Orders</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/complaints">Complaints</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/contactus">Contact Us</Link>
                    </li>
                  </>
                ) : user.role === 'seller' ? (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/">Home</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/manage-profile">Manage Profile</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/uploadProducts">Upload Products</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/manage-products">Manage Products</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/manage-coupons">Create Coupons</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/contactus">Contact Us</Link>
                    </li>
                  </>
                ) : user.role === 'admin' ? (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/">Home</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/manage-profile">Manage Profile</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/unapproved-products">Verify Products</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/manage-categories">Manage Categories</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/review-complaints">Review Complaints</Link>
                    </li>
                  </>
                ) : null}
                {user && (
                  <>
                    <li className="nav-item">
                      <span className="nav-link">
                        Welcome, {user.first_name}
                      </span>
                    </li>
                    <li className="nav-item">
                      
                      <button
                        onClick={handleLogout}
                        className="btn btn-primary btn-sm"
                      >
                        Logout
                      </button>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </nav>
        </div>
      </header>
    </>
  );
};

export default Header;
