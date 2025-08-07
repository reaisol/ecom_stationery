import psycopg2
from psycopg2.extras import RealDictCursor

def test_different_users():
    """Test connection with different usernames and admin1234 password"""
    
    password = "admin1234"
    host = "localhost"
    port = "5432"
    database = "postgres"
    
    users_to_try = [
        "postgres",
        "admin",
        "ADMIN",  # Your Windows username
        "postgresql",
        "pg",
        "root",
        "papercart_user"
    ]
    
    print(f"Testing connection with password: {password}")
    print(f"Host: {host}, Port: {port}, Database: {database}")
    print("-" * 60)
    
    for username in users_to_try:
        try:
            print(f"Trying username: '{username}'")
            
            conn = psycopg2.connect(
                host=host,
                port=port,
                database=database,
                user=username,
                password=password,
                cursor_factory=RealDictCursor
            )
            
            cursor = conn.cursor()
            cursor.execute("SELECT current_user, current_database();")
            result = cursor.fetchone()
            
            print(f"✅ SUCCESS!")
            print(f"  Connected as: {result['current_user']}")
            print(f"  Database: {result['current_database']}")
            
            # List all databases
            cursor.execute("SELECT datname FROM pg_database WHERE datistemplate = false;")
            databases = cursor.fetchall()
            print(f"  Available databases: {[db['datname'] for db in databases]}")
            
            cursor.close()
            conn.close()
            
            print(f"\n🎉 WORKING CREDENTIALS:")
            print(f"  Username: {username}")
            print(f"  Password: {password}")
            print(f"  Host: {host}")
            print(f"  Port: {port}")
            
            return username
            
        except psycopg2.Error as e:
            print(f"  ❌ Failed: {str(e)[:100]}...")
            print()
    
    print("❌ No username worked with password 'admin1234'")
    return None

if __name__ == "__main__":
    working_user = test_different_users()
    
    if working_user:
        print(f"\n🔧 UPDATE YOUR CONFIG:")
        print(f"In config.py, change:")
        print(f"  DB_USER = '{working_user}'")
        print(f"  DB_PASSWORD = 'admin1234'")
    else:
        print("\n💡 Please check your PostgreSQL GUI settings:")
        print("1. What USERNAME do you use in the GUI?")
        print("2. What HOST/SERVER do you connect to?")
        print("3. What PORT is configured?")

