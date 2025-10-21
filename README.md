# Database Project 1

User registration and authentication web application with advanced search functionality. Built with Node.js, Express, MySQL, and vanilla JavaScript.

## Features

- User registration with bcrypt password hashing
- Secure authentication (SQL injection protected)
- Search by name, username, salary range, age range, registration date, and sign-in status

## Setup

1. **Install dependencies:**
   ```bash
   cd Backend
   npm install
   ```

2. **Configure environment:**
   - Copy `Backend/dotenv` to `Backend/.env`
   - Update MySQL credentials in `.env` if needed

3. **Create database:**
   - Create a database named `web_app` in MySQL
   - Apply the schema from `sql.txt`

4. **Start backend:**
   ```bash
   cd Backend
   npm start
   ```
   - Should log: "I am listening on the fixed port 5050."

5. **Host frontend:**
   - Serve `Frontend/` via XAMPP (copy to `htdocs`) or another HTTP server
   - Access at `http://localhost/database_javascript/project1/Frontend/index.html`

## Testing

- Register a user and verify they appear in results
- Sign in and confirm timestamp updates
- Test search filters and API endpoints