import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';  

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    mfaEnabled: false 
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  // Validation rules
  const validateField = (name, value) => {
    switch (name) {
      case 'firstName':
        return value.length < 2 
          ? 'First name must be at least 2 characters long'
          : !/^[A-Za-z\s]+$/.test(value)
          ? 'First name should only contain letters'
          : '';

      case 'lastName':
        return value.length < 2
          ? 'Last name must be at least 2 characters long'
          : !/^[A-Za-z\s]+$/.test(value)
          ? 'Last name should only contain letters'
          : '';

      case 'email':
        return !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)
          ? 'Invalid email address'
          : '';

      case 'phone':
        return value.length !== 10
          ? 'Phone number must be 10 digits'
          : !/^\d+$/.test(value)
          ? 'Phone number should only contain numbers'
          : '';

      case 'password':
        if (value.length < 8) return 'Password must be at least 8 characters long';
        if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
        if (!/[a-z]/.test(value)) return 'Password must contain at least one lowercase letter';
        if (!/[0-9]/.test(value)) return 'Password must contain at least one number';
        if (!/[!@#$%^&*]/.test(value)) return 'Password must contain at least one special character (!@#$%^&*)';
        return '';

      case 'confirmPassword':
        return value !== formData.password
          ? 'Passwords do not match'
          : '';

      default:
        return '';
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validate field on change
    setErrors(prev => ({
      ...prev,
      [name]: validateField(name, value)
    }));

    // Special case for confirm password
    if (name === 'password') {
      setErrors(prev => ({
        ...prev,
        confirmPassword: formData.confirmPassword 
          ? validateField('confirmPassword', formData.confirmPassword)
          : prev.confirmPassword
      }));
    }
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/register', {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        mfa_enabled: formData.mfaEnabled
      });

      if (response.status === 200 || response.status === 201) {
        setSuccess(true);
        console.log('Registration successful - navigating in 2 seconds');
        
        setTimeout(() => {
          console.log('Executing navigation to /login');
          navigate('/login');
        }, 2000);
      } else {
        setErrors(prev => ({
          ...prev,
          submit: 'Unexpected response from server'
        }));
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        submit: error.response?.data?.detail || 'Registration failed. Please try again.'
      }));
      console.error('Error registering:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInputClassName = (fieldName) => {
    return `form-control ${errors[fieldName] ? 'is-invalid' : formData[fieldName] ? 'is-valid' : ''}`;
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h2 className="text-center mb-4">Register</h2>
          {success ? (
            <div className="alert alert-success text-center" role="alert">
              Registration successful! Redirecting to login page...
            </div>
          ) : (
            <form onSubmit={handleRegister} noValidate>
              <div className="mb-3">
                <label htmlFor="firstName" className="form-label">First Name</label>
                <input
                  type="text"
                  className={getInputClassName('firstName')}
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
                {errors.firstName && (
                  <div className="invalid-feedback">{errors.firstName}</div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="lastName" className="form-label">Last Name</label>
                <input
                  type="text"
                  className={getInputClassName('lastName')}
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
                {errors.lastName && (
                  <div className="invalid-feedback">{errors.lastName}</div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  className={getInputClassName('email')}
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
                {errors.email && (
                  <div className="invalid-feedback">{errors.email}</div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="phone" className="form-label">Phone</label>
                <input
                  type="tel"
                  className={getInputClassName('phone')}
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength="10"
                  required
                  disabled={isLoading}
                />
                {errors.phone && (
                  <div className="invalid-feedback">{errors.phone}</div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  type="password"
                  className={getInputClassName('password')}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
                {errors.password && (
                  <div className="invalid-feedback">{errors.password}</div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                <input
                  type="password"
                  className={getInputClassName('confirmPassword')}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
                {errors.confirmPassword && (
                  <div className="invalid-feedback">{errors.confirmPassword}</div>
                )}
              </div>
              <div className="mb-3">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="mfaEnabled"
                    name="mfaEnabled"
                    checked={formData.mfaEnabled}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  <label className="form-check-label" htmlFor="mfaEnabled">
                    Enable Two-Factor Authentication
                  </label>
                  <small className="form-text text-muted d-block">
                    When enabled, you'll need to verify your identity using a code sent to your email each time you log in.
                  </small>
                </div>
              </div>
              {errors.submit && (
                <div className="alert alert-danger" role="alert">
                  {errors.submit}
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-primary w-100 mb-3" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Registering...
                  </>
                ) : 'Register'}
              </button>
              
              <div className="text-center">
                Already have an account? {' '}
                <button 
                  onClick={() => navigate('/login')} 
                  className="btn btn-link p-0"
                  type="button"
                >
                  Login here
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;