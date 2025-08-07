# PostgreSQL Database Setup for Papercart

## 1. Install PostgreSQL

### Windows:
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. Remember the password you set for the `postgres` user
4. Default port is 5432

### macOS:
```bash
# Using Homebrew
brew install postgresql
brew services start postgresql
```

### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## 2. Create Database and User

### Option A: Using psql command line
```bash
# Connect to PostgreSQL as postgres user
psql -U postgres

# Create database
CREATE DATABASE papercart_db;

# Create user (optional, you can use postgres user)
CREATE USER papercart_user WITH PASSWORD 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE papercart_db TO papercart_user;

# Exit psql
\q
```

### Option B: Using pgAdmin
1. Open pgAdmin (PostgreSQL GUI tool)
2. Connect to your PostgreSQL server
3. Right-click "Databases" → "Create" → "Database"
4. Name: `papercart_db`
5. Click "Save"

## 3. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=papercart_db
DB_USER=postgres
DB_PASSWORD=your_password_here

# Alternative: Use DATABASE_URL
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/papercart_db

# Redis Configuration (optional)
REDIS_URL=redis://localhost:6379/0

# Application Settings
SECRET_KEY=your_secret_key_here
DEBUG=True
```

## 4. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

## 5. Run the Application

```bash
python app.py
```

The application will automatically create the required tables when it starts.

## 6. Database Schema

The application creates these tables:

### `users` table:
- `id` (SERIAL PRIMARY KEY)
- `full_name` (VARCHAR(255) NOT NULL)
- `phone_number` (VARCHAR(15) UNIQUE NOT NULL)
- `email` (VARCHAR(255) UNIQUE)
- `password_hash` (VARCHAR(255) NOT NULL)
- `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
- `is_verified` (BOOLEAN DEFAULT FALSE)

### `sessions` table:
- `id` (SERIAL PRIMARY KEY)
- `user_id` (INTEGER NOT NULL, FOREIGN KEY)
- `session_token` (VARCHAR(255) UNIQUE NOT NULL)
- `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
- `expires_at` (TIMESTAMP NOT NULL)

## 7. Performance Optimizations

The application creates these indexes automatically:
- `idx_users_phone` on `users(phone_number)`
- `idx_users_email` on `users(email)`
- `idx_sessions_token` on `sessions(session_token)`
- `idx_sessions_expires` on `sessions(expires_at)`

## 8. Backup and Maintenance

### Create Backup:
```bash
pg_dump -U postgres -h localhost papercart_db > backup.sql
```

### Restore Backup:
```bash
psql -U postgres -h localhost papercart_db < backup.sql
```

### Clean expired sessions (run periodically):
```sql
DELETE FROM sessions WHERE expires_at < NOW();
```

## 9. Production Considerations

1. **Security**: Use strong passwords and restrict database access
2. **Connection Pooling**: Consider using pgbouncer for connection pooling
3. **Monitoring**: Set up monitoring for database performance
4. **Backups**: Set up automated daily backups
5. **SSL**: Enable SSL connections in production

## 10. Troubleshooting

### Common Issues:

**Connection refused:**
- Check if PostgreSQL service is running
- Verify port 5432 is not blocked by firewall
- Check `pg_hba.conf` for authentication settings

**Permission denied:**
- Verify user has correct privileges on database
- Check if user can connect: `psql -U username -d papercart_db`

**Import errors:**
- Make sure `psycopg2-binary` is installed: `pip install psycopg2-binary`
