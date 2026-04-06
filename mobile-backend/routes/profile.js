const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sanitizeProfileData } = require('../middleware/validation');
const router = express.Router();

// GET /api/profile/me
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
        res.json({ status: 'success', data: user });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to fetch profile' });
    }
});

// PUT /api/profile/me — update profile (only allowed fields)
router.put('/me', auth, async (req, res) => {
    try {
        const sanitized = sanitizeProfileData(req.body);
        const user = await User.findByIdAndUpdate(req.userId, sanitized, { new: true });
        res.json({ status: 'success', data: user });
    } catch (error) {
        res.status(400).json({ status: 'error', message: 'Failed to update profile' });
    }
});

// GET /api/profile/workers — list workers with pagination
router.get('/workers', auth, async (req, res) => {
    try {
        const { district, page = 1, limit = 20 } = req.query;
        
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
        const skip = (pageNum - 1) * limitNum;

        const filter = { role: 'worker', isActive: true };
        if (district && typeof district === 'string') filter.district = district;

        const workers = await User.find(filter)
            .select('-passwordHash')
            .skip(skip)
            .limit(limitNum);

        const total = await User.countDocuments(filter);

        res.json({ 
            status: 'success', 
            data: { 
                content: workers,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    pages: Math.ceil(total / limitNum)
                }
            } 
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to fetch workers' });
    }
});

// GET /api/profile/workers/:id
router.get('/workers/:id', auth, async (req, res) => {
    try {
        const worker = await User.findById(req.params.id).select('-passwordHash');
        if (!worker) return res.status(404).json({ status: 'error', message: 'Worker not found' });
        res.json({ status: 'success', data: worker });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to fetch worker profile' });
    }
});

module.exports = router;
