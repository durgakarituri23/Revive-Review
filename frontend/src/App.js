import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Register from './pages/register';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './pages/login';
import ForgotResetPassword from './pages/forgot-password';
import SellerRegister from './pages/seller_register';
import UploadProducts from './pages/uploadProduct';
import Home from './pages/home';
import UnapprovedProductsPage from './pages/unapproved_products';
import ManageProducts from './pages/manageProducts';
import Cart from './pages/cart';
import Payments from './pages/payments';
import ManagePaymentMethods from './pages/managepaymentMethods';
import ViewOrders from './pages/viewOrders';

function App() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100"> {/* Wrapper for sticky footer */}
        <Header />
        <main className="flex-grow-1"> {/* Makes main content area fill available space */}
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotResetPassword />} />
            <Route path="/seller-register" element={<SellerRegister />} />

            {/* Product Routes */}
            <Route path="/uploadProducts" element={<UploadProducts />} />
            <Route path="/unapproved-products" element={<UnapprovedProductsPage />} />
            <Route path="/manage-products" element={<ManageProducts />} />

            {/* Shopping Routes */}
            <Route path="/cart" element={<Cart />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/manage-payments" element={<ManagePaymentMethods />} />
            <Route path="/vieworders" element={<ViewOrders />} />

            {/* Home and Fallback Routes */}
            <Route path="/" element={<Home />} />
            <Route path="*" element={<Navigate to="/" replace />} /> {/* Better 404 handling */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;