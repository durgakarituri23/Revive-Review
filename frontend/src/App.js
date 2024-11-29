import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute, SellerRoute, BuyerRoute, AdminRoute } from './components/ProtectedRoute';

// Import components
import Register from './pages/register';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './pages/login';
import ForgotResetPassword from './pages/forgot-password';
import SellerRegister from './pages/seller_register';
import AdminRegister from './pages/adminRegister'; 
import UploadProducts from './pages/uploadProduct';
import Home from './pages/home';
import UnapprovedProductsPage from './pages/unapproved_products';
import ManageProducts from './pages/manageProducts';
import Cart from './pages/cart';
import Payments from './pages/payments';
import ManagePaymentMethods from './pages/managepaymentMethods';
import ViewOrders from './pages/viewOrders';

// Role-specific home component wrapper
const RoleBasedHome = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;

  switch (user.role) {
    case 'seller':
      return <ManageProducts />;  // Sellers see their products
    case 'admin':
      return <UnapprovedProductsPage />; // Admins see products to approve
    case 'buyer':
    default:
      return <Home />; // Buyers see all approved products
  }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100">
          <Header />
          <main className="flex-grow-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotResetPassword />} />
              <Route path="/seller-register" element={<SellerRegister />} />
              <Route path="/admin-register" element={<AdminRegister />} />

              {/* Seller Only Routes */}
              <Route
                path="/uploadProducts"
                element={
                  <SellerRoute>
                    <UploadProducts />
                  </SellerRoute>
                }
              />
              <Route
                path="/manage-products"
                element={
                  <SellerRoute>
                    <ManageProducts />
                  </SellerRoute>
                }
              />

              {/* Admin Only Routes */}
              <Route
                path="/unapproved-products"
                element={
                  <AdminRoute>
                    <UnapprovedProductsPage />
                  </AdminRoute>
                }
              />

              {/* Buyer Only Routes */}
              <Route
                path="/cart"
                element={
                  <BuyerRoute>
                    <Cart />
                  </BuyerRoute>
                }
              />
              <Route
                path="/payments"
                element={
                  <BuyerRoute>
                    <Payments />
                  </BuyerRoute>
                }
              />
              <Route
                path="/manage-payments"
                element={
                  <BuyerRoute>
                    <ManagePaymentMethods />
                  </BuyerRoute>
                }
              />
              <Route
                path="/vieworders"
                element={
                  <BuyerRoute>
                    <ViewOrders />
                  </BuyerRoute>
                }
              />

              {/* Protected Home Route with Role-Based Content */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <RoleBasedHome />
                  </ProtectedRoute>
                }
              />

              {/* 404 Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;