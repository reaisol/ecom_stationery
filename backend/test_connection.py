import psycopg2
from config import Config

def test_connection():
    """Test PostgreSQL connection with different passwords"""
    
    passwords_to_try = [
        'admin1234',      # Current config
        'password',       # Default
        'postgres',       # Common default
        '',               # No password
        'admin',          # Common
    ]
    
    print("Testing PostgreSQL connection...")
    print(f"Host: {Config.DB_HOST}")
    print(f"Port: {Config.DB_PORT}")
    print(f"Database: {Config.DB_NAME}")
    print(f"User: {Config.DB_USER}")
    print("-" * 50)
    
    for password in passwords_to_try:
        try:
            print(f"Trying password: '{password}'")
            conn = psycopg2.connect(
                host=Config.DB_HOST,
                port=Config.DB_PORT,
                database='postgres',  # Try with default postgres database first
                user=Config.DB_USER,
                password=password
            )
            
            cursor = conn.cursor()
            cursor.execute("SELECT version();")
            version = cursor.fetchone()
            
            print(f"✅ SUCCESS! Password '{password}' works!")
            print(f"PostgreSQL Version: {version[0]}")
            
            # Now test with our target database
            try:
                cursor.execute(f"SELECT 1 FROM pg_database WHERE datname = '{Config.DB_NAME}';")
                db_exists = cursor.fetchone()
                
                if db_exists:
                    print(f"✅ Database '{Config.DB_NAME}' exists!")
                else:
                    print(f"⚠️  Database '{Config.DB_NAME}' does not exist. Creating it...")
                    cursor.execute(f"CREATE DATABASE {Config.DB_NAME};")
                    print(f"✅ Database '{Config.DB_NAME}' created!")
                    
            except psycopg2.Error as e:
                print(f"Database check error: {e}")
            
            cursor.close()
            conn.close()
            
            print(f"\n🎉 Use this password in your config: '{password}'")
            return password
            
        except psycopg2.Error as e:
            print(f"❌ Failed with password '{password}': {e}")
            print()
    
    print("❌ All password attempts failed!")
    print("\n💡 Solutions:")
    print("1. Check your PostgreSQL GUI tool for the correct password")
    print("2. Reset PostgreSQL password using pgAdmin")
    print("3. Use Windows authentication (if available)")
    
    return None

if __name__ == "__main__":
    test_connection()

