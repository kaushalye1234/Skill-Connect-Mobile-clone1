const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        enum: ['customer', 'worker', 'supplier', 'admin'],
        default: 'customer',
        index: true
    },
    district: String,
    city: String,
    skills: [String],
    bio: String,
    hourlyRate: Number,
    experience: String,
    companyName: String,
    isVerified: {
        type: Boolean,
        default: false,
        index: true
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    isDeleted: {
        type: Boolean,
        default: false,
        index: true
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Automatically filter out soft-deleted records in find queries
userSchema.pre('find', function() {
    this.where({ isDeleted: false });
});

userSchema.pre('findOne', function() {
    this.where({ isDeleted: false });
});

userSchema.pre('findOneAndUpdate', function() {
    this.where({ isDeleted: false });
});

userSchema.pre('findOneAndDelete', function() {
    this.where({ isDeleted: false });
});

// Add soft delete method
userSchema.methods.softDelete = async function() {
    this.isDeleted = true;
    this.deletedAt = new Date();
    return await this.save();
};

// Add restore method
userSchema.methods.restore = async function() {
    this.isDeleted = false;
    this.deletedAt = null;
    return await this.save();
};

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('passwordHash')) return next();
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.passwordHash;
    return obj;
};

module.exports = mongoose.model('User', userSchema);
