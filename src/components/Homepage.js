import React from 'react';
import { Link } from 'react-router-dom';
import './Homepage.css';

const categories = [
  {
    key: 'a1',
    title: 'A1 Paper Sheets',
    description: 'Premium quality, A1 Sheets.',
    image: 'https://raw.githubusercontent.com/reaisol/ecom_stationery/master/public/images/a3-bundle.jpg',
    cta: 'Select',
    slug: 'a1-paper-sheets'
  },
  {
    key: 'a2',
    title: 'A2 Paper Sheets',
    description: 'Premium quality, A2 Sheets.',
    image: 'https://raw.githubusercontent.com/reaisol/ecom_stationery/master/public/images/a2-bundle.jpg',
    cta: 'Select',
    slug: 'a2-paper-sheets'
  },
  {
    key: 'a3',
    title: 'A3 Paper Sheets',
    description: 'Premium quality, A3 Sheets.',
    image: 'https://raw.githubusercontent.com/reaisol/ecom_stationery/master/public/images/a3-bundle.jpg',
    cta: 'Select',
    slug: 'a3-paper-sheets'
  },
  {
    key: 'a4',
    title: 'A4 Paper Sheets',
    description: 'Premium quality, A4 Sheets.',
    image: 'https://raw.githubusercontent.com/reaisol/ecom_stationery/master/public/images/a4-bundle.jpg',
    cta: 'Select',
    slug: 'a4-paper-sheets'
  },
  {
    key: 'passport',
    title: 'Passport Size Photos',
    description: 'Premium photo sheets.',
    image: 'https://raw.githubusercontent.com/reaisol/ecom_stationery/master/public/images/passport-photo.jpg',
    cta: 'Select',
    slug: 'passport-size-photos'
  }
];

const Homepage = () => {
  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section minimal">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title large">Your Essential<br />Paper & Photo<br />Store</h1>
              <p className="hero-subtitle subtle">
                Discover high-quality paper sheets for all your needs and
                perfectly sized passport photos for official documents.
                Simplicity and quality at your fingertips.
              </p>
              <Link className="btn btn-primary hero-btn" to="#categories">Explore Products</Link>
            </div>
            <div className="hero-image">
              <img 
                src="https://raw.githubusercontent.com/reaisol/ecom_stationery/master/public/images/hero-paper.jpg" 
                alt="Paper sheets and passport photo" 
                loading="eager" 
                decoding="async" 
                fetchpriority="high"
                onError={(e) => {
                  e.target.src = 'https://raw.githubusercontent.com/reaisol/ecom_stationery/master/public/images/a4-bundle.jpg';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section" id="categories">
        <div className="container">
          <h2 className="section-title">Our Product Categories</h2>
          <div className="categories-grid">
            {categories.map(category => (
              <Link key={category.key} to={`/category/${category.slug}`} className="category-card card">
                <div className="category-image-wrap">
                  <img 
                    src={category.image} 
                    alt={category.title} 
                    className="category-image" 
                    loading="lazy" 
                    decoding="async"
                    onError={(e) => {
                      e.target.src = 'https://raw.githubusercontent.com/reaisol/ecom_stationery/master/public/images/a4-bundle.jpg';
                    }}
                  />
                </div>
                <h3 className="category-title">{category.title}</h3>
                <p className="category-desc">{category.description}</p>
                <span className="btn btn-danger category-cta">{category.cta}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;