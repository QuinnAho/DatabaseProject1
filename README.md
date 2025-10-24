# Database Project 1

User registration and authentication web application with advanced search functionality. Built with Node.js, Express, MySQL, and vanilla JavaScript.

**Video Demo:** https://drive.google.com/file/d/1YRTn4Y6OQ8l-6YmYSG0wKfFCyPrjIc3K/view?usp=sharing
## Features

- User registration with bcrypt password hashing
- Secure authentication (SQL injection protected)
- Search by name, username, salary range, age range, registration date, and sign-in status

## Prerequisites

- XAMPP (Apache web server and MySQL database)
- Node.js version 14 or higher
- Web browser

## Setup Instructions

### Step 1: Start XAMPP Services

1. Open XAMPP Control Panel
2. Start Apache web server
3. Start MySQL database
4. Verify both show "Running" status

### Step 2: Create MySQL Database

**Using phpMyAdmin:**
1. Navigate to http://localhost/phpmyadmin/
2. Click "New" in left sidebar
3. Database name: `web_app`
4. Click "Create"
5. Select `web_app` database
6. Click "SQL" tab
7. Copy contents of `schema.sql` file
8. Paste into SQL query box and click "Go"
9. Verify `Users` table appears in left sidebar

**Using MySQL Command Line:**
```bash
mysql -u root -p
CREATE DATABASE web_app;
USE web_app;
SOURCE C:/xampp/htdocs/DatabaseProject1/schema.sql;
SHOW TABLES;
EXIT;
```

### Step 3: Configure Backend Environment

1. Navigate to Backend folder:
   ```bash
   cd C:\xampp\htdocs\DatabaseProject1\Backend
   ```

2. Create `.env` file from template:
   ```bash
   # Windows Command Prompt
   copy dotenv .env

   # Git Bash / Linux / Mac
   cp dotenv .env
   ```

3. Edit `.env` if you set a MySQL password (default is empty):
   ```
   PORT=5050
   DB_USER=root
   PASSWORD=
   DATABASE=web_app
   DB_PORT=3306
   HOST=localhost
   ```

### Step 4: Install Backend Dependencies

```bash
cd C:\xampp\htdocs\DatabaseProject1\Backend
npm install
```

This installs: express, mysql, cors, dotenv, bcryptjs, nodemon

### Step 5: Start Backend Server

```bash
npm start
```

Expected output:
```
[nodemon] starting `node app.js`
db connected
I am listening on the fixed port 5050.
```

Keep this terminal window open. The server must stay running.

### Step 6: Access Frontend

Open browser and navigate to:
```
http://localhost/DatabaseProject1/Frontend/index.html
```

## Quick Start Summary

```bash
# 1. Start XAMPP Apache and MySQL

# 2. Create database in phpMyAdmin
#    Import schema.sql into web_app database

# 3. Configure and start backend
cd C:\xampp\htdocs\DatabaseProject1\Backend
copy dotenv .env
npm install
npm start

# 4. Access frontend in browser
# http://localhost/DatabaseProject1/Frontend/index.html
```

## Testing the Application

- Register a user and verify they appear in results table
- Sign in with registered credentials and verify success
- Search by first/last name
- Search by username
- Filter by salary range
- Filter by age range
- Click "Registered Today" to see new users
- Click "Users Never Signed In"

## Troubleshooting

### Cannot connect to MySQL
- Verify MySQL is running in XAMPP Control Panel
- Check `.env` file has correct credentials
- Verify `web_app` database exists in phpMyAdmin
- Try changing `HOST=localhost` to `HOST=127.0.0.1`

### Port 5050 already in use
```bash
# Windows - Find process using port 5050
netstat -ano | findstr :5050

# Kill process (replace XXXX with PID)
taskkill /F /PID XXXX
```

### npm command not found
- Install Node.js from https://nodejs.org/
- Restart terminal after installation

### Frontend shows "Failed to fetch" errors
- Verify backend server is running
- Check browser console (F12) for errors
- Confirm backend is accessible at http://localhost:5050

### Table 'web_app.Users' doesn't exist
- Import `schema.sql` (not `sql.txt`) in phpMyAdmin
- Verify table exists in phpMyAdmin under `web_app` database

### Apache won't start (Port 80 conflict)
- Edit XAMPP Apache config: Config → httpd.conf
- Change `Listen 80` to `Listen 8080`
- Restart Apache
- Access frontend at http://localhost:8080/DatabaseProject1/Frontend/index.html

## Default Access

- Backend API: http://localhost:5050
- Frontend UI: http://localhost/DatabaseProject1/Frontend/index.html
- phpMyAdmin: http://localhost/phpmyadmin/
- MySQL credentials: username `root`, password (empty by default)
