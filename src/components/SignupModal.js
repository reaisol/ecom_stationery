import React, { useState } from 'react';
import './SignupModal.css';

const SignupModal = ({ onClose, onSignup, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('signup'); // 'signup' or 'otp'
  const [otp, setOtp] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    // Phone Number validation
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }

    // Email validation (optional)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          email: formData.email || null,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep('otp');
        // For demo, show OTP in console
        console.log('OTP sent for signup:', data.otp);
        alert(`OTP sent! For demo: ${data.otp}`); // Remove in production
      } else {
        setErrors({ general: data.error || 'Signup failed' });
      }
    } catch (err) {
      setErrors({ general: 'Network error. Please try again.' });
    }

    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setErrors({ otp: 'Please enter a valid 6-digit OTP' });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('http://localhost:5000/api/verify-signup-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: formData.phoneNumber,
          otp: otp
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('session_token', data.session_token);
        onSignup({
          fullName: data.user.fullName,
          phoneNumber: data.user.phoneNumber,
          email: data.user.email,
          session_token: data.session_token
        });
      } else {
        setErrors({ otp: data.error || 'Invalid OTP' });
      }
    } catch (err) {
      setErrors({ otp: 'Network error. Please try again.' });
    }

    setLoading(false);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="signup-modal-content">
        <div className="modal-header">
          <h2>{step === 'signup' ? 'Create Your Account' : 'Verify OTP'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {step === 'signup' && (
            <div className="signup-step">
              <p className="step-description">
                Join us to manage your tasks efficiently.
              </p>

              <form onSubmit={(e) => { e.preventDefault(); handleSignup(); }}>
                <div className="input-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Akshit Sinha"
                    className={errors.fullName ? 'error' : ''}
                  />
                  {errors.fullName && <span className="error-text">{errors.fullName}</span>}
                </div>

                <div className="input-group">
                  <label htmlFor="phoneNumber">Phone Number</label>
                  <div className="phone-input">
                    <span className="country-code">+91</span>
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="Enter 10-digit number"
                      maxLength="10"
                      className={errors.phoneNumber ? 'error' : ''}
                    />
                  </div>
                  {errors.phoneNumber && <span className="error-text">{errors.phoneNumber}</span>}
                </div>

                <div className="input-group">
                  <label htmlFor="email">Email (Optional)</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="akshit.sinha@gmail.com"
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>

                <div className="input-group">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Minimum 8 characters"
                    className={errors.password ? 'error' : ''}
                  />
                  {errors.password && <span className="error-text">{errors.password}</span>}
                </div>

                <div className="input-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Re-enter your password"
                    className={errors.confirmPassword ? 'error' : ''}
                  />
                  {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                </div>

                {errors.general && <div className="error-message">{errors.general}</div>}

                <button 
                  type="submit"
                  className="btn btn-primary submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </button>
              </form>

              <div className="switch-auth">
                Already have an account?{' '}
                <button className="link-btn" onClick={onSwitchToLogin}>
                  Log In
                </button>
              </div>
            </div>
          )}

          {step === 'otp' && (
            <div className="otp-step">
              <p className="step-description">
                Enter the 6-digit OTP sent to +91 {formData.phoneNumber}
              </p>
              
              <div className="input-group">
                <label htmlFor="otp">OTP</label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                  className={`otp-input ${errors.otp ? 'error' : ''}`}
                />
                {errors.otp && <span className="error-text">{errors.otp}</span>}
              </div>

              <div className="otp-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setStep('signup')}
                >
                  Back
                </button>
                
                <button 
                  className="btn btn-primary"
                  onClick={handleVerifyOTP}
                  disabled={loading}
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>

              <button 
                className="resend-btn"
                onClick={handleSignup}
                disabled={loading}
              >
                Resend OTP
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignupModal;
