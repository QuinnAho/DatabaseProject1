// Database services exposed via DbService methods.

const mysql = require('mysql');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const util = require('util');

dotenv.config();

let instance = null;

const buildPublicError = (message, statusCode = 400) => {
    const error = new Error(message);
    error.publicMessage = message;
    error.statusCode = statusCode;
    return error;
};

const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.DB_USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DB_PORT,
    multipleStatements: false
});

const query = util.promisify(connection.query).bind(connection);

connection.connect(err => {
    if (err) {
        console.error('Failed to connect to MySQL:', err.message);
    } else {
        console.log('db ' + connection.state);
    }
});

const userProjection = `
    username,
    firstname,
    lastname,
    salary,
    age,
    registerday,
    signintime
`;

const toUser = row => ({
    username: row.username,
    firstname: row.firstname,
    lastname: row.lastname,
    salary: row.salary,
    age: row.age,
    registerday: row.registerday,
    signintime: row.signintime
});

class DbService {
    static getDbServiceInstance() {
        if (!instance) {
            instance = new DbService();
        }
        return instance;
    }

    async createUser(payload) {
        const username = payload?.username?.trim();
        const password = payload?.password;
        const firstname = payload?.firstname?.trim();
        const lastname = payload?.lastname?.trim();
        const salary = payload?.salary;
        const age = payload?.age;

        if (!username || !password || !firstname || !lastname) {
            throw buildPublicError('username, password, firstname, and lastname are required fields.', 400);
        }

        const numericSalary = Number.parseFloat(salary);
        if (Number.isNaN(numericSalary)) {
            throw buildPublicError('salary must be a valid number.', 400);
        }

        const numericAge = Number.parseInt(age, 10);
        if (Number.isNaN(numericAge)) {
            throw buildPublicError('age must be a valid integer.', 400);
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const registerDay = new Date();

        try {
            await query(
                `INSERT INTO Users (username, password, firstname, lastname, salary, age, registerday, signintime)
                 VALUES (?, ?, ?, ?, ?, ?, ?, NULL);`,
                [username, passwordHash, firstname, lastname, numericSalary, numericAge, registerDay]
            );
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw buildPublicError('username is already registered.', 409);
            }
            throw error;
        }

        return this.getUserByUsername(username);
    }

    async authenticateUser(payload) {
        const username = payload?.username?.trim();
        const password = payload?.password;

        if (!username || !password) {
            throw buildPublicError('username and password are required.', 400);
        }

        const rows = await query(
            `SELECT username, password, firstname, lastname, salary, age, registerday, signintime
             FROM Users WHERE username = ?;`,
            [username]
        );

        if (rows.length === 0) {
            return { success: false };
        }

        const userRow = rows[0];
        const passwordMatches = await bcrypt.compare(password, userRow.password);
        if (!passwordMatches) {
            return { success: false };
        }

        const signInTime = new Date();
        await query('UPDATE Users SET signintime = ? WHERE username = ?;', [signInTime, username]);

        const { password: _ignored, ...rest } = userRow;
        return { success: true, user: toUser({ ...rest, signintime: signInTime }) };
    }

    async getAllUsers() {
        const rows = await query(
            `SELECT ${userProjection} FROM Users ORDER BY registerday DESC, username ASC;`
        );
        return rows.map(toUser);
    }

    async getUserByUsername(username) {
        if (!username) {
            throw buildPublicError('username is required.', 400);
        }
        const rows = await query(
            `SELECT ${userProjection} FROM Users WHERE username = ?;`,
            [username.trim()]
        );
        if (rows.length === 0) {
            return null;
        }
        return toUser(rows[0]);
    }

    async getUsersByName(firstname, lastname) {
        const conditions = [];
        const params = [];

        if (firstname && firstname.trim()) {
            conditions.push('LOWER(firstname) LIKE ?');
            params.push(`%${firstname.trim().toLowerCase()}%`);
        }

        if (lastname && lastname.trim()) {
            conditions.push('LOWER(lastname) LIKE ?');
            params.push(`%${lastname.trim().toLowerCase()}%`);
        }

        if (conditions.length === 0) {
            throw buildPublicError('Provide at least a first or last name to search.', 400);
        }

        const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
        const rows = await query(
            `SELECT ${userProjection} FROM Users ${whereClause} ORDER BY firstname ASC, lastname ASC, username ASC;`,
            params
        );
        return rows.map(toUser);
    }

    async getUsersBySalaryRange(min, max) {
        if (min === undefined && max === undefined) {
            throw buildPublicError('Provide at least a minimum or maximum salary.', 400);
        }

        let minSalary = min !== undefined ? Number.parseFloat(min) : null;
        let maxSalary = max !== undefined ? Number.parseFloat(max) : null;

        if (minSalary !== null && Number.isNaN(minSalary)) {
            throw buildPublicError('min salary must be a valid number.', 400);
        }
        if (maxSalary !== null && Number.isNaN(maxSalary)) {
            throw buildPublicError('max salary must be a valid number.', 400);
        }

        if (minSalary !== null && maxSalary !== null && minSalary > maxSalary) {
            [minSalary, maxSalary] = [maxSalary, minSalary];
        }

        const conditions = [];
        const params = [];
        if (minSalary !== null) {
            conditions.push('salary >= ?');
            params.push(minSalary);
        }
        if (maxSalary !== null) {
            conditions.push('salary <= ?');
            params.push(maxSalary);
        }

        const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
        const rows = await query(
            `SELECT ${userProjection} FROM Users ${whereClause} ORDER BY salary ASC, username ASC;`,
            params
        );
        return rows.map(toUser);
    }

    async getUsersByAgeRange(min, max) {
        if (min === undefined && max === undefined) {
            throw buildPublicError('Provide at least a minimum or maximum age.', 400);
        }

        let minAge = min !== undefined ? Number.parseInt(min, 10) : null;
        let maxAge = max !== undefined ? Number.parseInt(max, 10) : null;

        if (minAge !== null && Number.isNaN(minAge)) {
            throw buildPublicError('min age must be a valid integer.', 400);
        }
        if (maxAge !== null && Number.isNaN(maxAge)) {
            throw buildPublicError('max age must be a valid integer.', 400);
        }

        if (minAge !== null && maxAge !== null && minAge > maxAge) {
            [minAge, maxAge] = [maxAge, minAge];
        }

        const conditions = [];
        const params = [];
        if (minAge !== null) {
            conditions.push('age >= ?');
            params.push(minAge);
        }
        if (maxAge !== null) {
            conditions.push('age <= ?');
            params.push(maxAge);
        }

        const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
        const rows = await query(
            `SELECT ${userProjection} FROM Users ${whereClause} ORDER BY age ASC, username ASC;`,
            params
        );
        return rows.map(toUser);
    }

    async getUsersRegisteredAfter(username) {
        if (!username) {
            throw buildPublicError('username is required.', 400);
        }

        const trimmedUsername = username.trim();
        const referenceRows = await query(
            'SELECT registerday FROM Users WHERE username = ?;',
            [trimmedUsername]
        );

        if (referenceRows.length === 0) {
            throw buildPublicError('Reference user not found.', 404);
        }

        const registerDay = referenceRows[0].registerday;
        const rows = await query(
            `SELECT ${userProjection} FROM Users WHERE registerday > ? ORDER BY registerday ASC, username ASC;`,
            [registerDay]
        );
        return rows.map(toUser);
    }

    async getUsersNeverSignedIn() {
        const rows = await query(
            `SELECT ${userProjection} FROM Users WHERE signintime IS NULL ORDER BY registerday ASC, username ASC;`
        );
        return rows.map(toUser);
    }

    async getUsersRegisteredSameDay(username) {
        if (!username) {
            throw buildPublicError('username is required.', 400);
        }

        const trimmedUsername = username.trim();
        const referenceRows = await query(
            'SELECT registerday FROM Users WHERE username = ?;',
            [trimmedUsername]
        );

        if (referenceRows.length === 0) {
            throw buildPublicError('Reference user not found.', 404);
        }

        const registerDay = referenceRows[0].registerday;
        const rows = await query(
            `SELECT ${userProjection} FROM Users
             WHERE DATE(registerday) = DATE(?)
             ORDER BY username ASC;`,
            [registerDay]
        );
        return rows.map(toUser);
    }

    async getUsersRegisteredToday() {
        const rows = await query(
            `SELECT ${userProjection} FROM Users
             WHERE DATE(registerday) = CURDATE()
             ORDER BY registerday ASC, username ASC;`
        );
        return rows.map(toUser);
    }
}

module.exports = DbService;
