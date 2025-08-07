import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import CouponModal from './CouponModal';
import './Homepage.css';

const Homepage = () => {
  const [products, setProducts] = useState([]);
  const [showCouponModal, setShowCouponModal] = useState(false);

  useEffect(() => {
    // Fetch products from backend
    fetch('http://localhost:5000/api/products')
      .then(response => response.json())
      .then(data => setProducts(data))
      .catch(error => console.error('Error fetching products:', error));
  }, []);

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Your Ideas<br />
                Deserve Perfect<br />
                Pages.
              </h1>
              <p className="hero-subtitle">
                "Your trusted source for premium, high-quality papers that<br />
                meet every expectation."
              </p>
              <button className="btn btn-primary hero-btn">
                Shop Now
              </button>
            </div>
            <div className="hero-image">
              <img src="./images/hero-paper.jpg" alt="Premium Paper Stack" />
            </div>
          </div>
        </div>
      </section>

      {/* Popular Products Section */}
      <section className="popular-products">
        <div className="container">
          <h2 className="section-title">Explore Our Popular Products</h2>
          
          <div className="products-grid">
            {products.slice(0, 4).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Full Product Catalog Section */}
      <section className="product-catalog">
        <div className="container">
          <div className="catalog-header">
            <h2 className="section-title">Papers</h2>
            <p className="catalog-subtitle">Complete range of premium paper products for all your needs</p>
          </div>
          
          <div className="catalog-grid">
            {products.map(product => (
              <ProductCard key={`catalog-${product.id}`} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Coupon Section */}
      <section className="coupon-section">
        <div className="container">
          <div className="coupon-banner">
            <div className="coupon-content">
              <h3>🎉 Special Offers Available!</h3>
              <p>Get exclusive discounts on your first order and bulk purchases</p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowCouponModal(true)}
              >
                View Coupons
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚚</div>
              <h4>Fast Delivery</h4>
              <p>Quick delivery within 2-5 business days</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✨</div>
              <h4>Premium Quality</h4>
              <p>High-quality papers for all your needs</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h4>Best Prices</h4>
              <p>Competitive pricing with bulk discounts</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📞</div>
              <h4>24/7 Support</h4>
              <p>Round-the-clock customer assistance</p>
            </div>
          </div>
        </div>
      </section>

      {showCouponModal && (
        <CouponModal onClose={() => setShowCouponModal(false)} />
      )}
    </div>
  );
};

export default Homepage;
