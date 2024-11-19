import React, { useState, useEffect } from "react";
import axios from "axios";

const ManagePaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [newPaymentType, setNewPaymentType] = useState("card");
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    cardName: "",
    cvv: "",
    paypalEmail: ""
  });
  
  // Retrieve user email from local storage
  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      if (!userEmail) {
        console.error("User email not found. Please log in.");
        return;
      }

      try {
        // Fetch existing payment methods for the user
        const response = await axios.get(`http://localhost:8000/user/payment-methods?email=${userEmail}`);
        setPaymentMethods(response.data.methods); // assuming 'methods' in response contains saved payment methods
      } catch (error) {
        console.error("Error fetching payment methods:", error);
      }
    };

    fetchPaymentMethods();
  }, [userEmail]);

  const handleAddPaymentMethod = async () => {
    try {
      // Define the new payment method based on the type
      const newMethod = newPaymentType === "card"
        ? {
            type: "card",
            cardNumber: paymentDetails.cardNumber,
            cardName: paymentDetails.cardName,
            cvv: paymentDetails.cvv
          }
        : {
            type: "paypal",
            paypalEmail: paymentDetails.paypalEmail
          };

      // Send a request to add the new payment method
      await axios.post(`http://localhost:8000/user/payment-methods`, {
        email: userEmail,
        paymentMethod: newMethod
      });
      
      // Update the list of payment methods in the UI
      setPaymentMethods((prevMethods) => [...prevMethods, newMethod]);
      // Clear input fields after adding
      setPaymentDetails({ cardNumber: "", cardName: "", cvv: "", paypalEmail: "" });
    } catch (error) {
      console.error("Error adding payment method:", error);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Manage Payment Methods</h2>

      <div className="mb-4">
        <label className="form-label">Add Payment Method</label>
        <select
          className="form-select mb-3"
          value={newPaymentType}
          onChange={(e) => setNewPaymentType(e.target.value)}
        >
          <option value="card">Credit Card</option>
          <option value="paypal">PayPal</option>
        </select>

        {newPaymentType === "card" && (
          <>
            <input
              type="text"
              placeholder="Card Number"
              className="form-control mb-3"
              value={paymentDetails.cardNumber}
              onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}
            />
            <input
              type="text"
              placeholder="Cardholder Name"
              className="form-control mb-3"
              value={paymentDetails.cardName}
              onChange={(e) => setPaymentDetails({ ...paymentDetails, cardName: e.target.value })}
            />
            <input
              type="text"
              placeholder="CVV"
              className="form-control mb-3"
              value={paymentDetails.cvv}
              onChange={(e) => setPaymentDetails({ ...paymentDetails, cvv: e.target.value })}
            />
          </>
        )}

        {newPaymentType === "paypal" && (
          <input
            type="email"
            placeholder="PayPal Email"
            className="form-control mb-3"
            value={paymentDetails.paypalEmail}
            onChange={(e) => setPaymentDetails({ ...paymentDetails, paypalEmail: e.target.value })}
          />
        )}
        <button className="btn btn-primary" onClick={handleAddPaymentMethod}>
          Add Payment Method
        </button>
      </div>

      <h3>Saved Payment Methods</h3>
      <ul className="list-group">
        {paymentMethods.map((method, index) => (
          <li key={index} className="list-group-item">
            {method.type === "card" ? (
              <>
                Credit Card ending in {method.cardNumber.slice(-4)} <br />
                Cardholder Name: {method.cardName}
              </>
            ) : (
              <>PayPal ({method.paypalEmail})</>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManagePaymentMethods;
