const API_BASE = 'http://localhost:5050';

const messageElement = document.getElementById('message');
const usersTableBody = document.querySelector('#users-table tbody');

const jsonHeaders = { 'Content-Type': 'application/json' };
const hideTimers = new Map();

const normaliseNumber = (value, parser) => {
    if (value === undefined || value === null || value === '') {
        return undefined;
    }
    const parsed = parser(value);
    return Number.isNaN(parsed) ? undefined : parsed;
};

const formatDateTime = value => {
    if (!value) {
        return '--';
    }
    return new Date(value).toLocaleString();
};

const formatCurrency = value => {
    const amount = Number(value);
    if (!Number.isFinite(amount)) {
        return '--';
    }
    return amount.toFixed(2);
};

const getBaseClass = element => {
    if (!element) {
        return '';
    }
    if (!element.dataset.baseClass) {
        element.dataset.baseClass = element.className || '';
    }
    return element.dataset.baseClass;
};

const hideNotification = element => {
    if (!element) {
        return;
    }
    if (hideTimers.has(element)) {
        clearTimeout(hideTimers.get(element));
        hideTimers.delete(element);
    }
    const baseClass = getBaseClass(element);
    element.classList.remove('is-visible');
    const timer = setTimeout(() => {
        element.textContent = '';
        element.className = baseClass;
        hideTimers.delete(element);
    }, 400);
    hideTimers.set(element, timer);
};

const scheduleHide = (element, timeout) => {
    if (!element) {
        return;
    }
    if (hideTimers.has(element)) {
        clearTimeout(hideTimers.get(element));
    }
    const timer = setTimeout(() => hideNotification(element), timeout);
    hideTimers.set(element, timer);
};

const showNotification = (
    element,
    tone,
    text,
    { autoDismiss = true, delay = 4500 } = {}
) => {
    if (!element) {
        return;
    }
    if (hideTimers.has(element)) {
        clearTimeout(hideTimers.get(element));
        hideTimers.delete(element);
    }
    const baseClass = getBaseClass(element);
    element.textContent = text;
    element.className = [baseClass, tone].filter(Boolean).join(' ').trim();
    requestAnimationFrame(() => element.classList.add('is-visible'));
    if (autoDismiss) {
        scheduleHide(element, delay);
    }
};

const setMessage = (text, tone = 'info', options = {}) => {
    const resolvedText = text || 'Ready to display users.';
    const resolvedTone = text ? tone : 'success';
    const mergedOptions = {
        autoDismiss: options.autoDismiss ?? false,
        delay: options.delay
    };
    showNotification(messageElement, resolvedTone, resolvedText, mergedOptions);
};

const setFeedback = (targetId, text, tone = 'info', options = {}) => {
    if (!targetId) {
        return;
    }
    const element = document.getElementById(targetId);
    if (!element) {
        return;
    }
    if (!text) {
        hideNotification(element);
        return;
    }
    const autoDismiss = tone !== 'error';
    showNotification(element, tone, text, {
        autoDismiss: options.autoDismiss ?? autoDismiss,
        delay: options.delay ?? (autoDismiss ? 3000 : undefined)
    });
};

const resolveMessage = (template, count) => {
    if (typeof template === 'function') {
        return template(count);
    }
    return template;
};
const renderUsersTable = users => {
    usersTableBody.innerHTML = '';

    if (!users || users.length === 0) {
        return 0;
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
    return users.length;
};

const presentResults = (
    users,
    {
        resultsMessage,
        feedbackMessage,
        emptyMessage,
        feedbackId
    } = {}
) => {
    const normalised = Array.isArray(users) ? users : [];
    const count = renderUsersTable(normalised);
    if (count === 0) {
        const emptyText =
            resolveMessage(emptyMessage, count) ?? 'No matching users found.';
        if (feedbackId) {
            setFeedback(feedbackId, emptyText, 'warning');
        }
        setMessage(emptyText, 'warning');
        return;
    }
    const resultsText =
        resolveMessage(resultsMessage, count) ??
        `Showing ${count} user${count === 1 ? '' : 's'}.`;
    setMessage(resultsText, 'success');
    if (feedbackId) {
        const feedbackText =
            resolveMessage(feedbackMessage ?? resultsMessage, count) ?? resultsText;
        setFeedback(feedbackId, feedbackText, 'success');
    }
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
        callback(new FormData(formElement), formElement);
    });
};

const loadAllUsers = async ({ silent = false } = {}) => {
    try {
        if (!silent) {
            setMessage('Loading users...', 'info');
        }
        const { data } = await apiRequest('/users');
        if (silent) {
            renderUsersTable(data);
            return;
        }
        presentResults(data, {
            resultsMessage: count =>
                `Displaying all ${count} user${count === 1 ? '' : 's'}.`,
            emptyMessage: 'No users found yet. Register a new user to get started.'
        });
    } catch (error) {
        setMessage(error.message, 'error');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    loadAllUsers();

    // registration ----------------------------------------------------------
    const registrationForm = document.getElementById('registration-form');
    handleFormSubmission(registrationForm, async (formData, formElement) => {
        const feedbackId = formElement.dataset.feedback;
        setFeedback(feedbackId, '');
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
            setFeedback(feedbackId, `Created user ${data.username}.`, 'success');
            await loadAllUsers();
        } catch (error) {
            setFeedback(feedbackId, error.message, 'error');
        }
    });

    // sign-in --------------------------------------------------------------
    const signinForm = document.getElementById('signin-form');
    handleFormSubmission(signinForm, async (formData, formElement) => {
        const feedbackId = formElement.dataset.feedback;
        setFeedback(feedbackId, '');
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
            setFeedback(feedbackId, `Signed in as ${data.username}.`, 'success');
            await loadAllUsers();
        } catch (error) {
            setFeedback(feedbackId, error.message, 'error');
        }
    });

    // search: name ---------------------------------------------------------
    const searchNameForm = document.getElementById('search-name-form');
    handleFormSubmission(searchNameForm, async (formData, formElement) => {
        const feedbackId = formElement.dataset.feedback;
        setFeedback(feedbackId, '');
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
            presentResults(data, {
                resultsMessage: count =>
                    `Found ${count} user${count === 1 ? '' : 's'} matching the supplied name filters.`,
                feedbackMessage: count =>
                    `Found ${count} user${count === 1 ? '' : 's'} with the provided name.`,
                emptyMessage: 'No users matched the provided first and last name combination.',
                feedbackId
            });
        } catch (error) {
            setFeedback(feedbackId, error.message, 'error');
        }
    });

    // search: username -----------------------------------------------------
    const searchUsernameForm = document.getElementById('search-username-form');
    handleFormSubmission(searchUsernameForm, async (formData, formElement) => {
        const feedbackId = formElement.dataset.feedback;
        setFeedback(feedbackId, '');
        const username = formData.get('username')?.trim();
        if (!username) {
            setFeedback(feedbackId, 'Please enter a username.', 'warning');
            return;
        }
        try {
            const { data } = await apiRequest(`/users/by-username/${encodeURIComponent(username)}`, {
                headers: jsonHeaders
            });
            presentResults(ensureArray(data), {
                resultsMessage: () => `Showing 1 user.`,
                feedbackMessage: () => `Found user ${username}.`,
                emptyMessage: `No user found with username "${username}".`,
                feedbackId
            });
        } catch (error) {
            setFeedback(feedbackId, error.message, 'error');
        }
    });

    // search: salary -------------------------------------------------------
    const searchSalaryForm = document.getElementById('search-salary-form');
    handleFormSubmission(searchSalaryForm, async (formData, formElement) => {
        const feedbackId = formElement.dataset.feedback;
        setFeedback(feedbackId, '');
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
            presentResults(data, {
                resultsMessage: count =>
                    `Found ${count} user${count === 1 ? '' : 's'} within the selected salary range.`,
                feedbackMessage: count =>
                    `Matched ${count} user${count === 1 ? '' : 's'} for the selected salary range.`,
                emptyMessage: 'No users fall within the selected salary range.',
                feedbackId
            });
        } catch (error) {
            setFeedback(feedbackId, error.message, 'error');
        }
    });

    // search: age ----------------------------------------------------------
    const searchAgeForm = document.getElementById('search-age-form');
    handleFormSubmission(searchAgeForm, async (formData, formElement) => {
        const feedbackId = formElement.dataset.feedback;
        setFeedback(feedbackId, '');
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
            presentResults(data, {
                resultsMessage: count =>
                    `Found ${count} user${count === 1 ? '' : 's'} within the selected age range.`,
                feedbackMessage: count =>
                    `Matched ${count} user${count === 1 ? '' : 's'} for the selected age range.`,
                emptyMessage: 'No users fall within the selected age range.',
                feedbackId
            });
        } catch (error) {
            setFeedback(feedbackId, error.message, 'error');
        }
    });

    // search: registered after --------------------------------------------
    const registeredAfterForm = document.getElementById('search-registered-after-form');
    handleFormSubmission(registeredAfterForm, async (formData, formElement) => {
        const feedbackId = formElement.dataset.feedback;
        setFeedback(feedbackId, '');
        const username = formData.get('username')?.trim();
        if (!username) {
            setFeedback(feedbackId, 'Please provide a username to compare against.', 'warning');
            return;
        }

        try {
            const { data } = await apiRequest(`/users/registered-after/${encodeURIComponent(username)}`, {
                headers: jsonHeaders
            });
            presentResults(data, {
                resultsMessage: count =>
                    `${count} user${count === 1 ? '' : 's'} registered after ${username}.`,
                feedbackMessage: count =>
                    `${count} user${count === 1 ? '' : 's'} found after ${username}.`,
                emptyMessage: `No users registered after ${username}.`,
                feedbackId
            });
        } catch (error) {
            setFeedback(feedbackId, error.message, 'error');
        }
    });

    // search: registered same day -----------------------------------------
    const sameDayForm = document.getElementById('search-same-day-form');
    handleFormSubmission(sameDayForm, async (formData, formElement) => {
        const feedbackId = formElement.dataset.feedback;
        setFeedback(feedbackId, '');
        const username = formData.get('username')?.trim();
        if (!username) {
            setFeedback(feedbackId, 'Please provide a username to compare against.', 'warning');
            return;
        }

        try {
            const { data } = await apiRequest(`/users/registered-same-day/${encodeURIComponent(username)}`, {
                headers: jsonHeaders
            });
            presentResults(data, {
                resultsMessage: count =>
                    `${count} user${count === 1 ? '' : 's'} registered on the same day as ${username}.`,
                feedbackMessage: count =>
                    `${count} user${count === 1 ? '' : 's'} share the registration day with ${username}.`,
                emptyMessage: `No other users share the same registration day as ${username}.`,
                feedbackId
            });
        } catch (error) {
            setFeedback(feedbackId, error.message, 'error');
        }
    });

    // quick filters --------------------------------------------------------
    document.getElementById('never-signed-in-btn').addEventListener('click', async () => {
        const feedbackId = 'quick-filters-feedback';
        setFeedback(feedbackId, '');
        try {
            const { data } = await apiRequest('/users/never-signed-in', {
                headers: jsonHeaders
            });
            presentResults(data, {
                resultsMessage: count =>
                    `${count} user${count === 1 ? '' : 's'} have never signed in.`,
                feedbackMessage: count =>
                    `${count} user${count === 1 ? '' : 's'} still need to sign in.`,
                emptyMessage: 'Every user has signed in at least once.',
                feedbackId
            });
        } catch (error) {
            setFeedback(feedbackId, error.message, 'error');
        }
    });

    document.getElementById('registered-today-btn').addEventListener('click', async () => {
        const feedbackId = 'quick-filters-feedback';
        setFeedback(feedbackId, '');
        try {
            const { data } = await apiRequest('/users/registered-today', {
                headers: jsonHeaders
            });
            presentResults(data, {
                resultsMessage: count =>
                    `${count} user${count === 1 ? '' : 's'} registered today.`,
                feedbackMessage: count =>
                    `${count} new registration${count === 1 ? '' : 's'} today.`,
                emptyMessage: 'No users have registered today yet.',
                feedbackId
            });
        } catch (error) {
            setFeedback(feedbackId, error.message, 'error');
        }
    });

    document.getElementById('view-all-btn').addEventListener('click', () => {
        setFeedback('quick-filters-feedback', '');
        loadAllUsers();
    });
});
