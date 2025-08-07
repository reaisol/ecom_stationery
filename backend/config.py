import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    # Database Configuration
    DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:password@localhost:5432/papercart_db')
    
    # Parse DATABASE_URL for individual components
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = os.getenv('DB_PORT', '5432')
    DB_NAME = os.getenv('DB_NAME', 'papercart_db')
    DB_USER = os.getenv('DB_USER', 'postgres')
    DB_PASSWORD = os.getenv('DB_PASSWORD', 'admin1234')
    
    # Redis Configuration
    REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
    
    # Fast2SMS Configuration
    FAST2SMS_API_KEY = os.getenv('FAST2SMS_API_KEY', '')
    
    # Application Settings
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'
    
    @classmethod
    def get_database_url(cls):
        """Get complete database URL"""
        if cls.DATABASE_URL and cls.DATABASE_URL.startswith('postgresql://'):
            return cls.DATABASE_URL
        else:
            return f"postgresql://{cls.DB_USER}:{cls.DB_PASSWORD}@{cls.DB_HOST}:{cls.DB_PORT}/{cls.DB_NAME}"
