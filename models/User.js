const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: function() { return !this.googleId; } },
  googleId: { type: String },
  role: { type: String, enum: ['user', 'artist', 'admin'], default: 'user' },
  subscriptionTier: { type: String, enum: ['free', 'pro', 'premium'], default: 'free' },
  purchasesRemaining: { type: Number, default: 3 }, // Free gets 3, Pro gets 9, Premium gets Infinity
  avatar: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
