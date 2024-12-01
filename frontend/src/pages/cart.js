import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from '../contexts/CartContext';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, updateCart, removeFromCart } = useCart();
  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    if (userEmail) {
      updateCart();
    }
  }, [userEmail, updateCart]);

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.price || 0;
      return total + price;
    }, 0).toFixed(2);
  };

  const handleDeleteProduct = async (productId) => {
    const success = await removeFromCart(productId);
    if (success) {
      alert("Product removed from cart successfully!");
    }
  };

  const handleCheckout = () => {
    navigate("/payments", { state: { cart: cartItems, total: calculateTotal() } });
  };

  if (!userEmail) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="alert alert-info text-center p-5">
              <h4 className="mb-0">Please login to view your cart</h4>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-9">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0 fw-bold">Shopping Cart</h2>
            {cartItems.length > 0 && (
              <span className="badge bg-primary rounded-pill px-3 py-2">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>

          {cartItems && cartItems.length > 0 ? (
            <div className="mb-4">
              {cartItems.map((item) => (
                <div key={item._id} className="card shadow-sm border-0 mb-3">
                  <div className="card-body">
                    <div className="row align-items-center">
                      <div className="col-md-3 mb-3 mb-md-0">
                        <div className="bg-light rounded p-3 text-center">
                          <img
                            src={`http://localhost:8000/upload_images/${item.images?.[0] || ''}`}
                            className="img-fluid"
                            alt={item.product_name || 'Product Image'}
                            style={{ maxHeight: '150px', objectFit: 'contain' }}
                          />
                        </div>
                      </div>

                      <div className="col-md-9">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <h5 className="mb-1 fw-bold">{item.product_name}</h5>
                            <span className="badge bg-light text-dark">{item.category}</span>
                          </div>
                          <h5 className="text-primary mb-0">${item.price?.toFixed(2)}</h5>
                        </div>

                        <p className="text-muted mb-3">{item.description}</p>

                        <div className="d-flex justify-content-end align-items-center">
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDeleteProduct(item._id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="mb-0 fw-bold">Order Summary</h4>
                    <h4 className="mb-0 text-primary">${calculateTotal()}</h4>
                  </div>
                  <button 
                    onClick={handleCheckout} 
                    className="btn btn-primary w-100 py-2 fw-bold"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card shadow-sm border-0">
              <div className="card-body text-center p-5">
                <h3 className="text-muted mb-4">Your cart is empty</h3>
                <button 
                  onClick={() => navigate('/')} 
                  className="btn btn-primary px-4 py-2"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;