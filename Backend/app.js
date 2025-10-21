// Backend: application services, accessible by URIs

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const dbService = require('./dbService');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// helpers --------------------------------------------------------------------
const safeSendError = (response, error) => {
    console.error(error);
    const status = error.statusCode || 500;
    const message = error.publicMessage || 'Unexpected server error';
    response.status(status).json({ error: message });
};

// routes ---------------------------------------------------------------------

app.get('/users', async (request, response) => {
    try {
        const db = dbService.getDbServiceInstance();
        const users = await db.getAllUsers();
        response.json({ data: users });
    } catch (error) {
        safeSendError(response, error);
    }
});

app.post('/users/register', async (request, response) => {
    try {
        const db = dbService.getDbServiceInstance();
        const newUser = await db.createUser(request.body);
        response.status(201).json({ data: newUser });
    } catch (error) {
        safeSendError(response, error);
    }
});

app.post('/users/signin', async (request, response) => {
    try {
        const db = dbService.getDbServiceInstance();
        const result = await db.authenticateUser(request.body);
        if (!result.success) {
            response.status(401).json({ error: 'Invalid username or password' });
            return;
        }
        response.json({ data: result.user });
    } catch (error) {
        safeSendError(response, error);
    }
});

app.get('/users/by-name', async (request, response) => {
    try {
        const { first, last } = request.query;
        const db = dbService.getDbServiceInstance();
        const users = await db.getUsersByName(first, last);
        response.json({ data: users });
    } catch (error) {
        safeSendError(response, error);
    }
});

app.get('/users/by-username/:username', async (request, response) => {
    try {
        const db = dbService.getDbServiceInstance();
        const user = await db.getUserByUsername(request.params.username);
        if (!user) {
            response.status(404).json({ error: 'User not found' });
            return;
        }
        response.json({ data: user });
    } catch (error) {
        safeSendError(response, error);
    }
});

app.get('/users/by-salary', async (request, response) => {
    try {
        const { min, max } = request.query;
        const db = dbService.getDbServiceInstance();
        const users = await db.getUsersBySalaryRange(min, max);
        response.json({ data: users });
    } catch (error) {
        safeSendError(response, error);
    }
});

app.get('/users/by-age', async (request, response) => {
    try {
        const { min, max } = request.query;
        const db = dbService.getDbServiceInstance();
        const users = await db.getUsersByAgeRange(min, max);
        response.json({ data: users });
    } catch (error) {
        safeSendError(response, error);
    }
});

app.get('/users/registered-after/:username', async (request, response) => {
    try {
        const db = dbService.getDbServiceInstance();
        const users = await db.getUsersRegisteredAfter(request.params.username);
        response.json({ data: users });
    } catch (error) {
        safeSendError(response, error);
    }
});

app.get('/users/never-signed-in', async (request, response) => {
    try {
        const db = dbService.getDbServiceInstance();
        const users = await db.getUsersNeverSignedIn();
        response.json({ data: users });
    } catch (error) {
        safeSendError(response, error);
    }
});

app.get('/users/registered-same-day/:username', async (request, response) => {
    try {
        const db = dbService.getDbServiceInstance();
        const users = await db.getUsersRegisteredSameDay(request.params.username);
        response.json({ data: users });
    } catch (error) {
        safeSendError(response, error);
    }
});

app.get('/users/registered-today', async (request, response) => {
    try {
        const db = dbService.getDbServiceInstance();
        const users = await db.getUsersRegisteredToday();
        response.json({ data: users });
    } catch (error) {
        safeSendError(response, error);
    }
});

// set up the web server listener
app.listen(5050, () => {
    console.log('I am listening on the fixed port 5050.');
});
