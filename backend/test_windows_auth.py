import psycopg2
import os

def test_windows_auth():
    """Test PostgreSQL connection with Windows authentication"""
    
    print("Testing Windows Authentication...")
    print("-" * 50)
    
    try:
        # Try with current Windows user
        current_user = os.getenv('USERNAME')
        print(f"Trying with Windows user: {current_user}")
        
        conn = psycopg2.connect(
            host="localhost",
            port="5432",
            database="postgres",
            user=current_user,
            # No password needed for Windows auth
        )
        
        cursor = conn.cursor()
        cursor.execute("SELECT current_user, version();")
        result = cursor.fetchone()
        
        print(f"✅ SUCCESS with Windows Authentication!")
        print(f"Connected as: {result[0]}")
        print(f"PostgreSQL Version: {result[1]}")
        
        cursor.close()
        conn.close()
        
        return current_user
        
    except psycopg2.Error as e:
        print(f"❌ Windows Authentication failed: {e}")
        return None

if __name__ == "__main__":
    test_windows_auth()

