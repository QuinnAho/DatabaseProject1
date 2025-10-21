# Video Demonstration Script - Database Project 1
**Target Duration: 30 Minutes**

## Introduction (2 minutes)
- Hello, this is my demonstration of Database Project 1
- Today I'll walk you through a complete user management system with:
  - User registration and authentication
  - Advanced search capabilities using SQL queries
  - Security best practices including SQL injection prevention
- The project uses Node.js, Express, MySQL, and vanilla JavaScript
- I'll demonstrate all 10 required features, explain the SQL queries, and show the code implementation
- Let's get started!

---

## Project Setup & Architecture (3-4 minutes)

### Directory Structure
- Show file explorer with project structure
- Explain the separation of concerns:
  - `Backend/` - Node.js server and database logic
  - `Frontend/` - HTML/CSS/JavaScript user interface
  - `sql.txt` - All SQL query documentation
  - `.env` configuration for database credentials

### Technology Stack
- **Backend**: Node.js with Express framework
- **Database**: MySQL (via XAMPP)
- **Frontend**: Vanilla JavaScript (no frameworks)
- **Security**: bcryptjs for password hashing, prepared statements for SQL
- **Dependencies**: Show `package.json` - express, mysql, cors, dotenv, bcryptjs, nodemon

### Environment Configuration
- Show `Backend/dotenv` file
- Explain each parameter:
  - PORT=5050 (backend server port)
  - DB_USER=root (MySQL username)
  - PASSWORD= (MySQL password, empty for XAMPP default)
  - DATABASE=web_app (our database name)
  - DB_PORT=3306 (MySQL default port)
  - HOST=localhost
- Mention this file must be renamed to `.env` to work

### Database Schema (Deep Dive)
- Open phpMyAdmin and show the `web_app` database
- Show the Users table structure
- Explain each field in detail:
  - `username` VARCHAR(50) PRIMARY KEY - unique identifier, prevents duplicates
  - `password` VARCHAR(255) - long enough for bcrypt hash (60 chars) plus future-proofing
  - `firstname`, `lastname` VARCHAR(50) - user's name fields
  - `salary` DECIMAL(12,2) - chose DECIMAL over FLOAT for precise currency calculations
  - `age` INTEGER - user's age
  - `registerday` DATETIME - includes time component, auto-set on registration
  - `signintime` DATETIME NULL - tracks last sign-in, NULL if never signed in
- Show the indexes:
  - PRIMARY KEY on username
  - INDEX on registerday (speeds up date-based queries)
  - INDEX on signintime (speeds up "never signed in" query)
  - COMPOSITE INDEX on (firstname, lastname) for name searches
  - INDEX on salary and age for range queries
- **Explain why indexes matter**: O(log n) vs O(n) lookups

---

## Feature Demonstrations (12-15 minutes)

### 1. User Registration (1.5 minutes)
- Navigate to the registration form on the frontend
- **Create first user**: "alice" with password, name "Alice Smith", salary 75000, age 28
- Click "Create Account"
- Show success message and user appears in results table
- **Open phpMyAdmin**: Show the new record in the Users table
- Point out the hashed password (not plain text)
- Point out the `registerday` timestamp (auto-generated)
- Point out `signintime` is NULL (hasn't signed in yet)
- **Create 2-3 more users** with different data for later demonstrations:
  - "bob" - salary 50000, age 35
  - "charlie" - salary 90000, age 42
  - "diana" - salary 65000, age 30

**SQL Query Explanation** (show `sql.txt` lines 19-20):
```sql
INSERT INTO Users (username, password, firstname, lastname, salary, age, registerday, signintime)
VALUES (?, ?, ?, ?, ?, ?, NOW(), NULL);
```
- Uses prepared statement with `?` placeholders
- NOW() function sets current timestamp
- signintime starts as NULL

### 2. User Sign-In - SQL Injection Safe (2 minutes)
- Use the sign-in form with "alice"
- Enter username: alice, password: (her password)
- Click "Sign In"
- Show success message with user details
- **Open phpMyAdmin**: Refresh and show alice's record
- Point out `signintime` is now updated with current timestamp
- **Try invalid password**: Show error handling
- **Try non-existent user**: Show appropriate error message

**SQL Query Explanation** (show `sql.txt` lines 23-29):
```sql
-- Authentication query
SELECT username, password, firstname, lastname, salary, age, registerday, signintime
FROM Users
WHERE username = ?;

-- Update sign-in time
UPDATE Users
SET signintime = NOW()
WHERE username = ?;
```

**Security Deep Dive** (show `dbService.js` lines 107-136):
- Show the `authenticateUser` function
- Point out parameterized query on line 115-119
- Explain bcrypt password comparison (line 126) - not plain text comparison
- Show how `signintime` is updated AFTER successful authentication (line 132)
- **Contrast with vulnerable code**: Write on screen what SQL injection would look like:
  ```javascript
  // VULNERABLE (DO NOT USE):
  query("SELECT * FROM Users WHERE username = '" + username + "'")
  // Attacker input: admin' OR '1'='1
  // Results in: SELECT * FROM Users WHERE username = 'admin' OR '1'='1'
  // Returns ALL users!
  ```

### 3. Search by First and/or Last Name (1.5 minutes)
- **Test 1**: Enter first name only "Ali" → show it finds "Alice Smith"
- **Test 2**: Enter last name only "smith" → show case-insensitive search
- **Test 3**: Enter both first "Bob" AND last "Jones" → show combined filter
- **Test 4**: Enter partial name "ar" → might find "Charlie" or "Sarah"
- Show results table updates dynamically

**SQL Query Explanation** (show `sql.txt` lines 31-35):
```sql
SELECT username, firstname, lastname, salary, age, registerday, signintime
FROM Users
WHERE (? IS NULL OR LOWER(firstname) LIKE LOWER(CONCAT('%', ?, '%')))
  AND (? IS NULL OR LOWER(lastname) LIKE LOWER(CONCAT('%', ?, '%')));
```
- Uses LIKE with CONCAT for wildcards (% before and after for partial matching)
- LOWER() makes it case-insensitive
- NULL checks allow searching by first OR last OR both

**Code Walkthrough** (show `dbService.js` lines 159-183):
- Show how the function builds dynamic WHERE clauses
- Only adds conditions if parameters are provided

### 4. Search by Username (1 minute)
- Enter specific username "alice"
- Click "Find User"
- Show the exact user match with all details
- Try a non-existent username → show "User not found" error

**SQL Query Explanation** (show `sql.txt` lines 37-40):
```sql
SELECT username, firstname, lastname, salary, age, registerday, signintime
FROM Users
WHERE username = ?;
```
- Simple exact match using prepared statement
- Returns single user or none

### 5. Salary Between X and Y (1.5 minutes)
- **Test 1**: Enter min=50000, max=80000 → show alice (75000) and bob (50000)
- **Test 2**: Enter only min=70000 → show users earning at least 70,000
- **Test 3**: Enter only max=60000 → show users earning up to 60,000
- Point out results are ordered by salary (ascending)

**SQL Query Explanation** (show `sql.txt` lines 42-46):
```sql
SELECT username, firstname, lastname, salary, age, registerday, signintime
FROM Users
WHERE salary BETWEEN ? AND ?
ORDER BY salary ASC;
```

**Show Code** (`dbService.js` lines 185-221):
- Explain validation of numeric inputs (lines 193-198)
- Show automatic swap if min > max (lines 200-202)
- Show dynamic WHERE clause building (lines 204-213)

### 6. Age Between X and Y (1 minute)
- Enter min=25, max=35 → show users in that age range
- Show results ordered by age ascending
- **Explain**: Similar logic to salary range but for INTEGER field

**SQL Query Explanation** (show `sql.txt` lines 48-52):
```sql
SELECT username, firstname, lastname, salary, age, registerday, signintime
FROM Users
WHERE age BETWEEN ? AND ?
ORDER BY age ASC;
```

### 7. Registered After User (2 minutes)
- **Setup**: Show current users and their registration times in phpMyAdmin
- Enter reference username "alice"
- Click "Find Users"
- Show all users who registered AFTER alice
- **Explain the two-step process**:
  1. First, query alice's registerday
  2. Then, find all users with registerday > alice's registerday

**SQL Query Explanation** (show `sql.txt` lines 54-60):
```sql
SELECT username, firstname, lastname, salary, age, registerday, signintime
FROM Users
WHERE registerday > (
    SELECT registerday FROM Users WHERE username = ?
)
ORDER BY registerday ASC;
```
- Uses subquery to get reference user's registerday
- Outer query filters users registered after that time
- Results ordered chronologically

**Show Code** (`dbService.js` lines 261-282):
- Show the two separate queries (lines 267-270 and 277-280)
- Explain error handling if reference user doesn't exist (line 272)

### 8. Users Who Never Signed In (1 minute)
- Click "Users Never Signed In" button
- Show users where signintime IS NULL
- **Create a new user** to demonstrate: "eve", don't sign her in
- Refresh the query → show eve appears in results
- **Sign in eve** → Refresh query → show eve no longer appears

**SQL Query Explanation** (show `sql.txt` lines 62-66):
```sql
SELECT username, firstname, lastname, salary, age, registerday, signintime
FROM Users
WHERE signintime IS NULL
ORDER BY registerday ASC;
```
- Uses IS NULL to check for NULL values
- Ordered by registration date (oldest first)

### 9. Registered Same Day as User (1.5 minutes)
- Enter reference username "alice"
- Click "Find Users"
- Show all users registered on the same DAY as alice (including alice herself)
- **Explain DATE() function**: Strips time component, only compares dates
- **Demo**: If alice registered at 2pm and bob at 8am same day, both appear

**SQL Query Explanation** (show `sql.txt` lines 68-74):
```sql
SELECT username, firstname, lastname, salary, age, registerday, signintime
FROM Users
WHERE DATE(registerday) = DATE((
    SELECT registerday FROM Users WHERE username = ?
))
ORDER BY username ASC;
```
- Subquery gets reference user's registerday (with time)
- DATE() function extracts only the date portion
- Compares dates ignoring time

### 10. Registered Today (1 minute)
- Click "Registered Today" button
- Show users who registered today (should show all demo users just created)
- **Explain**: Uses CURDATE() which returns current date without time
- Results ordered by registration time (earliest to latest)

**SQL Query Explanation** (show `sql.txt` lines 76-80):
```sql
SELECT username, firstname, lastname, salary, age, registerday, signintime
FROM Users
WHERE DATE(registerday) = CURDATE()
ORDER BY registerday ASC;
```
- CURDATE() is a MySQL function returning today's date
- DATE(registerday) strips time for accurate comparison

---

## SQL Injection Protection Deep Dive (3-4 minutes)

### What is SQL Injection?
- **Definition**: Malicious SQL code inserted into application queries
- **Example Attack**: User enters `admin' OR '1'='1` as username
- **Risk**: Bypasses authentication, exposes/deletes data, grants unauthorized access

### Vulnerable Code Example
Write on screen or notepad:
```javascript
// DANGEROUS - DO NOT USE THIS APPROACH
const username = request.body.username;
const query = "SELECT * FROM Users WHERE username = '" + username + "'";
connection.query(query); // VULNERABLE!

// If attacker enters: admin' OR '1'='1
// Query becomes: SELECT * FROM Users WHERE username = 'admin' OR '1'='1'
// This returns ALL users because '1'='1' is always true!
```

### Our Secure Implementation

**Show Code: `Backend/dbService.js`**
- Open `dbService.js` in editor
- Navigate to `authenticateUser` function (line 107)
- **Explain lines 115-119**:
  ```javascript
  const rows = await query(
      `SELECT username, password, firstname, lastname, salary, age, registerday, signintime
       FROM Users WHERE username = ?;`,
      [username]  // Parameter is bound separately
  );
  ```
- **Key Point**: The `?` placeholder is replaced by the MySQL driver AFTER escaping
- Even if attacker enters `admin' OR '1'='1`, it's treated as a literal string
- The query looks for a user literally named "admin' OR '1'='1" (which doesn't exist)

**Show Registration Function**
- Navigate to `createUser` function (line 66)
- Show lines 92-96 using parameterized INSERT:
  ```javascript
  await query(
      `INSERT INTO Users (username, password, firstname, lastname, salary, age, registerday, signintime)
       VALUES (?, ?, ?, ?, ?, ?, ?, NULL);`,
      [username, passwordHash, firstname, lastname, numericSalary, numericAge, registerDay]
  );
  ```
- **Explain**: All 6 user inputs are safely bound as parameters
- MySQL driver handles escaping automatically

**Show multipleStatements: false**
- Scroll to line 25 in `dbService.js`
- Point out `multipleStatements: false` in connection config
- **Explain**: Prevents attackers from executing multiple queries (e.g., `'; DROP TABLE Users; --`)

### Why This Matters
- **Industry Standard**: Prepared statements are required in professional software
- **OWASP Top 10**: SQL Injection consistently ranks in top security vulnerabilities
- **Real-world Impact**: Major data breaches often result from SQL injection
- **Our Approach**: Zero SQL injection vulnerabilities in this project

---

## Complete Code Walkthrough (5-6 minutes)

### Backend Routes - `Backend/app.js` (2 minutes)

**Show the Express Server Setup** (lines 1-14):
- `dotenv.config()` loads environment variables from `.env` file
- `cors()` middleware allows frontend to make requests from different origin
- `express.json()` parses JSON request bodies
- `express.urlencoded()` parses form data

**Show API Endpoints** (lines 26-145):
- Walk through each endpoint:
  1. `GET /users` - Get all users (line 26)
  2. `POST /users/register` - Create new user (line 36)
  3. `POST /users/signin` - Authenticate user (line 46)
  4. `GET /users/by-name` - Name search (line 60)
  5. `GET /users/by-username/:username` - Username lookup (line 71)
  6. `GET /users/by-salary` - Salary range (line 85)
  7. `GET /users/by-age` - Age range (line 96)
  8. `GET /users/registered-after/:username` - Date comparison (line 107)
  9. `GET /users/never-signed-in` - NULL check (line 117)
  10. `GET /users/registered-same-day/:username` - Same day (line 127)
  11. `GET /users/registered-today` - Today's registrations (line 137)

**Error Handling** (lines 17-22):
- Show `safeSendError` function
- Logs error to console for debugging
- Sends user-friendly message to client (never exposes internal errors)
- Uses appropriate HTTP status codes (400, 404, 500)

**Server Listener** (lines 148-150):
- Listens on port 5050 (configurable via .env)
- Logs confirmation message when server starts

### Database Service - `Backend/dbService.js` (2-3 minutes)

**Database Connection** (lines 19-36):
- Uses `mysql.createConnection()` with environment variables
- `multipleStatements: false` for security
- `util.promisify` converts callback-based query to Promise-based (line 28)
- Connection error handling (lines 30-36)

**Password Security with bcrypt** (lines 88 and 126):
- **Registration** (line 88): `await bcrypt.hash(password, 10)`
  - Generates salt and hashes password
  - `10` is the cost factor (2^10 rounds)
  - Takes ~100ms intentionally (prevents brute force)
- **Authentication** (line 126): `await bcrypt.compare(password, userRow.password)`
  - Compares plain text with hash
  - Returns true/false
  - Never stores plain text passwords

**Helper Functions**:
- `userProjection` (lines 38-46): Defines fields to select (excludes password)
- `toUser` (lines 48-56): Maps database row to clean user object
- `buildPublicError` (lines 12-17): Creates errors safe to send to client

**Validation Examples**:
- Show salary validation (lines 78-81)
- Show age validation (lines 83-86)
- Show username required check (line 74-76)
- **Explain**: Server-side validation is critical (never trust client)

### Frontend - `Frontend/index.html` (1 minute)

**HTML Structure**:
- Show registration form (lines 15-42)
- Show sign-in form (lines 45-57)
- Show search forms section (lines 60-126)
- Show results table (lines 129-145)

**Form Fields**:
- Point out `required` attributes for client-side validation
- Point out `type="number"` for numeric inputs
- Point out `type="password"` for password masking

**JavaScript Integration**:
- Mention `index.js` (line 147) handles all form submissions
- Uses `fetch()` API to call backend endpoints
- Updates results table dynamically with JSON responses

### SQL Documentation - `sql.txt`

**Open and Review**:
- **Explain purpose**: This file documents all SQL queries used in the project
- Section 1 (lines 2-16): CREATE TABLE schema
- Section 2 (lines 19-20): Registration INSERT
- Sections 3-12: All 10 query features
- **Important**: The `?` placeholders are replaced in Node.js code (not executed directly)
- **Assignment requirement**: Submit this file to show SQL implementation

---

## Database Verification in phpMyAdmin (2-3 minutes)

### Show the Database Structure
- Open phpMyAdmin → `web_app` database → `Users` table
- Click "Structure" tab
- Walk through each field and its properties
- Show the indexes and explain their purpose

### Show Actual Data
- Click "Browse" tab
- Show all records created during demonstration
- **Highlight Security Features**:
  - Passwords are bcrypt hashes (60 characters starting with $2a$ or $2b$)
  - Cannot reverse the hash to get original password
  - Each password has unique salt (even same password hashes differently)

### Execute Raw SQL Query
- Click "SQL" tab
- Run: `SELECT * FROM Users WHERE signintime IS NULL;`
- Show results match the "Never Signed In" feature
- Run: `SELECT * FROM Users WHERE DATE(registerday) = CURDATE();`
- Show results match the "Registered Today" feature
- **Explain**: These match the queries in sql.txt and demonstrate correctness

### Show Query Log (Optional)
- Click on "Status" → "Query statistics" if available
- Shows actual queries executed by the application
- Point out all queries use prepared statements (show `?` placeholders)

---

## Testing & Edge Cases (2 minutes)

### Error Handling Tests
- **Duplicate Username**: Try registering "alice" again → show 409 error
- **Invalid Password**: Try signing in with wrong password → show 401 error
- **Non-existent User**: Search for "xyz123" → show 404 error
- **Invalid Input**: Try negative salary or age → show validation error

### Query Edge Cases
- **Empty Results**: Search for salary range with no matches (e.g., 1-10)
- **Single Result**: Search that returns exactly one user
- **All Results**: Search that returns everyone (e.g., age 0-999)

### Data Validation
- **Show in code**: Salary must be numeric (dbService.js:78-81)
- **Show in code**: Age must be integer (dbService.js:83-86)
- **Show in code**: Required fields cannot be empty (dbService.js:74-76)

---

## Best Practices Implemented (1-2 minutes)

### Security
- ✓ Prepared statements (SQL injection prevention)
- ✓ Password hashing with bcrypt (no plain text storage)
- ✓ Input validation (server-side and client-side)
- ✓ Error messages don't expose internals
- ✓ `multipleStatements: false` prevents query chaining

### Code Quality
- ✓ Separation of concerns (routes vs database logic)
- ✓ Environment variables for configuration
- ✓ Consistent error handling
- ✓ Async/await for readable asynchronous code
- ✓ DRY principle (reusable helper functions)

### Database Design
- ✓ Appropriate data types (DECIMAL for money, DATETIME for timestamps)
- ✓ Indexes on frequently queried columns
- ✓ Primary key on username
- ✓ NULL handling for optional fields
- ✓ Normalization (no redundant data)

### Performance
- ✓ Database indexes speed up queries
- ✓ Connection pooling (could be improved with pool instead of single connection)
- ✓ Efficient queries (no SELECT *, only needed fields)
- ✓ Proper use of LIMIT where appropriate

---

## Conclusion & Summary (1-2 minutes)

### Requirements Checklist
- ✓ User registration with hashed passwords
- ✓ User sign-in protected from SQL injection
- ✓ Search by first and/or last name
- ✓ Search by username
- ✓ Salary range search (between X and Y)
- ✓ Age range search (between X and Y)
- ✓ Find users registered after another user
- ✓ Find users who never signed in
- ✓ Find users registered same day as another user
- ✓ Find users registered today
- ✓ All SQL queries documented in `sql.txt`
- ✓ Professional interface with proper error handling

### Technologies Used
- Node.js + Express for backend REST API
- MySQL for relational database
- Vanilla JavaScript for frontend interactivity
- bcryptjs for password security
- dotenv for environment configuration
- CORS for cross-origin requests

### Key Takeaways
- **Security First**: SQL injection prevention is non-negotiable
- **Prepared Statements**: Industry standard for database queries
- **Password Security**: Never store plain text passwords
- **Validation**: Always validate on server-side (client validation is convenience only)
- **Documentation**: sql.txt serves as project documentation

### Future Improvements (Optional)
- Add session management (JWT tokens)
- Implement pagination for large result sets
- Add input sanitization library (like validator.js)
- Use connection pooling for better performance
- Add unit tests and integration tests
- Implement rate limiting to prevent brute force attacks

### Thank You
- This completes my demonstration of Database Project 1
- All requirements have been successfully implemented
- The application is secure, functional, and well-documented
- Thank you for watching!

---

## Recording Tips & Checklist

### Before Recording
- [ ] Clean database (delete test data)
- [ ] Prepare 5-10 diverse users for demos
- [ ] Test all features work correctly
- [ ] Close unnecessary applications
- [ ] Set browser zoom to 125% or 150%
- [ ] Use full-screen mode (F11)
- [ ] Test microphone audio quality
- [ ] Plan 30-35 minutes (allows for mistakes/pauses)

### During Recording
- [ ] Speak clearly and at moderate pace
- [ ] Explain WHAT you're doing
- [ ] Explain WHY it matters
- [ ] Show both frontend UI and backend code
- [ ] Demonstrate actual results, not just code
- [ ] Point out security features explicitly
- [ ] Use phpMyAdmin to verify database changes
- [ ] Zoom in on code when showing specific lines
- [ ] Pause briefly between sections

### Screen Layout Tips
- Split screen: Browser (50%) + Code Editor (50%)
- Or: Full screen browser, switch to code when explaining
- Have phpMyAdmin open in another tab
- Have sql.txt open for reference
- Use OBS Studio or similar for recording

### Time Management
- Introduction: 2 min
- Setup & Architecture: 4 min
- Feature Demos: 15 min
- Security Deep Dive: 4 min
- Code Walkthrough: 6 min
- Database Verification: 3 min
- Testing & Best Practices: 3 min
- Conclusion: 2 min
- **Total: ~30 minutes**
