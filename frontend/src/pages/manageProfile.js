import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageProfile = () => {
  const userEmail = localStorage.getItem('userEmail');

  // State management for form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState(userEmail || ''); // Use the email from localStorage
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Fetch user details from the backend when the component mounts
  useEffect(() => {
    if (userEmail) {
      // Make an API call to fetch the user's details
      const fetchUserDetails = async () => {
        try {
          const response = await axios.get(`http://localhost:8000/get-user-details?email=${userEmail}`);
          const userData = response.data;

          // Update the state with the fetched user data
          setFirstName(userData.first_name);
          setLastName(userData.last_name);
          setPhone(userData.phone);
          setAddress(userData.address);
          setPostalCode(userData.postal_code);
        } catch (error) {
          console.error('Error fetching user details:', error);
        }
      };

      fetchUserDetails();
    }
  }, [userEmail]);

  // Handle form submission and send the updated data to the backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    // The updated user data to send to the backend
    const updatedData = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phone,
      address: address,
      postal_code: postalCode
    };

    try {
      // Send the updated user data to the backend
      const response = await axios.post('http://localhost:8000/update-user-details', updatedData);

      if (response.status === 200) {
        console.log('Profile updated successfully');
        // alert('Profile Updated Successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    //   alert('Error updating profile');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Manage Profile</h2>
      <form onSubmit={handleSubmit}>
        {/* First Name Input */}
        <div className="mb-3">
          <label htmlFor="firstName" className="form-label">First Name</label>
          <input
            type="text"
            className="form-control"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter your first name"
            required
          />
        </div>

        {/* Last Name Input */}
        <div className="mb-3">
          <label htmlFor="lastName" className="form-label">Last Name</label>
          <input
            type="text"
            className="form-control"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Enter your last name"
            required
          />
        </div>

        {/* Email Input (Disabled, as email is usually not editable) */}
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email Address</label>
          <input
            type="email"
            className="form-control"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            disabled // Email should typically be non-editable
          />
        </div>

        {/* Phone Number Input */}
        <div className="mb-3">
          <label htmlFor="phone" className="form-label">Phone Number</label>
          <input
            type="tel"
            className="form-control"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter your phone number"
            required
          />
        </div>

        {/* Address Input */}
        <div className="mb-3">
          <label htmlFor="address" className="form-label">Address</label>
          <input
            type="text"
            className="form-control"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your address"
            required
          />
        </div>

        {/* Postal Code Input */}
        <div className="mb-3">
          <label htmlFor="postalCode" className="form-label">Postal Code</label>
          <input
            type="text"
            className="form-control"
            id="postalCode"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            placeholder="Enter your postal code"
            required
          />
        </div>

        {/* Submit Button */}
        <button type="submit" className="btn btn-primary">Update Profile</button>
      </form>
    </div>
  );
};

export default ManageProfile;
