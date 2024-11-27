import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth
import 'bootstrap/dist/css/bootstrap.min.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth(); // Use the login function from AuthContext

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await login(email, password);
      setSuccess(true);

      // Delay navigation slightly to show success message
      setTimeout(() => {
        // Navigate based on user role
        if (response.role === 'seller') {
          navigate('/seller-dashboard');
        } else {
          navigate('/');
        }
      }, 1500);

    } catch (error) {
      setError(error.response?.data?.detail || 'Invalid credentials');
      setSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-4">
          <h2 className="text-center">Login</h2>
          {success ? (
            <div className="alert alert-success" role="alert">
              Login successful! Redirecting...
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
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
              </div>
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Logging in...
                  </>
                ) : 'Login'}
              </button>
            </form>
          )}
          <div className="mt-3 text-center">
            <Link to="/forgot-password" className="text-decoration-none">Forgot Password?</Link>
          </div>
          <div className="mt-2 text-center">
            <span>Don't have an account? </span>
            <Link to="/register" className="text-decoration-none">Register here</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;