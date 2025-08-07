import React, { useState } from 'react';
import './LoginModal.css';

const LoginModal = ({ onClose, onLogin, onSwitchToSignup }) => {
  const [loginType, setLoginType] = useState('password'); // 'password' or 'otp'
  const [step, setStep] = useState('login'); // 'login', 'otp', 'forgot', 'reset'
  const [formData, setFormData] = useState({
    identifier: '', // email or phone
    password: ''
  });
  const [otp, setOtp] = useState('');
  const [resetData, setResetData] = useState({
    identifier: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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

  const handleResetInputChange = (e) => {
    const { name, value } = e.target;
    setResetData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPhone = (phone) => {
    return /^[6-9]\d{9}$/.test(phone);
  };

  const validateLoginForm = () => {
    const newErrors = {};

    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Email or phone number is required';
    } else {
      const identifier = formData.identifier.trim();
      if (!isValidEmail(identifier) && !isValidPhone(identifier)) {
        newErrors.identifier = 'Please enter a valid email or 10-digit phone number';
      }
    }

    if (loginType === 'password' && !formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordLogin = async () => {
    if (!validateLoginForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: formData.identifier.trim(),
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('session_token', data.session_token);
        onLogin({
          fullName: data.user.fullName,
          phoneNumber: data.user.phoneNumber,
          email: data.user.email,
          session_token: data.session_token
        });
      } else {
        setErrors({ general: data.error || 'Login failed' });
      }
    } catch (err) {
      setErrors({ general: 'Network error. Please try again.' });
    }

    setLoading(false);
  };

  const handleSendOTP = async () => {
    if (!validateLoginForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('http://localhost:5000/api/send-login-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: formData.identifier.trim()
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep('otp');
        // For demo, show OTP in console
        console.log('OTP sent for login:', data.otp);
        alert(`OTP sent! For demo: ${data.otp}`); // Remove in production
      } else {
        setErrors({ general: data.error || 'Failed to send OTP' });
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
      const response = await fetch('http://localhost:5000/api/verify-login-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: formData.identifier.trim(),
          otp: otp
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('session_token', data.session_token);
        onLogin({
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

  const handleForgotPassword = async () => {
    if (!resetData.identifier.trim()) {
      setErrors({ resetIdentifier: 'Email or phone number is required' });
      return;
    }

    const identifier = resetData.identifier.trim();
    if (!isValidEmail(identifier) && !isValidPhone(identifier)) {
      setErrors({ resetIdentifier: 'Please enter a valid email or phone number' });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('http://localhost:5000/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: identifier
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep('reset');
        // For demo, show OTP in console
        console.log('Password reset OTP:', data.otp);
        alert(`Password reset OTP sent! For demo: ${data.otp}`); // Remove in production
      } else {
        setErrors({ resetIdentifier: data.error || 'Failed to send reset OTP' });
      }
    } catch (err) {
      setErrors({ resetIdentifier: 'Network error. Please try again.' });
    }

    setLoading(false);
  };

  const handleResetPassword = async () => {
    const newErrors = {};

    if (!resetData.otp || resetData.otp.length !== 6) {
      newErrors.resetOtp = 'Please enter a valid 6-digit OTP';
    }

    if (!resetData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (resetData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (resetData.newPassword !== resetData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('http://localhost:5000/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: resetData.identifier,
          otp: resetData.otp,
          newPassword: resetData.newPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Password reset successfully! Please login with your new password.');
        setStep('login');
        setResetData({ identifier: '', otp: '', newPassword: '', confirmPassword: '' });
        setFormData({ identifier: resetData.identifier, password: '' });
      } else {
        setErrors({ resetGeneral: data.error || 'Failed to reset password' });
      }
    } catch (err) {
      setErrors({ resetGeneral: 'Network error. Please try again.' });
    }

    setLoading(false);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'login': return 'Login to Papercart.in';
      case 'otp': return 'Verify OTP';
      case 'forgot': return 'Forgot Password';
      case 'reset': return 'Reset Password';
      default: return 'Login to Papercart.in';
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>{getStepTitle()}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {step === 'login' && (
            <div className="login-step">
              <div className="login-type-selector">
                <button
                  className={`type-btn ${loginType === 'password' ? 'active' : ''}`}
                  onClick={() => setLoginType('password')}
                >
                  Password Login
                </button>
                <button
                  className={`type-btn ${loginType === 'otp' ? 'active' : ''}`}
                  onClick={() => setLoginType('otp')}
                >
                  OTP Login
                </button>
              </div>

              <div className="input-group">
                <label htmlFor="identifier">Email or Phone Number</label>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  value={formData.identifier}
                  onChange={handleInputChange}
                  placeholder="Enter email or phone number"
                  className={errors.identifier ? 'error' : ''}
                />
                {errors.identifier && <span className="error-text">{errors.identifier}</span>}
              </div>

              {loginType === 'password' && (
                <div className="input-group">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className={errors.password ? 'error' : ''}
                  />
                  {errors.password && <span className="error-text">{errors.password}</span>}
                </div>
              )}

              {errors.general && <div className="error-message">{errors.general}</div>}

              <button 
                className="btn btn-primary submit-btn"
                onClick={loginType === 'password' ? handlePasswordLogin : handleSendOTP}
                disabled={loading}
              >
                {loading ? 
                  (loginType === 'password' ? 'Logging in...' : 'Sending OTP...') : 
                  (loginType === 'password' ? 'Login' : 'Send OTP')
                }
              </button>

              {loginType === 'password' && (
                <button 
                  className="forgot-password-btn"
                  onClick={() => setStep('forgot')}
                >
                  Forgot Password?
                </button>
              )}

              <div className="switch-auth">
                Don't have an account?{' '}
                <button className="link-btn" onClick={onSwitchToSignup}>
                  Sign Up
                </button>
              </div>
            </div>
          )}

          {step === 'otp' && (
            <div className="otp-step">
              <p className="step-description">
                Enter the 6-digit OTP sent to {formData.identifier}
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
                  onClick={() => setStep('login')}
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
                onClick={handleSendOTP}
                disabled={loading}
              >
                Resend OTP
              </button>
            </div>
          )}

          {step === 'forgot' && (
            <div className="forgot-step">
              <p className="step-description">
                Enter your email or phone number to receive a password reset OTP
              </p>
              
              <div className="input-group">
                <label htmlFor="resetIdentifier">Email or Phone Number</label>
                <input
                  id="resetIdentifier"
                  name="identifier"
                  type="text"
                  value={resetData.identifier}
                  onChange={handleResetInputChange}
                  placeholder="Enter email or phone number"
                  className={errors.resetIdentifier ? 'error' : ''}
                />
                {errors.resetIdentifier && <span className="error-text">{errors.resetIdentifier}</span>}
              </div>

              <div className="forgot-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setStep('login')}
                >
                  Back to Login
                </button>
                
                <button 
                  className="btn btn-primary"
                  onClick={handleForgotPassword}
                  disabled={loading}
                >
                  {loading ? 'Sending OTP...' : 'Send Reset OTP'}
                </button>
              </div>
            </div>
          )}

          {step === 'reset' && (
            <div className="reset-step">
              <p className="step-description">
                Enter the OTP and set your new password
              </p>
              
              <div className="input-group">
                <label htmlFor="resetOtp">OTP</label>
                <input
                  id="resetOtp"
                  name="otp"
                  type="text"
                  value={resetData.otp}
                  onChange={(e) => setResetData(prev => ({...prev, otp: e.target.value.replace(/\D/g, '').slice(0, 6)}))}
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                  className={`otp-input ${errors.resetOtp ? 'error' : ''}`}
                />
                {errors.resetOtp && <span className="error-text">{errors.resetOtp}</span>}
              </div>

              <div className="input-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={resetData.newPassword}
                  onChange={handleResetInputChange}
                  placeholder="Enter new password (min 8 characters)"
                  className={errors.newPassword ? 'error' : ''}
                />
                {errors.newPassword && <span className="error-text">{errors.newPassword}</span>}
              </div>

              <div className="input-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={resetData.confirmPassword}
                  onChange={handleResetInputChange}
                  placeholder="Confirm new password"
                  className={errors.confirmPassword ? 'error' : ''}
                />
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>

              {errors.resetGeneral && <div className="error-message">{errors.resetGeneral}</div>}

              <div className="reset-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setStep('forgot')}
                >
                  Back
                </button>
                
                <button 
                  className="btn btn-primary"
                  onClick={handleResetPassword}
                  disabled={loading}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;