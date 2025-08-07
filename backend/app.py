from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import random
import redis
import time
import psycopg2
from psycopg2.extras import RealDictCursor
import hashlib
import uuid
from datetime import datetime, timedelta
from config import Config

app = Flask(__name__)
CORS(app)

# Redis connection for storing OTPs and session data
try:
    redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
    # Test the connection
    redis_client.ping()
except:
    # Fallback to in-memory storage if Redis is not available
    redis_client = None
    otp_storage = {}
    session_storage = {}

# Database setup
def get_db_connection():
    """Get PostgreSQL database connection"""
    try:
        conn = psycopg2.connect(
            host=Config.DB_HOST,
            port=Config.DB_PORT,
            database=Config.DB_NAME,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            cursor_factory=RealDictCursor
        )
        return conn
    except psycopg2.Error as e:
        print(f"Database connection error: {e}")
        print(f"Please check your PostgreSQL password in config.py")
        print(f"Current password attempt: '{Config.DB_PASSWORD}'")
        return None

def init_database():
    """Initialize PostgreSQL database with user table"""
    conn = get_db_connection()
    if not conn:
        print("Failed to connect to database")
        return
    
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                full_name VARCHAR(255) NOT NULL,
                phone_number VARCHAR(15) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_verified BOOLEAN DEFAULT FALSE
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sessions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                session_token VARCHAR(255) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        ''')
        
        # Create indexes for better performance
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_users_phone ON users (phone_number)
        ''')
        
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_users_email ON users (email)
        ''')
        
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions (session_token)
        ''')
        
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions (expires_at)
        ''')
        
        conn.commit()
        print("Database initialized successfully")
    except psycopg2.Error as e:
        print(f"Database initialization error: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

def hash_password(password):
    """Hash password with salt"""
    salt = uuid.uuid4().hex
    password_hash = hashlib.sha256((password + salt).encode()).hexdigest()
    return f"{salt}:{password_hash}"

def verify_password(password, hashed):
    """Verify password against hash"""
    try:
        salt, password_hash = hashed.split(':')
        return hashlib.sha256((password + salt).encode()).hexdigest() == password_hash
    except:
        return False

def get_user_by_identifier(identifier):
    """Get user by email or phone number"""
    conn = get_db_connection()
    if not conn:
        return None
    
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            SELECT id, full_name, phone_number, email, password_hash, is_verified 
            FROM users 
            WHERE phone_number = %s OR email = %s
        ''', (identifier, identifier))
        
        user = cursor.fetchone()
        
        if user:
            return {
                'id': user['id'],
                'fullName': user['full_name'],
                'phoneNumber': user['phone_number'],
                'email': user['email'],
                'passwordHash': user['password_hash'],
                'isVerified': user['is_verified']
            }
        return None
    except psycopg2.Error as e:
        print(f"Error fetching user: {e}")
        return None
    finally:
        cursor.close()
        conn.close()

def create_user(full_name, phone_number, email, password):
    """Create new user"""
    conn = get_db_connection()
    if not conn:
        return None
    
    cursor = conn.cursor()
    password_hash = hash_password(password)
    
    try:
        cursor.execute('''
            INSERT INTO users (full_name, phone_number, email, password_hash)
            VALUES (%s, %s, %s, %s) RETURNING id
        ''', (full_name, phone_number, email, password_hash))
        
        user_id = cursor.fetchone()['id']
        conn.commit()
        return user_id
    except psycopg2.IntegrityError as e:
        print(f"User creation error: {e}")
        conn.rollback()
        return None
    except psycopg2.Error as e:
        print(f"Database error: {e}")
        conn.rollback()
        return None
    finally:
        cursor.close()
        conn.close()

def create_session(user_id):
    """Create session for user"""
    conn = get_db_connection()
    if not conn:
        return None
    
    cursor = conn.cursor()
    session_token = str(uuid.uuid4())
    expires_at = datetime.now() + timedelta(days=30)
    
    try:
        cursor.execute('''
            INSERT INTO sessions (user_id, session_token, expires_at)
            VALUES (%s, %s, %s)
        ''', (user_id, session_token, expires_at))
        
        conn.commit()
        return session_token
    except psycopg2.Error as e:
        print(f"Session creation error: {e}")
        conn.rollback()
        return None
    finally:
        cursor.close()
        conn.close()

def verify_session(session_token):
    """Verify session token"""
    conn = get_db_connection()
    if not conn:
        return None
    
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            SELECT u.id, u.full_name, u.phone_number, u.email 
            FROM users u 
            JOIN sessions s ON u.id = s.user_id 
            WHERE s.session_token = %s AND s.expires_at > NOW()
        ''', (session_token,))
        
        user = cursor.fetchone()
        
        if user:
            return {
                'id': user['id'],
                'fullName': user['full_name'],
                'phoneNumber': user['phone_number'],
                'email': user['email']
            }
        return None
    except psycopg2.Error as e:
        print(f"Session verification error: {e}")
        return None
    finally:
        cursor.close()
        conn.close()

# Initialize database
init_database()

# Coupon codes as per requirements
COUPON_CODES = {
    'FIRST100': {'discount': 100, 'min_order': 500, 'type': 'fixed'},
    'NEWUSER20': {'discount': 20, 'min_order': 0, 'type': 'percentage', 'max_discount': 200},
    'BULK300': {'discount': 300, 'min_order': 3000, 'type': 'fixed'},
    'FREESHIP': {'discount': 0, 'min_order': 10000, 'type': 'freeship'},
    'DIWALI200': {'discount': 200, 'min_order': 1000, 'type': 'fixed'},
    'OFFICE50': {'discount': 50, 'min_order': 0, 'type': 'fixed'}
}

def generate_otp():
    """Generate a 6-digit OTP"""
    return str(random.randint(100000, 999999))

def store_otp(phone, otp):
    """Store OTP with 5-minute expiration"""
    if redis_client:
        redis_client.setex(f"otp:{phone}", 300, otp)  # 5 minutes
    else:
        otp_storage[phone] = {'otp': otp, 'timestamp': time.time()}

def verify_otp(phone, otp):
    """Verify OTP"""
    if redis_client:
        stored_otp = redis_client.get(f"otp:{phone}")
        if stored_otp and stored_otp == otp:
            redis_client.delete(f"otp:{phone}")
            return True
    else:
        if phone in otp_storage:
            stored_data = otp_storage[phone]
            if stored_data['otp'] == otp and (time.time() - stored_data['timestamp']) < 300:
                del otp_storage[phone]
                return True
    return False

@app.route('/api/send-otp', methods=['POST'])
def send_otp():
    """Send OTP to phone number"""
    data = request.get_json()
    phone = data.get('phone')
    
    if not phone:
        return jsonify({'error': 'Phone number is required'}), 400
    
    # Generate and store OTP
    otp = generate_otp()
    store_otp(phone, otp)
    
    # In a real implementation, you would send SMS here
    # For development, we'll just return the OTP
    print(f"OTP for {phone}: {otp}")  # For development only
    
    return jsonify({
        'message': 'OTP sent successfully',
        'otp': otp  # Remove this in production
    })

@app.route('/api/verify-otp', methods=['POST'])
def verify_otp_endpoint():
    """Verify OTP and create session (legacy endpoint)"""
    data = request.get_json()
    phone = data.get('phone')
    otp = data.get('otp')
    
    if not phone or not otp:
        return jsonify({'error': 'Phone and OTP are required'}), 400
    
    if verify_otp(phone, otp):
        # Create session token (simplified)
        session_token = str(random.randint(100000000, 999999999))
        
        if redis_client:
            redis_client.setex(f"session:{session_token}", 86400, phone)  # 24 hours
        else:
            session_storage[session_token] = {'phone': phone, 'timestamp': time.time()}
        
        return jsonify({
            'message': 'OTP verified successfully',
            'session_token': session_token,
            'phone': phone
        })
    else:
        return jsonify({'error': 'Invalid or expired OTP'}), 400

@app.route('/api/signup', methods=['POST'])
def signup():
    """User signup with OTP verification"""
    data = request.get_json()
    full_name = data.get('fullName')
    phone_number = data.get('phoneNumber')
    email = data.get('email')
    password = data.get('password')
    
    if not all([full_name, phone_number, password]):
        return jsonify({'error': 'Full name, phone number, and password are required'}), 400
    
    # Check if user already exists
    existing_user = get_user_by_identifier(phone_number)
    if existing_user:
        return jsonify({'error': 'User with this phone number already exists'}), 400
    
    if email:
        existing_user = get_user_by_identifier(email)
        if existing_user:
            return jsonify({'error': 'User with this email already exists'}), 400
    
    # Generate and store OTP for signup verification
    otp = generate_otp()
    store_otp(f"signup:{phone_number}", otp)
    
    # Store signup data temporarily
    signup_data = {
        'fullName': full_name,
        'phoneNumber': phone_number,
        'email': email,
        'password': password
    }
    
    if redis_client:
        redis_client.setex(f"signup_data:{phone_number}", 600, str(signup_data))  # 10 minutes
    else:
        otp_storage[f"signup_data:{phone_number}"] = {'data': signup_data, 'timestamp': time.time()}
    
    # TODO: Send OTP via Fast2SMS (bypassed for now)
    print(f"Signup OTP for {phone_number}: {otp}")  # For development only
    
    return jsonify({
        'message': 'OTP sent for signup verification',
        'otp': otp  # Remove this in production
    })

@app.route('/api/verify-signup-otp', methods=['POST'])
def verify_signup_otp():
    """Verify signup OTP and create user"""
    data = request.get_json()
    phone_number = data.get('phoneNumber')
    otp = data.get('otp')
    
    if not phone_number or not otp:
        return jsonify({'error': 'Phone number and OTP are required'}), 400
    
    # Verify OTP
    if redis_client:
        stored_otp = redis_client.get(f"otp:signup:{phone_number}")
        signup_data_str = redis_client.get(f"signup_data:{phone_number}")
    else:
        otp_key = f"signup:{phone_number}"
        data_key = f"signup_data:{phone_number}"
        stored_otp = otp_storage.get(otp_key, {}).get('otp')
        signup_data_str = otp_storage.get(data_key, {}).get('data')
    
    if not stored_otp or stored_otp != otp:
        return jsonify({'error': 'Invalid or expired OTP'}), 400
    
    if not signup_data_str:
        return jsonify({'error': 'Signup session expired'}), 400
    
    # Parse signup data
    if isinstance(signup_data_str, str):
        import ast
        signup_data = ast.literal_eval(signup_data_str)
    else:
        signup_data = signup_data_str
    
    # Create user
    user_id = create_user(
        signup_data['fullName'],
        signup_data['phoneNumber'],
        signup_data['email'],
        signup_data['password']
    )
    
    if not user_id:
        return jsonify({'error': 'Failed to create user'}), 500
    
    # Create session
    session_token = create_session(user_id)
    
    # Clean up temporary data
    if redis_client:
        redis_client.delete(f"otp:signup:{phone_number}")
        redis_client.delete(f"signup_data:{phone_number}")
    else:
        otp_storage.pop(f"signup:{phone_number}", None)
        otp_storage.pop(f"signup_data:{phone_number}", None)
    
    return jsonify({
        'message': 'User created successfully',
        'session_token': session_token,
        'user': {
            'fullName': signup_data['fullName'],
            'phoneNumber': signup_data['phoneNumber'],
            'email': signup_data['email']
        }
    })

@app.route('/api/login', methods=['POST'])
def login():
    """User login with email/phone and password"""
    data = request.get_json()
    identifier = data.get('identifier')
    password = data.get('password')
    
    if not identifier or not password:
        return jsonify({'error': 'Email/phone and password are required'}), 400
    
    # Get user
    user = get_user_by_identifier(identifier)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Verify password
    if not verify_password(password, user['passwordHash']):
        return jsonify({'error': 'Invalid password'}), 401
    
    # Create session
    session_token = create_session(user['id'])
    
    return jsonify({
        'message': 'Login successful',
        'session_token': session_token,
        'user': {
            'fullName': user['fullName'],
            'phoneNumber': user['phoneNumber'],
            'email': user['email']
        }
    })

@app.route('/api/send-login-otp', methods=['POST'])
def send_login_otp():
    """Send OTP for login"""
    data = request.get_json()
    identifier = data.get('identifier')
    
    if not identifier:
        return jsonify({'error': 'Email or phone number is required'}), 400
    
    # Check if user exists
    user = get_user_by_identifier(identifier)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Generate and store OTP
    otp = generate_otp()
    store_otp(f"login:{identifier}", otp)
    
    # TODO: Send OTP via Fast2SMS (bypassed for now)
    print(f"Login OTP for {identifier}: {otp}")  # For development only
    
    return jsonify({
        'message': 'OTP sent for login',
        'otp': otp  # Remove this in production
    })

@app.route('/api/verify-login-otp', methods=['POST'])
def verify_login_otp():
    """Verify login OTP"""
    data = request.get_json()
    identifier = data.get('identifier')
    otp = data.get('otp')
    
    if not identifier or not otp:
        return jsonify({'error': 'Email/phone and OTP are required'}), 400
    
    # Verify OTP
    if redis_client:
        stored_otp = redis_client.get(f"otp:login:{identifier}")
    else:
        otp_key = f"login:{identifier}"
        stored_otp = otp_storage.get(otp_key, {}).get('otp')
    
    if not stored_otp or stored_otp != otp:
        return jsonify({'error': 'Invalid or expired OTP'}), 400
    
    # Get user
    user = get_user_by_identifier(identifier)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Create session
    session_token = create_session(user['id'])
    
    # Clean up OTP
    if redis_client:
        redis_client.delete(f"otp:login:{identifier}")
    else:
        otp_storage.pop(f"login:{identifier}", None)
    
    return jsonify({
        'message': 'Login successful',
        'session_token': session_token,
        'user': {
            'fullName': user['fullName'],
            'phoneNumber': user['phoneNumber'],
            'email': user['email']
        }
    })

@app.route('/api/forgot-password', methods=['POST'])
def forgot_password():
    """Send password reset OTP"""
    data = request.get_json()
    identifier = data.get('identifier')
    
    if not identifier:
        return jsonify({'error': 'Email or phone number is required'}), 400
    
    # Check if user exists
    user = get_user_by_identifier(identifier)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Generate and store OTP
    otp = generate_otp()
    store_otp(f"reset:{identifier}", otp)
    
    # TODO: Send OTP via Fast2SMS (bypassed for now)
    print(f"Password reset OTP for {identifier}: {otp}")  # For development only
    
    return jsonify({
        'message': 'Password reset OTP sent',
        'otp': otp  # Remove this in production
    })

@app.route('/api/reset-password', methods=['POST'])
def reset_password():
    """Reset password with OTP"""
    data = request.get_json()
    identifier = data.get('identifier')
    otp = data.get('otp')
    new_password = data.get('newPassword')
    
    if not all([identifier, otp, new_password]):
        return jsonify({'error': 'All fields are required'}), 400
    
    # Verify OTP
    if redis_client:
        stored_otp = redis_client.get(f"otp:reset:{identifier}")
    else:
        otp_key = f"reset:{identifier}"
        stored_otp = otp_storage.get(otp_key, {}).get('otp')
    
    if not stored_otp or stored_otp != otp:
        return jsonify({'error': 'Invalid or expired OTP'}), 400
    
    # Get user
    user = get_user_by_identifier(identifier)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Update password
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = conn.cursor()
    
    try:
        new_password_hash = hash_password(new_password)
        cursor.execute('''
            UPDATE users SET password_hash = %s WHERE id = %s
        ''', (new_password_hash, user['id']))
        
        conn.commit()
    except psycopg2.Error as e:
        print(f"Password update error: {e}")
        conn.rollback()
        return jsonify({'error': 'Failed to update password'}), 500
    finally:
        cursor.close()
        conn.close()
    
    # Clean up OTP
    if redis_client:
        redis_client.delete(f"otp:reset:{identifier}")
    else:
        otp_storage.pop(f"reset:{identifier}", None)
    
    return jsonify({
        'message': 'Password reset successfully'
    })

@app.route('/api/validate-coupon', methods=['POST'])
def validate_coupon():
    """Validate coupon code"""
    data = request.get_json()
    coupon_code = data.get('coupon_code', '').upper()
    cart_value = data.get('cart_value', 0)
    
    if not coupon_code:
        return jsonify({'error': 'Coupon code is required'}), 400
    
    if coupon_code not in COUPON_CODES:
        return jsonify({'error': 'Invalid coupon code'}), 400
    
    coupon = COUPON_CODES[coupon_code]
    
    # Check minimum order value
    if cart_value < coupon['min_order']:
        return jsonify({
            'error': f'Minimum order value of ₹{coupon["min_order"]} required for this coupon'
        }), 400
    
    # Calculate discount
    discount_amount = 0
    discount_type = coupon['type']
    
    if discount_type == 'fixed':
        discount_amount = coupon['discount']
    elif discount_type == 'percentage':
        discount_amount = (cart_value * coupon['discount']) / 100
        if 'max_discount' in coupon:
            discount_amount = min(discount_amount, coupon['max_discount'])
    elif discount_type == 'freeship':
        discount_amount = 0  # Free shipping would be handled separately
    
    return jsonify({
        'valid': True,
        'discount_amount': discount_amount,
        'discount_type': discount_type,
        'coupon_code': coupon_code,
        'message': f'Coupon applied successfully! You saved ₹{discount_amount}'
    })

@app.route('/api/products', methods=['GET'])
def get_products():
    """Get sample products for homepage"""
    products = [
        {
            'id': 1,
            'name': 'A1 Bundle Sheet',
            'price': 400.00,
            'original_price': 450.00,
            'image': '/images/a4-bundle.jpg',
            'description': 'A delightful mix of premium carbons, perfect for tracking or culinary uses. High quality and efficient.',
            'variants': [
                {'weight': '250 g', 'price': 400.00},
                {'weight': '500 g', 'price': 750.00},
                {'weight': '1 kg', 'price': 1400.00}
            ],
            'category': 'Bundle Sheets'
        },
        {
            'id': 2,
            'name': 'A4 Bundle Sheet',
            'price': 220.00,
            'original_price': 300.00,
            'image': '/images/a4-bundle.jpg',
            'description': 'Hand picked exotic spices to elevate your dishes. Authentic flavors from around the world.',
            'variants': [
                {'weight': '250 g', 'price': 220.00},
                {'weight': '500 g', 'price': 420.00},
                {'weight': '1 kg', 'price': 800.00}
            ],
            'category': 'Bundle Sheets'
        },
        {
            'id': 3,
            'name': 'A5 Bundle Sheet',
            'price': 400.00,
            'original_price': 450.00,
            'image': '/images/a3-bundle.jpg',
            'description': 'Premium quality A5 papers for professional documentation and printing.',
            'variants': [
                {'weight': '250 g', 'price': 400.00},
                {'weight': '500 g', 'price': 750.00},
                {'weight': '1 kg', 'price': 1400.00}
            ],
            'category': 'Bundle Sheets'
        },
        {
            'id': 4,
            'name': 'A0 Bundle Sheet',
            'price': 220.00,
            'original_price': 260.00,
            'image': '/images/a2-bundle.jpg',
            'description': 'Large format A0 papers ideal for architectural drawings and large prints.',
            'variants': [
                {'weight': '100 g', 'price': 220.00},
                {'weight': '200 g', 'price': 400.00},
                {'weight': '500 g', 'price': 900.00}
            ],
            'category': 'Bundle Sheets'
        },
        {
            'id': 5,
            'name': 'Passport Photo Sheet',
            'price': 380.00,
            'original_price': 400.00,
            'image': '/images/passport-photo.jpg',
            'description': 'A healthy blend of almonds, walnuts, and pistachios, ideal for energy and well-being.',
            'variants': [
                {'weight': '250 g', 'price': 380.00},
                {'weight': '500 g', 'price': 720.00},
                {'weight': '1 kg', 'price': 1300.00}
            ],
            'category': 'Photo Papers'
        },
        {
            'id': 6,
            'name': 'A2 Bundle Sheet',
            'price': 340.00,
            'original_price': 380.00,
            'image': '/images/a2-bundle.jpg',
            'description': 'Premium A2 size papers for medium format printing and design work.',
            'variants': [
                {'weight': '250 g', 'price': 340.00},
                {'weight': '500 g', 'price': 650.00},
                {'weight': '1 kg', 'price': 1200.00}
            ],
            'category': 'Bundle Sheets'
        },
        {
            'id': 7,
            'name': 'A1 Bundle Sheet',
            'price': 280.00,
            'original_price': 320.00,
            'image': '/images/a4-bundle.jpg',
            'description': 'High-quality A1 papers perfect for technical drawings and presentations.',
            'variants': [
                {'weight': '200 g', 'price': 280.00},
                {'weight': '400 g', 'price': 520.00},
                {'weight': '800 g', 'price': 950.00}
            ],
            'category': 'Bundle Sheets'
        },
        {
            'id': 8,
            'name': 'Organic Almonds Whole',
            'price': 550.00,
            'original_price': 600.00,
            'image': '/images/a3-bundle.jpg',
            'description': 'Premium organic whole almonds, perfect for healthy snacking and cooking.',
            'variants': [
                {'weight': '500 g', 'price': 550.00},
                {'weight': '1 kg', 'price': 1000.00},
                {'weight': '2 kg', 'price': 1800.00}
            ],
            'category': 'Specialty'
        }
    ]
    
    return jsonify(products)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
