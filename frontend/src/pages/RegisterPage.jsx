import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import '../styles/auth.css';

function RegisterPage() {
  const navigate = useNavigate();
  
  // Form data state for all input fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  // Error message state
  const [error, setError] = useState('');
  
  // Password requirements tracking state
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,      // At least 8 characters
    uppercase: false,   // At least one uppercase letter
    lowercase: false,   // At least one lowercase letter
    number: false,      // At least one number
    special: false      // At least one special character
  });

  // Check password requirements whenever password changes
  useEffect(() => {
    const { password } = formData;
    setPasswordRequirements({
      length: password.length >= 8,                  // Check length
      uppercase: /[A-Z]/.test(password),            // Check for uppercase
      lowercase: /[a-z]/.test(password),            // Check for lowercase
      number: /[0-9]/.test(password),               // Check for numbers
      special: /[!@#$%^&*]/.test(password)          // Check for special characters
    });
  }, [formData.password]);  // Only run when password changes

  // Handle input field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Verify all password requirements are met
    const allRequirementsMet = Object.values(passwordRequirements).every(req => req);
    if (!allRequirementsMet) {
      setError('Please meet all password requirements');
      return;
    }

    // Attempt to register user
    try {
      const response = await authAPI.register(formData);
      console.log('Registration successful:', response.data);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Create Account</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Username</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
            <div className="password-requirements">
              <p style={{ color: passwordRequirements.length ? 'var(--success-color)' : 'var(--text-color)' }}>
                {passwordRequirements.length ? '✓' : '○'} At least 8 characters
              </p>
              <p style={{ color: passwordRequirements.uppercase ? 'var(--success-color)' : 'var(--text-color)' }}>
                {passwordRequirements.uppercase ? '✓' : '○'} One uppercase letter
              </p>
              <p style={{ color: passwordRequirements.lowercase ? 'var(--success-color)' : 'var(--text-color)' }}>
                {passwordRequirements.lowercase ? '✓' : '○'} One lowercase letter
              </p>
              <p style={{ color: passwordRequirements.number ? 'var(--success-color)' : 'var(--text-color)' }}>
                {passwordRequirements.number ? '✓' : '○'} One number
              </p>
              <p style={{ color: passwordRequirements.special ? 'var(--success-color)' : 'var(--text-color)' }}>
                {passwordRequirements.special ? '✓' : '○'} One special character (!@#$%^&*)
              </p>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
            />
          </div>

          <button type="submit" className="submit-button">
            Create Account
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <a href="/login">Sign in</a>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage; 