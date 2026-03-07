const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(__dirname, '../data/users.json');

/**
 * Reads and returns all users from the JSON file.
 * @returns {Array}
 */
function getAllUsers() {
    try {
        if (!fs.existsSync(USERS_FILE)) {
            fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2), 'utf8');
            return [];
        }
        const raw = fs.readFileSync(USERS_FILE, 'utf8');
        return JSON.parse(raw);
    } catch (err) {
        console.error('[userStorage] Failed to read users.json:', err);
        return [];
    }
}

/**
 * Finds a user by email (case-insensitive).
 * @param {string} email
 * @returns {Object|null}
 */
function findUserByEmail(email) {
    const users = getAllUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

/**
 * Appends a new user to users.json and saves the file.
 * @param {{ id: number, name: string, email: string, password: string }} user
 */
function addUser(user) {
    const users = getAllUsers();
    users.push(user);
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

/**
 * Generates the next available numeric ID.
 * @returns {number}
 */
function getNextId() {
    const users = getAllUsers();
    if (users.length === 0) return 1;
    return Math.max(...users.map(u => u.id || 0)) + 1;
}

module.exports = { getAllUsers, findUserByEmail, addUser, getNextId };
