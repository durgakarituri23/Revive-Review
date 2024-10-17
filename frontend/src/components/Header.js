import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Header = () => {
  return (
    <header className="bg-primary text-white p-3">
      <div className="container">
        <h1>Revive & Rewear</h1>
        <nav>
          <ul className="nav">
            <li className="nav-item">
              <Link className="nav-link text-white" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" to="/register">Register</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" to="/seller-register">Register Seller</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" to="/login">Login</Link>
            </li>
            {/* Add other links as needed */}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
