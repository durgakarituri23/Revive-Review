import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import 'bootstrap/dist/css/bootstrap.min.css';  

const SellerRegister = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [taxId, setTaxId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate(); // Initialize the navigate function

  const handleRegister = async (e) => {
    e.preventDefault();

    // Clear error message
    setError('');

    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      // Make an API call to register the seller
      const response = await axios.post('http://localhost:8000/seller_register', {
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        email: email,
        password: password,
        business_name: businessName,
        address: address,
        tax_id: taxId,
      });

      // If registration is successful
      if (response.status === 200) {
        setSuccess(true);
        console.log('Seller registration successful', response.data);
        // Redirect to login page
        navigate('/login'); // Redirect to login page
      }
    } catch (error) {
      setError('Email or business name already exists');
      console.error('Error registering seller:', error);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-4">
          <h2 className="text-center">Seller Registration</h2>
          {success ? (
            <div className="alert alert-success" role="alert">
              Seller registration successful!
            </div>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="mb-3">
                <label htmlFor="firstName" className="form-label">First Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="lastName" className="form-label">Last Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="phone" className="form-label">Phone</label>
                <input
                  type="text"
                  className="form-control"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="businessName" className="form-label">Business Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="businessName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="address" className="form-label">Address</label>
                <input
                  type="text"
                  className="form-control"
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="taxId" className="form-label">Tax ID</label>
                <input
                  type="text"
                  className="form-control"
                  id="taxId"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              {error && <div className="alert alert-danger" role="alert">{error}</div>}
              <button type="submit" className="btn btn-primary w-100">Register as Seller</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerRegister;
