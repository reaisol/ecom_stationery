import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './CategoryPage.css';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getCartSubtotal } = useCart();
  const [coupon, setCoupon] = useState('');
  const [couponFeedback, setCouponFeedback] = useState(null);
  const [discount, setDiscount] = useState(0);
  const navigate = useNavigate();

  const subtotal = useMemo(() => getCartSubtotal(), [cart, getCartSubtotal]);
  const total = Math.max(0, subtotal - discount);

  const handleApplyCoupon = async () => {
    setCouponFeedback(null);
    try {
      const res = await fetch('http://localhost:5000/api/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coupon_code: coupon, cart_value: subtotal })
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setDiscount(data.discount_amount);
        setCouponFeedback({ type: 'success', message: data.message });
      } else {
        setDiscount(0);
        setCouponFeedback({ type: 'error', message: data.error || 'Invalid coupon' });
      }
    } catch (e) {
      setCouponFeedback({ type: 'error', message: 'Network error' });
    }
  };

  const handleProceed = () => {
    const token = localStorage.getItem('session_token');
    if (!token) {
      navigate('/cart?login=1&redirect=/checkout');
      return;
    }
    navigate('/checkout', { state: { from: 'cart' } });
  };

  return (
    <div className="container" style={{ padding: '24px 0' }}>
      <div className="card" style={{ padding: 16 }}>
        <h2>Checkout</h2>
        <div className="table-responsive">
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Thumbnail</th>
                <th>Products</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cart.items.map(item => (
                <tr key={item.id}>
                  <td><img src={item.image} alt={item.name} style={{ width: 80, height: 60, objectFit: 'cover' }} /></td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    <div style={{ color: '#666' }}>{item.variant}</div>
                  </td>
                  <td>₹{item.price.toFixed(2)}</td>
                  <td>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                      <input value={item.quantity} onChange={(e)=> updateQuantity(item.id, Math.max(1, Number(e.target.value)||1))} style={{ width: 40, textAlign: 'center' }} />
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                  </td>
                  <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                  <td>
                    <button onClick={() => removeFromCart(item.id)} title="Remove">🗑️</button>
                  </td>
                </tr>
              ))}
              {cart.items.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: 24 }}>Your cart is empty.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
          <input value={coupon} onChange={(e)=> setCoupon(e.target.value)} placeholder="Enter Your Coupon Code" style={{ flex: 1, padding: 8 }} />
          <button onClick={handleApplyCoupon} className="btn btn-primary">APPLY COUPON</button>
        </div>
        {couponFeedback && (
          <div style={{ marginTop: 8, color: couponFeedback.type === 'success' ? 'green' : 'crimson' }}>
            {couponFeedback.message}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
          <div style={{ width: 320 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span>Sub Total</span>
              <strong>INR {subtotal.toFixed(2)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span>Discount</span>
              <strong>- INR {discount.toFixed(2)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee', paddingTop: 8 }}>
              <span>Total</span>
              <strong>INR {total.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
          <button className="btn btn-primary" onClick={handleProceed} disabled={cart.items.length === 0}>
            PROCEED TO CHECKOUT
          </button>
        </div>
      </div>
    </div>
  );
}


