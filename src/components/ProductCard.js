import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { HeartIcon, CartIcon } from '../icons';
import './ProductCard.css';

const ProductCard = ({ product, compact = false }) => {
  const [selectedVariant, setSelectedVariant] = useState(product.variants ? product.variants[0] : null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    if (selectedVariant) {
      addToCart(product, selectedVariant, 1);
      
      // Show feedback animation or notification
      const button = document.querySelector(`[data-product="${product.id}"] .add-to-cart-btn`);
      if (button) {
        const span = button.querySelector('span');
        button.style.transform = 'scale(0.95)';
        if (span) span.textContent = '✓ Added!';
        setTimeout(() => {
          button.style.transform = 'scale(1)';
          if (span) span.textContent = 'Add to Cart';
        }, 1000);
      }
    }
  };

  const handleVariantChange = (e) => {
    const selectedWeight = e.target.value;
    const variant = product.variants.find(v => v.weight === selectedWeight);
    setSelectedVariant(variant);
  };

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
  };

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;

  return (
    <div className={`product-card ${compact ? 'compact' : ''}`} data-product={product.id}>
      <div className="product-image">
        <img src={product.image} alt={product.name} />
        {!compact && (
          <button
            className={`wishlist-heart ${isWishlisted ? 'wishlisted' : ''}`}
            onClick={handleWishlistToggle}
          >
            <HeartIcon size={20} filled={isWishlisted} />
          </button>
        )}
      </div>

      <div className="product-info">
        {compact ? (
          <p className="product-description">
            {product.description}
          </p>
        ) : (
          <>
            <h3 className="product-name">{product.name}</h3>
            <div className="product-pricing">
              <span className="current-price">₹{currentPrice.toFixed(2)}</span>
              {product.original_price && product.original_price > currentPrice && (
                <span className="original-price">₹{product.original_price.toFixed(2)}</span>
              )}
            </div>
            {product.variants && product.variants.length > 0 && (
              <div className="product-options">
                <select
                  className="weight-selector"
                  value={selectedVariant?.weight || ''}
                  onChange={handleVariantChange}
                >
                  {product.variants.map((variant, index) => (
                    <option key={index} value={variant.weight}>
                      {variant.weight}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button className="add-to-cart-btn" onClick={handleAddToCart}>
              <CartIcon size={18} />
              <span>Add to Cart</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
