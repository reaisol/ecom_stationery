import psycopg2
from psycopg2.extras import RealDictCursor

def test_specific_connection():
    """Test connection with admin1234 password to different databases"""
    
    password = "admin1234"
    user = "postgres"
    host = "localhost"
    port = "5432"
    
    databases_to_try = [
        "postgres",        # Default PostgreSQL database
        "papercart_db",    # Our target database
        "template1",       # Another default database
    ]
    
    print(f"Testing connection with password: {password}")
    print(f"User: {user}, Host: {host}, Port: {port}")
    print("-" * 60)
    
    for db_name in databases_to_try:
        try:
            print(f"Trying database: '{db_name}'")
            
            conn = psycopg2.connect(
                host=host,
                port=port,
                database=db_name,
                user=user,
                password=password,
                cursor_factory=RealDictCursor
            )
            
            cursor = conn.cursor()
            cursor.execute("SELECT current_database(), current_user, version();")
            result = cursor.fetchone()
            
            print(f"✅ SUCCESS!")
            print(f"  Connected to database: {result['current_database']}")
            print(f"  Connected as user: {result['current_user']}")
            print(f"  PostgreSQL version: {result['version'][:50]}...")
            
            # Check if our target database exists
            if db_name == "postgres":
                cursor.execute("SELECT 1 FROM pg_database WHERE datname = 'papercart_db';")
                db_exists = cursor.fetchone()
                
                if db_exists:
                    print(f"  ✅ Target database 'papercart_db' exists!")
                else:
                    print(f"  ⚠️  Target database 'papercart_db' does NOT exist.")
                    print(f"  Creating database 'papercart_db'...")
                    
                    # Create the database
                    conn.autocommit = True
                    cursor.execute("CREATE DATABASE papercart_db;")
                    print(f"  ✅ Database 'papercart_db' created successfully!")
            
            cursor.close()
            conn.close()
            print()
            
            return True
            
        except psycopg2.Error as e:
            print(f"  ❌ Failed: {e}")
            print()
    
    return False

if __name__ == "__main__":
    success = test_specific_connection()
    
    if success:
        print("🎉 Connection successful! The issue might be with the database name.")
        print("💡 Try updating your config.py if needed.")
    else:
        print("❌ All connections failed. Let's check authentication method.")

