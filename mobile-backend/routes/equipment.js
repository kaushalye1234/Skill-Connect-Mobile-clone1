const express = require('express');
const Equipment = require('../models/Equipment');
const auth = require('../middleware/auth');
const router = express.Router();

const sanitizeEquipmentData = (data) => {
    const allowed = ['name', 'description', 'category', 'dailyRate', 'isAvailable', 'location'];
    const sanitized = {};
    allowed.forEach(field => {
        if (data[field] !== undefined) sanitized[field] = data[field];
    });
    return sanitized;
};

// GET /api/equipment — list available equipment with pagination
router.get('/', auth, async (req, res) => {
    try {
        const { page = 1, limit = 20, category } = req.query;
        
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
        const skip = (pageNum - 1) * limitNum;

        const filter = { isAvailable: true };
        if (category && typeof category === 'string') filter.category = category;

        const equipment = await Equipment.find(filter)
            .populate('supplier', 'firstName lastName companyName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const total = await Equipment.countDocuments(filter);

        res.json({ 
            status: 'success', 
            data: { 
                content: equipment,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    pages: Math.ceil(total / limitNum)
                }
            } 
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to fetch equipment' });
    }
});

// GET /api/equipment/:id
router.get('/:id', auth, async (req, res) => {
    try {
        const item = await Equipment.findById(req.params.id)
            .populate('supplier', 'firstName lastName companyName email phone');
        if (!item) return res.status(404).json({ status: 'error', message: 'Equipment not found' });
        res.json({ status: 'success', data: item });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to fetch equipment' });
    }
});

// POST /api/equipment — add equipment (supplier only)
router.post('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'supplier') {
            return res.status(403).json({ status: 'error', message: 'Only suppliers can add equipment' });
        }

        const sanitized = sanitizeEquipmentData(req.body);
        const equipment = new Equipment({
            ...sanitized,
            supplier: req.userId
        });
        await equipment.save();
        res.status(201).json({ status: 'success', data: equipment });
    } catch (error) {
        res.status(400).json({ status: 'error', message: 'Failed to add equipment' });
    }
});

// PUT /api/equipment/:id — update equipment (supplier only)
router.put('/:id', auth, async (req, res) => {
    try {
        const equipment = await Equipment.findOne({
            _id: req.params.id,
            supplier: req.userId
        });
        if (!equipment) return res.status(404).json({ status: 'error', message: 'Equipment not found or not authorized' });

        const sanitized = sanitizeEquipmentData(req.body);
        Object.assign(equipment, sanitized);
        await equipment.save();

        res.json({ status: 'success', data: equipment });
    } catch (error) {
        res.status(400).json({ status: 'error', message: 'Failed to update equipment' });
    }
});

// DELETE /api/equipment/:id
router.delete('/:id', auth, async (req, res) => {
    try {
        const equipment = await Equipment.findOneAndDelete({
            _id: req.params.id,
            supplier: req.userId
        });
        if (!equipment) return res.status(404).json({ status: 'error', message: 'Equipment not found or not authorized' });
        res.json({ status: 'success', message: 'Equipment deleted' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to delete equipment' });
    }
});

module.exports = router;
