import React, { useState } from 'react';
import './CouponModal.css';

const CouponModal = ({ onClose }) => {
  const [couponCode, setCouponCode] = useState('');
  const [cartValue, setCartValue] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const availableCoupons = [
    {
      code: 'FIRST100',
      description: '₹100 off for first-time customers',
      minOrder: 500,
      type: 'First Purchase'
    },
    {
      code: 'NEWUSER20',
      description: '20% off (up to ₹200) for new users',
      minOrder: 0,
      type: 'New User'
    },
    {
      code: 'BULK300',
      description: '₹300 off on bulk orders',
      minOrder: 3000,
      type: 'Bulk Order'
    },
    {
      code: 'FREESHIP',
      description: 'Free shipping on large orders',
      minOrder: 10000,
      type: 'Free Shipping'
    },
    {
      code: 'DIWALI200',
      description: '₹200 off during Diwali season',
      minOrder: 1000,
      type: 'Seasonal'
    },
    {
      code: 'OFFICE50',
      description: '₹50 off on office supplies',
      minOrder: 0,
      type: 'Category'
    }
  ];

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      setValidationResult({ error: 'Please enter a coupon code' });
      return;
    }

    if (!cartValue || cartValue <= 0) {
      setValidationResult({ error: 'Please enter a valid cart value' });
      return;
    }

    setLoading(true);
    setValidationResult(null);

    try {
      const response = await fetch('http://localhost:5000/api/validate-coupon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coupon_code: couponCode.toUpperCase(),
          cart_value: parseFloat(cartValue)
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setValidationResult({
          success: true,
          ...data
        });
      } else {
        setValidationResult({
          error: data.error
        });
      }
    } catch (err) {
      setValidationResult({
        error: 'Network error. Please try again.'
      });
    }

    setLoading(false);
  };

  const handleCopyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    setCouponCode(code);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="coupon-modal-content">
        <div className="modal-header">
          <h2>🎉 Available Coupons</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Coupon Validator */}
          <div className="coupon-validator">
            <h3>Test Coupon Code</h3>
            
            <div className="validator-form">
              <div className="input-group">
                <label>Coupon Code</label>
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                />
              </div>

              <div className="input-group">
                <label>Cart Value (₹)</label>
                <input
                  type="number"
                  value={cartValue}
                  onChange={(e) => setCartValue(e.target.value)}
                  placeholder="Enter cart amount"
                  min="0"
                />
              </div>

              <button 
                className="btn btn-primary validate-btn"
                onClick={handleValidateCoupon}
                disabled={loading}
              >
                {loading ? 'Validating...' : 'Validate Coupon'}
              </button>
            </div>

            {validationResult && (
              <div className={`validation-result ${validationResult.success ? 'success' : 'error'}`}>
                {validationResult.success ? (
                  <div>
                    <div className="success-icon">✅</div>
                    <p><strong>{validationResult.message}</strong></p>
                    <p>Discount Amount: ₹{validationResult.discount_amount}</p>
                    <p>Type: {validationResult.discount_type}</p>
                  </div>
                ) : (
                  <div>
                    <div className="error-icon">❌</div>
                    <p>{validationResult.error}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Available Coupons List */}
          <div className="coupons-list">
            <h3>Available Coupon Codes</h3>
            
            <div className="coupons-grid">
              {availableCoupons.map((coupon, index) => (
                <div key={index} className="coupon-card">
                  <div className="coupon-header">
                    <span className="coupon-type">{coupon.type}</span>
                    <button 
                      className="copy-btn"
                      onClick={() => handleCopyCoupon(coupon.code)}
                      title="Copy code"
                    >
                      📋
                    </button>
                  </div>
                  
                  <div className="coupon-code">{coupon.code}</div>
                  <div className="coupon-description">{coupon.description}</div>
                  
                  {coupon.minOrder > 0 && (
                    <div className="min-order">
                      Min. order: ₹{coupon.minOrder}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouponModal;
