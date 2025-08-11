import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ProductDetail.css';

export default function CheckoutPage() {
  const { cart, getCartSubtotal, clearCart } = useCart();
  const subtotal = useMemo(() => getCartSubtotal(), [cart, getCartSubtotal]);
  const [address, setAddress] = useState({
    fullName: '',
    house: '',
    landmark: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('session_token');
    if (!token) {
      // Redirect to login modal entry via homepage path as a simple fallback
      navigate('/', { replace: true });
      alert('Please login to proceed to checkout.');
    }
  }, [navigate]);

  const placeOrder = async () => {
    const token = localStorage.getItem('session_token');
    if (!token) {
      alert('Please login first.');
      navigate('/', { replace: true });
      return;
    }
    setPlacing(true);
    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': token
        },
        body: JSON.stringify({
          items: cart.items.map(i => ({
            productId: i.productId,
            name: i.name,
            image: i.image,
            variant: i.variant,
            unitPrice: i.price,
            quantity: i.quantity
          })),
          address,
          paymentMethod
        })
      });
      const data = await res.json();
      if (res.ok) {
        clearCart();
        alert('Order placed successfully. Order ID: ' + data.orderId);
        navigate('/');
      } else {
        alert(data.error || 'Failed to place order');
      }
    } catch (e) {
      alert('Network error');
    }
    setPlacing(false);
  };

  return (
    <div className="container" style={{ padding: '24px 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
        <div className="card" style={{ padding: 16 }}>
          <h2>Delivery Address</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <input placeholder="Full Name" value={address.fullName} onChange={(e)=> setAddress({ ...address, fullName: e.target.value })} />
            <input placeholder="Phone Number" value={address.phone} onChange={(e)=> setAddress({ ...address, phone: e.target.value })} />
            <input placeholder="House Number / Building Name" value={address.house} onChange={(e)=> setAddress({ ...address, house: e.target.value })} />
            <input placeholder="Landmark (Optional)" value={address.landmark} onChange={(e)=> setAddress({ ...address, landmark: e.target.value })} />
            <input placeholder="Street Name / Area" value={address.street} onChange={(e)=> setAddress({ ...address, street: e.target.value })} />
            <input placeholder="City" value={address.city} onChange={(e)=> setAddress({ ...address, city: e.target.value })} />
            <input placeholder="State" value={address.state} onChange={(e)=> setAddress({ ...address, state: e.target.value })} />
            <input placeholder="Pincode" value={address.pincode} onChange={(e)=> setAddress({ ...address, pincode: e.target.value })} />
          </div>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <h3>Order Summary</h3>
          <div>
            {cart.items.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span>{item.name} {item.variant && <em>x{item.quantity}</em>}</span>
                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee', paddingTop: 8, marginTop: 8 }}>
            <strong>Total</strong>
            <strong>INR {subtotal.toFixed(2)}</strong>
          </div>
          <div style={{ marginTop: 16 }}>
            <div>
              <label>
                <input type="radio" name="pm" value="online" checked={paymentMethod==='online'} onChange={()=> setPaymentMethod('online')} />
                Online
              </label>
            </div>
            <div>
              <label>
                <input type="radio" name="pm" value="cod" checked={paymentMethod==='cod'} onChange={()=> setPaymentMethod('cod')} />
                Cash On Delivery
              </label>
            </div>
          </div>
          <button className="btn btn-primary" style={{ marginTop: 16, width: '100%' }} onClick={placeOrder} disabled={placing || cart.items.length === 0}>
            {placing ? 'PLACING...' : 'PLACE ORDER'}
          </button>
        </div>
      </div>
    </div>
  );
}


