# Paper eCommerce Platform

A minimal paper products eCommerce platform built with React.js frontend and Python Flask backend, featuring OTP authentication and coupon code management.

## Features

### 🔐 Authentication
- Phone number-based OTP authentication
- Secure session management
- Guest browsing with login-required purchases

### 🎟️ Coupon System
- Real-time coupon code validation
- Multiple coupon types (fixed, percentage, free shipping)
- Bulk order discounts
- Interactive coupon testing interface

### 🏠 Homepage
- Hero section with call-to-action
- Popular products showcase
- Features section
- Responsive design with mobile optimization

### 🎨 Design
- Clean, modern UI with Arial typography
- 16px baseline font size for optimal readability
- Consistent color scheme with red (#e74c3c) accent
- Smooth animations and hover effects

## Tech Stack

### Frontend
- **React.js 18** - UI framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **CSS3** - Styling with flexbox/grid

### Backend
- **Python Flask** - Web framework
- **Redis** - Session and OTP storage (optional, falls back to in-memory)
- **CORS** - Cross-origin resource sharing

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+ and pip
- Redis (optional, for production)

### 1. Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm start
```
The React app will run on http://localhost:3000

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start Flask server
python app.py
```
The Flask API will run on http://localhost:5000

### 3. Add Images
Place your images in the `public/images/` directory:
- `logo.png` - Company logo
- `hero-paper.jpg` - Hero section image
- `a4-bundle.jpg`, `a3-bundle.jpg`, `a2-bundle.jpg`, `passport-photo.jpg` - Product images

## Available Coupon Codes

| Code | Description | Min Order | Type |
|------|------------|-----------|------|
| FIRST100 | ₹100 off for first-time customers | ₹500 | Fixed |
| NEWUSER20 | 20% off (up to ₹200) for new users | ₹0 | Percentage |
| BULK300 | ₹300 off on bulk orders | ₹3000 | Fixed |
| FREESHIP | Free shipping on large orders | ₹10000 | Free Shipping |
| DIWALI200 | ₹200 off during Diwali season | ₹1000 | Fixed |
| OFFICE50 | ₹50 off on office supplies | ₹0 | Fixed |

## API Endpoints

### Authentication
- `POST /api/send-otp` - Send OTP to phone number
- `POST /api/verify-otp` - Verify OTP and create session

### Coupons
- `POST /api/validate-coupon` - Validate coupon code

### Products
- `GET /api/products` - Get product list

### Health
- `GET /api/health` - Health check

## Development Notes

### OTP Testing
In development mode, the OTP is displayed in the console and browser alert for easy testing.

### Coupon Testing
Use the coupon modal to test different coupon codes with various cart values.

### Responsive Design
The application is fully responsive and optimized for:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## File Structure

```
├── public/
│   ├── images/           # Product and brand images
│   └── index.html
├── src/
│   ├── components/       # React components
│   │   ├── Header.js/css
│   │   ├── Homepage.js/css
│   │   ├── ProductCard.js/css
│   │   ├── LoginModal.js/css
│   │   └── CouponModal.js/css
│   ├── App.js/css
│   ├── index.js/css
├── backend/
│   ├── app.py           # Flask application
│   └── requirements.txt
└── package.json
```

## Customization

### Adding New Coupons
Edit the `COUPON_CODES` dictionary in `backend/app.py`:

```python
COUPON_CODES = {
    'NEWCODE': {
        'discount': 100,
        'min_order': 500,
        'type': 'fixed'  # or 'percentage', 'freeship'
    }
}
```

### Styling
- Main colors are defined in CSS custom properties
- Arial font family is used throughout
- 16px base font size with responsive scaling

## Production Deployment

### Frontend
```bash
npm run build
# Deploy the build/ directory to your hosting service
```

### Backend
```bash
# Use Gunicorn for production
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Environment Variables
Set these for production:
- `REDIS_URL` - Redis connection string
- `TWILIO_ACCOUNT_SID` - For SMS OTP (if using Twilio)
- `TWILIO_AUTH_TOKEN` - For SMS OTP (if using Twilio)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
