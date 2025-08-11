import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ProductDetail.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

function prettifySlug(slug) {
  return slug ? slug.split('-').map(s => s[0].toUpperCase() + s.slice(1)).join(' ') : '';
}

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);
  const [selectedGsm, setSelectedGsm] = useState('');
  const [activeImage, setActiveImage] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    let isCancelled = false;
    async function fetchDetail() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE}/api/products/${id}`);
        if (!res.ok) throw new Error(`${res.status}`);
        const data = await res.json();
        if (!isCancelled) {
          setProduct(data);
          setActiveImage(data.imageUrl);
          setSelectedGsm('');
          // fetch related
          const r = await fetch(`${API_BASE}/api/categories/${data.categorySlug}/products?pageSize=4`);
          const rj = await r.json();
          setRelated((rj.items || []).filter(p => p.id !== data.id).slice(0, 4));
        }
      } catch (e) {
        if (!isCancelled) setError('Product not found.');
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }
    fetchDetail();
    return () => { isCancelled = true; };
  }, [id]);

  const categoryName = useMemo(() => (product ? prettifySlug(product.categorySlug) : ''), [product]);

  function changeQty(delta) {
    setQty(prev => Math.max(1, prev + delta));
  }

  function handleAddToCart() {
    if (!product) return;
    if (product.gsmOptions && product.gsmOptions.length && !selectedGsm) {
      setToast('Please select a GSM');
      setTimeout(() => setToast(''), 1500);
      return;
    }
    const cartProduct = {
      id: product.id,
      name: product.name,
      image: product.imageUrl,
      original_price: product.pricePerUnit,
      category: categoryName
    };
    const variant = { weight: selectedGsm || 'default', price: product.pricePerUnit };
    addToCart(cartProduct, variant, qty);
    setToast(`Added ${product.name}${selectedGsm ? ` (${selectedGsm} GSM)` : ''} × ${qty}`);
    setTimeout(() => setToast(''), 1500);
  }

  if (loading) return <div className="container"><div className="state">Loading…</div></div>;
  if (error) return <div className="container"><div className="state error">{error} <Link to="/">Go Home</Link></div></div>;
  if (!product) return null;

  return (
    <div className="product-detail">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/" className="crumb">Home</Link>
          <span className="sep">/</span>
          <Link to={`/category/${product.categorySlug}`} className="crumb">{categoryName}</Link>
          <span className="sep">/</span>
          <span className="crumb current">{product.name}</span>
        </div>

        <div className="detail-grid">
          <div className="gallery">
            <div className="hero">
              <img src={activeImage} alt={product.name} />
            </div>
            <div className="thumbs">
              {[product.imageUrl, ...(product.gallery || [])].slice(0,4).map((src, i) => (
                <button key={i} className={`thumb ${src===activeImage ? 'active':''}`} onClick={() => setActiveImage(src)}>
                  <img src={src} alt={`${product.name} ${i+1}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="summary">
            <h1 className="title">{product.name}</h1>
            <div className="price">₹{product.pricePerUnit.toFixed(2)}</div>

            <div className="description">
              <p>{product.longDescription || 'Premium papers with smooth finish and consistent print quality.'}</p>
              <ul>
                {(product.highlights || [
                  'Standard size compatible with office printers.',
                  'Smooth surface for crisp text and images.',
                  'Reliable performance for daily printing.'
                ]).map((h, idx) => <li key={idx}>{h}</li>)}
              </ul>
            </div>

            <div className="purchase">
              {product.gsmOptions && product.gsmOptions.length > 0 && (
                <label className="gsm">
                  <span>GSM</span>
                  <select value={selectedGsm} onChange={(e)=>setSelectedGsm(e.target.value)}>
                    <option value="" disabled>Select</option>
                    {product.gsmOptions.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </label>
              )}

              <div className="qty">
                <span>Quantity</span>
                <div className="stepper">
                  <button onClick={()=>changeQty(-1)}>-</button>
                  <input type="number" min={1} value={qty} onChange={(e)=>setQty(Math.max(1, Number(e.target.value)||1))} />
                  <button onClick={()=>changeQty(1)}>+</button>
                </div>
              </div>

              <div className="cta-row">
                <button className="btn btn-danger" onClick={handleAddToCart}>Add to Cart</button>
                <button className="btn btn-secondary">Add to Wishlist</button>
              </div>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="related">
            <h2>Related Products</h2>
            <div className="related-grid">
              {related.map(r => (
                <Link key={r.id} to={`/product/${r.id}`} className="card related-card">
                  <div className="img"><img src={r.imageUrl} alt={`${r.brand} ${r.name}`} /></div>
                  <div className="info">
                    <div className="name">Premium {prettifySlug(r.categorySlug).split(' ')[0]} Bundle</div>
                    <div className="price">₹{r.pricePerUnit.toFixed(2)}</div>
                    <div className="tags"><span>{r.gsmOptions?.[0]}g</span><span>1kg</span></div>
                    <span className="btn btn-secondary">View Details</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
