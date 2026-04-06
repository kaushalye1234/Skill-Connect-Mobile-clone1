const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { authValidation, validate } = require('../middleware/validation');
const router = express.Router();

// POST /api/auth/register
router.post('/register', authValidation.register, validate, async (req, res) => {
    const logger = require('../middleware/logger');
    
    try {
        const { firstName, lastName, email, password, phone, role, district, city, skills, hourlyRate, experience, companyName } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                status: 'error',
                message: 'Email already registered' 
            });
        }

        // Create new user
        const user = new User({
            firstName,
            lastName,
            email,
            passwordHash: password,
            phone,
            role: role || 'customer',
            district,
            city,
            skills,
            hourlyRate,
            experience,
            companyName
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        logger.info(`User registered: ${email}`);

        res.status(201).json({
            status: 'success',
            data: {
                token,
                userId: user._id,
                name: `${user.firstName} ${user.lastName || ''}`.trim(),
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        logger.error(`Registration error: ${error.message}`);
        res.status(500).json({ 
            status: 'error',
            message: 'Registration failed: ' + error.message
        });
    }
});

// POST /api/auth/login
router.post('/login', authValidation.login, validate, async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ 
                status: 'error',
                message: 'Invalid email or password' 
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ 
                status: 'error',
                message: 'Invalid email or password' 
            });
        }

        if (!user.isActive) {
            return res.status(403).json({ 
                status: 'error',
                message: 'Account is deactivated' 
            });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Changed from 7d to 1h for better security
        );

        res.json({
            status: 'success',
            data: {
                token,
                userId: user._id,
                name: `${user.firstName} ${user.lastName || ''}`.trim(),
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            message: 'Login failed' 
        });
    }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
    res.json({ status: 'success', data: req.user });
});

module.exports = router;
