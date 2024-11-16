import React, { useState, useEffect } from "react";
import axios from "axios";

const Cart = () => {
  const [cart, setCart] = useState([]);
  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    const fetchCartItems = async () => {
      if (!userEmail) {
        console.error("User email not found. Please log in.");
        return;
      }

      try {
        const response = await axios.get(`http://localhost:8000/user/cart?email=${userEmail}`);
        setCart(response.data);  // Assuming `response.data` is an array of product objects
      } catch (error) {
        console.error("Error fetching cart items:", error);
      }
    };

    fetchCartItems();
  }, [userEmail]);



  // Handle deleting a product from the cart
  const handleDeleteProduct = async (productId) => {
    try {
      await axios.delete(`http://localhost:8000/user/cart/delete`, {
        data: { email: userEmail, productId }
      });
      setCart(cart.filter((item) => item._id !== productId)); // Update UI
    } catch (error) {
      console.error("Error deleting product from cart:", error);
    }
  };

  // Handle updating the quantity of a product in the cart
  const handleUpdateQuantity = async (productId, newQuantity) => {
    // Allow the update API call even if newQuantity is 1
    if (newQuantity < 1) {
      await handleDeleteProduct(productId); // Delete if quantity is zero
      return;
    }

    try {
      await axios.put(`http://localhost:8000/user/cart/update`, {
        email: userEmail,
        id: productId,
        quantity: newQuantity
      });
      setCart(
        cart.map((item) =>
          item._id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error("Error updating product quantity:", error);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Shopping Cart</h2>

      {/* Cart Item List */}
      <div className="row">
        {cart && cart.length > 0 ? (
          cart.map((item) => (
            <div key={item._id} className="col-md-12 mb-3">
              <div className="card">
                <div className="row g-0 align-items-center">
                  {/* Product Image */}
                  <div className="col-md-3">
                    <img
                      src={`http://localhost:8000/upload_images/${item.images?.[0] || ''}`}
                      className="img-fluid rounded-start"
                      alt={item.product_name || 'Product Image'}
                    />
                  </div>

                  {/* Product Details */}
                  <div className="col-md-9">
                    <div className="card-body">
                      <h5 className="card-title">{item.product_name || 'Product Name'}</h5>
                      <p className="card-text">{item.description || 'No description available'}</p>
                      <p className="card-text">
                        <strong>Price:</strong> ${item.price ? item.price.toFixed(2) : '0.00'}
                      </p>
                      <p className="card-text">
                        <strong>Category:</strong> {item.category || 'Uncategorized'}
                      </p>
                      <div className="d-flex align-items-center">
                        <button
                          className="btn btn-secondary me-2"
                          onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                        >
                          -
                        </button>
                        <strong className="mx-2">{item.quantity || 1}</strong>
                        <button
                          className="btn btn-secondary ms-2"
                          onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <p className="card-text">
                        <strong>Total:</strong> ${(item.price * (item.quantity || 1)).toFixed(2)}
                      </p>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDeleteProduct(item._id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>Your cart is empty.</p>
        )}
      </div>

      {/* Total Amount */}
      
    </div>
  );
};

export default Cart;





