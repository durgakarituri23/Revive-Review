import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Assuming you're using React Router for navigation
import 'bootstrap/dist/css/bootstrap.min.css';  

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent page refresh
    setError('');

    try {
      // Make an API call to log in the user
      const response = await axios.post('http://localhost:8000/login', {
        email: email,
        password: password,
      });

      // If login is successful
      if (response.status === 200) {
        setSuccess(true);
        console.log('Login successful', response.data);
      }
    } catch (error) {
      // Handle error from backend
      if (error.response && error.response.status === 400) {
        setError(error.response.data.detail);
      } else {
        setError('An error occurred during login');
      }
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-4">
          <h2 className="text-center">Login</h2>
          {success ? (
            <div className="alert alert-success" role="alert">
              Login successful!
            </div>
          ) : (
            <form onSubmit={handleLogin}>
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
              {error && <div className="alert alert-danger" role="alert">{error}</div>}
              <button type="submit" className="btn btn-primary w-100">Login</button>
            </form>
          )}
          <div className="mt-3 text-center">
            {/* Add link to Forgot Password page */}
            <Link to="/forgot-password">Forgot Password?</Link>  {/* Navigates to the Forgot Password page */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
