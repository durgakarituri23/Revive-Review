import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [requiresMFA, setRequiresMFA] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const { login, verifyMFA, resendMFACode } = useAuth();

  const navigateByRole = (role) => {
    switch (role) {
      case 'seller':
        navigate('/seller-dashboard');
        break;
      case 'admin':
        navigate('/admin-dashboard');
        break;
      default:
        navigate('/');
        break;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await login(email, password);
      
      if (response.requires_mfa) {
        setRequiresMFA(true);
        setError('');
      } else {
        setSuccess(true);
        // If MFA not required, proceed with normal login flow
        setTimeout(() => {
          navigateByRole(response.role);
        }, 1500);
      }
    } catch (error) {
      setError(error.response?.data?.detail || 'Invalid credentials');
      setSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyMFA = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await verifyMFA(email, verificationCode);
      
      if (response.access_token) {
        // If verification successful, proceed with login
        setSuccess(true);
        setTimeout(() => {
          navigateByRole(response.role);
        }, 1500);
      } else {
        // If verification failed, stay on same page and show error
        setError('Invalid verification code. Please try again.');
      }
    } catch (error) {
      // Show error but stay on verification page
      setError(error.response?.data?.detail || 'Failed to verify code');
      setVerificationCode(''); // Clear the verification code input
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
        setIsLoading(true);
        const response = await resendMFACode(email);
        setError(response.message || 'New verification code sent to your email');
        setVerificationCode(''); // Clear the verification code input
    } catch (error) {
        setError(error.response?.data?.detail || 'Failed to resend verification code');
    } finally {
        setIsLoading(false);
    }
};

  // MFA verification form
  if (requiresMFA) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-4">
            <h2 className="text-center mb-4">Verify Your Identity</h2>
            <div className="card">
              <div className="card-body">
                <p className="text-muted">
                  A verification code has been sent to your email.
                  Please enter the code below to continue.
                </p>
                <form onSubmit={handleVerifyMFA}>
                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control form-control-lg text-center"
                      placeholder="Enter verification code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      maxLength="6"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="alert alert-success" role="alert">
                      Verification successful! Redirecting...
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-primary w-100 mb-3"
                    disabled={isLoading || success}
                  >
                    {isLoading ? (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                    ) : "Verify Code"}
                  </button>

                  <button
                    type="button"
                    className="btn btn-link w-100"
                    onClick={handleResendCode}
                    disabled={isLoading || success}
                  >
                    Resend Code
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Regular login form (rest of your existing login form JSX)
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-4">
          <h2 className="text-center">Login</h2>
          {success ? (
            <div className="alert alert-success text-center">
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
                className="btn btn-primary w-100 mb-3"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                ) : "Login"}
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