import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

// Cart actions
const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART'
};

// Cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM: {
      const { product, variant, quantity = 1 } = action.payload;
      const itemId = `${product.id}-${variant.weight}`;
      
      const existingItem = state.items.find(item => item.id === itemId);
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === itemId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        };
      } else {
        const newItem = {
          id: itemId,
          productId: product.id,
          name: product.name,
          price: variant.price,
          originalPrice: product.original_price,
          image: product.image,
          variant: variant.weight,
          quantity,
          category: product.category
        };
        
        return {
          ...state,
          items: [...state.items, newItem]
        };
      }
    }
    
    case CART_ACTIONS.REMOVE_ITEM:
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.itemId)
      };
    
    case CART_ACTIONS.UPDATE_QUANTITY: {
      const { itemId, quantity } = action.payload;
      
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.id !== itemId)
        };
      }
      
      return {
        ...state,
        items: state.items.map(item =>
          item.id === itemId
            ? { ...item, quantity }
            : item
        )
      };
    }
    
    case CART_ACTIONS.CLEAR_CART:
      return {
        ...state,
        items: []
      };
    
    case CART_ACTIONS.LOAD_CART:
      return {
        ...state,
        items: action.payload.items || []
      };
    
    default:
      return state;
  }
};

// Initial cart state
const initialState = {
  items: []
};

export const CartProvider = ({ children }) => {
  const [cartState, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('papercart_cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        dispatch({
          type: CART_ACTIONS.LOAD_CART,
          payload: { items: parsedCart.items }
        });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('papercart_cart', JSON.stringify(cartState));
  }, [cartState]);

  // Cart utility functions
  const addToCart = (product, variant, quantity = 1) => {
    dispatch({
      type: CART_ACTIONS.ADD_ITEM,
      payload: { product, variant, quantity }
    });
  };

  const removeFromCart = (itemId) => {
    dispatch({
      type: CART_ACTIONS.REMOVE_ITEM,
      payload: { itemId }
    });
  };

  const updateQuantity = (itemId, quantity) => {
    dispatch({
      type: CART_ACTIONS.UPDATE_QUANTITY,
      payload: { itemId, quantity }
    });
  };

  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  };

  // Cart calculations
  const getCartCount = () => {
    return cartState.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = () => {
    return cartState.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartSubtotal = () => {
    return getCartTotal();
  };

  const value = {
    cart: cartState,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartCount,
    getCartTotal,
    getCartSubtotal
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
