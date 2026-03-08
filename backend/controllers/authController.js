const userStorage = require('../utils/userStorage');

/**
 * POST /api/auth/signup
 * Body: { name, email, password }
 */
exports.signup = (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
        }

        // Check if user already exists
        const existing = userStorage.findUserByEmail(email);
        if (existing) {
            return res.status(409).json({ success: false, error: 'User already exists.' });
        }

        // Create new user
        const newUser = {
            id: userStorage.getNextId(),
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: password  // Plain text for prototype — replace with bcrypt for production
        };

        userStorage.addUser(newUser);

        console.log(`[Auth] New user registered: ${newUser.email}`);

        return res.status(201).json({
            success: true,
            message: 'Account created successfully. Please log in.',
            user: { id: newUser.id, name: newUser.name, email: newUser.email }
        });

    } catch (err) {
        console.error('[Auth Signup Error]:', err);
        return res.status(500).json({ success: false, error: 'Signup failed. Please try again.' });
    }
};

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
exports.login = (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password are required.' });
        }

        // Find the user
        const user = userStorage.findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid email or password.' });
        }

        // Check password
        if (user.password !== password) {
            return res.status(401).json({ success: false, error: 'Invalid email or password.' });
        }

        console.log(`[Auth] Login successful: ${user.email}`);

        return res.json({
            success: true,
            message: 'Login successful.',
            user: { id: user.id, name: user.name, email: user.email }
        });

    } catch (err) {
        console.error('[Auth Login Error]:', err);
        return res.status(500).json({ success: false, error: 'Login failed. Please try again.' });
    }
};
