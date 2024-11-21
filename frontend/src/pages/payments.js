import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const Payments = () => {
  const location = useLocation();
  const { cart, total } = location.state || { cart: [], total: "0.00" };
  const navigate = useNavigate();

  const [userDetails, setUserDetails] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    postal_code: ""
  });
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [selectedMethodDetails, setSelectedMethodDetails] = useState(null);
  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userEmail) {
        setUserDetails((prevDetails) => ({ ...prevDetails, email: "User email not found. Please log in." }));
        return;
      }

      try {
        const userResponse = await axios.get(`http://localhost:8000/user/details?email=${userEmail}`);
        setUserDetails({
          name: userResponse.data.name || "",
          phone: userResponse.data.phone || "",
          email: userEmail,
          address: userResponse.data.address || "",
          postal_code: userResponse.data.postal_code || ""
        });

        const paymentResponse = await axios.get(`http://localhost:8000/user/payment-methods?email=${userEmail}`);
        const methods = Array.isArray(paymentResponse.data.methods) ? paymentResponse.data.methods : [];
        setPaymentMethods([...methods, { type: "cash", displayName: "Cash on Delivery" }]);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserData();
  }, [userEmail]);

  const handlePaymentMethodChange = (e) => {
    const methodType = e.target.value;
    setSelectedPaymentMethod(methodType);
    const methodDetails = paymentMethods.find(method => method.type === methodType);
    setSelectedMethodDetails(methodDetails || null);
  };

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      alert("Please select a payment method to proceed.");
      return;
    }

    try {
      // Update each item's `buyed` status to true
      await Promise.all(
        cart.map(async (item) => {
          if (!item.buyed) {
            await axios.put(`http://localhost:8000/update-item`, {
              email:userEmail,
              buyed: true,
            });
          }
        })
      );

      alert("Payment successful! Thank you for your purchase.");
      navigate("/vieworders");
    } catch (error) {
      console.error("Error updating item status:", error);
      alert("Payment failed. Please try again.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
  };

  return (
    <div className="container mt-5">
      <h2>Payment Page</h2>
      <h4>Total Amount: ${total}</h4>

      <div className="mt-4">
        <h5>Shipping Information:</h5>
        <div className="mb-3">
          <label className="form-label">Name:</label>
          <input
            type="text"
            className="form-control"
            name="name"
            value={userDetails.name}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Phone Number:</label>
          <input
            type="text"
            className="form-control"
            name="phone"
            value={userDetails.phone}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Email:</label>
          <input
            type="text"
            className="form-control"
            name="email"
            value={userDetails.email}
            readOnly
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Address:</label>
          <input
            type="text"
            className="form-control"
            name="address"
            value={userDetails.address}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Postal Code:</label>
          <input
            type="text"
            className="form-control"
            name="postal_code"
            value={userDetails.postal_code}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="row">
        {cart.map((item) => (
          <div key={item._id} className="col-md-12 mb-3">
            <div className="card">
              <div className="row g-0 align-items-center">
                <div className="col-md-3">
                  <img
                    src={`http://localhost:8000/upload_images/${item.images?.[0] || ""}`}
                    className="img-fluid rounded-start"
                    alt={item.product_name || "Product Image"}
                  />
                </div>
                <div className="col-md-9">
                  <div className="card-body">
                    <h5>{item.product_name || "Product Name"}</h5>
                    <p>Quantity: {item.quantity}</p>
                    <p>Price: ${item.price ? item.price.toFixed(2) : "0.00"}</p>
                    <p>Total: ${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <label>Select Payment Method:</label>
        <select className="form-select mb-3" onChange={handlePaymentMethodChange} value={selectedPaymentMethod}>
          <option value="">Choose Payment Method</option>
          {paymentMethods.map((method, index) => (
            <option key={index} value={method.type}>
              {method.type === "card"
                ? `Credit Card ending in ${method.cardNumber.slice(-4)}`
                : method.type === "paypal"
                ? `PayPal (${method.paypalEmail})`
                : method.displayName}
            </option>
          ))}
        </select>

        {selectedMethodDetails && selectedMethodDetails.type === "card" && (
          <div className="mt-3">
            <h5>Credit Card Details:</h5>
            <p>Card Number: **** **** **** {selectedMethodDetails.cardNumber.slice(-4)}</p>
            <p>Cardholder Name: {selectedMethodDetails.cardName}</p>
          </div>
        )}

        {selectedMethodDetails && selectedMethodDetails.type === "paypal" && (
          <div className="mt-3">
            <h5>PayPal Details:</h5>
            <p>PayPal Email: {selectedMethodDetails.paypalEmail}</p>
          </div>
        )}

        {selectedMethodDetails && selectedMethodDetails.type === "cash" && (
          <div className="mt-3">
            <h5>Cash on Delivery</h5>
            <p>No additional information required.</p>
          </div>
        )}

        <button onClick={handlePayment} className="btn btn-success mt-3">
          Confirm Payment
        </button>
      </div>
    </div>
  );
};

export default Payments;
