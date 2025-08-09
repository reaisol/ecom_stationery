import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './CategoryPage.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

function prettifySlug(slug) {
  if (!slug) return '';
  return slug
    .split('-')
    .map(segment => segment.length > 1 ? segment[0].toUpperCase() + segment.slice(1) : segment.toUpperCase())
    .join(' ');
}

const emptyResponse = { items: [], total: 0, page: 1, pageSize: 12 };

export default function CategoryPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();

  const [response, setResponse] = useState(emptyResponse);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [gsmByProduct, setGsmByProduct] = useState({});
  const [qtyByProduct, setQtyByProduct] = useState({});
  const [toast, setToast] = useState('');

  const q = searchParams.get('q') || '';
  const [searchText, setSearchText] = useState(q);

  const categoryName = useMemo(() => prettifySlug(slug), [slug]);

  useEffect(() => { setSearchText(q); }, [q]);

  useEffect(() => {
    let isCancelled = false;
    async function fetchProducts() {
      setLoading(true);
      setError('');
      try {
        const query = new URLSearchParams();
        const res = await fetch(`${API_BASE}/api/categories/${slug}/products?${query.toString()}`);
        if (!res.ok) {
          if (res.status === 404) {
            setResponse(emptyResponse);
            setError('Category not found');
          } else {
            throw new Error(`Request failed: ${res.status}`);
          }
        } else {
          const data = await res.json();
          if (!isCancelled) {
            setResponse({
              items: Array.isArray(data.items) ? data.items : [],
              total: typeof data.total === 'number' ? data.total : (Array.isArray(data.items) ? data.items.length : 0),
              page: 1,
              pageSize: data.pageSize || 12
            });
          }
        }
      } catch (err) {
        if (!isCancelled) setError('Network error. Please try again.');
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }
    fetchProducts();
    return () => { isCancelled = true; };
  }, [slug]);

  useEffect(() => {
    const nextGsm = { ...gsmByProduct };
    const nextQty = { ...qtyByProduct };
    response.items.forEach(p => {
      if (!(p.id in nextQty)) nextQty[p.id] = p.minOrderQty || 1;
      if (!(p.id in nextGsm)) nextGsm[p.id] = '';
    });
    setGsmByProduct(nextGsm);
    setQtyByProduct(nextQty);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response.items]);

  const filteredItems = useMemo(() => {
    const needle = (searchText || '').trim().toLowerCase();
    if (!needle) return response.items;
    return response.items.filter(p => {
      const hay = `${p.brand || ''} ${p.name || ''}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [response.items, searchText]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchText) params.set('q', searchText); else params.delete('q');
    setSearchParams(params);
  }

  function handleAddToCart(p) {
    const selectedGsm = gsmByProduct[p.id];
    const qty = Number(qtyByProduct[p.id] || p.minOrderQty || 1);
    if (!selectedGsm) {
      setToast('Please select a GSM first');
      setTimeout(() => setToast(''), 1800);
      return;
    }
    const productShape = {
      id: p.id,
      name: p.name || categoryName,
      image: p.imageUrl,
      original_price: p.pricePerUnit,
      category: categoryName
    };
    const variantShape = { weight: selectedGsm, price: p.pricePerUnit };
    addToCart(productShape, variantShape, qty);
    setToast(`Added ${categoryName} (${p.brand}, ${selectedGsm} GSM) × ${qty}`);
    setTimeout(() => setToast(''), 1600);
  }

  function changeQty(id, delta, min) {
    const current = Number(qtyByProduct[id] || min || 1);
    const next = Math.max(min || 1, current + delta);
    setQtyByProduct(prev => ({ ...prev, [id]: next }));
  }

  return (
    <div className="category-page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/" className="crumb">Home</Link>
          <span className="sep">/</span>
          <span className="crumb current">{categoryName}</span>
        </div>

        <div className="page-header">
          <button className="back-link" onClick={() => navigate(-1)}>
            ← Back to Products
          </button>
          <h1>Companies Offering {categoryName}</h1>
          <form className="category-search" onSubmit={handleSearchSubmit} role="search">
            <input
              type="search"
              placeholder="Search brands…"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              aria-label="Search brands"
            />
            <button className="btn btn-primary" type="submit">Search</button>
          </form>
        </div>

        {loading && <div className="state">Loading…</div>}
        {!loading && error && (
          <div className="state error">{error} <Link to="/">Go Home</Link></div>
        )}

        {!loading && !error && filteredItems.length === 0 && (
          <div className="state empty">
            No results found for “{searchText}”. Try another search or <Link to="/">go back</Link>.
          </div>
        )}

        {!loading && !error && filteredItems.length > 0 && (
          <div className="products-grid">
            {filteredItems.map(p => (
              <div key={p.id} className="card product-card">
                <div className="product-image">
                  <img src={p.imageUrl || '/images/a4-bundle.jpg'} alt={`${p.brand} ${categoryName}`} loading="lazy" />
                </div>
                <div className="product-info">
                  <h3 className="brand-title">{p.brand}</h3>
                  <p className="subtitle">Leading supplier of premium office paper and specialized photo paper.</p>
                  <div className="controls-row">
                    <label className="gsm-select">
                      <span>GSM</span>
                      <select
                        value={gsmByProduct[p.id] || ''}
                        onChange={(e) => setGsmByProduct(prev => ({ ...prev, [p.id]: e.target.value }))}
                      >
                        <option value="" disabled>Select</option>
                        {(p.gsmOptions || []).map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </label>

                    <div className="qty-stepper" aria-label="Quantity selector">
                      <button className="step" onClick={() => changeQty(p.id, -1, p.minOrderQty)}>-</button>
                      <input
                        type="number"
                        min={p.minOrderQty || 1}
                        value={qtyByProduct[p.id] || p.minOrderQty || 1}
                        onChange={(e) => setQtyByProduct(prev => ({ ...prev, [p.id]: Math.max(p.minOrderQty || 1, Number(e.target.value) || (p.minOrderQty || 1)) }))}
                      />
                      <button className="step" onClick={() => changeQty(p.id, 1, p.minOrderQty)}>+</button>
                    </div>
                  </div>

                  <button
                    className="btn btn-danger add-to-cart"
                    onClick={() => handleAddToCart(p)}
                    disabled={!p.inStock}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {toast && (
        <div className="toast">{toast}</div>
      )}
    </div>
  );
}
