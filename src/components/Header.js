import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { SearchIcon, HeartIcon, CartIcon, UserIcon } from '../icons';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';
import './Header.css';

const Header = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const { getCartCount } = useCart();

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoginModalOpen(false);
    setIsSignupModalOpen(false);
  };

  const handleSignup = (userData) => {
    setUser(userData);
    setIsSignupModalOpen(false);
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('session_token');
  };

  const switchToSignup = () => {
    setIsLoginModalOpen(false);
    setIsSignupModalOpen(true);
  };

  const switchToLogin = () => {
    setIsSignupModalOpen(false);
    setIsLoginModalOpen(true);
  };

  return (
    <>
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <img src="/images/logo.png" alt="Papercart.in" className="logo-img" />
              <span className="logo-text">Papercart.in</span>
            </div>
            
            <div className="search-bar">
              <input 
                type="text" 
                placeholder="Search for products..." 
                className="search-input"
              />
              <button className="search-btn">
                <SearchIcon size={24} />
              </button>
            </div>
            
            <div className="header-actions">
              {user ? (
                <div className="user-menu">
                  <div className="user-profile">
                    <UserIcon size={24} />
                    <span className="user-phone">{user.phone}</span>
                  </div>
                  <button className="btn btn-secondary" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              ) : (
                <button 
                  className="btn btn-primary"
                  onClick={() => setIsLoginModalOpen(true)}
                >
                  <UserIcon size={18} />
                  <span>Login</span>
                </button>
              )}
              <button className="wishlist-btn">
                <HeartIcon size={24} />
              </button>
              <button className="cart-btn">
                <CartIcon size={24} />
                {getCartCount() > 0 && (
                  <span className="cart-count">{getCartCount()}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {isLoginModalOpen && (
        <LoginModal 
          onClose={() => setIsLoginModalOpen(false)}
          onLogin={handleLogin}
          onSwitchToSignup={switchToSignup}
        />
      )}
      
      {isSignupModalOpen && (
        <SignupModal 
          onClose={() => setIsSignupModalOpen(false)}
          onSignup={handleSignup}
          onSwitchToLogin={switchToLogin}
        />
      )}
    </>
  );
};

export default Header;
