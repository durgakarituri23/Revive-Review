import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ViewOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userEmail = localStorage.getItem('userEmail');

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userEmail) {
        setError('User email not found. Please log in.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:8000/orders/user?email=${userEmail}`);
        setOrders(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to fetch orders. Please try again later.');
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userEmail]);

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Your Orders</h2>
      {orders.length === 0 ? (
        <div className="alert alert-info">No orders found.</div>
      ) : (
        orders.map((order) => (
          <div key={order._id} className="card mb-4">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Order ID: {order._id}</h5>
              <span>Status: {order.status}</span>
            </div>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-6">
                  <h6>Order Date</h6>
                  <p>{new Date(order.order_date).toLocaleString()}</p>
                </div>
                <div className="col-md-6 text-md-end">
                  <h6>Total Amount</h6>
                  <p className="h5">${order.total_amount.toFixed(2)}</p>
                </div>
              </div>
              
              <h6>Items:</h6>
              {order.items.map((item, index) => (
                <div key={index} className="card mb-3">
                  <div className="row g-0 align-items-center">
                    <div className="col-md-2">
                      {item.image && (
                        <img
                          src={`http://localhost:8000/upload_images/${item.image}`}
                          className="img-fluid rounded-start"
                          alt={item.product_name}
                        />
                      )}
                    </div>
                    <div className="col-md-10">
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-8">
                            <h5 className="card-title">{item.product_name}</h5>
                            <p className="card-text">
                              Quantity: {item.quantity} x ${item.price.toFixed(2)}
                            </p>
                          </div>
                          <div className="col-md-4 text-md-end">
                            <p className="card-text">
                              <strong>
                                Subtotal: ${(item.quantity * item.price).toFixed(2)}
                              </strong>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="row mt-4">
                <div className="col-md-6">
                  <h6>Shipping Address</h6>
                  <p>
                    {order.shipping_address.name}<br />
                    {order.shipping_address.address}<br />
                    {order.shipping_address.postal_code}
                  </p>
                </div>
                <div className="col-md-6">
                  <h6>Payment Method</h6>
                  {order.payment_method.type === 'card' ? (
                    <p>
                      Card ending in {order.payment_method.cardNumber.slice(-4)}<br />
                      {order.payment_method.cardName}
                    </p>
                  ) : (
                    <p>PayPal ({order.payment_method.paypalEmail})</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ViewOrders;