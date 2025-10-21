const API_BASE = 'http://localhost:5050';

const messageElement = document.getElementById('message');
const usersTableBody = document.querySelector('#users-table tbody');

const jsonHeaders = { 'Content-Type': 'application/json' };

const normaliseNumber = (value, parser) => {
    if (value === undefined || value === null || value === '') {
        return undefined;
    }
    const parsed = parser(value);
    return Number.isNaN(parsed) ? undefined : parsed;
};

const formatDateTime = value => {
    if (!value) {
        return '—';
    }
    return new Date(value).toLocaleString();
};

const formatCurrency = value => {
    const amount = Number(value);
    if (!Number.isFinite(amount)) {
        return '—';
    }
    return amount.toFixed(2);
};

const setMessage = (text, tone = 'info') => {
    messageElement.textContent = text;
    messageElement.setAttribute('data-tone', tone);
};

const renderUsersTable = users => {
    usersTableBody.innerHTML = '';

    if (!users || users.length === 0) {
        setMessage('No matching users found.', 'warning');
        return;
    }

    const fragment = document.createDocumentFragment();
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.firstname}</td>
            <td>${user.lastname}</td>
            <td>${formatCurrency(user.salary)}</td>
            <td>${user.age}</td>
            <td>${formatDateTime(user.registerday)}</td>
            <td>${formatDateTime(user.signintime)}</td>
        `;
        fragment.appendChild(row);
    });

    usersTableBody.appendChild(fragment);
    setMessage(`Showing ${users.length} user${users.length === 1 ? '' : 's'}.`, 'success');
};

const ensureArray = data => {
    if (Array.isArray(data)) {
        return data;
    }
    if (!data) {
        return [];
    }
    return [data];
};

const apiRequest = async (path, options = {}) => {
    const response = await fetch(`${API_BASE}${path}`, options);
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
        const message = payload.error || 'Request failed';
        throw new Error(message);
    }
    return payload;
};

const handleFormSubmission = (formElement, callback) => {
    formElement.addEventListener('submit', event => {
        event.preventDefault();
        callback(new FormData(formElement));
    });
};

const loadAllUsers = async () => {
    try {
        const { data } = await apiRequest('/users');
        renderUsersTable(data);
    } catch (error) {
        setMessage(error.message, 'error');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    loadAllUsers();

    // registration ----------------------------------------------------------
    const registrationForm = document.getElementById('registration-form');
    handleFormSubmission(registrationForm, async formData => {
        const payload = {
            username: formData.get('username'),
            password: formData.get('password'),
            firstname: formData.get('firstname'),
            lastname: formData.get('lastname'),
            salary: normaliseNumber(formData.get('salary'), Number.parseFloat),
            age: normaliseNumber(formData.get('age'), Number.parseInt)
        };

        try {
            const { data } = await apiRequest('/users/register', {
                method: 'POST',
                headers: jsonHeaders,
                body: JSON.stringify(payload)
            });
            registrationForm.reset();
            setMessage(`Created user ${data.username}.`, 'success');
            await loadAllUsers();
        } catch (error) {
            setMessage(error.message, 'error');
        }
    });

    // sign-in --------------------------------------------------------------
    const signinForm = document.getElementById('signin-form');
    handleFormSubmission(signinForm, async formData => {
        const payload = {
            username: formData.get('username'),
            password: formData.get('password')
        };

        try {
            const { data } = await apiRequest('/users/signin', {
                method: 'POST',
                headers: jsonHeaders,
                body: JSON.stringify(payload)
            });
            signinForm.reset();
            setMessage(`Signed in as ${data.username}.`, 'success');
            await loadAllUsers();
        } catch (error) {
            setMessage(error.message, 'error');
        }
    });

    // search: name ---------------------------------------------------------
    const searchNameForm = document.getElementById('search-name-form');
    handleFormSubmission(searchNameForm, async formData => {
        const params = new URLSearchParams();
        const first = formData.get('firstname')?.trim();
        const last = formData.get('lastname')?.trim();
        if (first) {
            params.append('first', first);
        }
        if (last) {
            params.append('last', last);
        }

        try {
            const { data } = await apiRequest(`/users/by-name?${params.toString()}`, {
                headers: jsonHeaders
            });
            searchNameForm.reset();
            renderUsersTable(data);
        } catch (error) {
            setMessage(error.message, 'error');
        }
    });

    // search: username -----------------------------------------------------
    const searchUsernameForm = document.getElementById('search-username-form');
    handleFormSubmission(searchUsernameForm, async formData => {
        const username = formData.get('username')?.trim();
        if (!username) {
            setMessage('Please enter a username.', 'warning');
            return;
        }
        try {
            const { data } = await apiRequest(`/users/by-username/${encodeURIComponent(username)}`, {
                headers: jsonHeaders
            });
            renderUsersTable(ensureArray(data));
        } catch (error) {
            setMessage(error.message, 'error');
        }
    });

    // search: salary -------------------------------------------------------
    const searchSalaryForm = document.getElementById('search-salary-form');
    handleFormSubmission(searchSalaryForm, async formData => {
        const params = new URLSearchParams();
        const minSalary = formData.get('min');
        const maxSalary = formData.get('max');
        if (minSalary) {
            params.append('min', minSalary);
        }
        if (maxSalary) {
            params.append('max', maxSalary);
        }

        try {
            const { data } = await apiRequest(`/users/by-salary?${params.toString()}`, {
                headers: jsonHeaders
            });
            renderUsersTable(data);
        } catch (error) {
            setMessage(error.message, 'error');
        }
    });

    // search: age ----------------------------------------------------------
    const searchAgeForm = document.getElementById('search-age-form');
    handleFormSubmission(searchAgeForm, async formData => {
        const params = new URLSearchParams();
        const minAge = formData.get('min');
        const maxAge = formData.get('max');
        if (minAge) {
            params.append('min', minAge);
        }
        if (maxAge) {
            params.append('max', maxAge);
        }

        try {
            const { data } = await apiRequest(`/users/by-age?${params.toString()}`, {
                headers: jsonHeaders
            });
            renderUsersTable(data);
        } catch (error) {
            setMessage(error.message, 'error');
        }
    });

    // search: registered after --------------------------------------------
    const registeredAfterForm = document.getElementById('search-registered-after-form');
    handleFormSubmission(registeredAfterForm, async formData => {
        const username = formData.get('username')?.trim();
        if (!username) {
            setMessage('Please provide a username to compare against.', 'warning');
            return;
        }

        try {
            const { data } = await apiRequest(`/users/registered-after/${encodeURIComponent(username)}`, {
                headers: jsonHeaders
            });
            renderUsersTable(data);
        } catch (error) {
            setMessage(error.message, 'error');
        }
    });

    // search: registered same day -----------------------------------------
    const sameDayForm = document.getElementById('search-same-day-form');
    handleFormSubmission(sameDayForm, async formData => {
        const username = formData.get('username')?.trim();
        if (!username) {
            setMessage('Please provide a username to compare against.', 'warning');
            return;
        }

        try {
            const { data } = await apiRequest(`/users/registered-same-day/${encodeURIComponent(username)}`, {
                headers: jsonHeaders
            });
            renderUsersTable(data);
        } catch (error) {
            setMessage(error.message, 'error');
        }
    });

    // quick filters --------------------------------------------------------
    document.getElementById('never-signed-in-btn').addEventListener('click', async () => {
        try {
            const { data } = await apiRequest('/users/never-signed-in', {
                headers: jsonHeaders
            });
            renderUsersTable(data);
        } catch (error) {
            setMessage(error.message, 'error');
        }
    });

    document.getElementById('registered-today-btn').addEventListener('click', async () => {
        try {
            const { data } = await apiRequest('/users/registered-today', {
                headers: jsonHeaders
            });
            renderUsersTable(data);
        } catch (error) {
            setMessage(error.message, 'error');
        }
    });

    document.getElementById('view-all-btn').addEventListener('click', () => loadAllUsers());
});
